export const generatePagination = (currentPage: number, totalPages: number) => {
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
     * elllipsis and the last page if the current page is somewhere in the
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
};