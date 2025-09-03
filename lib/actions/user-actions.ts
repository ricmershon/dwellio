"use server";

import dbConnect from '@/lib/db-connect';
import { User, UserDocument } from '@/models';
import { hashPassword, validatePassword } from '@/utils/password-utils';
import { ActionState, ActionStatus } from '@/types';
import { toActionState } from '@/utils/to-action-state';

export const createCredentialsUser =  async (_prevState: ActionState, formData: FormData) => {
    const email = <string>formData.get("email");
    const password = <string>formData.get("password");
    const username = <string>formData.get("username");
    
    /**
     * Input validation
     */
    if (!email || !password) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: 'Email and password are required.'
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: "Please enter a valid email address."
        });
    }

    try {
        await dbConnect();

        /**
         * Check if user already exists
         */
        const existingUser: UserDocument | null = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            if (!existingUser.passwordHash) {

                /**
                 * ACCOUNT LINKING: Google OAuth user adding password.
                 */
                console.log(`API: Linking password to existing OAuth account: ${email}.`);
                
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.isValid) {
                    return toActionState({
                        status: ActionStatus.ERROR,
                        message: passwordValidation.errors.join(', ')
                    });
                }

                const hashedPassword = await hashPassword(password);
                existingUser.passwordHash = hashedPassword;
                
                /**
                 * Update usernname in database if provided and different from
                 * the already stored for the Google OAuth account.
                 */
                if (username && username.trim() !== existingUser.username) {

                    /**
                     * Check for username availability.
                     */
                    const usernameExists: boolean | null = await User.findOne({ 
                        username: username.trim(),
                        _id: { $ne: existingUser._id }
                    });
                    
                    if (!usernameExists) {
                        existingUser.username = username.trim();
                    }
                }
                
                await existingUser.save();

                return toActionState({
                    status: ActionStatus.SUCCESS,
                    userId: (existingUser._id as string).toString(),
                    message: 'Password successfully added to your existin Google account. You can now sign in with either method.',
                    isAccountLinked: true,
                    canSignInWith: ['google', 'credentials']
                });
            } else {

                /**
                 * User already has a credentials authentication account.
                 */
                return toActionState({
                    status: ActionStatus.ERROR,
                    message: 'An account with this email already exists. Try signing in instead.'
                });
            }
        }

        /**
         * NEW USER: Create account with credentials authentication.
         */
        console.log(`API: Creating new credentials account: ${email}`);
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return toActionState({
                status: ActionStatus.ERROR,
                message: passwordValidation.errors.join(', ')
            });
        }

        const finalUsername = username?.trim() || email.split('@')[0];

        /**
         * Check if username is taken (if provided).
         */
        if (username?.trim()) {
            const usernameExists = await User.findOne({ username: username.trim() });
            if (usernameExists) {
                return toActionState({
                    status: ActionStatus.ERROR,
                    message: "Username is already taken."
                })
            }
        }

        /**
         * Continue with user creation.
         */
        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
            email: email.toLowerCase(),
            username: finalUsername,
            passwordHash: hashedPassword,
            image: null
        });

        return toActionState({
            status: ActionStatus.SUCCESS,
            message: "Account created successfully.",
            userId: newUser._id.toString(),
            isAccountLinked: false,
            canSignInWith: ['credentials']
        });
    } catch (error) {
        console.error(`>>> User registration error: ${error}`);
        return toActionState({
            status: ActionStatus.ERROR,
            message: "Internal server error. Please try again."
        });
    }
}