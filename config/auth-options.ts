import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import dbConnect from "@/lib/db-connect";
import { User } from "@/models";
import { verifyPassword } from "@/utils/password-utils";

export const authOptions: NextAuthOptions = {
    providers: [
        /**
         * Google OAuth login.
         */
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
        /**
         * Credentials (email, password) login.
         */
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
                    type: "hidden"
                }
            },

            /**
             * Authorize user.
             */
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required.');
                }

                await dbConnect();
                
                const user = await User.findOne({ email: credentials.email });
                
                if (!user) {
                    throw new Error(`No account found for ${credentials.email}.`);
                }
                
                if (!user.passwordHash) {

                    /**
                     * User that has no password hash trying to sign in is a
                     * Google OAuth user.
                     */
                    throw new Error(`${credentials.email} is linked to a Google account. Please sign in with Google or register the account with a password.`);
                }

                /**
                 * Continue credentials login flow.
                 */
                const isPasswordValid = await verifyPassword(credentials.password, user.passwordHash);
                if (!isPasswordValid) {
                    throw new Error('Invalid password.');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                    image: user.image
                };
            }
        })
    ],

    session: { strategy: "jwt" },

    callbacks: {
        /**
         * `signIn` is invoked on successfull signin.
         */
        async signIn({ user, account, profile }) {
            
            /**
             * Handle Google OAuth signin
            */
           if (account?.provider === 'google' && profile?.email) {
                await dbConnect();

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