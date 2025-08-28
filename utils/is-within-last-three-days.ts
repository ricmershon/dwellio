export const isWithinLastWeek = (date: Date) => {
    const now = new Date();

    /**
     * Get date for 7 days ago
     */
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 3);

    return date >= oneWeekAgo && date <= now;
};