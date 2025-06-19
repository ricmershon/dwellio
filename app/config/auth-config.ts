import GoogleProvider from "next-auth/providers/google";
import type { Profile } from 'next-auth';

import connectDB from "@/app/config/database-config";
import { User } from "@/app/models/user-model";

interface DwellioSession {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id?: string | null;
    }
    expires: string;
}

interface GoogleProfile extends Profile {
    picture?: string;
} 

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code'
                }
            }
        })
    ],
    callbacks: {
        // Invoked on successful sign in
        async signIn({ profile }: { profile: GoogleProfile}) {
            // Connect to database
            await connectDB();
            const user  = await User.findOne({ email: profile.email })

            // Check if user exists, if not create user
            if (!user) {
                const username = profile.name!.slice(0, 20);
                await User.create({
                    email: profile.email,
                    username: username,
                    image: profile.picture
                });
            }
            // Return true to allow sign in
            return true
        },

        // Session callback function that modifies the session object
        async session({ session }: { session: DwellioSession }) {
            // Get user from database and assign id to the session and return the session
            const user = await User.findOne({ email: session.user!.email });
            session.user!.id = user._id?.toString();
            return session;
        }
    }
};