import GoogleProvider from "next-auth/providers/google";
import type { DefaultUser, Session } from "next-auth";

import dbConnect from "@/config/database-config";
import { User } from "@/models";

export const authOptions = {
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
        })
    ],
    callbacks: {
        // Invoked on successful sign in
        async signIn({ user }: { user: DefaultUser }) {
            // Connect to database
            await dbConnect();
            const dbUser  = await User.findOne({ email: user.email })

            // Check if user exists, if not create user
            if (!dbUser) {
                const username = user.name!.slice(0, 20);
                await User.create({
                    email: user.email,
                    username: username,
                    image: user.image
                });
            }
            // Return true to allow sign in
            return true
        },

        // Session callback function that modifies the session object
        async session({ session }: { session: Session }) {
            // Get user from database and assign id to the session and return the session
            const user = await User.findOne({ email: session.user!.email });
            session.user!.id = user._id?.toString();
            return session;
        }
    }
};