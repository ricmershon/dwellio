import { cookies } from "next/headers";

import { VIEWPORT_WIDTH_COOKIE_NAME } from "@/types";

/**
 * Retrieves viewport width from browser cookies
 * @returns Viewport width in pixels, or 0 if not available or invalid
 */
export const getViewportWidth = async () => {
    try {
        // Validate VIEWPORT_WIDTH_COOKIE_NAME is defined
        if (!VIEWPORT_WIDTH_COOKIE_NAME) {
            console.warn('getViewportWidth: VIEWPORT_WIDTH_COOKIE_NAME is not defined');
            return 0;
        }
        
        const cookieStore = await cookies();
        
        // Validate cookieStore was retrieved successfully
        if (!cookieStore) {
            console.warn('getViewportWidth: cookies() returned null or undefined');
            return 0;
        }
        
        const viewportCookie = cookieStore.get(VIEWPORT_WIDTH_COOKIE_NAME)?.value;
        
        // Check if cookie exists and has a value
        if (!viewportCookie) {
            // This is normal - no warning needed for missing viewport cookie
            return 0;
        }
        
        // Validate cookie value is a string
        if (typeof viewportCookie !== 'string') {
            console.warn('getViewportWidth: viewport cookie value is not a string');
            return 0;
        }
        
        // Convert to number with validation
        const width = Number(viewportCookie);
        
        // Validate the conversion was successful
        if (isNaN(width)) {
            console.warn('getViewportWidth: viewport cookie value is not a valid number:', viewportCookie);
            return 0;
        }
        
        // Validate width is a reasonable viewport size
        if (width < 0) {
            console.warn('getViewportWidth: negative viewport width detected:', width);
            return 0;
        }
        
        if (width > 10000) {
            console.warn('getViewportWidth: suspiciously large viewport width detected:', width);
            // Don't return 0 here as ultra-wide monitors exist, but log for monitoring
        }
        
        return width;
    } catch (error) {
        // Only log unexpected errors in development or non-build scenarios
        if (process.env.NODE_ENV === 'development' || 
            (error instanceof Error && !error.message.includes('DYNAMIC_SERVER_USAGE'))) {
            console.error('getViewportWidth: error retrieving viewport width:', error);
        }
        return 0;
    }
}