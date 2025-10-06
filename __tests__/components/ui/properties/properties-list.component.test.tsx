import { render, screen } from '@testing-library/react';
import { Types } from 'mongoose';

import PropertiesList from '@/ui/properties/properties-list';
import { PropertyDocument } from '@/models/property-model';
import { PropertiesQuery } from '@/types';
import * as fetchFeaturedProperties from '@/lib/data/property-data';
import * as fetchPaginatedProperties from '@/lib/data/property-data';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('@/ui/properties/property-card', () => ({
    __esModule: true,
    default: ({ property }: { property: PropertyDocument }) => (
        <div data-testid="property-card" data-property-id={String(property._id)}>
            {property.name}
        </div>
    ),
}));

// ✅ Internal Dependencies (Real - spied)
jest.spyOn(fetchFeaturedProperties, 'fetchFeaturedProperties');
jest.spyOn(fetchPaginatedProperties, 'fetchPaginatedProperties');

// ============================================================================
// TEST DATA
// ============================================================================
const createMockProperty = (id: string, name: string): PropertyDocument => ({
    _id: new Types.ObjectId(id) as any,
    owner: new Types.ObjectId(),
    name,
    type: 'Apartment',
    description: 'Test property',
    location: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
    },
    beds: 2,
    baths: 2,
    squareFeet: 1200,
    amenities: ['WiFi'],
    rates: {
        nightly: 150,
    },
    sellerInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
    },
    imagesData: [
        {
            secureUrl: 'https://example.com/image1.jpg',
            publicId: 'image1',
            height: 800,
            width: 1200,
        },
    ],
    isFeatured: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
} as PropertyDocument);

const mockProperties: PropertyDocument[] = [
    createMockProperty('507f1f77bcf86cd799439011', 'Property 1'),
    createMockProperty('507f1f77bcf86cd799439012', 'Property 2'),
    createMockProperty('507f1f77bcf86cd799439013', 'Property 3'),
];

// ============================================================================
// TEST SUITE
// ============================================================================
describe('PropertiesList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Data Fetching Logic
    // ========================================================================
    describe('Data Fetching Logic', () => {
        it('should fetch featured properties when featured=true and viewportWidth provided', async () => {
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue(mockProperties);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 1024,
            });
            render(Component);

            expect(fetchFeaturedProperties.fetchFeaturedProperties).toHaveBeenCalledWith(1024);
            expect(fetchPaginatedProperties.fetchPaginatedProperties).not.toHaveBeenCalled();
        });

        it('should fetch paginated properties when currentPage provided', async () => {
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(mockProperties);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 2,
                viewportWidth: 768,
                query: mockQuery,
            });
            render(Component);

            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(2, 768, mockQuery);
            expect(fetchFeaturedProperties.fetchFeaturedProperties).not.toHaveBeenCalled();
        });

        it('should use provided properties array when passed directly', async () => {
            const Component = await PropertiesList({
                properties: mockProperties,
            });
            render(Component);

            expect(fetchFeaturedProperties.fetchFeaturedProperties).not.toHaveBeenCalled();
            expect(fetchPaginatedProperties.fetchPaginatedProperties).not.toHaveBeenCalled();
            expect(screen.getAllByTestId('property-card')).toHaveLength(3);
        });

        it('should prioritize featured fetch over paginated when viewportWidth present', async () => {
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue(mockProperties);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 1024,
            });
            render(Component);

            expect(fetchFeaturedProperties.fetchFeaturedProperties).toHaveBeenCalledWith(1024);
            expect(fetchPaginatedProperties.fetchPaginatedProperties).not.toHaveBeenCalled();
        });

        it('should default to empty array when no data source provided', async () => {
            const Component = await PropertiesList({ properties: [] });
            render(Component);

            expect(screen.getByText('No properties found')).toBeInTheDocument();
            expect(fetchFeaturedProperties.fetchFeaturedProperties).not.toHaveBeenCalled();
            expect(fetchPaginatedProperties.fetchPaginatedProperties).not.toHaveBeenCalled();
        });

        it('should pass query parameter to fetchPaginatedProperties', async () => {
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(mockProperties);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            await PropertiesList({
                currentPage: 1,
                viewportWidth: 1024,
                query: mockQuery,
            });

            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(
                1,
                1024,
                mockQuery
            );
        });

        it('should not fetch when featured=true but viewportWidth missing', async () => {
            const Component = await PropertiesList({
                properties: [],
            });
            render(Component);

            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Properties Rendering
    // ========================================================================
    describe('Properties Rendering', () => {
        it('should render all provided properties as PropertyCard components', async () => {
            const Component = await PropertiesList({
                properties: mockProperties,
            });
            render(Component);

            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards).toHaveLength(3);
        });

        it('should pass correct property data to each PropertyCard', async () => {
            const Component = await PropertiesList({
                properties: mockProperties,
            });
            render(Component);

            expect(screen.getByText('Property 1')).toBeInTheDocument();
            expect(screen.getByText('Property 2')).toBeInTheDocument();
            expect(screen.getByText('Property 3')).toBeInTheDocument();
        });

        it('should render properties in grid layout', async () => {
            const Component = await PropertiesList({
                properties: mockProperties,
            });
            const { container } = render(Component);

            const grid = container.querySelector('.grid');
            expect(grid).toBeInTheDocument();
        });

        it('should render single property correctly', async () => {
            const singleProperty = [mockProperties[0]];
            const Component = await PropertiesList({
                properties: singleProperty,
            });
            render(Component);

            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards).toHaveLength(1);
            expect(screen.getByText('Property 1')).toBeInTheDocument();
        });

        it('should preserve property order in rendering', async () => {
            const Component = await PropertiesList({
                properties: mockProperties,
            });
            render(Component);

            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards[0]).toHaveTextContent('Property 1');
            expect(propertyCards[1]).toHaveTextContent('Property 2');
            expect(propertyCards[2]).toHaveTextContent('Property 3');
        });
    });

    // ========================================================================
    // Empty State Handling
    // ========================================================================
    describe('Empty State Handling', () => {
        it('should display "No properties found" message when properties array is empty', async () => {
            const Component = await PropertiesList({
                properties: [],
            });
            render(Component);

            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });

        it('should display "No properties found" when fetch returns empty array', async () => {
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue([]);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 1,
                viewportWidth: 1024,
                query: mockQuery,
            });
            render(Component);

            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });

        it('should not render any PropertyCard components when no properties', async () => {
            const Component = await PropertiesList({
                properties: [],
            });
            render(Component);

            expect(screen.queryAllByTestId('property-card')).toHaveLength(0);
        });

        it('should display message when featured properties fetch returns empty', async () => {
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue([]);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 1024,
            });
            render(Component);

            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Featured Properties Mode
    // ========================================================================
    describe('Featured Properties Mode', () => {
        it('should render featured properties for mobile viewport', async () => {
            const featuredProps = [
                createMockProperty('507f1f77bcf86cd799439014', 'Featured 1'),
                createMockProperty('507f1f77bcf86cd799439015', 'Featured 2'),
            ];
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue(featuredProps);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 375,
            });
            render(Component);

            expect(fetchFeaturedProperties.fetchFeaturedProperties).toHaveBeenCalledWith(375);
            expect(screen.getByText('Featured 1')).toBeInTheDocument();
            expect(screen.getByText('Featured 2')).toBeInTheDocument();
        });

        it('should render featured properties for tablet viewport', async () => {
            const featuredProps = [createMockProperty('507f1f77bcf86cd799439016', 'Featured Tablet')];
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue(featuredProps);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 768,
            });
            render(Component);

            expect(fetchFeaturedProperties.fetchFeaturedProperties).toHaveBeenCalledWith(768);
            expect(screen.getByText('Featured Tablet')).toBeInTheDocument();
        });

        it('should render featured properties for desktop viewport', async () => {
            const featuredProps = [createMockProperty('507f1f77bcf86cd799439017', 'Featured Desktop')];
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue(featuredProps);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 1920,
            });
            render(Component);

            expect(fetchFeaturedProperties.fetchFeaturedProperties).toHaveBeenCalledWith(1920);
            expect(screen.getByText('Featured Desktop')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Paginated Properties Mode
    // ========================================================================
    describe('Paginated Properties Mode', () => {
        it('should fetch and render first page of properties', async () => {
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(mockProperties);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 1,
                viewportWidth: 1024,
                query: mockQuery,
            });
            render(Component);

            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(1, 1024, mockQuery);
            expect(screen.getAllByTestId('property-card')).toHaveLength(3);
        });

        it('should fetch and render specific page of properties', async () => {
            const pageProps = [createMockProperty('507f1f77bcf86cd799439018', 'Page 5 Property')];
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(pageProps);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 5,
                viewportWidth: 1024,
                query: mockQuery,
            });
            render(Component);

            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(5, 1024, mockQuery);
            expect(screen.getByText('Page 5 Property')).toBeInTheDocument();
        });

        it('should handle search query with pagination', async () => {
            const searchResults = [createMockProperty('507f1f77bcf86cd799439019', 'Search Result')];
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(searchResults);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 2,
                viewportWidth: 1024,
                query: mockQuery,
            });
            render(Component);

            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(2, 1024, mockQuery);
            expect(screen.getByText('Search Result')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Props Combinations
    // ========================================================================
    describe('Props Combinations', () => {
        it('should handle properties prop provided directly', async () => {
            const Component = await PropertiesList({
                properties: mockProperties,
            });
            render(Component);

            // Should use provided properties, not fetch
            expect(fetchFeaturedProperties.fetchFeaturedProperties).not.toHaveBeenCalled();
            expect(fetchPaginatedProperties.fetchPaginatedProperties).not.toHaveBeenCalled();
            expect(screen.getAllByTestId('property-card')).toHaveLength(3);
        });

        it('should handle currentPage and query with viewportWidth', async () => {
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(mockProperties);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 1,
                viewportWidth: 1024,
                query: mockQuery,
            });
            render(Component);

            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(1, 1024, mockQuery);
        });

        it('should handle empty properties array', async () => {
            const Component = await PropertiesList({ properties: [] });
            render(Component);

            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Full Component Behavior', () => {
        it('should complete full featured properties flow', async () => {
            const featuredProps = [
                createMockProperty('507f1f77bcf86cd79943901a', 'Featured A'),
                createMockProperty('507f1f77bcf86cd79943901b', 'Featured B'),
                createMockProperty('507f1f77bcf86cd79943901c', 'Featured C'),
            ];
            (fetchFeaturedProperties.fetchFeaturedProperties as jest.Mock).mockResolvedValue(featuredProps);

            const Component = await PropertiesList({
                featured: true,
                viewportWidth: 1440,
            });
            render(Component);

            // Verify data fetch
            expect(fetchFeaturedProperties.fetchFeaturedProperties).toHaveBeenCalledWith(1440);

            // Verify rendering
            expect(screen.getAllByTestId('property-card')).toHaveLength(3);
            expect(screen.getByText('Featured A')).toBeInTheDocument();
            expect(screen.getByText('Featured B')).toBeInTheDocument();
            expect(screen.getByText('Featured C')).toBeInTheDocument();
        });

        it('should complete full paginated properties flow with search', async () => {
            const searchResults = [
                createMockProperty('507f1f77bcf86cd79943901d', 'Downtown Loft'),
                createMockProperty('507f1f77bcf86cd79943901e', 'Downtown Studio'),
            ];
            (fetchPaginatedProperties.fetchPaginatedProperties as jest.Mock).mockResolvedValue(searchResults);

            const mockQuery = { $or: [] } as unknown as PropertiesQuery;
            const Component = await PropertiesList({
                currentPage: 2,
                viewportWidth: 1024,
                query: mockQuery,
            });
            render(Component);

            // Verify data fetch with all parameters
            expect(fetchPaginatedProperties.fetchPaginatedProperties).toHaveBeenCalledWith(
                2,
                1024,
                mockQuery
            );

            // Verify rendering
            expect(screen.getAllByTestId('property-card')).toHaveLength(2);
            expect(screen.getByText('Downtown Loft')).toBeInTheDocument();
            expect(screen.getByText('Downtown Studio')).toBeInTheDocument();
        });

        it('should handle transition from empty to populated state', async () => {
            // First render with empty
            const { rerender } = render(await PropertiesList({ properties: [] }));

            expect(screen.getByText('No properties found')).toBeInTheDocument();

            // Second render with properties
            rerender(await PropertiesList({ properties: mockProperties }));

            expect(screen.queryByText('No properties found')).not.toBeInTheDocument();
            expect(screen.getAllByTestId('property-card')).toHaveLength(3);
        });
    });
});
