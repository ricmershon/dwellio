import React from 'react';
import { render, screen, createNextNavigationMock } from '@/__tests__/test-utils';
import PropertiesPagination from '@/ui/properties/properties-pagination';
import { generatePagination } from '@/utils/generate-pagination';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
    ...createNextNavigationMock(),
    usePathname: jest.fn(() => '/properties'),
}));

// Mock clsx to handle class objects properly
jest.mock('clsx', () => {
    return (...args: unknown[]) => {
        return args
            .flat()
            .filter(Boolean)
            .map(arg => {
                if (typeof arg === 'string') return arg;
                if (typeof arg === 'object' && arg !== null) {
                    return Object.entries(arg)
                        .filter(([, value]) => Boolean(value))
                        .map(([key]) => key)
                        .join(' ');
                }
                return '';
            })
            .filter(Boolean)
            .join(' ');
    };
});

// Mock Link component
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
        <a href={href} className={className} data-testid="pagination-link">
            {children}
        </a>
    ),
}));

// Mock heroicons for PaginationArrow component
jest.mock('@heroicons/react/24/outline', () => ({
    ArrowLeftIcon: ({ className }: { className?: string }) => (
        <div data-testid="arrow-left-icon" className={className}>←</div>
    ),
    ArrowRightIcon: ({ className }: { className?: string }) => (
        <div data-testid="arrow-right-icon" className={className}>→</div>
    ),
}));

// Mock generatePagination utility - we'll test this separately
jest.mock('@/utils/generate-pagination');
const mockGeneratePagination = generatePagination as jest.MockedFunction<typeof generatePagination>;

// Get mocks from the navigation mock
const { mockPush, mockReplace, mockSearchParams } = jest.requireMock('next/navigation');

describe('PropertiesPagination', () => {
    const defaultProps = {
        currentPage: 1,
        totalPages: 10,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear URLSearchParams manually (it doesn't have a clear() method)
        Array.from(mockSearchParams.keys()).forEach(key => {
            mockSearchParams.delete(key);
        });
        // Reset pathname mock to default
        const { usePathname } = jest.mocked(jest.requireMock('next/navigation'));
        usePathname.mockReturnValue('/properties');
        // Default mock implementation
        mockGeneratePagination.mockReturnValue([1, 2, 3, '...', 9, 10]);
    });

    describe('Component Structure', () => {
        it('should render main container with correct class', () => {
            const { container } = render(<PropertiesPagination {...defaultProps} />);
            
            const mainContainer = container.querySelector('.inline-flex');
            expect(mainContainer).toBeInTheDocument();
            expect(mainContainer).toHaveClass('inline-flex');
        });

        it('should render left arrow, pagination numbers, and right arrow', () => {
            const { container } = render(<PropertiesPagination {...defaultProps} />);
            
            // Check for arrow icons instead of mock data-testids
            expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
            expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
            
            // Check for pagination numbers container
            const numbersContainer = container.querySelector('.flex.-space-x-px');
            expect(numbersContainer).toBeInTheDocument();
            
            // Verify we have the expected pagination elements (1, 2, 3, ..., 9, 10)
            expect(screen.getByText('1')).toBeInTheDocument(); // Active page
            expect(screen.getByText('2')).toBeInTheDocument(); 
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
            expect(screen.getByText('9')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });

        it('should render pagination numbers container with correct classes', () => {
            const { container } = render(<PropertiesPagination {...defaultProps} />);
            
            const numbersContainer = container.querySelector('.flex.-space-x-px');
            expect(numbersContainer).toBeInTheDocument();
        });
    });

    describe('URL Generation', () => {
        it('should create URLs with page parameter', () => {
            render(<PropertiesPagination currentPage={2} totalPages={5} />);
            
            // Check link hrefs for arrows - arrows render as Links when not disabled
            const leftArrowLink = screen.getByTestId('arrow-left-icon').parentElement;
            const rightArrowLink = screen.getByTestId('arrow-right-icon').parentElement;
            
            expect(leftArrowLink).toHaveAttribute('href', '/properties?page=1');
            expect(rightArrowLink).toHaveAttribute('href', '/properties?page=3');
        });

        it('should preserve existing search parameters', () => {
            mockSearchParams.set('search', 'villa');
            mockSearchParams.set('location', 'miami');
            
            render(<PropertiesPagination currentPage={3} totalPages={8} />);
            
            const leftArrowLink = screen.getByTestId('arrow-left-icon').parentElement;
            const rightArrowLink = screen.getByTestId('arrow-right-icon').parentElement;
            
            const leftHref = leftArrowLink?.getAttribute('href') || '';
            const rightHref = rightArrowLink?.getAttribute('href') || '';
            
            expect(leftHref).toContain('search=villa');
            expect(leftHref).toContain('location=miami');
            expect(leftHref).toContain('page=2');
            
            expect(rightHref).toContain('search=villa');
            expect(rightHref).toContain('location=miami');
            expect(rightHref).toContain('page=4');
        });

        it('should handle different pathname', () => {
            const { usePathname } = jest.mocked(jest.requireMock('next/navigation'));
            usePathname.mockReturnValue('/properties/featured');
            
            render(<PropertiesPagination currentPage={1} totalPages={5} />);
            
            const rightArrowLink = screen.getByTestId('arrow-right-icon').parentElement;
            expect(rightArrowLink).toHaveAttribute('href', '/properties/featured?page=2');
        });
    });

    describe('Arrow States', () => {
        it('should disable left arrow on first page', () => {
            render(<PropertiesPagination currentPage={1} totalPages={5} />);
            
            const leftArrowIcon = screen.getByTestId('arrow-left-icon');
            const leftArrowContainer = leftArrowIcon.parentElement;
            
            // When disabled, PaginationArrow renders as a div instead of a Link
            expect(leftArrowContainer?.tagName.toLowerCase()).toBe('div');
            expect(leftArrowContainer).toHaveClass('pointer-events-none', 'text-gray-300');
        });

        it('should disable right arrow on last page', () => {
            render(<PropertiesPagination currentPage={5} totalPages={5} />);
            
            const rightArrowIcon = screen.getByTestId('arrow-right-icon');
            const rightArrowContainer = rightArrowIcon.parentElement;
            
            // When disabled, PaginationArrow renders as a div instead of a Link
            expect(rightArrowContainer?.tagName.toLowerCase()).toBe('div');
            expect(rightArrowContainer).toHaveClass('pointer-events-none', 'text-gray-300');
        });

        it('should enable both arrows on middle pages', () => {
            render(<PropertiesPagination currentPage={3} totalPages={5} />);
            
            const leftArrowIcon = screen.getByTestId('arrow-left-icon');
            const rightArrowIcon = screen.getByTestId('arrow-right-icon');
            const leftArrowContainer = leftArrowIcon.parentElement;
            const rightArrowContainer = rightArrowIcon.parentElement;
            
            // When enabled, PaginationArrow renders as a Link
            expect(leftArrowContainer?.tagName.toLowerCase()).toBe('a');
            expect(rightArrowContainer?.tagName.toLowerCase()).toBe('a');
            expect(leftArrowContainer).toHaveClass('hover:bg-gray-100');
            expect(rightArrowContainer).toHaveClass('hover:bg-gray-100');
        });

        it('should handle single page correctly', () => {
            render(<PropertiesPagination currentPage={1} totalPages={1} />);
            
            const leftArrowIcon = screen.getByTestId('arrow-left-icon');
            const rightArrowIcon = screen.getByTestId('arrow-right-icon');
            const leftArrowContainer = leftArrowIcon.parentElement;
            const rightArrowContainer = rightArrowIcon.parentElement;
            
            // Both arrows should be disabled (rendered as divs)
            expect(leftArrowContainer?.tagName.toLowerCase()).toBe('div');
            expect(rightArrowContainer?.tagName.toLowerCase()).toBe('div');
            expect(leftArrowContainer).toHaveClass('pointer-events-none', 'text-gray-300');
            expect(rightArrowContainer).toHaveClass('pointer-events-none', 'text-gray-300');
        });
    });

    describe('Pagination Number Generation', () => {
        it('should call generatePagination with correct parameters', () => {
            render(<PropertiesPagination currentPage={5} totalPages={12} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(5, 12);
        });

        it('should render pagination numbers with correct behavior', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 4, 5, 6, '...', 10]);
            
            render(<PropertiesPagination currentPage={5} totalPages={10} />);
            
            // Check that page 1 is a link (inactive) with first position styling
            const page1Link = screen.getByText('1').closest('a');
            expect(page1Link).toBeInTheDocument();
            expect(page1Link).toHaveAttribute('href', '/properties?page=1');
            expect(page1Link).toHaveClass('rounded-l-md'); // first position
            
            // Check that ellipsis is rendered as div (middle position)
            const ellipsisElements = screen.getAllByText('...');
            expect(ellipsisElements).toHaveLength(2);
            ellipsisElements.forEach(ellipsis => {
                const ellipsisDiv = ellipsis.closest('div');
                expect(ellipsisDiv?.tagName.toLowerCase()).toBe('div');
                expect(ellipsisDiv).toHaveClass('text-gray-300');
            });
            
            // Check that page 5 is active (current page, rendered as div)
            const page5Div = screen.getByText('5').closest('div');
            expect(page5Div).toBeInTheDocument();
            expect(page5Div?.tagName.toLowerCase()).toBe('div');
            expect(page5Div).toHaveClass('z-10', 'bg-blue-700', 'text-white');
            
            // Check that page 10 is a link with last position styling
            const page10Link = screen.getByText('10').closest('a');
            expect(page10Link).toBeInTheDocument();
            expect(page10Link).toHaveAttribute('href', '/properties?page=10');
            expect(page10Link).toHaveClass('rounded-r-md'); // last position
        });

        it('should handle single page pagination', () => {
            mockGeneratePagination.mockReturnValue([1]);
            
            render(<PropertiesPagination currentPage={1} totalPages={1} />);
            
            // For single page, only one page number should be rendered
            expect(screen.getByText('1')).toBeInTheDocument();
            
            // Should have single page styling (both rounded corners)
            const pageElement = screen.getByText('1').closest('div');
            expect(pageElement).toHaveClass('rounded-l-md', 'rounded-r-md');
        });

        it('should generate unique keys for pagination numbers', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 3, '...', 5]);
            
            render(<PropertiesPagination currentPage={3} totalPages={5} />);
            
            // Verify all expected page elements are rendered
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getAllByText('...')).toHaveLength(2);
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
            
            // Check that the active page is styled correctly
            const activePage = screen.getByText('3').closest('div');
            expect(activePage).toHaveClass('z-10', 'bg-blue-700', 'text-white');
        });
    });

    describe('Position Logic', () => {
        it('should set correct positions for multiple pages', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3, 4, 5]);
            
            render(<PropertiesPagination currentPage={3} totalPages={5} />);
            
            // Check that first page link has left rounded corners
            const firstPageLink = screen.getByText('1').closest('a');
            expect(firstPageLink).toHaveClass('rounded-l-md');
            
            // Check that last page link has right rounded corners
            const lastPageLink = screen.getByText('5').closest('a');
            expect(lastPageLink).toHaveClass('rounded-r-md');
            
            // Check that middle pages don't have rounded corners
            const middlePageLink = screen.getByText('2').closest('a');
            expect(middlePageLink).not.toHaveClass('rounded-l-md');
            expect(middlePageLink).not.toHaveClass('rounded-r-md');
        });

        it('should handle ellipsis positions correctly', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 5, 6, 7, '...', 12]);
            
            render(<PropertiesPagination currentPage={6} totalPages={12} />);
            
            // Check that ellipsis elements are rendered as divs (not links)
            const ellipsisElements = screen.getAllByText('...');
            expect(ellipsisElements).toHaveLength(2);
            
            ellipsisElements.forEach(ellipsis => {
                const ellipsisContainer = ellipsis.closest('div');
                expect(ellipsisContainer?.tagName.toLowerCase()).toBe('div');
                expect(ellipsisContainer).toHaveClass('text-gray-300');
            });
            
            // Check first and last pages have proper rounded corners
            const firstPageLink = screen.getByText('1').closest('a');
            expect(firstPageLink).toHaveClass('rounded-l-md');
            
            const lastPageLink = screen.getByText('12').closest('a');
            expect(lastPageLink).toHaveClass('rounded-r-md');
        });
    });

    describe('Props Validation', () => {
        it('should handle zero totalPages', () => {
            mockGeneratePagination.mockReturnValue([]);
            
            render(<PropertiesPagination currentPage={1} totalPages={0} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(1, 0);
            // With zero pages, no pagination numbers should be rendered
            expect(screen.queryByText('1')).not.toBeInTheDocument();
        });

        it('should handle negative currentPage', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3]);
            
            render(<PropertiesPagination currentPage={-1} totalPages={3} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(-1, 3);
        });

        it('should handle currentPage greater than totalPages', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3]);
            
            render(<PropertiesPagination currentPage={5} totalPages={3} />);
            
            // Right arrow should be disabled when currentPage > totalPages
            const rightArrowIcon = screen.getByTestId('arrow-right-icon');
            const rightArrowContainer = rightArrowIcon.parentElement;
            expect(rightArrowContainer?.tagName.toLowerCase()).toBe('div'); // Disabled = div, not link
            expect(rightArrowContainer).toHaveClass('pointer-events-none', 'text-gray-300');
        });

        it('should handle large page numbers', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 998, 999, 1000]);
            
            render(<PropertiesPagination currentPage={999} totalPages={1000} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(999, 1000);
            
            // Check that large page numbers are rendered correctly
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
            expect(screen.getByText('998')).toBeInTheDocument();
            expect(screen.getByText('999')).toBeInTheDocument(); // Active page
            expect(screen.getByText('1000')).toBeInTheDocument();
            
            // Check that page 999 is active
            const activePage = screen.getByText('999').closest('div');
            expect(activePage).toHaveClass('z-10', 'bg-blue-700', 'text-white');
        });
    });

    describe('Memoization', () => {
        it('should memoize pagination generation', () => {
            const { rerender } = render(<PropertiesPagination currentPage={3} totalPages={10} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledTimes(1);
            
            // Re-render with same props - should not call generatePagination again due to useMemo
            rerender(<PropertiesPagination currentPage={3} totalPages={10} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledTimes(1);
        });

        it('should regenerate pagination when props change', () => {
            const { rerender } = render(<PropertiesPagination currentPage={3} totalPages={10} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(3, 10);
            
            rerender(<PropertiesPagination currentPage={4} totalPages={10} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(4, 10);
            expect(mockGeneratePagination).toHaveBeenCalledTimes(2);
        });

        it('should memoize createPageURL callback', () => {
            const { rerender } = render(<PropertiesPagination currentPage={2} totalPages={5} />);
            
            // Get the left arrow link's href
            const initialLeftArrowIcon = screen.getByTestId('arrow-left-icon');
            const initialLeftArrowLink = initialLeftArrowIcon.parentElement;
            const initialHref = initialLeftArrowLink?.getAttribute('href');
            
            // Re-render with same search params - URL should be memoized
            rerender(<PropertiesPagination currentPage={2} totalPages={5} />);
            
            const rerenderedLeftArrowIcon = screen.getByTestId('arrow-left-icon');
            const rerenderedLeftArrowLink = rerenderedLeftArrowIcon.parentElement;
            expect(rerenderedLeftArrowLink?.getAttribute('href')).toBe(initialHref);
        });
    });

    describe('Integration with Dependencies', () => {
        it('should pass correct props to PaginationArrow components', () => {
            render(<PropertiesPagination currentPage={3} totalPages={8} />);
            
            // Get arrow containers through the icons
            const leftArrowIcon = screen.getByTestId('arrow-left-icon');
            const rightArrowIcon = screen.getByTestId('arrow-right-icon');
            const leftArrowContainer = leftArrowIcon.parentElement;
            const rightArrowContainer = rightArrowIcon.parentElement;
            
            // Both arrows should be enabled (rendered as links)
            expect(leftArrowContainer?.tagName.toLowerCase()).toBe('a');
            expect(rightArrowContainer?.tagName.toLowerCase()).toBe('a');
            
            // Check hrefs
            expect(leftArrowContainer).toHaveAttribute('href', '/properties?page=2');
            expect(rightArrowContainer).toHaveAttribute('href', '/properties?page=4');
        });

        it('should pass correct props to PaginationNumber components', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3]);
            
            render(<PropertiesPagination currentPage={2} totalPages={3} />);
            
            // Check first page (inactive - should be a link)
            const page1Link = screen.getByText('1').closest('a');
            expect(page1Link).toBeInTheDocument();
            expect(page1Link).toHaveAttribute('href', '/properties?page=1');
            expect(page1Link).toHaveClass('hover:bg-gray-100');
            
            // Check current page (active - should be a div)
            const page2Div = screen.getByText('2').closest('div');
            expect(page2Div?.tagName.toLowerCase()).toBe('div');
            expect(page2Div).toHaveClass('z-10', 'bg-blue-700', 'text-white');
            
            // Check last page (inactive - should be a link)
            const page3Link = screen.getByText('3').closest('a');
            expect(page3Link).toBeInTheDocument();
            expect(page3Link).toHaveAttribute('href', '/properties?page=3');
            expect(page3Link).toHaveClass('hover:bg-gray-100');
        });
    });

    describe('Accessibility', () => {
        it('should have accessible structure', () => {
            render(<PropertiesPagination currentPage={2} totalPages={5} />);
            
            // Check that enabled arrows are rendered as links (accessible)
            const leftArrowIcon = screen.getByTestId('arrow-left-icon');
            const rightArrowIcon = screen.getByTestId('arrow-right-icon');
            const leftArrowContainer = leftArrowIcon.parentElement;
            const rightArrowContainer = rightArrowIcon.parentElement;
            
            expect(leftArrowContainer?.tagName.toLowerCase()).toBe('a');
            expect(rightArrowContainer?.tagName.toLowerCase()).toBe('a');
        });

        it('should properly mark disabled arrows', () => {
            render(<PropertiesPagination currentPage={1} totalPages={3} />);
            
            // Left arrow should be disabled (rendered as div) on first page
            const leftArrowIcon = screen.getByTestId('arrow-left-icon');
            const leftArrowContainer = leftArrowIcon.parentElement;
            expect(leftArrowContainer?.tagName.toLowerCase()).toBe('div');
            expect(leftArrowContainer).toHaveClass('pointer-events-none', 'text-gray-300');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for first page', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3, '...', 10]);
            
            const { container } = render(<PropertiesPagination currentPage={1} totalPages={10} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot for middle page', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 4, 5, 6, '...', 10]);
            
            const { container } = render(<PropertiesPagination currentPage={5} totalPages={10} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot for last page', () => {
            mockGeneratePagination.mockReturnValue([1, 2, '...', 8, 9, 10]);
            
            const { container } = render(<PropertiesPagination currentPage={10} totalPages={10} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot for single page', () => {
            mockGeneratePagination.mockReturnValue([1]);
            
            const { container } = render(<PropertiesPagination currentPage={1} totalPages={1} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});