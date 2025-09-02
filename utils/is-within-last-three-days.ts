export const isWithinLastThreeDays = (date: Date) => {
    const now = new Date();

    /**
     * Get date for 3 days ago
     */
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);

    return date >= threeDaysAgo && date <= now;
};