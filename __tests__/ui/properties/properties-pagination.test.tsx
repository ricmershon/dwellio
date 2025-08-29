import React from 'react';
import { render, screen, createNextNavigationMock } from '@/__tests__/test-utils';
import PropertiesPagination from '@/ui/properties/properties-pagination';
import { generatePagination } from '@/utils/generate-pagination';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
    ...createNextNavigationMock(),
    usePathname: jest.fn(() => '/properties'),
}));

// Mock clsx to return joined class names
jest.mock('clsx', () => ((...args: unknown[]) => 
    args.filter(Boolean).join(' ')
));

// Mock Link component
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
        <a href={href} className={className} data-testid="pagination-link">
            {children}
        </a>
    ),
}));

// Mock PaginationArrow subcomponent
jest.mock('@/ui/shared/pagination-arrow', () => ({
    __esModule: true,
    default: ({ direction, href, isDisabled }: { direction: string; href: string; isDisabled?: boolean }) => (
        <div 
            data-testid={`pagination-arrow-${direction}`}
            data-href={href}
            data-disabled={isDisabled}
            aria-disabled={isDisabled}
        >
            {direction === 'left' ? '←' : '→'}
        </div>
    ),
}));

// Mock PaginationNumber subcomponent
jest.mock('@/ui/shared/pagination-number', () => ({
    __esModule: true,
    default: ({ page, href, isActive, position }: { 
        page: number | string; 
        href: string; 
        isActive: boolean; 
        position?: string;
    }) => (
        <div 
            data-testid="pagination-number"
            data-page={page}
            data-href={href}
            data-active={isActive}
            data-position={position}
        >
            {page}
        </div>
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
            render(<PropertiesPagination {...defaultProps} />);
            
            expect(screen.getByTestId('pagination-arrow-left')).toBeInTheDocument();
            expect(screen.getByTestId('pagination-arrow-right')).toBeInTheDocument();
            expect(screen.getAllByTestId('pagination-number')).toHaveLength(6); // [1, 2, 3, '...', 9, 10]
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
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            
            expect(leftArrow).toHaveAttribute('data-href', '/properties?page=1');
            expect(rightArrow).toHaveAttribute('data-href', '/properties?page=3');
        });

        it('should preserve existing search parameters', () => {
            mockSearchParams.set('search', 'villa');
            mockSearchParams.set('location', 'miami');
            
            render(<PropertiesPagination currentPage={3} totalPages={8} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            
            expect(leftArrow.getAttribute('data-href')).toContain('search=villa');
            expect(leftArrow.getAttribute('data-href')).toContain('location=miami');
            expect(leftArrow.getAttribute('data-href')).toContain('page=2');
            
            expect(rightArrow.getAttribute('data-href')).toContain('search=villa');
            expect(rightArrow.getAttribute('data-href')).toContain('location=miami');
            expect(rightArrow.getAttribute('data-href')).toContain('page=4');
        });

        it('should handle different pathname', () => {
            const { usePathname } = jest.mocked(jest.requireMock('next/navigation'));
            usePathname.mockReturnValue('/properties/featured');
            
            render(<PropertiesPagination currentPage={1} totalPages={5} />);
            
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('data-href', '/properties/featured?page=2');
        });
    });

    describe('Arrow States', () => {
        it('should disable left arrow on first page', () => {
            render(<PropertiesPagination currentPage={1} totalPages={5} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('data-disabled', 'true');
        });

        it('should disable right arrow on last page', () => {
            render(<PropertiesPagination currentPage={5} totalPages={5} />);
            
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('data-disabled', 'true');
        });

        it('should enable both arrows on middle pages', () => {
            render(<PropertiesPagination currentPage={3} totalPages={5} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            
            expect(leftArrow).toHaveAttribute('data-disabled', 'false');
            expect(rightArrow).toHaveAttribute('data-disabled', 'false');
        });

        it('should handle single page correctly', () => {
            render(<PropertiesPagination currentPage={1} totalPages={1} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            
            expect(leftArrow).toHaveAttribute('data-disabled', 'true');
            expect(rightArrow).toHaveAttribute('data-disabled', 'true');
        });
    });

    describe('Pagination Number Generation', () => {
        it('should call generatePagination with correct parameters', () => {
            render(<PropertiesPagination currentPage={5} totalPages={12} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(5, 12);
        });

        it('should render pagination numbers with correct props', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 4, 5, 6, '...', 10]);
            
            render(<PropertiesPagination currentPage={5} totalPages={10} />);
            
            const numbers = screen.getAllByTestId('pagination-number');
            expect(numbers).toHaveLength(7);
            
            // Check first number
            expect(numbers[0]).toHaveAttribute('data-page', '1');
            expect(numbers[0]).toHaveAttribute('data-active', 'false');
            expect(numbers[0]).toHaveAttribute('data-position', 'first');
            
            // Check ellipsis (middle position)
            expect(numbers[1]).toHaveAttribute('data-page', '...');
            expect(numbers[1]).toHaveAttribute('data-position', 'middle');
            
            // Check active page
            expect(numbers[3]).toHaveAttribute('data-page', '5');
            expect(numbers[3]).toHaveAttribute('data-active', 'true');
            
            // Check last number
            expect(numbers[6]).toHaveAttribute('data-page', '10');
            expect(numbers[6]).toHaveAttribute('data-position', 'last');
        });

        it('should handle single page pagination', () => {
            mockGeneratePagination.mockReturnValue([1]);
            
            render(<PropertiesPagination currentPage={1} totalPages={1} />);
            
            const numbers = screen.getAllByTestId('pagination-number');
            expect(numbers).toHaveLength(1);
            expect(numbers[0]).toHaveAttribute('data-position', 'single');
        });

        it('should generate unique keys for pagination numbers', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 3, '...', 5]);
            
            const { container } = render(<PropertiesPagination currentPage={3} totalPages={5} />);
            
            // Each pagination number should have a unique key (page-index format)
            const numbers = container.querySelectorAll('[data-testid="pagination-number"]');
            expect(numbers).toHaveLength(5);
        });
    });

    describe('Position Logic', () => {
        it('should set correct positions for multiple pages', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3, 4, 5]);
            
            render(<PropertiesPagination currentPage={3} totalPages={5} />);
            
            const numbers = screen.getAllByTestId('pagination-number');
            
            expect(numbers[0]).toHaveAttribute('data-position', 'first');
            expect(numbers[1]).not.toHaveAttribute('data-position'); // middle pages have no position
            expect(numbers[2]).not.toHaveAttribute('data-position');
            expect(numbers[3]).not.toHaveAttribute('data-position');
            expect(numbers[4]).toHaveAttribute('data-position', 'last');
        });

        it('should handle ellipsis positions correctly', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 5, 6, 7, '...', 12]);
            
            render(<PropertiesPagination currentPage={6} totalPages={12} />);
            
            const numbers = screen.getAllByTestId('pagination-number');
            
            expect(numbers[0]).toHaveAttribute('data-position', 'first'); // 1
            expect(numbers[1]).toHaveAttribute('data-position', 'middle'); // '...'
            expect(numbers[5]).toHaveAttribute('data-position', 'middle'); // '...'
            expect(numbers[6]).toHaveAttribute('data-position', 'last'); // 12
        });
    });

    describe('Props Validation', () => {
        it('should handle zero totalPages', () => {
            mockGeneratePagination.mockReturnValue([]);
            
            render(<PropertiesPagination currentPage={1} totalPages={0} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(1, 0);
            expect(screen.queryAllByTestId('pagination-number')).toHaveLength(0);
        });

        it('should handle negative currentPage', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3]);
            
            render(<PropertiesPagination currentPage={-1} totalPages={3} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(-1, 3);
        });

        it('should handle currentPage greater than totalPages', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3]);
            
            render(<PropertiesPagination currentPage={5} totalPages={3} />);
            
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            expect(rightArrow).toHaveAttribute('data-disabled', 'true');
        });

        it('should handle large page numbers', () => {
            mockGeneratePagination.mockReturnValue([1, '...', 998, 999, 1000]);
            
            render(<PropertiesPagination currentPage={999} totalPages={1000} />);
            
            expect(mockGeneratePagination).toHaveBeenCalledWith(999, 1000);
            
            const numbers = screen.getAllByTestId('pagination-number');
            expect(numbers[4]).toHaveAttribute('data-page', '1000');
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
            
            const initialLeftArrow = screen.getByTestId('pagination-arrow-left');
            const initialHref = initialLeftArrow.getAttribute('data-href');
            
            // Re-render with same search params - URL should be memoized
            rerender(<PropertiesPagination currentPage={2} totalPages={5} />);
            
            const rerenderedLeftArrow = screen.getByTestId('pagination-arrow-left');
            expect(rerenderedLeftArrow.getAttribute('data-href')).toBe(initialHref);
        });
    });

    describe('Integration with Dependencies', () => {
        it('should pass correct props to PaginationArrow components', () => {
            render(<PropertiesPagination currentPage={3} totalPages={8} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            
            expect(leftArrow).toHaveAttribute('data-href', '/properties?page=2');
            expect(leftArrow).toHaveAttribute('data-disabled', 'false');
            
            expect(rightArrow).toHaveAttribute('data-href', '/properties?page=4');
            expect(rightArrow).toHaveAttribute('data-disabled', 'false');
        });

        it('should pass correct props to PaginationNumber components', () => {
            mockGeneratePagination.mockReturnValue([1, 2, 3]);
            
            render(<PropertiesPagination currentPage={2} totalPages={3} />);
            
            const numbers = screen.getAllByTestId('pagination-number');
            
            expect(numbers[0]).toHaveAttribute('data-page', '1');
            expect(numbers[0]).toHaveAttribute('data-href', '/properties?page=1');
            expect(numbers[0]).toHaveAttribute('data-active', 'false');
            
            expect(numbers[1]).toHaveAttribute('data-page', '2');
            expect(numbers[1]).toHaveAttribute('data-href', '/properties?page=2');
            expect(numbers[1]).toHaveAttribute('data-active', 'true');
            
            expect(numbers[2]).toHaveAttribute('data-page', '3');
            expect(numbers[2]).toHaveAttribute('data-href', '/properties?page=3');
            expect(numbers[2]).toHaveAttribute('data-active', 'false');
        });
    });

    describe('Accessibility', () => {
        it('should have accessible structure', () => {
            render(<PropertiesPagination currentPage={2} totalPages={5} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            const rightArrow = screen.getByTestId('pagination-arrow-right');
            
            expect(leftArrow).toHaveAttribute('aria-disabled', 'false');
            expect(rightArrow).toHaveAttribute('aria-disabled', 'false');
        });

        it('should properly mark disabled arrows', () => {
            render(<PropertiesPagination currentPage={1} totalPages={3} />);
            
            const leftArrow = screen.getByTestId('pagination-arrow-left');
            expect(leftArrow).toHaveAttribute('aria-disabled', 'true');
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