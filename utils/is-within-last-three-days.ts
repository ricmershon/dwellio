/**
 * Checks if a given date is within the last 3 days (inclusive)
 * @param date - Date to check
 * @returns true if date is within the last 3 days, false otherwise
 */
export const isWithinLastThreeDays = (date: Date) => {
    // Input validation
    if (!date) {
        console.warn('isWithinLastThreeDays: date parameter is null or undefined');
        return false;
    }
    
    if (!(date instanceof Date)) {
        console.warn('isWithinLastThreeDays: date parameter is not a Date object');
        return false;
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.warn('isWithinLastThreeDays: date parameter is an invalid Date');
        return false;
    }
    
    try {
        const now = new Date();
        
        // Validate current date is valid (should always be, but safety first)
        if (isNaN(now.getTime())) {
            console.error('isWithinLastThreeDays: current date is invalid');
            return false;
        }

        /**
         * Get date for 3 days ago
         */
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(now.getDate() - 3);
        
        // Validate the calculated past date
        if (isNaN(threeDaysAgo.getTime())) {
            console.error('isWithinLastThreeDays: calculated threeDaysAgo date is invalid');
            return false;
        }

        // Perform the comparison
        const result = date >= threeDaysAgo && date <= now;
        
        return result;
    } catch (error) {
        console.error('isWithinLastThreeDays: error during date comparison:', error);
        return false;
    }
};