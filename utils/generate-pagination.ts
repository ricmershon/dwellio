/**
 * Generates pagination array with ellipsis for efficient navigation
 * @param currentPage - Current active page (1-based)
 * @param totalPages - Total number of pages available
 * @returns Array of page numbers and ellipsis strings
 */
export const generatePagination = (currentPage: number, totalPages: number) => {
    // Input validation
    if (typeof currentPage !== 'number' || typeof totalPages !== 'number') {
        console.warn('generatePagination: currentPage and totalPages must be numbers');
        return [1];
    }
    
    if (!Number.isInteger(currentPage) || !Number.isInteger(totalPages)) {
        console.warn('generatePagination: currentPage and totalPages must be integers');
        return [1];
    }
    
    if (totalPages < 1) {
        console.warn('generatePagination: totalPages must be at least 1');
        return [1];
    }
    
    if (currentPage < 1) {
        console.warn('generatePagination: currentPage must be at least 1, defaulting to page 1');
        currentPage = 1;
    }
    
    if (currentPage > totalPages) {
        console.warn(`generatePagination: currentPage (${currentPage}) exceeds totalPages (${totalPages}), defaulting to last page`);
        currentPage = totalPages;
    }

    try {
        /**
         * Return pagination without ellipsis if total number of pages is 5 or less.
         */
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        /**
         * Return "1", "2", "3", an ellipsis and the last 2 pages if the current page
         * is one of the first 3.
         */
        if (currentPage <= 3) {
            return [1, 2, 3, "...", totalPages - 1, totalPages];
        }

        /**
         * Return "1", "2", an ellipsis and the last 3 pages if the current page is
         * one of the last 3 pages.
         */
        if (currentPage >= totalPages - 2) {
            return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
        }

        /**
         * Return "1", an ellipsis, the current pages and its neighbors, another
         * ellipsis and the last page if the current page is somewhere in the
         * middle.
         */
        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    } catch (error) {
        console.error('generatePagination: error generating pagination:', error);
        // Return safe fallback pagination
        return [1];
    }
};