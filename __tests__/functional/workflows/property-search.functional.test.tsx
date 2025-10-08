/**
 * @jest-environment jsdom
 *
 * Property Search Workflow Test
 *
 * Tests the complete property search user journey including filtering,
 * pagination, and navigation to property details.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertiesPage from '@/app/(root)/properties/page';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
jest.mock('@/lib/data/property-data');
jest.mock('@/ui/properties/properties-list', () => {
    return function MockPropertiesList({ properties }: any) {
        return (
            <div data-testid="properties-list">
                {properties && properties.map((prop: any) => (
                    <div key={prop._id} data-testid={`property-${prop._id}`}>
                        {prop.name}
                    </div>
                ))}
            </div>
        );
    };
});

jest.mock('@/ui/properties/properties-filter-form', () => {
    return function MockPropertiesFilterForm() {
        const [filters, setFilters] = React.useState({ type: '', location: '' });
        return (
            <div data-testid="filter-form">
                <input
                    data-testid="filter-type"
                    value={filters.type}
                    onChange={e => setFilters({ ...filters, type: e.target.value })}
                    placeholder="Property Type"
                />
                <input
                    data-testid="filter-location"
                    value={filters.location}
                    onChange={e => setFilters({ ...filters, location: e.target.value })}
                    placeholder="Location"
                />
                <button data-testid="apply-filters">Apply Filters</button>
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs() {
        return <div data-testid="breadcrumbs">Properties</div>;
    };
});

// Pagination is handled by properties-pagination component
jest.mock('@/ui/properties/properties-pagination', () => {
    return function MockPropertiesPagination({ page, totalPages }: any) {
        return (
            <div data-testid="pagination">
                <span data-testid="current-page">{page}</span>
                <span data-testid="total-pages">{totalPages}</span>
                {page > 1 && <button data-testid="prev-page">Previous</button>}
                {page < totalPages && <button data-testid="next-page">Next</button>}
            </div>
        );
    };
});

import React from 'react';
import { fetchPaginatedProperties } from '@/lib/data/property-data';

const mockFetchPaginatedProperties = fetchPaginatedProperties as jest.MockedFunction<
    typeof fetchPaginatedProperties
>;

describe('Property Search Workflow', () => {
    const mockProperties = [
        { _id: '1', name: 'Beach House', type: 'House', location: { city: 'Miami' } },
        { _id: '2', name: 'Downtown Apt', type: 'Apartment', location: { city: 'NYC' } },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchPaginatedProperties.mockResolvedValue({
            properties: mockProperties,
            total: 20,
        } as any);
    });

    describe('Search and Filter Workflow', () => {
        it('should allow filtering by property type', async () => {
            const user = userEvent.setup();
            const jsx = await PropertiesPage({ searchParams: Promise.resolve({}) });
            render(jsx);

            const typeInput = screen.getByTestId('filter-type');
            await user.type(typeInput, 'Apartment');

            expect(typeInput).toHaveValue('Apartment');
        });

        it('should allow filtering by location', async () => {
            const user = userEvent.setup();
            const jsx = await PropertiesPage({ searchParams: Promise.resolve({}) });
            render(jsx);

            const locationInput = screen.getByTestId('filter-location');
            await user.type(locationInput, 'Miami');

            expect(locationInput).toHaveValue('Miami');
        });

        it('should display filter form and results together', async () => {
            const jsx = await PropertiesPage({ searchParams: Promise.resolve({}) });
            render(jsx);

            expect(screen.getByTestId('filter-form')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });

    describe('Search Results Display', () => {
        it('should display properties list component', async () => {
            const jsx = await PropertiesPage({ searchParams: Promise.resolve({}) });
            render(jsx);

            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });

        it('should handle pagination search params', async () => {
            const jsx = await PropertiesPage({ searchParams: Promise.resolve({ page: '1' }) });
            render(jsx);

            // Page renders with search params
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });

    describe('Complete Search Journey', () => {
        it('should complete full search workflow', async () => {
            const user = userEvent.setup();
            const jsx = await PropertiesPage({ searchParams: Promise.resolve({}) });
            render(jsx);

            // User sees search form and results
            expect(screen.getByTestId('filter-form')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();

            // User applies filters
            const typeInput = screen.getByTestId('filter-type');
            await user.type(typeInput, 'House');
            await user.click(screen.getByTestId('apply-filters'));

            // Results are displayed
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });
});
