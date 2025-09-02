import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { getSessionUser } from "@/utils/get-session-user";

export const requireSessionUser = async (): Promise<NonNullable<Session["user"]> & { id: string }> => {
    try {
        const user = await getSessionUser();
        
        // Check if user exists and has valid structure
        if (!user || typeof user !== 'object') {
            if (process.env.NODE_ENV === 'development') {
                console.warn('No user session found, redirecting to auth required');
            }
            redirect("/?authRequired=true");
        }
        
        // Validate user has required id property  
        if (!user.id || typeof user.id !== 'string') {
            if (process.env.NODE_ENV === 'development') {
                console.warn('User session missing required id, redirecting to auth required');
            }
            redirect("/?authRequired=true");
        }
        
        // TypeScript now knows user and user.id are not null due to redirect above
        return user as NonNullable<Session["user"]> & { id: string };
    } catch (error) {
        // Only log unexpected errors in development
        if (process.env.NODE_ENV === 'development' && 
            !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
            console.error('Error in requireSessionUser:', error);
        }
        
        // Attempt redirect even if there's an error
        try {
            redirect("/?authRequired=true");
        } catch (redirectError) {
            // Only log redirect failures in development
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to redirect after authentication error:', redirectError);
            }
            // In case redirect fails, throw the original error
            throw new Error('Authentication required but unable to redirect');
        }
        
        // This should never be reached due to redirect, but satisfy TypeScript
        throw error;
    }
};
