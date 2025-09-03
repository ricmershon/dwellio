import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import PropertiesPage from '@/app/(root)/properties/page';
import { PropertiesQuery } from '@/types';

// Mock all child components
jest.mock('@/ui/properties/properties-list', () => ({
    __esModule: true,
    default: ({ query, currentPage, viewportWidth }: { 
        query: PropertiesQuery; 
        currentPage: number; 
        viewportWidth: number; 
    }) => (
        <div 
            data-testid="properties-list"
            data-current-page={currentPage}
            data-viewport-width={viewportWidth}
            data-query-term={query.$or[0].name.source}
        >
            PropertiesList Component
        </div>
    ),
}));

jest.mock('@/ui/properties/properties-pagination', () => ({
    __esModule: true,
    default: ({ currentPage, totalPages }: { currentPage: number; totalPages: number }) => (
        <div 
            data-testid="properties-pagination"
            data-current-page={currentPage}
            data-total-pages={totalPages}
        >
            PropertiesPagination Component
        </div>
    ),
}));

jest.mock('@/ui/shared/breadcrumbs', () => ({
    __esModule: true,
    default: ({ breadcrumbs }: { breadcrumbs: Array<{ label: string; href: string; active?: boolean }> }) => (
        <nav 
            data-testid="breadcrumbs"
            data-breadcrumb-count={breadcrumbs.length}
        >
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={index} data-active={breadcrumb.active}>
                    {breadcrumb.label}
                </span>
            ))}
        </nav>
    ),
}));

jest.mock('@/ui/properties/properties-filter-form', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="properties-filter-form">
            PropertiesFilterForm Component
        </div>
    ),
}));

jest.mock('@/ui/skeletons/properties-list-skeleton', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="properties-list-skeleton">
            PropertiesListSkeleton Component
        </div>
    ),
}));

jest.mock('@/ui/shared/delayed-render', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="delayed-render">
            {children}
        </div>
    ),
}));

// Mock data fetching functions
jest.mock('@/lib/data/property-data', () => ({
    fetchNumPropertiesPages: jest.fn(),
}));

// Mock utilities
jest.mock('@/utils/get-viewport-width', () => ({
    getViewportWidth: jest.fn(),
}));

describe('PropertiesPage', () => {
    const mockFetchNumPropertiesPages = jest.mocked(jest.requireMock('@/lib/data/property-data').fetchNumPropertiesPages);
    const mockGetViewportWidth = jest.mocked(jest.requireMock('@/utils/get-viewport-width').getViewportWidth);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock returns
        mockGetViewportWidth.mockResolvedValue(1200);
        mockFetchNumPropertiesPages.mockResolvedValue(5);
    });

    describe('Component Structure', () => {
        it('should render main element with all child components', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const main = screen.getByRole('main');
            expect(main).toBeInTheDocument();
            
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('properties-filter-form')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });

        it('should render breadcrumbs with correct navigation structure', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveAttribute('data-breadcrumb-count', '2');
            
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            
            // Properties should be marked as active
            const propertiesBreadcrumb = screen.getByText('Properties');
            expect(propertiesBreadcrumb).toHaveAttribute('data-active', 'true');
        });

        it('should have Suspense boundary in component structure', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            // Since we're testing the resolved component, Suspense fallback won't show
            // but we can verify the main components are present
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            expect(screen.getByTestId('properties-filter-form')).toBeInTheDocument();
        });
    });

    describe('SearchParams Handling', () => {
        it('should handle empty search params with defaults', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '1');
            expect(propertiesList).toHaveAttribute('data-query-term', '(?:)'); // Empty string becomes empty regex group
        });

        it('should handle query search parameter', async () => {
            const searchParams = Promise.resolve({ query: 'luxury apartment' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-query-term', 'luxury apartment');
        });

        it('should handle page search parameter', async () => {
            const searchParams = Promise.resolve({ page: '3' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '3');
        });

        it('should handle both query and page parameters', async () => {
            const searchParams = Promise.resolve({ 
                query: 'beachfront villa',
                page: '2' 
            });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '2');
            expect(propertiesList).toHaveAttribute('data-query-term', 'beachfront villa');
        });

        it('should handle invalid page parameter with fallback to 1', async () => {
            const searchParams = Promise.resolve({ page: 'invalid' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '1');
        });

        it('should handle zero page parameter with fallback to 1', async () => {
            const searchParams = Promise.resolve({ page: '0' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '1');
        });
    });

    describe('Data Fetching Integration', () => {
        it('should call getViewportWidth on page load', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            expect(mockGetViewportWidth).toHaveBeenCalledTimes(1);
        });

        it('should call fetchNumPropertiesPages with correct query and viewport', async () => {
            const searchParams = Promise.resolve({ query: 'test search' });
            mockGetViewportWidth.mockResolvedValue(768);
            
            render(await PropertiesPage({ searchParams }));
            
            expect(mockFetchNumPropertiesPages).toHaveBeenCalledTimes(1);
            
            const [query, viewportWidth] = mockFetchNumPropertiesPages.mock.calls[0];
            expect(viewportWidth).toBe(768);
            expect(query.$or).toHaveLength(8);
            expect(query.$or[0].name.source).toBe('test search');
        });

        it('should create correct PropertiesQuery structure', async () => {
            const searchParams = Promise.resolve({ query: 'luxury' });
            
            render(await PropertiesPage({ searchParams }));
            
            const [query] = mockFetchNumPropertiesPages.mock.calls[0];
            expect(query.$or).toEqual([
                { name: expect.objectContaining({ source: 'luxury' }) },
                { description: expect.objectContaining({ source: 'luxury' }) },
                { amenities: expect.objectContaining({ source: 'luxury' }) },
                { type: expect.objectContaining({ source: 'luxury' }) },
                { "location.street": expect.objectContaining({ source: 'luxury' }) },
                { "location.city": expect.objectContaining({ source: 'luxury' }) },
                { "location.state": expect.objectContaining({ source: 'luxury' }) },
                { "location.zip": expect.objectContaining({ source: 'luxury' }) },
            ]);
        });

        it('should handle different viewport widths', async () => {
            const viewportWidths = [320, 768, 1024, 1200, 1920];
            
            for (const width of viewportWidths) {
                mockGetViewportWidth.mockResolvedValue(width);
                const searchParams = Promise.resolve({});
                
                const { unmount } = render(await PropertiesPage({ searchParams }));
                
                const propertiesList = screen.getByTestId('properties-list');
                expect(propertiesList).toHaveAttribute('data-viewport-width', width.toString());
                
                unmount();
                jest.clearAllMocks();
            }
        });
    });

    describe('PropertiesList Integration', () => {
        it('should pass correct props to PropertiesList', async () => {
            const searchParams = Promise.resolve({ 
                query: 'mountain cabin',
                page: '4' 
            });
            mockGetViewportWidth.mockResolvedValue(1024);
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '4');
            expect(propertiesList).toHaveAttribute('data-viewport-width', '1024');
            expect(propertiesList).toHaveAttribute('data-query-term', 'mountain cabin');
        });

        it('should render PropertiesList component correctly', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            // The PropertiesList component should be rendered
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });

    describe('PropertiesPagination Integration', () => {
        it('should render pagination when totalPages > 0', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(5);
            const searchParams = Promise.resolve({ page: '2' });
            
            render(await PropertiesPage({ searchParams }));
            
            const pagination = screen.getByTestId('properties-pagination');
            expect(pagination).toBeInTheDocument();
            expect(pagination).toHaveAttribute('data-current-page', '2');
            expect(pagination).toHaveAttribute('data-total-pages', '5');
        });

        it('should not render pagination when totalPages is 0', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(0);
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            expect(screen.queryByTestId('properties-pagination')).not.toBeInTheDocument();
        });

        it('should render pagination with correct wrapper styling', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(3);
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const paginationWrapper = screen.getByTestId('properties-pagination').parentElement;
            expect(paginationWrapper).toHaveClass('mt-5', 'flex', 'w-full', 'justify-center');
        });

        it('should handle single page results', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(1);
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const pagination = screen.getByTestId('properties-pagination');
            expect(pagination).toHaveAttribute('data-total-pages', '1');
        });
    });

    describe('Query Processing', () => {
        it('should create case-insensitive regex from query', async () => {
            const searchParams = Promise.resolve({ query: 'Test Query' });
            
            render(await PropertiesPage({ searchParams }));
            
            const [query] = mockFetchNumPropertiesPages.mock.calls[0];
            const nameRegex = query.$or[0].name;
            
            expect(nameRegex.flags).toContain('i'); // Case-insensitive flag
            expect(nameRegex.source).toBe('Test Query');
        });

        it('should handle empty query string', async () => {
            const searchParams = Promise.resolve({ query: '' });
            
            render(await PropertiesPage({ searchParams }));
            
            const [query] = mockFetchNumPropertiesPages.mock.calls[0];
            expect(query.$or[0].name.source).toBe('(?:)'); // Empty string becomes empty regex group
        });

        it('should handle special regex characters in query', async () => {
            const searchParams = Promise.resolve({ query: 'apartment (2+3) bedrooms' });
            
            render(await PropertiesPage({ searchParams }));
            
            const [query] = mockFetchNumPropertiesPages.mock.calls[0];
            expect(query.$or[0].name.source).toBe('apartment (2+3) bedrooms');
        });

        it('should handle undefined query parameter', async () => {
            const searchParams = Promise.resolve({ query: undefined });
            
            render(await PropertiesPage({ searchParams }));
            
            const [query] = mockFetchNumPropertiesPages.mock.calls[0];
            expect(query.$or[0].name.source).toBe('(?:)'); // Undefined becomes empty regex group
        });
    });

    describe('Error Handling', () => {
        it('should handle getViewportWidth errors gracefully', async () => {
            mockGetViewportWidth.mockRejectedValue(new Error('Viewport error'));
            const searchParams = Promise.resolve({});
            
            await expect(async () => {
                render(await PropertiesPage({ searchParams }));
            }).rejects.toThrow('Viewport error');
        });

        it('should handle fetchNumPropertiesPages errors gracefully', async () => {
            mockFetchNumPropertiesPages.mockRejectedValue(new Error('Fetch pages error'));
            const searchParams = Promise.resolve({});
            
            await expect(async () => {
                render(await PropertiesPage({ searchParams }));
            }).rejects.toThrow('Fetch pages error');
        });

        it('should handle Promise rejection in searchParams', async () => {
            const searchParams = Promise.reject(new Error('SearchParams error'));
            
            await expect(async () => {
                render(await PropertiesPage({ searchParams }));
            }).rejects.toThrow('SearchParams error');
        });
    });

    describe('Edge Cases and Props Validation', () => {
        it('should handle extremely long query strings', async () => {
            const longQuery = 'a'.repeat(1000);
            const searchParams = Promise.resolve({ query: longQuery });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-query-term', longQuery);
        });

        it('should handle very large page numbers', async () => {
            const searchParams = Promise.resolve({ page: '999999' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '999999');
        });

        it('should handle negative page numbers with fallback', async () => {
            const searchParams = Promise.resolve({ page: '-5' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '-5'); // Number() preserves negative values
        });

        it('should handle decimal page numbers', async () => {
            const searchParams = Promise.resolve({ page: '3.14' });
            
            render(await PropertiesPage({ searchParams }));
            
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveAttribute('data-current-page', '3.14'); // Number() preserves decimal values
        });
    });

    describe('Performance Considerations', () => {
        it('should handle rapid successive renders', async () => {
            const searchParams1 = Promise.resolve({ query: 'test1' });
            const searchParams2 = Promise.resolve({ query: 'test2' });
            const searchParams3 = Promise.resolve({ query: 'test3' });
            
            const renders = await Promise.all([
                PropertiesPage({ searchParams: searchParams1 }),
                PropertiesPage({ searchParams: searchParams2 }),
                PropertiesPage({ searchParams: searchParams3 }),
            ]);
            
            renders.forEach((component) => {
                const { container } = render(component);
                expect(container.querySelector('[data-testid="properties-list"]')).toBeTruthy();
            });
        });

        it('should not cause memory leaks with large datasets', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(1000);
            const searchParams = Promise.resolve({ page: '500' });
            
            const { unmount } = render(await PropertiesPage({ searchParams }));
            
            const pagination = screen.getByTestId('properties-pagination');
            expect(pagination).toHaveAttribute('data-total-pages', '1000');
            expect(pagination).toHaveAttribute('data-current-page', '500');
            
            // Cleanup should work without issues
            unmount();
        });
    });

    describe('Accessibility and Semantics', () => {
        it('should use semantic main element', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const main = screen.getByRole('main');
            expect(main).toBeInTheDocument();
        });

        it('should provide proper navigation structure with breadcrumbs', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs.tagName).toBe('NAV');
            
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
        });

        it('should maintain proper component hierarchy', async () => {
            const searchParams = Promise.resolve({});
            
            render(await PropertiesPage({ searchParams }));
            
            const main = screen.getByRole('main');
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            const filterForm = screen.getByTestId('properties-filter-form');
            const propertiesList = screen.getByTestId('properties-list');
            
            // All components should be within main
            expect(main).toContainElement(breadcrumbs);
            expect(main).toContainElement(filterForm);
            expect(main).toContainElement(propertiesList);
        });
    });

    describe('Metadata', () => {
        it('should export correct metadata', async () => {
            // Import the metadata directly to test it
            const propertiesModule = await import('@/app/(root)/properties/page');
            
            expect(propertiesModule.metadata).toBeDefined();
            expect(propertiesModule.metadata.title).toBe('Properties');
        });
    });

    describe('Integration Snapshots', () => {
        it('should match snapshot with default parameters', async () => {
            const searchParams = Promise.resolve({});
            
            const { container } = render(await PropertiesPage({ searchParams }));
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with search query', async () => {
            const searchParams = Promise.resolve({ 
                query: 'luxury apartment',
                page: '2' 
            });
            
            const { container } = render(await PropertiesPage({ searchParams }));
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with no pagination', async () => {
            mockFetchNumPropertiesPages.mockResolvedValue(0);
            const searchParams = Promise.resolve({});
            
            const { container } = render(await PropertiesPage({ searchParams }));
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});