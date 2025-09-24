import { isWithinLastThreeDays } from '@/utils/is-within-last-three-days';

describe('Date Utility Functions', () => {
    describe('isWithinLastThreeDays', () => {
        const originalDate = global.Date;

        beforeEach(() => {
            // Mock current time to a fixed date for consistent testing
            // January 15, 2024, 12:00:00 UTC
            const mockNow = new Date('2024-01-15T12:00:00.000Z');
            jest.useFakeTimers();
            jest.setSystemTime(mockNow);
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        describe('Valid Date Inputs', () => {
            it('should return true for current date', () => {
                const currentDate = new Date('2024-01-15T12:00:00.000Z');
                expect(isWithinLastThreeDays(currentDate)).toBe(true);
            });

            it('should return true for dates within the last 3 days', () => {
                // January 14, 2024 (1 day ago)
                const oneDayAgo = new Date('2024-01-14T12:00:00.000Z');
                expect(isWithinLastThreeDays(oneDayAgo)).toBe(true);

                // January 13, 2024 (2 days ago)
                const twoDaysAgo = new Date('2024-01-13T12:00:00.000Z');
                expect(isWithinLastThreeDays(twoDaysAgo)).toBe(true);

                // January 12, 2024 (3 days ago - boundary)
                const threeDaysAgo = new Date('2024-01-12T12:00:00.000Z');
                expect(isWithinLastThreeDays(threeDaysAgo)).toBe(true);
            });

            it('should return false for dates older than 3 days', () => {
                // January 11, 2024 (4 days ago)
                const fourDaysAgo = new Date('2024-01-11T12:00:00.000Z');
                expect(isWithinLastThreeDays(fourDaysAgo)).toBe(false);

                // January 10, 2024 (5 days ago)
                const fiveDaysAgo = new Date('2024-01-10T12:00:00.000Z');
                expect(isWithinLastThreeDays(fiveDaysAgo)).toBe(false);

                // Much older date
                const veryOld = new Date('2023-01-15T12:00:00.000Z');
                expect(isWithinLastThreeDays(veryOld)).toBe(false);
            });

            it('should return false for future dates', () => {
                // January 16, 2024 (1 day in future)
                const tomorrow = new Date('2024-01-16T12:00:00.000Z');
                expect(isWithinLastThreeDays(tomorrow)).toBe(false);

                // January 20, 2024 (5 days in future)
                const fiveDaysFromNow = new Date('2024-01-20T12:00:00.000Z');
                expect(isWithinLastThreeDays(fiveDaysFromNow)).toBe(false);
            });
        });

        describe('Boundary Testing', () => {
            it('should handle exact 3-day boundary correctly', () => {
                // Test exactly 3 days ago at the same time
                const exactlyThreeDaysAgo = new Date('2024-01-12T12:00:00.000Z');
                expect(isWithinLastThreeDays(exactlyThreeDaysAgo)).toBe(true);

                // Test just before 3 days ago (still within range)
                const justBeforeThreeDays = new Date('2024-01-12T12:00:01.000Z');
                expect(isWithinLastThreeDays(justBeforeThreeDays)).toBe(true);

                // Test just after 3 days ago (outside range)
                const justAfterThreeDays = new Date('2024-01-12T11:59:59.000Z');
                expect(isWithinLastThreeDays(justAfterThreeDays)).toBe(false);
            });

            it('should handle different times within valid days', () => {
                // Same day but different times
                const earlyMorning = new Date('2024-01-15T00:00:00.000Z');
                const lateNight = new Date('2024-01-15T12:00:01.000Z'); // Just after current time

                expect(isWithinLastThreeDays(earlyMorning)).toBe(true);
                expect(isWithinLastThreeDays(lateNight)).toBe(false); // Future time

                // Different times 2 days ago
                const twoDaysAgoMorning = new Date('2024-01-13T00:00:00.000Z');
                const twoDaysAgoEvening = new Date('2024-01-13T23:59:59.000Z');

                expect(isWithinLastThreeDays(twoDaysAgoMorning)).toBe(true);
                expect(isWithinLastThreeDays(twoDaysAgoEvening)).toBe(true);
            });
        });

        describe('Input Validation', () => {
            it('should return false for null input', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                const result = isWithinLastThreeDays(null as any);

                expect(result).toBe(false);
                expect(consoleSpy).toHaveBeenCalledWith('isWithinLastThreeDays: date parameter is null or undefined');

                consoleSpy.mockRestore();
            });

            it('should return false for undefined input', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                const result = isWithinLastThreeDays(undefined as any);

                expect(result).toBe(false);
                expect(consoleSpy).toHaveBeenCalledWith('isWithinLastThreeDays: date parameter is null or undefined');

                consoleSpy.mockRestore();
            });

            it('should return false for non-Date object input', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(isWithinLastThreeDays('2024-01-15' as any)).toBe(false);
                expect(isWithinLastThreeDays(1705320000000 as any)).toBe(false);
                expect(isWithinLastThreeDays({} as any)).toBe(false);
                expect(isWithinLastThreeDays([] as any)).toBe(false);

                expect(consoleSpy).toHaveBeenCalledWith('isWithinLastThreeDays: date parameter is not a Date object');

                consoleSpy.mockRestore();
            });

            it('should return false for invalid Date objects', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                const invalidDate = new Date('invalid-date-string');
                const result = isWithinLastThreeDays(invalidDate);

                expect(result).toBe(false);
                expect(consoleSpy).toHaveBeenCalledWith('isWithinLastThreeDays: date parameter is an invalid Date');

                consoleSpy.mockRestore();
            });
        });

        describe('Edge Cases and Error Handling', () => {
            it('should handle leap years correctly', () => {
                // Mock February 29, 2024 (leap year)
                const leapYearNow = new Date('2024-02-29T12:00:00.000Z');
                jest.setSystemTime(leapYearNow);

                // February 26, 2024 (3 days ago during leap year)
                const threeDaysAgoLeapYear = new Date('2024-02-26T12:00:00.000Z');
                expect(isWithinLastThreeDays(threeDaysAgoLeapYear)).toBe(true);

                // February 25, 2024 (4 days ago during leap year)
                const fourDaysAgoLeapYear = new Date('2024-02-25T12:00:00.000Z');
                expect(isWithinLastThreeDays(fourDaysAgoLeapYear)).toBe(false);
            });

            it('should handle month boundaries correctly', () => {
                // Mock March 2, 2024
                const marchSecond = new Date('2024-03-02T12:00:00.000Z');
                jest.setSystemTime(marchSecond);

                // February 28, 2024 (3 days ago, crossing month boundary)
                const crossingMonthBoundary = new Date('2024-02-28T12:00:00.000Z');
                expect(isWithinLastThreeDays(crossingMonthBoundary)).toBe(true);

                // February 27, 2024 (4 days ago)
                const outsideRange = new Date('2024-02-27T12:00:00.000Z');
                expect(isWithinLastThreeDays(outsideRange)).toBe(false);
            });

            it('should handle year boundaries correctly', () => {
                // Mock January 2, 2025
                const newYearSecond = new Date('2025-01-02T12:00:00.000Z');
                jest.setSystemTime(newYearSecond);

                // December 30, 2024 (3 days ago, crossing year boundary)
                const crossingYearBoundary = new Date('2024-12-30T12:00:00.000Z');
                expect(isWithinLastThreeDays(crossingYearBoundary)).toBe(true);

                // December 29, 2024 (4 days ago)
                const outsideRangeNewYear = new Date('2024-12-29T12:00:00.000Z');
                expect(isWithinLastThreeDays(outsideRangeNewYear)).toBe(false);
            });

            it('should handle timezone considerations', () => {
                // Test with different timezone formats (but times should be compared as-is)
                const utcDate = new Date('2024-01-13T12:00:00.000Z');
                const isoDate = new Date('2024-01-13T12:00:00.000Z');

                expect(isWithinLastThreeDays(utcDate)).toBe(true);
                expect(isWithinLastThreeDays(isoDate)).toBe(true);
            });

            it('should handle error in current date calculation', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                // Mock Date constructor to return invalid date
                const originalDate = global.Date;
                global.Date = class extends originalDate {
                    constructor(...args: any[]) {
                        super();
                        if (args.length === 0) {
                            // Make current date invalid
                            this.setTime(NaN);
                        }
                    }
                } as any;

                const testDate = new originalDate('2024-01-15T12:00:00.000Z');
                const result = isWithinLastThreeDays(testDate);

                expect(result).toBe(false);
                expect(consoleSpy).toHaveBeenCalledWith('isWithinLastThreeDays: current date is invalid');

                global.Date = originalDate;
                consoleSpy.mockRestore();
            });

            it('should handle error in date calculation', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                // Mock setDate to return invalid timestamp
                const originalSetDate = Date.prototype.setDate;
                Date.prototype.setDate = jest.fn().mockImplementation(function(this: Date, day: number) {
                    // Call original but then make the date invalid
                    originalSetDate.call(this, day);
                    this.setTime(NaN);
                    return NaN;
                });

                const testDate = new Date('2024-01-13T12:00:00.000Z');
                const result = isWithinLastThreeDays(testDate);

                expect(result).toBe(false);
                expect(consoleSpy).toHaveBeenCalledWith('isWithinLastThreeDays: calculated threeDaysAgo date is invalid');

                Date.prototype.setDate = originalSetDate;
                consoleSpy.mockRestore();
            });

        });

        describe('Real-world Usage Scenarios', () => {
            it('should correctly identify recent blog posts', () => {
                // Blog post from yesterday
                const yesterdayPost = new Date('2024-01-14T08:30:00.000Z');
                expect(isWithinLastThreeDays(yesterdayPost)).toBe(true);

                // Blog post from last week
                const weekOldPost = new Date('2024-01-08T08:30:00.000Z');
                expect(isWithinLastThreeDays(weekOldPost)).toBe(false);
            });

            it('should correctly identify recent user activity', () => {
                // User logged in 2 days ago
                const recentActivity = new Date('2024-01-13T14:22:00.000Z');
                expect(isWithinLastThreeDays(recentActivity)).toBe(true);

                // User logged in a week ago
                const oldActivity = new Date('2024-01-08T14:22:00.000Z');
                expect(isWithinLastThreeDays(oldActivity)).toBe(false);
            });

            it('should correctly identify recent notifications', () => {
                // Notification from this morning
                const todayNotification = new Date('2024-01-15T09:15:00.000Z');
                expect(isWithinLastThreeDays(todayNotification)).toBe(true);

                // Notification from 3 days ago
                const threeDayNotification = new Date('2024-01-12T16:45:00.000Z');
                expect(isWithinLastThreeDays(threeDayNotification)).toBe(true);

                // Old notification from last month
                const oldNotification = new Date('2023-12-15T16:45:00.000Z');
                expect(isWithinLastThreeDays(oldNotification)).toBe(false);
            });

            it('should handle message timestamp filtering', () => {
                // Recent message
                const recentMessage = new Date('2024-01-14T20:30:00.000Z');
                expect(isWithinLastThreeDays(recentMessage)).toBe(true);

                // Older message thread
                const oldMessage = new Date('2024-01-10T20:30:00.000Z');
                expect(isWithinLastThreeDays(oldMessage)).toBe(false);
            });
        });

        describe('Performance and Consistency', () => {
            it('should handle multiple consecutive calls consistently', () => {
                const testDate = new Date('2024-01-14T12:00:00.000Z');

                // Multiple calls should return the same result
                expect(isWithinLastThreeDays(testDate)).toBe(true);
                expect(isWithinLastThreeDays(testDate)).toBe(true);
                expect(isWithinLastThreeDays(testDate)).toBe(true);
            });

            it('should handle array of dates efficiently', () => {
                const dates = [
                    new Date('2024-01-15T12:00:00.000Z'), // today
                    new Date('2024-01-14T12:00:00.000Z'), // 1 day ago
                    new Date('2024-01-13T12:00:00.000Z'), // 2 days ago
                    new Date('2024-01-12T12:00:00.000Z'), // 3 days ago
                    new Date('2024-01-11T12:00:00.000Z'), // 4 days ago
                ];

                const results = dates.map(date => isWithinLastThreeDays(date));

                expect(results).toEqual([true, true, true, true, false]);
            });
        });
    });
});