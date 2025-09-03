import { NextRequest, NextResponse } from 'next/server';

import dbConnect from '@/lib/db-connect';
import { User, UserDocument } from '@/models';
import { hashPassword, validatePassword } from '@/utils/password-utils';

export async function POST(request: NextRequest) {
    try {
        const { email, password, username } = await request.json();

        /**
         * Input validation
         */
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

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
                console.log(`API: Linking password to existing OAuth account: ${email}`);
                
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.isValid) {
                    return NextResponse.json(
                        { error: passwordValidation.errors.join(', ') },
                        { status: 400 }
                    );
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

                return NextResponse.json({
                    message: 'Password successfully added to your existing Google account! You can now sign in with either method.',
                    userId: (existingUser._id as string).toString(),
                    accountLinked: true,
                    canSignInWith: ['google', 'credentials']
                }, { status: 200 });
            } else {

                /**
                 * User already has a credentials authentication account.
                 */
                return NextResponse.json(
                    { error: 'An account with this email already exists. Try signing in instead.' },
                    { status: 409 }
                );
            }
        }

        /**
         * NEW USER: Create account with credentials authentication.
         */
        console.log(`API: Creating new credentials account: ${email}`);
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(', ') },
                { status: 400 }
            );
        }

        const finalUsername = username?.trim() || email.split('@')[0];

        /**
         * Check if username is taken (if provided).
         */
        if (username?.trim()) {
            const usernameExists = await User.findOne({ username: username.trim() });
            if (usernameExists) {
                return NextResponse.json(
                    { error: 'Username is already taken' },
                    { status: 409 }
                );
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

        return NextResponse.json({
            message: 'Account created successfully!',
            userId: newUser._id.toString(),
            accountLinked: false,
            canSignInWith: ['credentials']
        }, { status: 201 });
    } catch (error) {
        console.error(`User registration error: ${error}`);
        return NextResponse.json(
            { error: 'Internal server error. Please try again.' },
            { status: 500 }
        );
    }
}