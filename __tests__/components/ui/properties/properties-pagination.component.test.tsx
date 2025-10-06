import { render, screen } from '@testing-library/react';

import PropertiesPagination from '@/ui/properties/properties-pagination';
import * as generatePagination from '@/utils/generate-pagination';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock('@/ui/shared/pagination-arrow', () => ({
    __esModule: true,
    default: ({ direction, href, isDisabled }: any) => (
        <a
            data-testid={`pagination-arrow-${direction}`}
            href={href}
            aria-disabled={isDisabled}
        >
            {direction}
        </a>
    ),
}));

jest.mock('@/ui/shared/pagination-number', () => ({
    __esModule: true,
    default: ({ href, page, position, isActive }: any) => (
        <a
            data-testid={`pagination-number-${page}`}
            href={href}
            data-position={position}
            aria-current={isActive ? 'page' : undefined}
        >
            {page}
        </a>
    ),
}));

// ✅ Internal Dependencies (Real - spied)
jest.spyOn(generatePagination, 'generatePagination');

// ============================================================================
// MOCK SETUP
// ============================================================================
const { usePathname, useSearchParams } = require('next/navigation');

const mockUsePathname = usePathname as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;

const createMockSearchParams = (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return {
        get: (key: string) => searchParams.get(key),
        toString: () => searchParams.toString(),
        [Symbol.iterator]: searchParams[Symbol.iterator].bind(searchParams),
    };
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('PropertiesPagination Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockUsePathname.mockReturnValue('/properties');
        mockUseSearchParams.mockReturnValue(createMockSearchParams());
        (generatePagination.generatePagination as jest.Mock).mockImplementation(
            (current, total) => Array.from({ length: total }, (_, i) => i + 1)
        );
    });

    // ========================================================================
    // Pagination Generation
    // ========================================================================
    describe('Pagination Generation', () => {
        it('should call generatePagination with currentPage and totalPages', () => {
            render(<PropertiesPagination currentPage={3} totalPages={10} />);

            expect(generatePagination.generatePagination).toHaveBeenCalledWith(3, 10);
        });

        it('should render pagination numbers for all pages', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3, 4, 5]);

            render(<PropertiesPagination currentPage={1} totalPages={5} />);

            expect(screen.getByTestId('pagination-number-1')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-2')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-3')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-4')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-5')).toBeInTheDocument();
        });

        it('should render ellipsis in pagination', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, '...', 5]);

            render(<PropertiesPagination currentPage={1} totalPages={5} />);

            expect(screen.getByTestId('pagination-number-1')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-...')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-5')).toBeInTheDocument();
        });

        it('should handle single page', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1]);

            render(<PropertiesPagination currentPage={1} totalPages={1} />);

            const pageNumber = screen.getByTestId('pagination-number-1');
            expect(pageNumber).toHaveAttribute('data-position', 'single');
        });

        it('should memoize pagination generation result', () => {
            const { rerender } = render(<PropertiesPagination currentPage={1} totalPages={5} />);

            expect(generatePagination.generatePagination).toHaveBeenCalledTimes(1);

            // Rerender with same props
            rerender(<PropertiesPagination currentPage={1} totalPages={5} />);

            // Should not call again due to useMemo
            expect(generatePagination.generatePagination).toHaveBeenCalledTimes(1);
        });

        it('should regenerate pagination when currentPage changes', () => {
            const { rerender } = render(<PropertiesPagination currentPage={1} totalPages={5} />);

            expect(generatePagination.generatePagination).toHaveBeenCalledTimes(1);

            // Rerender with different currentPage
            rerender(<PropertiesPagination currentPage={2} totalPages={5} />);

            expect(generatePagination.generatePagination).toHaveBeenCalledTimes(2);
        });

        it('should regenerate pagination when totalPages changes', () => {
            const { rerender } = render(<PropertiesPagination currentPage={1} totalPages={5} />);

            expect(generatePagination.generatePagination).toHaveBeenCalledTimes(1);

            // Rerender with different totalPages
            rerender(<PropertiesPagination currentPage={1} totalPages={10} />);

            expect(generatePagination.generatePagination).toHaveBeenCalledTimes(2);
        });
    });

    // ========================================================================
    // Page URL Creation
    // ========================================================================
    describe('Page URL Creation', () => {
        it('should create URL with page parameter', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3]);

            render(<PropertiesPagination currentPage={1} totalPages={3} />);

            const page2Link = screen.getByTestId('pagination-number-2');
            expect(page2Link).toHaveAttribute('href', '/properties?page=2');
        });

        it('should preserve existing search parameters', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'apartment' }));
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3]);

            render(<PropertiesPagination currentPage={1} totalPages={3} />);

            const page2Link = screen.getByTestId('pagination-number-2');
            expect(page2Link).toHaveAttribute('href', '/properties?query=apartment&page=2');
        });

        it('should preserve multiple search parameters', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(
                createMockSearchParams({ query: 'apartment', type: 'condo', city: 'nyc' })
            );
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2]);

            render(<PropertiesPagination currentPage={1} totalPages={2} />);

            const page2Link = screen.getByTestId('pagination-number-2');
            const href = page2Link.getAttribute('href') || '';
            expect(href).toContain('query=apartment');
            expect(href).toContain('type=condo');
            expect(href).toContain('city=nyc');
            expect(href).toContain('page=2');
        });

        it('should override existing page parameter', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ page: '5', query: 'test' }));
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3]);

            render(<PropertiesPagination currentPage={5} totalPages={3} />);

            const page2Link = screen.getByTestId('pagination-number-2');
            expect(page2Link).toHaveAttribute('href', '/properties?page=2&query=test');
        });

        it('should use current pathname in URL', () => {
            mockUsePathname.mockReturnValue('/properties/search');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2]);

            render(<PropertiesPagination currentPage={1} totalPages={2} />);

            const page2Link = screen.getByTestId('pagination-number-2');
            expect(page2Link).toHaveAttribute('href', '/properties/search?page=2');
        });

        it('should memoize createPageURL function', () => {
            mockUsePathname.mockReturnValue('/properties');
            const mockSearchParams = createMockSearchParams();
            mockUseSearchParams.mockReturnValue(mockSearchParams);
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3]);

            const { rerender } = render(<PropertiesPagination currentPage={1} totalPages={3} />);

            const firstPage2Link = screen.getByTestId('pagination-number-2');
            const firstHref = firstPage2Link.getAttribute('href');

            // Rerender with same pathname and searchParams
            rerender(<PropertiesPagination currentPage={1} totalPages={3} />);

            const secondPage2Link = screen.getByTestId('pagination-number-2');
            const secondHref = secondPage2Link.getAttribute('href');

            expect(firstHref).toBe(secondHref);
        });
    });

    // ========================================================================
    // Pagination Arrows
    // ========================================================================
    describe('Pagination Arrows', () => {
        it('should render left and right arrows', () => {
            render(<PropertiesPagination currentPage={5} totalPages={10} />);

            expect(screen.getByTestId('pagination-arrow-left')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-arrow-right')).toBeInTheDocument();
        });

        it('should disable left arrow on first page', () => {
            render(<PropertiesPagination currentPage={1} totalPages={10} />);

            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'true');
        });

        it('should enable left arrow on non-first page', () => {
            render(<PropertiesPagination currentPage={2} totalPages={10} />);

            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'false');
        });

        it('should disable right arrow on last page', () => {
            render(<PropertiesPagination currentPage={10} totalPages={10} />);

            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'true');
        });

        it('should enable right arrow on non-last page', () => {
            render(<PropertiesPagination currentPage={9} totalPages={10} />);

            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'false');
        });

        it('should create correct href for left arrow', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertiesPagination currentPage={5} totalPages={10} />);

            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('href', '/properties?page=4');
        });

        it('should create correct href for right arrow', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());

            render(<PropertiesPagination currentPage={5} totalPages={10} />);

            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('href', '/properties?page=6');
        });

        it('should preserve search params in arrow hrefs', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'downtown' }));

            render(<PropertiesPagination currentPage={3} totalPages={10} />);

            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');

            expect(leftArrow).toHaveAttribute('href', '/properties?query=downtown&page=2');
            expect(rightArrow).toHaveAttribute('href', '/properties?query=downtown&page=4');
        });

        it('should both arrows be disabled on single page', () => {
            render(<PropertiesPagination currentPage={1} totalPages={1} />);

            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');

            expect(leftArrow).toHaveAttribute('aria-disabled', 'true');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'true');
        });
    });

    // ========================================================================
    // Pagination Number Positions
    // ========================================================================
    describe('Pagination Number Positions', () => {
        it('should mark first number with "first" position', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3, 4, 5]);

            render(<PropertiesPagination currentPage={1} totalPages={5} />);

            const firstNumber = screen.getByTestId('pagination-number-1');
            expect(firstNumber).toHaveAttribute('data-position', 'first');
        });

        it('should mark last number with "last" position', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3, 4, 5]);

            render(<PropertiesPagination currentPage={1} totalPages={5} />);

            const lastNumber = screen.getByTestId('pagination-number-5');
            expect(lastNumber).toHaveAttribute('data-position', 'last');
        });

        it('should mark ellipsis with "middle" position', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, '...', 10]);

            render(<PropertiesPagination currentPage={1} totalPages={10} />);

            const ellipsis = screen.getByTestId('pagination-number-...');
            expect(ellipsis).toHaveAttribute('data-position', 'middle');
        });

        it('should mark single page with "single" position', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1]);

            render(<PropertiesPagination currentPage={1} totalPages={1} />);

            const singleNumber = screen.getByTestId('pagination-number-1');
            expect(singleNumber).toHaveAttribute('data-position', 'single');
        });

        it('should handle first and last in same pagination', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2]);

            render(<PropertiesPagination currentPage={1} totalPages={2} />);

            const firstNumber = screen.getByTestId('pagination-number-1');
            const lastNumber = screen.getByTestId('pagination-number-2');

            expect(firstNumber).toHaveAttribute('data-position', 'first');
            expect(lastNumber).toHaveAttribute('data-position', 'last');
        });
    });

    // ========================================================================
    // Active Page Indication
    // ========================================================================
    describe('Active Page Indication', () => {
        it('should mark current page as active', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3, 4, 5]);

            render(<PropertiesPagination currentPage={3} totalPages={5} />);

            const activePage = screen.getByTestId('pagination-number-3');
            expect(activePage).toHaveAttribute('aria-current', 'page');
        });

        it('should not mark other pages as active', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3, 4, 5]);

            render(<PropertiesPagination currentPage={3} totalPages={5} />);

            const page1 = screen.getByTestId('pagination-number-1');
            const page2 = screen.getByTestId('pagination-number-2');
            const page4 = screen.getByTestId('pagination-number-4');
            const page5 = screen.getByTestId('pagination-number-5');

            expect(page1).not.toHaveAttribute('aria-current');
            expect(page2).not.toHaveAttribute('aria-current');
            expect(page4).not.toHaveAttribute('aria-current');
            expect(page5).not.toHaveAttribute('aria-current');
        });

        it('should mark first page as active when on page 1', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3]);

            render(<PropertiesPagination currentPage={1} totalPages={3} />);

            const activePage = screen.getByTestId('pagination-number-1');
            expect(activePage).toHaveAttribute('aria-current', 'page');
        });

        it('should mark last page as active when on last page', () => {
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([8, 9, 10]);

            render(<PropertiesPagination currentPage={10} totalPages={10} />);

            const activePage = screen.getByTestId('pagination-number-10');
            expect(activePage).toHaveAttribute('aria-current', 'page');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Full Pagination Behavior', () => {
        it('should render complete pagination for middle page', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams({ query: 'apartment' }));
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, '...', 4, 5, 6, '...', 10]);

            render(<PropertiesPagination currentPage={5} totalPages={10} />);

            // Verify arrows
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'false');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'false');
            expect(leftArrow).toHaveAttribute('href', '/properties?query=apartment&page=4');
            expect(rightArrow).toHaveAttribute('href', '/properties?query=apartment&page=6');

            // Verify pagination numbers
            expect(screen.getByTestId('pagination-number-1')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-4')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-5')).toHaveAttribute('aria-current', 'page');
            expect(screen.getByTestId('pagination-number-6')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-number-10')).toBeInTheDocument();
        });

        it('should render complete pagination for first page', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, 2, 3, '...', 10]);

            render(<PropertiesPagination currentPage={1} totalPages={10} />);

            // Verify left arrow disabled
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'true');

            // Verify right arrow enabled
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'false');

            // Verify page 1 is active
            const activePage = screen.getByTestId('pagination-number-1');
            expect(activePage).toHaveAttribute('aria-current', 'page');
        });

        it('should render complete pagination for last page', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1, '...', 8, 9, 10]);

            render(<PropertiesPagination currentPage={10} totalPages={10} />);

            // Verify left arrow enabled
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'false');

            // Verify right arrow disabled
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'true');

            // Verify page 10 is active
            const activePage = screen.getByTestId('pagination-number-10');
            expect(activePage).toHaveAttribute('aria-current', 'page');
        });

        it('should handle single page scenario completely', () => {
            mockUsePathname.mockReturnValue('/properties');
            mockUseSearchParams.mockReturnValue(createMockSearchParams());
            (generatePagination.generatePagination as jest.Mock).mockReturnValue([1]);

            render(<PropertiesPagination currentPage={1} totalPages={1} />);

            // Both arrows disabled
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'true');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'true');

            // Single page active with "single" position
            const singlePage = screen.getByTestId('pagination-number-1');
            expect(singlePage).toHaveAttribute('aria-current', 'page');
            expect(singlePage).toHaveAttribute('data-position', 'single');
        });
    });
});
