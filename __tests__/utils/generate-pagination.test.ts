/**
 * Generate Pagination Tests
 * 
 * Section 1 of UTILS_TEST_PLAN
 * Tests pagination array generation with ellipsis notation for efficient navigation
 */

import { generatePagination } from "@/utils/generate-pagination";

describe("generatePagination", () => {
    // Suppress console warnings for expected validation failures
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

    describe("Basic Functionality Tests", () => {
        it("should generate correct pagination for ≤5 pages", () => {
            expect(generatePagination(1, 1)).toEqual([1]);
            expect(generatePagination(1, 2)).toEqual([1, 2]);
            expect(generatePagination(2, 3)).toEqual([1, 2, 3]);
            expect(generatePagination(3, 4)).toEqual([1, 2, 3, 4]);
            expect(generatePagination(4, 5)).toEqual([1, 2, 3, 4, 5]);
        });

        it("should handle exactly 5 pages boundary", () => {
            expect(generatePagination(1, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(generatePagination(3, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(generatePagination(5, 5)).toEqual([1, 2, 3, 4, 5]);
        });

        it("should generate ellipsis for >5 pages", () => {
            const result = generatePagination(1, 10);
            expect(result).toContain("...");
            expect(result.length).toBeGreaterThan(5);
        });

        it("should return array of correct length", () => {
            // ≤5 pages: length equals total pages
            expect(generatePagination(1, 3)).toHaveLength(3);
            expect(generatePagination(2, 5)).toHaveLength(5);
            
            // >5 pages: length is 6 (with ellipsis)
            expect(generatePagination(1, 10)).toHaveLength(6);
            expect(generatePagination(5, 20)).toHaveLength(7);
        });
    });

    describe("Current Page Position Tests", () => {
        it("should show beginning pages with end ellipsis when current page ≤3", () => {
            expect(generatePagination(1, 10)).toEqual([1, 2, 3, "...", 9, 10]);
            expect(generatePagination(2, 15)).toEqual([1, 2, 3, "...", 14, 15]);
            expect(generatePagination(3, 20)).toEqual([1, 2, 3, "...", 19, 20]);
        });

        it("should show beginning ellipsis with end pages when current page ≥totalPages-2", () => {
            expect(generatePagination(8, 10)).toEqual([1, 2, "...", 8, 9, 10]);
            expect(generatePagination(13, 15)).toEqual([1, 2, "...", 13, 14, 15]);
            expect(generatePagination(18, 20)).toEqual([1, 2, "...", 18, 19, 20]);
        });

        it("should show both ellipsis for middle current page", () => {
            expect(generatePagination(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
            expect(generatePagination(8, 15)).toEqual([1, "...", 7, 8, 9, "...", 15]);
            expect(generatePagination(10, 20)).toEqual([1, "...", 9, 10, 11, "...", 20]);
        });

        it("should handle edge positions (page 3 to 4 transition)", () => {
            // Page 3 should still show beginning format
            expect(generatePagination(3, 10)).toEqual([1, 2, 3, "...", 9, 10]);
            
            // Page 4 should switch to middle format
            expect(generatePagination(4, 10)).toEqual([1, "...", 3, 4, 5, "...", 10]);
        });

        it("should handle edge positions (page n-2 to n-3 transition)", () => {
            // Page 8 (totalPages-2) should show end format
            expect(generatePagination(8, 10)).toEqual([1, 2, "...", 8, 9, 10]);
            
            // Page 7 (totalPages-3) should show middle format
            expect(generatePagination(7, 10)).toEqual([1, "...", 6, 7, 8, "...", 10]);
        });
    });

    describe("Input Validation Tests", () => {
        it("should return [1] for non-number inputs", () => {
            expect(generatePagination("1" as any, 10)).toEqual([1]);
            expect(generatePagination(1, "10" as any)).toEqual([1]);
            expect(generatePagination("1" as any, "10" as any)).toEqual([1]);
            expect(generatePagination(null as any, 10)).toEqual([1]);
            expect(generatePagination(1, undefined as any)).toEqual([1]);
            
            expect(console.warn).toHaveBeenCalledWith(
                'generatePagination: currentPage and totalPages must be numbers'
            );
        });

        it("should return [1] for non-integer inputs", () => {
            expect(generatePagination(3.5, 10)).toEqual([1]);
            expect(generatePagination(2, 10.9)).toEqual([1]);
            expect(generatePagination(2.1, 5.7)).toEqual([1]);
            
            expect(console.warn).toHaveBeenCalledWith(
                'generatePagination: currentPage and totalPages must be integers'
            );
        });

        it("should return [1] when totalPages < 1", () => {
            expect(generatePagination(1, 0)).toEqual([1]);
            expect(generatePagination(1, -1)).toEqual([1]);
            expect(generatePagination(1, -10)).toEqual([1]);
            
            expect(console.warn).toHaveBeenCalledWith(
                'generatePagination: totalPages must be at least 1'
            );
        });

        it("should default to page 1 when currentPage < 1", () => {
            expect(generatePagination(0, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(generatePagination(-1, 3)).toEqual([1, 2, 3]);
            expect(generatePagination(-10, 10)).toEqual([1, 2, 3, "...", 9, 10]);
            
            expect(console.warn).toHaveBeenCalledWith(
                'generatePagination: currentPage must be at least 1, defaulting to page 1'
            );
        });

        it("should default to last page when currentPage > totalPages", () => {
            expect(generatePagination(10, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(generatePagination(15, 10)).toEqual([1, 2, "...", 8, 9, 10]);
            expect(generatePagination(100, 7)).toEqual([1, 2, "...", 5, 6, 7]);
            
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('exceeds totalPages')
            );
        });

        it("should handle zero and negative values correctly", () => {
            expect(generatePagination(0, 0)).toEqual([1]);
            expect(generatePagination(-5, -3)).toEqual([1]);
            expect(generatePagination(0, 10)).toEqual([1, 2, 3, "...", 9, 10]);
        });
    });

    describe("Edge Cases Tests", () => {
        it("should handle very large page numbers", () => {
            const result1000 = generatePagination(500, 1000);
            expect(result1000).toEqual([1, "...", 499, 500, 501, "...", 1000]);
            
            const result999 = generatePagination(1, 999);
            expect(result999).toEqual([1, 2, 3, "...", 998, 999]);
            
            const result9999 = generatePagination(9999, 9999);
            expect(result9999).toEqual([1, 2, "...", 9997, 9998, 9999]);
        });

        it("should handle currentPage equals totalPages", () => {
            expect(generatePagination(1, 1)).toEqual([1]);
            expect(generatePagination(5, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(generatePagination(10, 10)).toEqual([1, 2, "...", 8, 9, 10]);
        });

        it("should handle currentPage equals 1", () => {
            expect(generatePagination(1, 1)).toEqual([1]);
            expect(generatePagination(1, 5)).toEqual([1, 2, 3, 4, 5]);
            expect(generatePagination(1, 10)).toEqual([1, 2, 3, "...", 9, 10]);
        });

        it("should handle null and undefined inputs", () => {
            expect(generatePagination(null as any, null as any)).toEqual([1]);
            expect(generatePagination(undefined as any, undefined as any)).toEqual([1]);
            expect(generatePagination(5, null as any)).toEqual([1]);
            expect(generatePagination(undefined as any, 10)).toEqual([1]);
        });
    });

    describe("Error Handling Tests", () => {
        it("should return [1] for invalid calculation scenarios", () => {
            // Test with Infinity
            expect(generatePagination(Infinity, 10)).toEqual([1]);
            expect(generatePagination(1, Infinity)).toEqual([1]);
            
            // Test with NaN
            expect(generatePagination(NaN, 10)).toEqual([1]);
            expect(generatePagination(1, NaN)).toEqual([1]);
        });

        it("should handle try-catch block for unexpected errors", () => {
            // Mock Array.from to throw an error
            const originalArrayFrom = Array.from;
            Array.from = jest.fn().mockImplementation(() => {
                throw new Error("Mock error");
            });
            
            const result = generatePagination(1, 3);
            expect(result).toEqual([1]);
            expect(console.error).toHaveBeenCalledWith(
                'generatePagination: error generating pagination:',
                expect.any(Error)
            );
            
            // Restore Array.from
            Array.from = originalArrayFrom;
        });

        it("should never throw exceptions", () => {
            // Test various problematic inputs that should not throw
            expect(() => generatePagination(null as any, undefined as any)).not.toThrow();
            expect(() => generatePagination({} as any, [] as any)).not.toThrow();
            expect(() => generatePagination(Infinity, -Infinity)).not.toThrow();
            expect(() => generatePagination(NaN, NaN)).not.toThrow();
        });
    });

    describe("Boundary and Transition Tests", () => {
        it("should handle 6-page boundary (first case needing ellipsis)", () => {
            expect(generatePagination(1, 6)).toEqual([1, 2, 3, "...", 5, 6]);
            expect(generatePagination(3, 6)).toEqual([1, 2, 3, "...", 5, 6]);
            expect(generatePagination(4, 6)).toEqual([1, 2, "...", 4, 5, 6]);
            expect(generatePagination(6, 6)).toEqual([1, 2, "...", 4, 5, 6]);
        });

        it("should maintain consistency in transition zones", () => {
            // Test the transition from beginning format to middle format
            const totalPages = 12;
            expect(generatePagination(3, totalPages)).toEqual([1, 2, 3, "...", 11, 12]);
            expect(generatePagination(4, totalPages)).toEqual([1, "...", 3, 4, 5, "...", 12]);
            
            // Test the transition from middle format to end format
            expect(generatePagination(9, totalPages)).toEqual([1, "...", 8, 9, 10, "...", 12]);
            expect(generatePagination(10, totalPages)).toEqual([1, 2, "...", 10, 11, 12]);
        });
    });
});