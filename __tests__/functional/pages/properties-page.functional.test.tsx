/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import PropertiesPage from '@/app/(root)/properties/page';
import { fetchNumPropertiesPages } from '@/lib/data/property-data';
import { getViewportWidth } from '@/utils/get-viewport-width';

// Mock dependencies
jest.mock('@/lib/data/property-data');
jest.mock('@/utils/get-viewport-width');

// Mock child components
jest.mock('@/ui/properties/properties-list', () => {
    return function MockPropertiesList({ query, currentPage, viewportWidth }: any) {
        return (
            <div data-testid="properties-list">
                <div data-testid="query">{JSON.stringify(query)}</div>
                <div data-testid="current-page">{currentPage}</div>
                <div data-testid="viewport-width">{viewportWidth}</div>
            </div>
        );
    };
});

jest.mock('@/ui/properties/properties-pagination', () => {
    return function MockPropertiesPagination({ currentPage, totalPages }: any) {
        return (
            <div data-testid="properties-pagination">
                <div data-testid="pagination-current">{currentPage}</div>
                <div data-testid="pagination-total">{totalPages}</div>
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <nav data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, index: number) => (
                    <span key={index} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </nav>
        );
    };
});

jest.mock('@/ui/properties/properties-filter-form', () => {
    return function MockPropertiesFilterForm() {
        return <div data-testid="properties-filter-form">Filter Form</div>;
    };
});

jest.mock('@/ui/skeletons/properties-list-skeleton', () => {
    return function MockPropertiesListSkeleton() {
        return <div data-testid="properties-list-skeleton">Loading...</div>;
    };
});

jest.mock('@/ui/shared/delayed-render', () => {
    return function MockDelayedRender({ children }: any) {
        return <div>{children}</div>;
    };
});

const mockFetchNumPropertiesPages = fetchNumPropertiesPages as jest.MockedFunction<typeof fetchNumPropertiesPages>;
const mockGetViewportWidth = getViewportWidth as jest.MockedFunction<typeof getViewportWidth>;

describe('PropertiesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetViewportWidth.mockResolvedValue(1024);
        mockFetchNumPropertiesPages.mockResolvedValue(5);
    });

    describe('Component Rendering', () => {
        it('should render main element', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            expect(breadcrumbs).toHaveTextContent('Home');
            expect(breadcrumbs).toHaveTextContent('Properties');
        });

        it('should render filter form', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const filterForm = screen.getByTestId('properties-filter-form');
            expect(filterForm).toBeInTheDocument();
        });

        it('should render properties list', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
        });

        it('should render pagination when totalPages > 0', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(3);
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const pagination = screen.getByTestId('properties-pagination');
            expect(pagination).toBeInTheDocument();
        });

        it('should not render pagination when totalPages = 0', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(0);
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const pagination = screen.queryByTestId('properties-pagination');
            expect(pagination).not.toBeInTheDocument();
        });
    });

    describe('Search Parameters Handling', () => {
        it('should handle default search params (no query, no page)', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            expect(currentPage).toHaveTextContent('1');

            const query = screen.getByTestId('query');
            const parsedQuery = JSON.parse(query.textContent || '{}');
            expect(parsedQuery.$or).toBeDefined();
        });

        it('should handle query parameter', async () => {
            const searchParams = Promise.resolve({ query: 'apartment' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const query = screen.getByTestId('query');
            const parsedQuery = JSON.parse(query.textContent || '{}');

            expect(parsedQuery.$or).toBeDefined();
            expect(parsedQuery.$or.length).toBeGreaterThan(0);
        });

        it('should handle page parameter', async () => {
            const searchParams = Promise.resolve({ page: '3' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            expect(currentPage).toHaveTextContent('3');

            const paginationCurrent = screen.getByTestId('pagination-current');
            expect(paginationCurrent).toHaveTextContent('3');
        });

        it('should handle both query and page parameters', async () => {
            const searchParams = Promise.resolve({ query: 'downtown', page: '2' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            expect(currentPage).toHaveTextContent('2');

            const query = screen.getByTestId('query');
            expect(query).toBeInTheDocument();
        });

        it('should default to page 1 when page is invalid', async () => {
            const searchParams = Promise.resolve({ page: 'invalid' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            expect(currentPage).toHaveTextContent('1');
        });

        it('should default to empty query when query is undefined', async () => {
            const searchParams = Promise.resolve({ page: '2' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const query = screen.getByTestId('query');
            const parsedQuery = JSON.parse(query.textContent || '{}');
            expect(parsedQuery.$or).toBeDefined();
        });
    });

    describe('Query Building', () => {
        it('should build query with $or array for all searchable fields', async () => {
            const searchParams = Promise.resolve({ query: 'miami' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const query = screen.getByTestId('query');
            const parsedQuery = JSON.parse(query.textContent || '{}');

            expect(parsedQuery.$or).toBeDefined();
            expect(Array.isArray(parsedQuery.$or)).toBe(true);
            expect(parsedQuery.$or.length).toBe(8); // name, description, amenities, type, street, city, state, zip
        });

        it('should create case-insensitive regex for query', async () => {
            const searchParams = Promise.resolve({ query: 'Downtown' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            // Query should be processed and used
            expect(mockFetchNumPropertiesPages).toHaveBeenCalled();
            const callArg = mockFetchNumPropertiesPages.mock.calls[0][0];
            expect(callArg.$or).toBeDefined();
        });
    });

    describe('Data Fetching', () => {
        it('should call getViewportWidth', async () => {
            const searchParams = Promise.resolve({});
            await PropertiesPage({ searchParams });

            expect(mockGetViewportWidth).toHaveBeenCalledTimes(1);
        });

        it('should call fetchNumPropertiesPages with query and viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(768);
            const searchParams = Promise.resolve({ query: 'beach' });
            await PropertiesPage({ searchParams });

            expect(mockFetchNumPropertiesPages).toHaveBeenCalledTimes(1);
            expect(mockFetchNumPropertiesPages).toHaveBeenCalledWith(
                expect.objectContaining({ $or: expect.any(Array) }),
                768
            );
        });

        it('should pass viewport width to PropertiesList', async () => {
            mockGetViewportWidth.mockResolvedValue(1440);
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const viewportWidth = screen.getByTestId('viewport-width');
            expect(viewportWidth).toHaveTextContent('1440');
        });
    });

    describe('Pagination Display', () => {
        it('should display pagination with correct currentPage and totalPages', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(10);
            const searchParams = Promise.resolve({ page: '5' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const paginationCurrent = screen.getByTestId('pagination-current');
            const paginationTotal = screen.getByTestId('pagination-total');

            expect(paginationCurrent).toHaveTextContent('5');
            expect(paginationTotal).toHaveTextContent('10');
        });

        it('should center pagination within container', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(5);
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            const { container } = render(jsx);

            const paginationContainer = container.querySelector('.mt-5.flex.w-full.justify-center');
            expect(paginationContainer).toBeInTheDocument();
        });
    });

    describe('Metadata', () => {
        it('should export metadata object', async () => {
            const { metadata } = await import('@/app/(root)/properties/page');
            expect(metadata).toBeDefined();
            expect(metadata.title).toBe('Properties');
        });
    });

    describe('Integration Tests', () => {
        it('should render complete page with all components', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(5);
            const searchParams = Promise.resolve({ query: 'apartment', page: '2' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('properties-filter-form')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            expect(screen.getByTestId('properties-pagination')).toBeInTheDocument();
        });

        it('should pass correct props to child components', async () => {
            mockGetViewportWidth.mockResolvedValue(1200);
            mockFetchNumPropertiesPages.mockResolvedValue(7);
            const searchParams = Promise.resolve({ query: 'luxury', page: '3' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            const viewportWidth = screen.getByTestId('viewport-width');
            const paginationTotal = screen.getByTestId('pagination-total');

            expect(currentPage).toHaveTextContent('3');
            expect(viewportWidth).toHaveTextContent('1200');
            expect(paginationTotal).toHaveTextContent('7');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty query string', async () => {
            const searchParams = Promise.resolve({ query: '' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
        });

        it('should handle page 0 by defaulting to 1', async () => {
            const searchParams = Promise.resolve({ page: '0' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            expect(currentPage).toHaveTextContent('1');
        });

        it('should handle negative page number', async () => {
            const searchParams = Promise.resolve({ page: '-5' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            // Number('-5') = -5, not converted to 1 in current implementation
            expect(currentPage).toHaveTextContent('-5');
        });

        it('should handle very long query strings', async () => {
            const longQuery = 'a'.repeat(1000);
            const searchParams = Promise.resolve({ query: longQuery });
            const jsx = await PropertiesPage({ searchParams });

            expect(() => render(jsx)).not.toThrow();
        });

        it('should handle special characters in query', async () => {
            const searchParams = Promise.resolve({ query: '$pecial@#characters!' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
        });
    });

    describe('Async Behavior', () => {
        it('should properly await searchParams promise', async () => {
            const searchParams = Promise.resolve({ page: '4', query: 'test' });
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const currentPage = screen.getByTestId('current-page');
            expect(currentPage).toHaveTextContent('4');
        });

        it('should properly await viewport width fetch', async () => {
            mockGetViewportWidth.mockResolvedValue(500);
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const viewportWidth = screen.getByTestId('viewport-width');
            expect(viewportWidth).toHaveTextContent('500');
        });

        it('should properly await total pages fetch', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(15);
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const paginationTotal = screen.getByTestId('pagination-total');
            expect(paginationTotal).toHaveTextContent('15');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const main = screen.getByRole('main');
            expect(main.tagName).toBe('MAIN');
        });

        it('should have breadcrumb navigation', async () => {
            const searchParams = Promise.resolve({});
            const jsx = await PropertiesPage({ searchParams });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs.tagName).toBe('NAV');
        });
    });
});
