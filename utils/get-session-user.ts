import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";

import { authOptions } from "@/config/auth-options";

export const getSessionUser = async (): Promise<Session["user"] | null> => {
    try {
        const session = await getServerSession(authOptions);
        
        // Validate session structure
        if (!session || typeof session !== 'object') {
            return null;
        }
        
        // Validate user object exists and has required properties
        if (!session.user || typeof session.user !== 'object') {
            return null;
        }
        
        // Validate user has required id property
        if (!session.user.id || typeof session.user.id !== 'string') {
            return null;
        }
        
        return session.user;
    } catch (error) {
        // Only log unexpected errors in development or non-build scenarios
        if (process.env.NODE_ENV === 'development' || 
            (error instanceof Error && !error.message.includes('DYNAMIC_SERVER_USAGE'))) {
            console.error('Error retrieving session user:', error);
        }
        return null;
    }
}