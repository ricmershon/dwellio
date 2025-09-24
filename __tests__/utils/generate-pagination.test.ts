import { generatePagination } from '@/utils/generate-pagination';

describe('Pagination Generation Utilities', () => {
    describe('generatePagination', () => {
        describe('Basic Functionality', () => {
            it('should return all pages when totalPages is 5 or less', () => {
                expect(generatePagination(1, 1)).toEqual([1]);
                expect(generatePagination(1, 2)).toEqual([1, 2]);
                expect(generatePagination(2, 3)).toEqual([1, 2, 3]);
                expect(generatePagination(3, 4)).toEqual([1, 2, 3, 4]);
                expect(generatePagination(4, 5)).toEqual([1, 2, 3, 4, 5]);
            });

            it('should handle first 3 pages with ellipsis pattern', () => {
                expect(generatePagination(1, 10)).toEqual([1, 2, 3, "...", 9, 10]);
                expect(generatePagination(2, 10)).toEqual([1, 2, 3, "...", 9, 10]);
                expect(generatePagination(3, 10)).toEqual([1, 2, 3, "...", 9, 10]);
            });

            it('should handle last 3 pages with ellipsis pattern', () => {
                expect(generatePagination(8, 10)).toEqual([1, 2, "...", 8, 9, 10]);
                expect(generatePagination(9, 10)).toEqual([1, 2, "...", 8, 9, 10]);
                expect(generatePagination(10, 10)).toEqual([1, 2, "...", 8, 9, 10]);
            });

            it('should handle middle pages with double ellipsis pattern', () => {
                expect(generatePagination(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
                expect(generatePagination(6, 10)).toEqual([1, "...", 5, 6, 7, "...", 10]);
                expect(generatePagination(7, 12)).toEqual([1, "...", 6, 7, 8, "...", 12]);
            });
        });

        describe('Input Validation', () => {
            it('should handle non-number inputs', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(generatePagination('5' as any, 10)).toEqual([1]);
                expect(generatePagination(5, '10' as any)).toEqual([1]);
                expect(generatePagination(null as any, 10)).toEqual([1]);
                expect(generatePagination(5, undefined as any)).toEqual([1]);

                expect(consoleSpy).toHaveBeenCalledWith('generatePagination: currentPage and totalPages must be numbers');

                consoleSpy.mockRestore();
            });

            it('should handle non-integer inputs', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(generatePagination(5.5, 10)).toEqual([1]);
                expect(generatePagination(5, 10.7)).toEqual([1]);
                expect(generatePagination(3.14, 6.28)).toEqual([1]);

                expect(consoleSpy).toHaveBeenCalledWith('generatePagination: currentPage and totalPages must be integers');

                consoleSpy.mockRestore();
            });

            it('should handle totalPages less than 1', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(generatePagination(1, 0)).toEqual([1]);
                expect(generatePagination(1, -5)).toEqual([1]);

                expect(consoleSpy).toHaveBeenCalledWith('generatePagination: totalPages must be at least 1');

                consoleSpy.mockRestore();
            });

            it('should handle currentPage less than 1', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(generatePagination(0, 10)).toEqual([1, 2, 3, "...", 9, 10]);
                expect(generatePagination(-3, 10)).toEqual([1, 2, 3, "...", 9, 10]);

                expect(consoleSpy).toHaveBeenCalledWith('generatePagination: currentPage must be at least 1, defaulting to page 1');

                consoleSpy.mockRestore();
            });

            it('should handle currentPage greater than totalPages', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(generatePagination(15, 10)).toEqual([1, 2, "...", 8, 9, 10]);
                expect(generatePagination(100, 5)).toEqual([1, 2, 3, 4, 5]);

                expect(consoleSpy).toHaveBeenCalledWith('generatePagination: currentPage (15) exceeds totalPages (10), defaulting to last page');

                consoleSpy.mockRestore();
            });
        });

        describe('Edge Cases', () => {
            it('should handle exactly 6 pages with different current pages', () => {
                expect(generatePagination(1, 6)).toEqual([1, 2, 3, "...", 5, 6]);
                expect(generatePagination(3, 6)).toEqual([1, 2, 3, "...", 5, 6]);
                expect(generatePagination(4, 6)).toEqual([1, 2, "...", 4, 5, 6]);
                expect(generatePagination(6, 6)).toEqual([1, 2, "...", 4, 5, 6]);
            });

            it('should handle exactly 7 pages with different current pages', () => {
                expect(generatePagination(1, 7)).toEqual([1, 2, 3, "...", 6, 7]);
                expect(generatePagination(3, 7)).toEqual([1, 2, 3, "...", 6, 7]);
                expect(generatePagination(4, 7)).toEqual([1, "...", 3, 4, 5, "...", 7]);
                expect(generatePagination(5, 7)).toEqual([1, 2, "...", 5, 6, 7]);
                expect(generatePagination(7, 7)).toEqual([1, 2, "...", 5, 6, 7]);
            });

            it('should handle large pagination ranges', () => {
                expect(generatePagination(50, 100)).toEqual([1, "...", 49, 50, 51, "...", 100]);
                expect(generatePagination(2, 100)).toEqual([1, 2, 3, "...", 99, 100]);
                expect(generatePagination(99, 100)).toEqual([1, 2, "...", 98, 99, 100]);
            });

            it('should handle single page', () => {
                expect(generatePagination(1, 1)).toEqual([1]);
            });
        });

        describe('Boundary Testing', () => {
            it('should handle transition points correctly for first pattern', () => {
                // Testing the boundary where currentPage <= 3
                expect(generatePagination(3, 10)).toEqual([1, 2, 3, "...", 9, 10]);
                expect(generatePagination(4, 10)).toEqual([1, "...", 3, 4, 5, "...", 10]);
            });

            it('should handle transition points correctly for last pattern', () => {
                // Testing the boundary where currentPage >= totalPages - 2
                expect(generatePagination(8, 10)).toEqual([1, 2, "...", 8, 9, 10]); // 8 >= 10-2
                expect(generatePagination(7, 10)).toEqual([1, "...", 6, 7, 8, "...", 10]); // 7 < 10-2
            });

            it('should handle minimum viable pagination scenarios', () => {
                // 6 pages is the minimum for ellipsis patterns
                expect(generatePagination(1, 6)).toEqual([1, 2, 3, "...", 5, 6]);
                expect(generatePagination(4, 6)).toEqual([1, 2, "...", 4, 5, 6]);
            });
        });

        describe('Error Handling', () => {
            it('should handle processing errors gracefully', () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                // Mock Array.from to throw an error
                const originalArrayFrom = Array.from;
                Array.from = jest.fn().mockImplementation(() => {
                    throw new Error('Array processing error');
                });

                const result = generatePagination(3, 5);

                expect(result).toEqual([1]);
                expect(consoleSpy).toHaveBeenCalledWith('generatePagination: error generating pagination:', expect.any(Error));

                Array.from = originalArrayFrom;
                consoleSpy.mockRestore();
            });

            it('should handle extremely large numbers', () => {
                expect(generatePagination(1000000, 1000000)).toEqual([1, 2, "...", 999998, 999999, 1000000]);
            });

            it('should handle zero and negative edge cases', () => {
                const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

                expect(generatePagination(0, 0)).toEqual([1]);
                expect(generatePagination(-1, -1)).toEqual([1]);

                consoleSpy.mockRestore();
            });
        });

        describe('Real-world Usage Scenarios', () => {
            it('should handle typical blog pagination', () => {
                // 25 pages of blog posts, viewing different pages
                expect(generatePagination(1, 25)).toEqual([1, 2, 3, "...", 24, 25]);
                expect(generatePagination(13, 25)).toEqual([1, "...", 12, 13, 14, "...", 25]);
                expect(generatePagination(24, 25)).toEqual([1, 2, "...", 23, 24, 25]);
            });

            it('should handle e-commerce product pagination', () => {
                // 50 pages of products
                expect(generatePagination(1, 50)).toEqual([1, 2, 3, "...", 49, 50]);
                expect(generatePagination(25, 50)).toEqual([1, "...", 24, 25, 26, "...", 50]);
                expect(generatePagination(48, 50)).toEqual([1, 2, "...", 48, 49, 50]);
            });

            it('should handle search results pagination', () => {
                // 15 pages of search results
                expect(generatePagination(1, 15)).toEqual([1, 2, 3, "...", 14, 15]);
                expect(generatePagination(8, 15)).toEqual([1, "...", 7, 8, 9, "...", 15]);
                expect(generatePagination(13, 15)).toEqual([1, 2, "...", 13, 14, 15]);
            });

            it('should handle user listing pagination', () => {
                // 100 users across pages
                expect(generatePagination(1, 100)).toEqual([1, 2, 3, "...", 99, 100]);
                expect(generatePagination(50, 100)).toEqual([1, "...", 49, 50, 51, "...", 100]);
                expect(generatePagination(98, 100)).toEqual([1, 2, "...", 98, 99, 100]);
            });

            it('should handle small pagination sets', () => {
                // Small datasets that might not need ellipsis
                expect(generatePagination(1, 2)).toEqual([1, 2]);
                expect(generatePagination(2, 3)).toEqual([1, 2, 3]);
                expect(generatePagination(3, 4)).toEqual([1, 2, 3, 4]);
            });
        });

        describe('Performance and Consistency', () => {
            it('should always include page 1 and last page in results > 5 pages', () => {
                for (let totalPages = 6; totalPages <= 20; totalPages++) {
                    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
                        const result = generatePagination(currentPage, totalPages);
                        expect(result).toContain(1);
                        expect(result).toContain(totalPages);
                    }
                }
            });

            it('should always include current page in results', () => {
                const testCases = [
                    [1, 10], [5, 10], [10, 10],
                    [1, 25], [13, 25], [25, 25],
                    [1, 3], [2, 3], [3, 3]
                ];

                testCases.forEach(([currentPage, totalPages]) => {
                    const result = generatePagination(currentPage, totalPages);
                    expect(result).toContain(currentPage);
                });
            });

            it('should maintain consistent array structure', () => {
                // All results should be arrays with numbers and/or ellipsis strings
                const testCases = [
                    [1, 10], [5, 15], [3, 7], [8, 12], [1, 1]
                ];

                testCases.forEach(([currentPage, totalPages]) => {
                    const result = generatePagination(currentPage, totalPages);
                    expect(Array.isArray(result)).toBe(true);
                    expect(result.length).toBeGreaterThan(0);

                    result.forEach(item => {
                        expect(typeof item === 'number' || item === '...').toBe(true);
                    });
                });
            });
        });
    });
});