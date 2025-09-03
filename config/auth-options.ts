import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import dbConnect from "@/lib/db-connect";
import { User } from "@/models";
import { hashPassword, verifyPassword, validatePassword } from "@/utils/password-utils";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Email and Password",
            credentials: {
                email: { 
                    label: "Email", 
                    type: "email", 
                    placeholder: "your@email.com" 
                },
                password: { 
                    label: "Password", 
                    type: "password" 
                },
                action: {
                    label: "Action",
                    type: "hidden"  // 'signin' or 'signup'
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                await dbConnect();

                const action = credentials.action || "signin";

                if (action === 'signup') {

                    /**
                     * Handle user registration with account linking if user
                     * uses email and Google OAuth.
                     */
                    const existingUser = await User.findOne({ email: credentials.email });
                    
                    if (existingUser) {
                        if (!existingUser.passwordHash) {

                            /**
                             * LINK ACCOUNTS:
                             * 
                             * Existing user with no passwordHash is an existing
                             * Google OAuth user. Validate and hash password, save
                             * to database.
                             */
                            console.log(`Linking password to existing OAuth account: ${credentials.email}`);
                            
                            const passwordValidation = validatePassword(credentials.password);
                            if (!passwordValidation.isValid) {
                                throw new Error(passwordValidation.errors.join(', '));
                            }

                            const hashedPassword = await hashPassword(credentials.password);
                            existingUser.passwordHash = hashedPassword;
                            await existingUser.save();

                            return {
                                id: existingUser._id.toString(),
                                email: existingUser.email,
                                name: existingUser.username,
                                image: existingUser.image
                            };
                        } else {

                            /**
                             * User is trying to signup with an email that
                             * already exists in the database.
                             */
                            throw new Error('Account with this email already exists. Try signing in instead.');
                        }
                    } else {

                        /**
                         * NEW USER. Create account with credentials.
                         */
                        console.log(`Creating new credentials account: ${credentials.email}`);
                        
                        const passwordValidation = validatePassword(credentials.password);
                        if (!passwordValidation.isValid) {
                            throw new Error(passwordValidation.errors.join(', '));
                        }

                        const hashedPassword = await hashPassword(credentials.password);
                        const newUser = await User.create({
                            email: credentials.email,
                            username: credentials.email.split('@')[0],
                            passwordHash: hashedPassword,
                            image: null
                        });

                        return {
                            id: newUser._id.toString(),
                            email: newUser.email,
                            name: newUser.username,
                            image: newUser.image
                        };
                    }
                } else {

                    /**
                     * SIGN IN: Handle login
                     */
                    const user = await User.findOne({ email: credentials.email });
                    
                    if (!user) {
                        throw new Error('No account found with this email address');
                    }
                    
                    if (!user.passwordHash) {

                        /**
                         * User that has no password hash trying to sign in is a
                         * Google OAuth user.
                         */
                        throw new Error('This email is linked to a Google account. Please sign in with Google or add a password to your account.');
                    }

                    /**
                     * Continue credentials login flow.
                     */
                    const isPasswordValid = await verifyPassword(credentials.password, user.passwordHash);
                    if (!isPasswordValid) {
                        throw new Error('Invalid password');
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.username,
                        image: user.image
                    };
                }
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        /**
         * `signIn` is invoked on successfull signin.
         */

        async signIn({ user, account, profile }) {
            await dbConnect();
            
            if (account?.provider === 'google' && profile?.email) {

                /**
                 * Handle Google OAuth signin
                 */
                const existingUser = await User.findOne({ email: profile.email });
                
                if (existingUser) {

                    /**
                     * User exists - update their info (especially if they have
                     * linked accounts).
                     */
                    existingUser.username = existingUser.username
                        || profile.name
                        || profile.email.split('@')[0];
                    existingUser.image = existingUser.image
                        || user.image
                        || null;
                    await existingUser.save();
                    
                    /**
                     * Update user object with id from database.
                     */
                    user.id = existingUser._id.toString();
                } else {

                    /**
                     * Creating new Google OAuth user.
                     */
                    const newUser = await User.create({
                        username: profile.name || profile.email.split('@')[0],
                        email: profile.email,
                        image: user.image || null,
                        passwordHash: null // OAuth-only account
                    });
                    
                    user.id = newUser._id.toString();
                }
            }
            
            return true;
        },

        /**
         * Session callback function that updates the session object.
         */
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },

        /**
         * Stores MongoDB user ID in the JWT token and makes the ID available
         * in the session object throughout the app.
         */
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    }
};