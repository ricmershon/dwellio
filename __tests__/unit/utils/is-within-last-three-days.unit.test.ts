import { isWithinLastThreeDays } from "@/utils/is-within-last-three-days";

describe("isWithinLastThreeDays", () => {
    // Mock console methods to test warning/error logging
    const consoleSpy = {
        warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        consoleSpy.warn.mockClear();
        consoleSpy.error.mockClear();
        jest.useRealTimers();
    });

    afterAll(() => {
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe("Valid date scenarios within three days", () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
        });

        it("should return true for current date", () => {
            const currentDate = new Date("2024-01-15T12:00:00.000Z");

            const result = isWithinLastThreeDays(currentDate);

            expect(result).toBe(true);
        });

        it("should return true for yesterday", () => {
            const yesterday = new Date("2024-01-14T12:00:00.000Z");

            const result = isWithinLastThreeDays(yesterday);

            expect(result).toBe(true);
        });

        it("should return true for two days ago", () => {
            const twoDaysAgo = new Date("2024-01-13T12:00:00.000Z");

            const result = isWithinLastThreeDays(twoDaysAgo);

            expect(result).toBe(true);
        });

        it("should return true for three days ago", () => {
            const threeDaysAgo = new Date("2024-01-12T12:00:00.000Z");

            const result = isWithinLastThreeDays(threeDaysAgo);

            expect(result).toBe(true);
        });

        it("should return true for date on boundary", () => {
            const boundaryDate = new Date("2024-01-12T12:00:00.000Z");

            const result = isWithinLastThreeDays(boundaryDate);

            expect(result).toBe(true);
        });

        it("should return true for early morning of current day", () => {
            const earlyMorning = new Date("2024-01-15T00:00:00.001Z");

            const result = isWithinLastThreeDays(earlyMorning);

            expect(result).toBe(true);
        });
    });

    describe("Valid date scenarios outside three days", () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
        });

        it("should return false for four days ago", () => {
            const fourDaysAgo = new Date("2024-01-11T12:00:00.000Z");

            const result = isWithinLastThreeDays(fourDaysAgo);

            expect(result).toBe(false);
        });

        it("should return false for one week ago", () => {
            const oneWeekAgo = new Date("2024-01-08T12:00:00.000Z");

            const result = isWithinLastThreeDays(oneWeekAgo);

            expect(result).toBe(false);
        });

        it("should return false for one month ago", () => {
            const oneMonthAgo = new Date("2023-12-15T12:00:00.000Z");

            const result = isWithinLastThreeDays(oneMonthAgo);

            expect(result).toBe(false);
        });

        it("should return false for one year ago", () => {
            const oneYearAgo = new Date("2023-01-15T12:00:00.000Z");

            const result = isWithinLastThreeDays(oneYearAgo);

            expect(result).toBe(false);
        });

        it("should return false for future dates", () => {
            const tomorrow = new Date("2024-01-16T12:00:00.000Z");

            const result = isWithinLastThreeDays(tomorrow);

            expect(result).toBe(false);
        });

        it("should return false for far future dates", () => {
            const farFuture = new Date("2025-01-15T12:00:00.000Z");

            const result = isWithinLastThreeDays(farFuture);

            expect(result).toBe(false);
        });
    });

    describe("Invalid input handling", () => {
        it("should return false for null input", () => {
            const result = isWithinLastThreeDays(null as any);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is null or undefined"
            );
        });

        it("should return false for undefined input", () => {
            const result = isWithinLastThreeDays(undefined as any);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is null or undefined"
            );
        });

        it("should return false for string input", () => {
            const result = isWithinLastThreeDays("2024-01-15" as any);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is not a Date object"
            );
        });

        it("should return false for number input", () => {
            const result = isWithinLastThreeDays(1705320000000 as any);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is not a Date object"
            );
        });

        it("should return false for invalid Date object", () => {
            const invalidDate = new Date("invalid-date");

            const result = isWithinLastThreeDays(invalidDate);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is an invalid Date"
            );
        });

        it("should return false for Date object with NaN time", () => {
            const nanDate = new Date(NaN);

            const result = isWithinLastThreeDays(nanDate);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is an invalid Date"
            );
        });

        it("should return false for object that is not a Date", () => {
            const fakeDate = {
                getTime: () => Date.now(),
                toString: () => "fake date"
            };

            const result = isWithinLastThreeDays(fakeDate as any);

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "isWithinLastThreeDays: date parameter is not a Date object"
            );
        });
    });

    describe("Timezone and daylight saving time scenarios", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        it("should handle timezone differences correctly", () => {
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

            const sameTimeUTC = new Date("2024-01-15T12:00:00.000Z");

            const result = isWithinLastThreeDays(sameTimeUTC);

            expect(result).toBe(true);
        });

        it("should handle daylight saving time transitions", () => {
            jest.setSystemTime(new Date("2024-03-10T12:00:00.000Z"));

            const threeDaysAgo = new Date("2024-03-07T13:00:00.000Z");

            const result = isWithinLastThreeDays(threeDaysAgo);

            expect(result).toBe(true);
        });

        it("should handle end of year date transitions", () => {
            jest.setSystemTime(new Date("2024-01-02T12:00:00.000Z"));

            const lastYearDate = new Date("2023-12-30T12:00:00.000Z");

            const result = isWithinLastThreeDays(lastYearDate);

            expect(result).toBe(true);
        });

        it("should handle leap year February dates", () => {
            jest.setSystemTime(new Date("2024-03-01T12:00:00.000Z"));

            const feb29 = new Date("2024-02-29T12:00:00.000Z");

            const result = isWithinLastThreeDays(feb29);

            expect(result).toBe(true);
        });
    });

    describe("Edge cases and boundary conditions", () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
        });

        it("should handle exactly 72 hours ago", () => {
            const exactly72HoursAgo = new Date("2024-01-12T12:00:00.000Z");

            const result = isWithinLastThreeDays(exactly72HoursAgo);

            expect(result).toBe(true);
        });

        it("should handle just under 72 hours ago", () => {
            const just72HoursAgo = new Date("2024-01-12T12:00:01.000Z");

            const result = isWithinLastThreeDays(just72HoursAgo);

            expect(result).toBe(true);
        });

        it("should return false for dates just outside the range", () => {
            const justOutside = new Date("2024-01-11T23:59:59.999Z");

            const result = isWithinLastThreeDays(justOutside);

            expect(result).toBe(false);
        });

        it("should handle very old dates", () => {
            const veryOldDate = new Date("1900-01-01T00:00:00.000Z");

            const result = isWithinLastThreeDays(veryOldDate);

            expect(result).toBe(false);
        });

        it("should handle dates at epoch (1970)", () => {
            const epochDate = new Date(0);

            const result = isWithinLastThreeDays(epochDate);

            expect(result).toBe(false);
        });

        it("should handle maximum JavaScript date", () => {
            const maxDate = new Date(8640000000000000);

            const result = isWithinLastThreeDays(maxDate);

            expect(result).toBe(false);
        });

        it("should handle minimum JavaScript date", () => {
            const minDate = new Date(-8640000000000000);

            const result = isWithinLastThreeDays(minDate);

            expect(result).toBe(false);
        });
    });

    describe("Performance considerations", () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
        });

        it("should complete quickly", () => {
            const testDate = new Date("2024-01-14T12:00:00.000Z");

            const start = performance.now();
            const result = isWithinLastThreeDays(testDate);
            const end = performance.now();

            expect(result).toBe(true);
            expect(end - start).toBeLessThan(10);
        });

        it("should handle multiple concurrent calls", () => {
            const testDate = new Date("2024-01-14T12:00:00.000Z");

            const results = Array.from({ length: 100 }, () => isWithinLastThreeDays(testDate));

            results.forEach(result => {
                expect(result).toBe(true);
            });
        });

        it("should handle large numbers of different dates efficiently", () => {
            const dates = Array.from({ length: 1000 }, (_, i) =>
                new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
            );

            const start = performance.now();
            const results = dates.map(date => isWithinLastThreeDays(date));
            const end = performance.now();

            expect(results.filter(Boolean)).toHaveLength(4);
            expect(end - start).toBeLessThan(100);
        });
    });

    describe("Real-world usage scenarios", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        it("should work correctly for user activity tracking", () => {
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

            const userLastSeen = new Date("2024-01-13T08:30:00.000Z");

            const result = isWithinLastThreeDays(userLastSeen);

            expect(result).toBe(true);
        });

        it("should work correctly for content freshness checking", () => {
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

            const contentCreated = new Date("2024-01-10T15:45:00.000Z");

            const result = isWithinLastThreeDays(contentCreated);

            expect(result).toBe(false);
        });

        it("should work correctly for notification relevance", () => {
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

            const notificationTime = new Date("2024-01-14T20:15:00.000Z");

            const result = isWithinLastThreeDays(notificationTime);

            expect(result).toBe(true);
        });

        it("should work correctly for cache expiration logic", () => {
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

            const cacheTime = new Date("2024-01-11T12:00:00.000Z");

            const result = isWithinLastThreeDays(cacheTime);

            expect(result).toBe(false);
        });
    });

    describe("Return type and consistency", () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
        });

        it("should always return boolean type", () => {
            const validDate = new Date("2024-01-14T12:00:00.000Z");
            const result = isWithinLastThreeDays(validDate);

            expect(typeof result).toBe("boolean");
        });

        it("should return consistent results for same input", () => {
            const testDate = new Date("2024-01-14T12:00:00.000Z");

            const result1 = isWithinLastThreeDays(testDate);
            const result2 = isWithinLastThreeDays(testDate);
            const result3 = isWithinLastThreeDays(testDate);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            expect(result1).toBe(true);
        });

        it("should handle Date object modifications after call", () => {
            const testDate = new Date("2024-01-14T12:00:00.000Z");

            const result1 = isWithinLastThreeDays(testDate);

            testDate.setFullYear(2023);

            const result2 = isWithinLastThreeDays(testDate);

            expect(result1).toBe(true);
            expect(result2).toBe(false);
        });
    });
});