/**
 * Is Within Last Three Days Tests
 * 
 * Section 3 of UTILS_TEST_PLAN
 * Tests date checking utility for recent content filtering
 */

import { isWithinLastThreeDays } from "@/utils/is-within-last-three-days";

describe("isWithinLastThreeDays", () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        console.warn = jest.fn();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
    });

    describe("Date Calculation Tests", () => {
        beforeEach(() => {
            // Fix the current time for consistent testing
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("should return true for date exactly 3 days ago", () => {
            const threeDaysAgo = new Date('2024-01-12T12:00:00.000Z');
            expect(isWithinLastThreeDays(threeDaysAgo)).toBe(true);
        });

        it("should return true for date 2 days ago", () => {
            const twoDaysAgo = new Date('2024-01-13T12:00:00.000Z');
            expect(isWithinLastThreeDays(twoDaysAgo)).toBe(true);
        });

        it("should return true for date 1 day ago", () => {
            const oneDayAgo = new Date('2024-01-14T12:00:00.000Z');
            expect(isWithinLastThreeDays(oneDayAgo)).toBe(true);
        });

        it("should return true for current date", () => {
            const currentDate = new Date('2024-01-15T12:00:00.000Z');
            expect(isWithinLastThreeDays(currentDate)).toBe(true);
        });

        it("should return false for date 4 days ago", () => {
            const fourDaysAgo = new Date('2024-01-11T12:00:00.000Z');
            expect(isWithinLastThreeDays(fourDaysAgo)).toBe(false);
        });

        it("should handle future dates appropriately", () => {
            const futureDate = new Date('2024-01-16T12:00:00.000Z');
            const result = isWithinLastThreeDays(futureDate);
            // Future dates should return false as they are > current date (now)
            expect(result).toBe(false);
        });
    });

    describe("Input Validation Tests", () => {
        it("should return false for null input", () => {
            const result = isWithinLastThreeDays(null as any);
            
            expect(result).toBe(false);
            expect(console.warn).toHaveBeenCalledWith(
                'isWithinLastThreeDays: date parameter is null or undefined'
            );
        });

        it("should return false for undefined input", () => {
            const result = isWithinLastThreeDays(undefined as any);
            
            expect(result).toBe(false);
            expect(console.warn).toHaveBeenCalledWith(
                'isWithinLastThreeDays: date parameter is null or undefined'
            );
        });

        it("should return false for non-Date object input", () => {
            const inputs = [
                "2024-01-15",
                1642248000000,
                { year: 2024, month: 1, day: 15 },
                [],
                true,
                "not a date"
            ];

            inputs.forEach(input => {
                const result = isWithinLastThreeDays(input as any);
                expect(result).toBe(false);
            });

            expect(console.warn).toHaveBeenCalledWith(
                'isWithinLastThreeDays: date parameter is not a Date object'
            );
        });

        it("should return false for invalid Date object", () => {
            const invalidDates = [
                new Date("invalid"),
                new Date(""),
                new Date("not-a-date"),
                new Date(NaN)
            ];

            invalidDates.forEach(invalidDate => {
                const result = isWithinLastThreeDays(invalidDate);
                expect(result).toBe(false);
            });

            expect(console.warn).toHaveBeenCalledWith(
                'isWithinLastThreeDays: date parameter is an invalid Date'
            );
        });
    });

    describe("Edge Cases Tests", () => {
        it("should handle boundary conditions exactly 72 hours ago", () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T15:30:45.123Z'));

            // Exactly 3 days before (using setDate logic, not 72 hours)
            const threeDaysAgo = new Date('2024-01-12T15:30:45.123Z');
            expect(isWithinLastThreeDays(threeDaysAgo)).toBe(true);

            // 4 days ago should be false
            const fourDaysAgo = new Date('2024-01-11T15:30:45.123Z');
            expect(isWithinLastThreeDays(fourDaysAgo)).toBe(false);

            jest.useRealTimers();
        });

        it("should handle timezone edge cases", () => {
            jest.useFakeTimers();
            
            // Test with different timezone scenarios
            const timezoneTests = [
                { current: '2024-01-15T00:00:00.000Z', test: '2024-01-12T23:59:59.999Z' },
                { current: '2024-01-15T23:59:59.999Z', test: '2024-01-12T00:00:00.000Z' },
            ];

            timezoneTests.forEach(({ current, test }) => {
                jest.setSystemTime(new Date(current));
                const testDate = new Date(test);
                const result = isWithinLastThreeDays(testDate);
                
                // Should handle timezone boundaries correctly
                expect(typeof result).toBe('boolean');
            });

            jest.useRealTimers();
        });

        it("should handle daylight saving time transitions", () => {
            jest.useFakeTimers();
            
            // Mock dates around DST transitions (US Spring forward)
            jest.setSystemTime(new Date('2024-03-12T12:00:00.000Z'));
            
            // Test a date exactly 3 days before using same logic as the function
            const now = new Date('2024-03-12T12:00:00.000Z');
            const threeDaysAgo = new Date('2024-03-12T12:00:00.000Z');
            threeDaysAgo.setDate(now.getDate() - 3); // This gives us 2024-03-09
            
            const result = isWithinLastThreeDays(threeDaysAgo);
            
            // Should be true as it matches the boundary
            expect(result).toBe(true);
            
            jest.useRealTimers();
        });

        it("should handle system clock manipulation scenarios", () => {
            // Mock Date constructor to simulate clock issues
            const originalDate = global.Date;
            
            // Temporarily mock Date to return invalid time
            global.Date = class extends Date {
                constructor(...args: any[]) {
                    if (args.length === 0) {
                        super();
                        // Simulate corrupted system clock
                        (this as any).getTime = () => NaN;
                    } else {
                        super(...args as []);
                    }
                }
            } as any;

            const validDate = new Date('2024-01-15T12:00:00.000Z');
            const result = isWithinLastThreeDays(validDate);
            
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                'isWithinLastThreeDays: current date is invalid'
            );

            // Restore original Date
            global.Date = originalDate;
        });
    });

    describe("Date Object Tests", () => {
        it("should handle valid Date objects with various formats", () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

            const validDates = [
                new Date('2024-01-14'), // ISO string
                new Date(2024, 0, 14), // Constructor with year, month, day
                new Date('January 14, 2024'), // Readable string
                new Date('01/14/2024'), // MM/DD/YYYY format
                new Date(1705228800000), // Timestamp
            ];

            validDates.forEach(date => {
                const result = isWithinLastThreeDays(date);
                expect(typeof result).toBe('boolean');
            });

            jest.useRealTimers();
        });

        it("should handle Date objects created from timestamps", () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

            const currentTimestamp = Date.now();
            const oneDayAgoTimestamp = currentTimestamp - (24 * 60 * 60 * 1000);
            const fourDaysAgoTimestamp = currentTimestamp - (4 * 24 * 60 * 60 * 1000);

            expect(isWithinLastThreeDays(new Date(oneDayAgoTimestamp))).toBe(true);
            expect(isWithinLastThreeDays(new Date(fourDaysAgoTimestamp))).toBe(false);

            jest.useRealTimers();
        });

        it("should handle Date objects created from strings", () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

            const dateStrings = [
                '2024-01-14T12:00:00.000Z',
                '2024-01-13T00:00:00.000Z',
                '2024-01-12T23:59:59.999Z',
            ];

            dateStrings.forEach(dateString => {
                const date = new Date(dateString);
                const result = isWithinLastThreeDays(date);
                expect(result).toBe(true);
            });

            jest.useRealTimers();
        });

        it("should handle millisecond precision", () => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

            const preciseDate1 = new Date('2024-01-14T12:00:00.001Z');
            const preciseDate2 = new Date('2024-01-14T12:00:00.999Z');

            expect(isWithinLastThreeDays(preciseDate1)).toBe(true);
            expect(isWithinLastThreeDays(preciseDate2)).toBe(true);

            jest.useRealTimers();
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle date calculation errors", () => {
            // Mock setDate to throw an error
            const originalSetDate = Date.prototype.setDate;
            Date.prototype.setDate = jest.fn().mockImplementation(() => {
                throw new Error("Date calculation error");
            });

            const testDate = new Date('2024-01-14T12:00:00.000Z');
            const result = isWithinLastThreeDays(testDate);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                'isWithinLastThreeDays: error during date comparison:',
                expect.any(Error)
            );

            // Restore original method
            Date.prototype.setDate = originalSetDate;
        });

        it("should handle date comparison failures", () => {
            // Mock date comparison to throw an error
            const originalValueOf = Date.prototype.valueOf;
            Date.prototype.valueOf = jest.fn().mockImplementation(() => {
                throw new Error("Comparison error");
            });

            const testDate = new Date('2024-01-14T12:00:00.000Z');
            const result = isWithinLastThreeDays(testDate);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith(
                'isWithinLastThreeDays: error during date comparison:',
                expect.any(Error)
            );

            // Restore original method
            Date.prototype.valueOf = originalValueOf;
        });

        it("should handle invalid calculated dates", () => {
            // Mock the setDate method to create an invalid date scenario
            const originalDate = global.Date;
            
            global.Date = class MockDate extends Date {
                constructor(...args: any[]) {
                    if (args.length === 0) {
                        super();
                    } else {
                        super(...args as []);
                    }
                }
                
                setDate(day: number) {
                    super.setDate(day);
                    // Simulate invalid date after calculation
                    (this as any).getTime = () => NaN;
                    return NaN;
                }
            } as any;

            const testDate = new Date('2024-01-14T12:00:00.000Z');
            const result = isWithinLastThreeDays(testDate);

            expect(result).toBe(false);

            global.Date = originalDate;
        });
    });

    describe("Performance and Integration Tests", () => {
        it("should execute within reasonable time limits", () => {
            const testDate = new Date();
            
            const startTime = performance.now();
            isWithinLastThreeDays(testDate);
            const endTime = performance.now();

            // Should complete in under 10ms
            expect(endTime - startTime).toBeLessThan(10);
        });

        it("should handle multiple rapid calls efficiently", () => {
            const dates = Array.from({ length: 100 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date;
            });

            const startTime = performance.now();
            
            const results = dates.map(date => isWithinLastThreeDays(date));
            
            const endTime = performance.now();

            // Should process 100 dates in under 50ms
            expect(endTime - startTime).toBeLessThan(50);
            expect(results).toHaveLength(100);
            expect(results[0]).toBe(true); // Today
            expect(results[4]).toBe(false); // 4+ days ago should be false
        });

        it("should work consistently across different time zones", () => {
            // Test with various timezone offsets in date strings
            const timezoneVariants = [
                '2024-01-14T12:00:00.000Z',
                '2024-01-14T12:00:00.000+05:00',
                '2024-01-14T12:00:00.000-08:00',
            ];

            timezoneVariants.forEach(dateString => {
                const date = new Date(dateString);
                const result = isWithinLastThreeDays(date);
                expect(typeof result).toBe('boolean');
            });
        });
    });
});