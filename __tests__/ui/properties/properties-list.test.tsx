import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import PropertiesList from '@/ui/properties/properties-list';
import { PropertyDocument } from '@/models';
import { PropertiesQuery } from '@/types/types';

// Mock PropertyCard component
jest.mock('@/ui/properties/property-card', () => ({
    __esModule: true,
    default: ({ property }: { property: PropertyDocument }) => (
        <div 
            data-testid="property-card"
            data-property-id={property._id?.toString()}
            data-property-name={property.name}
        >
            PropertyCard: {property.name}
        </div>
    ),
}));

// Mock data fetching functions
jest.mock('@/lib/data/property-data', () => ({
    fetchFeaturedProperties: jest.fn(),
    fetchPaginatedProperties: jest.fn(),
}));

// Helper to create valid PropertiesQuery
const createValidQuery = (searchTerm: string = 'test'): PropertiesQuery => ({
    $or: [
        { name: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') },
        { amenities: new RegExp(searchTerm, 'i') },
        { type: new RegExp(searchTerm, 'i') },
        { "location.street": new RegExp(searchTerm, 'i') },
        { "location.city": new RegExp(searchTerm, 'i') },
        { "location.state": new RegExp(searchTerm, 'i') },
        { "location.zip": new RegExp(searchTerm, 'i') }
    ]
});

// Helper to create mock properties
const createMockProperty = (overrides: Partial<PropertyDocument> = {}): PropertyDocument => ({
    _id: `property-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Property',
    description: 'A beautiful test property',
    type: 'House',
    beds: 2,
    baths: 1,
    square_feet: 1000,
    location: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
    },
    rates: {
        nightly: 100,
        weekly: 600,
        monthly: 2000,
    },
    imagesData: [{
        secureUrl: 'https://test.com/image.jpg',
        publicId: 'test-image',
        width: 800,
        height: 600,
    }],
    owner: 'owner-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    amenities: ['WiFi', 'Kitchen'],
    ...overrides,
} as PropertyDocument);

describe('PropertiesList', () => {
    const mockFetchFeaturedProperties = jest.mocked(jest.requireMock('@/lib/data/property-data').fetchFeaturedProperties);
    const mockFetchPaginatedProperties = jest.mocked(jest.requireMock('@/lib/data/property-data').fetchPaginatedProperties);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock returns
        mockFetchFeaturedProperties.mockResolvedValue([]);
        mockFetchPaginatedProperties.mockResolvedValue([]);
    });

    describe('Component Structure', () => {
        it('should render section with correct container structure', async () => {
            const properties = [createMockProperty({ name: 'Test Property 1' })];
            
            render(await PropertiesList({ properties }));
            
            const section = screen.getByRole('region');
            expect(section.tagName).toBe('SECTION');
            
            const container = section.querySelector('.m-auto');
            expect(container).toBeInTheDocument();
        });

        it('should render grid container with correct classes when properties exist', async () => {
            const properties = [createMockProperty({ name: 'Grid Test Property' })];
            
            const { container } = render(await PropertiesList({ properties }));
            
            const gridContainer = container.querySelector('.grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4.lg\\:grid-cols-5.xl\\:grid-cols-6.gap-4.md\\:gap-6');
            expect(gridContainer).toBeInTheDocument();
        });

        it('should render no properties message when empty', async () => {
            render(await PropertiesList({ properties: [] }));
            
            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });
    });

    describe('Direct Properties Props Pattern', () => {
        it('should render properties when provided directly', async () => {
            const properties = [
                createMockProperty({ name: 'Direct Property 1' }),
                createMockProperty({ name: 'Direct Property 2' }),
                createMockProperty({ name: 'Direct Property 3' }),
            ];
            
            render(await PropertiesList({ properties }));
            
            expect(screen.getByText('PropertyCard: Direct Property 1')).toBeInTheDocument();
            expect(screen.getByText('PropertyCard: Direct Property 2')).toBeInTheDocument();
            expect(screen.getByText('PropertyCard: Direct Property 3')).toBeInTheDocument();
            
            // Should not call data fetching functions when properties provided directly
            expect(mockFetchFeaturedProperties).not.toHaveBeenCalled();
            expect(mockFetchPaginatedProperties).not.toHaveBeenCalled();
        });

        it('should render with optional viewportWidth when properties provided', async () => {
            const properties = [createMockProperty({ name: 'Viewport Property' })];
            
            render(await PropertiesList({ properties, viewportWidth: 1200 }));
            
            expect(screen.getByText('PropertyCard: Viewport Property')).toBeInTheDocument();
            expect(mockFetchFeaturedProperties).not.toHaveBeenCalled();
            expect(mockFetchPaginatedProperties).not.toHaveBeenCalled();
        });

        it('should handle empty properties array', async () => {
            render(await PropertiesList({ properties: [] }));
            
            expect(screen.getByText('No properties found')).toBeInTheDocument();
            expect(screen.queryAllByTestId('property-card')).toHaveLength(0);
        });
    });

    describe('Featured Properties Props Pattern', () => {
        it('should fetch and render featured properties', async () => {
            const featuredProperties = [
                createMockProperty({ name: 'Featured Property 1' }),
                createMockProperty({ name: 'Featured Property 2' }),
            ];
            
            mockFetchFeaturedProperties.mockResolvedValue(featuredProperties);
            
            render(await PropertiesList({ featured: true, viewportWidth: 1200 }));
            
            expect(mockFetchFeaturedProperties).toHaveBeenCalledWith(1200);
            expect(mockFetchFeaturedProperties).toHaveBeenCalledTimes(1);
            
            expect(screen.getByText('PropertyCard: Featured Property 1')).toBeInTheDocument();
            expect(screen.getByText('PropertyCard: Featured Property 2')).toBeInTheDocument();
        });

        it('should handle featured with different viewport widths', async () => {
            const featuredProperties = [createMockProperty({ name: 'Mobile Featured' })];
            mockFetchFeaturedProperties.mockResolvedValue(featuredProperties);
            
            render(await PropertiesList({ featured: true, viewportWidth: 768 }));
            
            expect(mockFetchFeaturedProperties).toHaveBeenCalledWith(768);
            expect(screen.getByText('PropertyCard: Mobile Featured')).toBeInTheDocument();
        });

        it('should handle empty featured properties', async () => {
            mockFetchFeaturedProperties.mockResolvedValue([]);
            
            render(await PropertiesList({ featured: true, viewportWidth: 1200 }));
            
            expect(mockFetchFeaturedProperties).toHaveBeenCalledWith(1200);
            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });

        it('should not fetch featured properties when featured is false', async () => {
            const regularProperties = [createMockProperty({ name: 'Regular Property' })];
            mockFetchPaginatedProperties.mockResolvedValue(regularProperties);
            
            render(await PropertiesList({ 
                currentPage: 1, 
                query: createValidQuery(), 
                viewportWidth: 1200 
            }));
            
            expect(mockFetchFeaturedProperties).not.toHaveBeenCalled();
            expect(mockFetchPaginatedProperties).toHaveBeenCalled();
        });
    });

    describe('Paginated Properties Props Pattern', () => {
        it('should fetch and render paginated properties', async () => {
            const paginatedProperties = [
                createMockProperty({ name: 'Paginated Property 1' }),
                createMockProperty({ name: 'Paginated Property 2' }),
            ];
            
            const query = createValidQuery();
            
            mockFetchPaginatedProperties.mockResolvedValue(paginatedProperties);
            
            render(await PropertiesList({ 
                currentPage: 2, 
                query, 
                viewportWidth: 1024 
            }));
            
            expect(mockFetchPaginatedProperties).toHaveBeenCalledWith(2, 1024, query);
            expect(mockFetchPaginatedProperties).toHaveBeenCalledTimes(1);
            
            expect(screen.getByText('PropertyCard: Paginated Property 1')).toBeInTheDocument();
            expect(screen.getByText('PropertyCard: Paginated Property 2')).toBeInTheDocument();
        });

        it('should handle different page numbers', async () => {
            const properties = [createMockProperty({ name: 'Page 5 Property' })];
            mockFetchPaginatedProperties.mockResolvedValue(properties);
            
            const query = createValidQuery();
            
            render(await PropertiesList({ 
                currentPage: 5, 
                query, 
                viewportWidth: 800 
            }));
            
            expect(mockFetchPaginatedProperties).toHaveBeenCalledWith(5, 800, query);
            expect(screen.getByText('PropertyCard: Page 5 Property')).toBeInTheDocument();
        });

        it('should handle complex queries', async () => {
            const properties = [createMockProperty({ name: 'Searched Property' })];
            mockFetchPaginatedProperties.mockResolvedValue(properties);
            
            const complexQuery = createValidQuery('luxury');
            
            render(await PropertiesList({ 
                currentPage: 1, 
                query: complexQuery, 
                viewportWidth: 1200 
            }));
            
            expect(mockFetchPaginatedProperties).toHaveBeenCalledWith(1, 1200, complexQuery);
            expect(screen.getByText('PropertyCard: Searched Property')).toBeInTheDocument();
        });

        it('should handle empty paginated results', async () => {
            mockFetchPaginatedProperties.mockResolvedValue([]);
            
            const query = createValidQuery('nonexistent');
            
            render(await PropertiesList({ 
                currentPage: 1, 
                query, 
                viewportWidth: 1024 
            }));
            
            expect(mockFetchPaginatedProperties).toHaveBeenCalledWith(1, 1024, query);
            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });

        it('should handle currentPage 0 as falsy and return empty array', async () => {
            render(await PropertiesList({ 
                currentPage: 0, 
                query: createValidQuery(), 
                viewportWidth: 1024 
            }));
            
            expect(mockFetchPaginatedProperties).not.toHaveBeenCalled();
            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });
    });

    describe('PropertyCard Integration', () => {
        it('should pass correct props to PropertyCard components', async () => {
            const properties = [
                createMockProperty({ 
                    _id: 'prop-123', 
                    name: 'Integration Test Property 1' 
                }),
                createMockProperty({ 
                    _id: 'prop-456', 
                    name: 'Integration Test Property 2' 
                }),
            ];
            
            render(await PropertiesList({ properties }));
            
            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards).toHaveLength(2);
            
            expect(propertyCards[0]).toHaveAttribute('data-property-id', 'prop-123');
            expect(propertyCards[0]).toHaveAttribute('data-property-name', 'Integration Test Property 1');
            
            expect(propertyCards[1]).toHaveAttribute('data-property-id', 'prop-456');
            expect(propertyCards[1]).toHaveAttribute('data-property-name', 'Integration Test Property 2');
        });

        it('should generate unique keys for PropertyCard components', async () => {
            const properties = [
                createMockProperty({ _id: 'unique-1', name: 'Unique Property 1' }),
                createMockProperty({ _id: 'unique-2', name: 'Unique Property 2' }),
                createMockProperty({ _id: 'unique-3', name: 'Unique Property 3' }),
            ];
            
            render(await PropertiesList({ properties }));
            
            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards).toHaveLength(3);
            
            // Each property should have unique IDs
            const propertyIds = propertyCards.map(card => card.getAttribute('data-property-id'));
            const uniqueIds = new Set(propertyIds);
            expect(uniqueIds.size).toBe(3); // All IDs should be unique
        });

        it('should handle properties with complex _id types', async () => {
            const properties = [
                createMockProperty({ _id: { toString: () => 'complex-id-1' } as unknown as string, name: 'Complex ID Property' }),
            ];
            
            render(await PropertiesList({ properties }));
            
            const propertyCard = screen.getByTestId('property-card');
            expect(propertyCard).toHaveAttribute('data-property-id', 'complex-id-1');
        });
    });

    describe('Data Fetching Error Handling', () => {
        it('should handle fetchFeaturedProperties errors gracefully', async () => {
            mockFetchFeaturedProperties.mockRejectedValue(new Error('Featured fetch failed'));
            
            await expect(async () => {
                render(await PropertiesList({ featured: true, viewportWidth: 1200 }));
            }).rejects.toThrow('Featured fetch failed');
        });

        it('should handle fetchPaginatedProperties errors gracefully', async () => {
            mockFetchPaginatedProperties.mockRejectedValue(new Error('Pagination fetch failed'));
            
            const query = createValidQuery();
            
            await expect(async () => {
                render(await PropertiesList({ 
                    currentPage: 1, 
                    query, 
                    viewportWidth: 1024 
                }));
            }).rejects.toThrow('Pagination fetch failed');
        });
    });

    describe('Edge Cases and Props Validation', () => {
        it('should handle large numbers of properties', async () => {
            const manyProperties = Array.from({ length: 50 }, (_, index) => 
                createMockProperty({ 
                    _id: `bulk-property-${index}`, 
                    name: `Bulk Property ${index + 1}` 
                })
            );
            
            render(await PropertiesList({ properties: manyProperties }));
            
            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards).toHaveLength(50);
            
            // Check first and last properties
            expect(screen.getByText('PropertyCard: Bulk Property 1')).toBeInTheDocument();
            expect(screen.getByText('PropertyCard: Bulk Property 50')).toBeInTheDocument();
        });

        it('should handle properties with minimal required data', async () => {
            const minimalProperty = {
                _id: 'minimal-prop',
                name: 'Minimal Property',
            } as PropertyDocument;
            
            render(await PropertiesList({ properties: [minimalProperty] }));
            
            expect(screen.getByText('PropertyCard: Minimal Property')).toBeInTheDocument();
        });

        it('should handle different viewport width values', async () => {
            const properties = [createMockProperty({ name: 'Responsive Property' })];
            
            // Test different viewport widths that might affect rendering
            const viewportWidths = [320, 768, 1024, 1200, 1920];
            
            for (const viewportWidth of viewportWidths) {
                const { unmount } = render(await PropertiesList({ 
                    properties, 
                    viewportWidth 
                }));
                
                expect(screen.getByText('PropertyCard: Responsive Property')).toBeInTheDocument();
                unmount();
            }
        });

        it('should handle undefined/null property values gracefully', async () => {
            const propertiesWithNulls = [
                createMockProperty({ 
                    _id: 'null-test', 
                    name: 'Property with Nulls',
                    description: undefined as unknown as string,
                }),
            ];
            
            render(await PropertiesList({ properties: propertiesWithNulls }));
            
            expect(screen.getByText('PropertyCard: Property with Nulls')).toBeInTheDocument();
        });
    });

    describe('Conditional Logic', () => {
        it('should prioritize featured over pagination when both conditions could apply', async () => {
            const featuredProperties = [createMockProperty({ name: 'Featured Priority' })];
            mockFetchFeaturedProperties.mockResolvedValue(featuredProperties);
            
            // This should never be called when featured=true
            mockFetchPaginatedProperties.mockResolvedValue([
                createMockProperty({ name: 'Should Not Appear' })
            ]);
            
            render(await PropertiesList({ 
                featured: true, 
                viewportWidth: 1200
            })); // Type assertion to bypass union type restriction
            
            expect(mockFetchFeaturedProperties).toHaveBeenCalledWith(1200);
            expect(mockFetchPaginatedProperties).not.toHaveBeenCalled();
            
            expect(screen.getByText('PropertyCard: Featured Priority')).toBeInTheDocument();
            expect(screen.queryByText('PropertyCard: Should Not Appear')).not.toBeInTheDocument();
        });

        it('should fall back to empty array when no valid data source', async () => {
            // No properties provided, not featured, no currentPage
            render(await PropertiesList({ properties: [] }));
            
            expect(mockFetchFeaturedProperties).not.toHaveBeenCalled();
            expect(mockFetchPaginatedProperties).not.toHaveBeenCalled();
            
            expect(screen.getByText('No properties found')).toBeInTheDocument();
        });

        it('should prioritize direct properties over any fetching', async () => {
            const directProperties = [createMockProperty({ name: 'Direct Priority' })];
            
            // These should never be called when properties are provided
            mockFetchFeaturedProperties.mockResolvedValue([
                createMockProperty({ name: 'Should Not Fetch Featured' })
            ]);
            mockFetchPaginatedProperties.mockResolvedValue([
                createMockProperty({ name: 'Should Not Fetch Paginated' })
            ]);
            
            render(await PropertiesList({ 
                properties: directProperties
            }));
            
            expect(mockFetchFeaturedProperties).not.toHaveBeenCalled();
            expect(mockFetchPaginatedProperties).not.toHaveBeenCalled();
            
            expect(screen.getByText('PropertyCard: Direct Priority')).toBeInTheDocument();
        });
    });

    describe('Performance Considerations', () => {
        it('should handle rapid successive renders', async () => {
            const properties = [createMockProperty({ name: 'Performance Test' })];
            
            // Render multiple times quickly
            const renders = await Promise.all([
                PropertiesList({ properties }),
                PropertiesList({ properties }),
                PropertiesList({ properties }),
            ]);
            
            renders.forEach(component => {
                const { container } = render(component);
                expect(container.querySelector('[data-property-name="Performance Test"]')).toBeTruthy();
            });
        });

        it('should not cause memory leaks with large datasets', async () => {
            const largeDataset = Array.from({ length: 100 }, (_, i) => 
                createMockProperty({ 
                    _id: `perf-${i}`, 
                    name: `Performance Property ${i}` 
                })
            );
            
            const { unmount } = render(await PropertiesList({ properties: largeDataset }));
            
            expect(screen.getAllByTestId('property-card')).toHaveLength(100);
            
            // Cleanup should work without issues
            unmount();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic section element', async () => {
            const properties = [createMockProperty({ name: 'Semantic Property' })];
            
            render(await PropertiesList({ properties }));
            
            const section = screen.getByRole('region');
            expect(section.tagName).toBe('SECTION');
        });

        it('should provide meaningful structure for screen readers', async () => {
            const properties = [
                createMockProperty({ name: 'Property A' }),
                createMockProperty({ name: 'Property B' }),
            ];
            
            render(await PropertiesList({ properties }));
            
            const propertyCards = screen.getAllByTestId('property-card');
            expect(propertyCards).toHaveLength(2);
            
            // Each property card should have accessible content
            expect(screen.getByText('PropertyCard: Property A')).toBeInTheDocument();
            expect(screen.getByText('PropertyCard: Property B')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with direct properties', async () => {
            const properties = [
                createMockProperty({ _id: 'snap-1', name: 'Snapshot Property 1' }),
                createMockProperty({ _id: 'snap-2', name: 'Snapshot Property 2' }),
            ];
            
            const { container } = render(await PropertiesList({ properties }));
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with no properties', async () => {
            const { container } = render(await PropertiesList({ properties: [] }));
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with featured properties', async () => {
            const featuredProperties = [
                createMockProperty({ _id: 'featured-1', name: 'Featured Snapshot 1' }),
            ];
            mockFetchFeaturedProperties.mockResolvedValue(featuredProperties);
            
            const { container } = render(await PropertiesList({ 
                featured: true, 
                viewportWidth: 1200 
            }));
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});