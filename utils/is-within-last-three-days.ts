export const isWithinLastThreeDays = (date: Date) => {
    const now = new Date();

    /**
     * Get date for 3 days ago
     */
    const threeDaysAgog = new Date();
    threeDaysAgog.setDate(now.getDate() - 3);

    return date >= threeDaysAgog && date <= now;
};