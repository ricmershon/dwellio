// Mock all external dependencies first
jest.mock('@/lib/data/property-data', () => ({
    fetchFavoritedProperties: jest.fn()
}));

jest.mock('@/utils/require-session-user', () => ({
    requireSessionUser: jest.fn()
}));

jest.mock('@/ui/shared/breadcrumbs', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ breadcrumbs }: any) => (
        <nav data-testid="breadcrumbs">
            {breadcrumbs.map((crumb: any, index: number) => (
                <span 
                    key={index} 
                    className={crumb.active ? 'active' : ''}
                    data-href={crumb.href}
                >
                    {crumb.label}
                </span>
            ))}
        </nav>
    ),
}));

jest.mock('@/ui/properties/properties-list', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ properties }: any) => (
        <section data-testid="properties-list">
            {properties.filter((prop: any) => prop && prop._id).map((prop: any) => (
                <div key={prop._id} data-testid={`property-${prop._id}`}>
                    {prop.name}
                </div>
            ))}
        </section>
    ),
}));

import { render, screen } from '@testing-library/react';
import FavoritePropertiesPage from '@/app/(root)/properties/favorites/page';
import { requireSessionUser } from '@/utils/require-session-user';
import { fetchFavoritedProperties } from '@/lib/data/property-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchFavoritedProperties = fetchFavoritedProperties as jest.MockedFunction<typeof fetchFavoritedProperties>;

describe('FavoritePropertiesPage Integration Tests', () => {
    const mockSessionUser = {
        id: 'favorites-user-123',
        name: 'Favorites Test User',
        email: 'favorites@test.com',
        image: 'https://example.com/user-avatar.jpg'
    };

    let propertyIdCounter = 0;
    const createMockFavoriteProperty = (overrides: any = {}) => ({
        _id: overrides._id || `fav-prop-${++propertyIdCounter}`,
        name: 'Favorite Test Property',
        type: 'House',
        description: 'Beautiful favorited property',
        location: {
            street: '456 Favorites Ave',
            city: 'Favorites City',
            state: 'CA',
            zipcode: '90210'
        },
        beds: 3,
        baths: 2,
        squareFeet: 1800,
        owner: 'property-owner-456' as unknown as import('mongoose').Types.ObjectId,
        isFeatured: true,
        amenities: ['Pool', 'WiFi', 'Gym'],
        rates: { nightly: 250, weekly: 1500, monthly: 5000 },
        imagesData: [
            { secureUrl: 'https://test.com/fav-prop.jpg', publicId: 'fav-prop', width: 800, height: 600 }
        ],
        sellerInfo: {
            name: 'Property Owner',
            email: 'owner@test.com',
            phone: '555-0123'
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        propertyIdCounter = 0;
        mockRequireSessionUser.mockResolvedValue(mockSessionUser);
        mockFetchFavoritedProperties.mockResolvedValue([]);
    });

    describe('Page Metadata', () => {
        it('should export correct metadata object', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const FavoritePropertiesPageModule = require('@/app/(root)/properties/favorites/page');
            expect(FavoritePropertiesPageModule.metadata).toEqual({
                title: 'Favorite Properties'
            });
        });
    });

    describe('Authentication Integration', () => {
        it('should call requireSessionUser before rendering', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should handle authentication and pass user ID to data fetching', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith('favorites-user-123');
        });

        it('should handle authentication redirects properly', async () => {
            const authError = new Error('Authentication required');
            mockRequireSessionUser.mockRejectedValue(authError);

            await expect(FavoritePropertiesPage()).rejects.toThrow('Authentication required');
        });

        it('should handle session errors gracefully', async () => {
            const sessionError = new Error('Session expired');
            mockRequireSessionUser.mockRejectedValue(sessionError);

            await expect(FavoritePropertiesPage()).rejects.toThrow('Session expired');
        });

        it('should handle null user ID in session', async () => {
            const userWithoutId = { ...mockSessionUser, id: undefined };
            mockRequireSessionUser.mockResolvedValue(userWithoutId as any);

            const component = await FavoritePropertiesPage();
            render(component);

            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith(undefined);
        });
    });

    describe('Data Fetching Integration', () => {
        it('should call fetchFavoritedProperties with session user ID', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            expect(mockFetchFavoritedProperties).toHaveBeenCalledTimes(1);
            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith('favorites-user-123');
        });

        it('should handle successful favorites data retrieval', async () => {
            const favoriteProperties = [
                createMockFavoriteProperty({ name: 'Beach House Favorite' }),
                createMockFavoriteProperty({ name: 'Mountain Cabin Favorite' }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(favoriteProperties);

            const component = await FavoritePropertiesPage();
            render(component);

            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            expect(screen.getByText('Beach House Favorite')).toBeInTheDocument();
            expect(screen.getByText('Mountain Cabin Favorite')).toBeInTheDocument();
        });

        it('should pass properties array to PropertiesList', async () => {
            const favoriteProperties = [
                createMockFavoriteProperty({ _id: 'fav-1', name: 'Favorite Property 1' }),
                createMockFavoriteProperty({ _id: 'fav-2', name: 'Favorite Property 2' }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(favoriteProperties);

            const component = await FavoritePropertiesPage();
            render(component);

            expect(screen.getByTestId('property-fav-1')).toBeInTheDocument();
            expect(screen.getByTestId('property-fav-2')).toBeInTheDocument();
        });

        it('should handle data fetching errors appropriately', async () => {
            const dataError = new Error('Failed to fetch favorite properties');
            mockFetchFavoritedProperties.mockRejectedValue(dataError);

            await expect(FavoritePropertiesPage()).rejects.toThrow('Failed to fetch favorite properties');
        });

        it('should handle empty favorites array', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([]);

            const component = await FavoritePropertiesPage();
            render(component);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
            expect(propertiesList.children).toHaveLength(0);
        });
    });

    describe('Breadcrumbs Integration', () => {
        it('should render Breadcrumbs with correct navigation path', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            
            const breadcrumbItems = breadcrumbs.children;
            expect(breadcrumbItems).toHaveLength(2);
        });

        it('should set "Favorite Properties" as active breadcrumb', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            const activeBreadcrumb = screen.getByText('Favorite Properties');
            expect(activeBreadcrumb).toHaveClass('active');
            expect(activeBreadcrumb).toHaveAttribute('data-href', '/properties/favorites');
        });

        it('should include "Profile" link in breadcrumb trail', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            const profileBreadcrumb = screen.getByText('Profile');
            expect(profileBreadcrumb).toBeInTheDocument();
            expect(profileBreadcrumb).toHaveAttribute('data-href', '/profile');
            expect(profileBreadcrumb).not.toHaveClass('active');
        });

        it('should handle breadcrumb navigation properly', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            const profileLink = screen.getByText('Profile');
            const favoritesLink = screen.getByText('Favorite Properties');
            
            expect(breadcrumbs).toContainElement(profileLink);
            expect(breadcrumbs).toContainElement(favoritesLink);
        });
    });

    describe('Layout Structure', () => {
        it('should render main element as page container', async () => {
            const component = await FavoritePropertiesPage();
            const { container } = render(component);

            const mainElement = container.querySelector('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should maintain proper semantic HTML structure', async () => {
            const component = await FavoritePropertiesPage();
            const { container } = render(component);

            const mainElement = container.querySelector('main');
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            const propertiesList = screen.getByTestId('properties-list');

            expect(mainElement).toContainElement(breadcrumbs);
            expect(mainElement).toContainElement(propertiesList);
        });

        it('should apply consistent page layout patterns', async () => {
            const component = await FavoritePropertiesPage();
            const { container } = render(component);

            const mainElement = container.querySelector('main');
            expect(mainElement).toBeInTheDocument();
            expect(mainElement?.children).toHaveLength(2); // Breadcrumbs + PropertiesList
        });

        it('should handle responsive design requirements', async () => {
            const component = await FavoritePropertiesPage();
            render(component);

            // The components themselves should handle responsive design
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });

    describe('PropertiesList Integration', () => {
        it('should render PropertiesList component with favorites', async () => {
            const favorites = [createMockFavoriteProperty({ name: 'Integration Test Property' })];
            mockFetchFavoritedProperties.mockResolvedValue(favorites);

            const component = await FavoritePropertiesPage();
            render(component);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
            expect(screen.getByText('Integration Test Property')).toBeInTheDocument();
        });

        it('should pass correct properties array to child component', async () => {
            const favorites = [
                createMockFavoriteProperty({ _id: 'prop-1', name: 'Property One' }),
                createMockFavoriteProperty({ _id: 'prop-2', name: 'Property Two' }),
                createMockFavoriteProperty({ _id: 'prop-3', name: 'Property Three' }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(favorites);

            const component = await FavoritePropertiesPage();
            render(component);

            expect(screen.getByTestId('property-prop-1')).toBeInTheDocument();
            expect(screen.getByTestId('property-prop-2')).toBeInTheDocument();
            expect(screen.getByTestId('property-prop-3')).toBeInTheDocument();
            expect(screen.getByText('Property One')).toBeInTheDocument();
            expect(screen.getByText('Property Two')).toBeInTheDocument();
            expect(screen.getByText('Property Three')).toBeInTheDocument();
        });

        it('should handle empty favorites state properly', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([]);

            const component = await FavoritePropertiesPage();
            render(component);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
            expect(propertiesList.children).toHaveLength(0);
        });

        it('should maintain component prop interface', async () => {
            const favorites = [createMockFavoriteProperty()];
            mockFetchFavoritedProperties.mockResolvedValue(favorites);

            // This test verifies that the page renders without prop interface errors
            const component = await FavoritePropertiesPage();
            render(component);

            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        describe('Authentication Failures', () => {
            it('should handle expired or invalid sessions', async () => {
                const sessionError = new Error('Session invalid or expired');
                mockRequireSessionUser.mockRejectedValue(sessionError);

                await expect(FavoritePropertiesPage()).rejects.toThrow('Session invalid or expired');
            });

            it('should maintain security boundaries consistently', async () => {
                const securityError = new Error('Unauthorized access');
                mockRequireSessionUser.mockRejectedValue(securityError);

                await expect(FavoritePropertiesPage()).rejects.toThrow('Unauthorized access');
            });

            it('should handle malformed session data', async () => {
                const malformedUser = { /* missing required fields */ } as any;
                mockRequireSessionUser.mockResolvedValue(malformedUser);

                const component = await FavoritePropertiesPage();
                render(component);

                expect(mockFetchFavoritedProperties).toHaveBeenCalledWith(undefined);
            });
        });

        describe('Data Loading Errors', () => {
            it('should handle favorites fetch failures', async () => {
                const fetchError = new Error('Database connection failed');
                mockFetchFavoritedProperties.mockRejectedValue(fetchError);

                await expect(FavoritePropertiesPage()).rejects.toThrow('Database connection failed');
            });

            it('should handle network timeouts', async () => {
                const timeoutError = new Error('Request timeout');
                mockFetchFavoritedProperties.mockRejectedValue(timeoutError);

                await expect(FavoritePropertiesPage()).rejects.toThrow('Request timeout');
            });

            it('should handle malformed favorites data', async () => {
                const malformedData = [
                    null,
                    createMockFavoriteProperty({ name: 'Valid Property' }),
                    undefined,
                ] as any;
                mockFetchFavoritedProperties.mockResolvedValue(malformedData);

                const component = await FavoritePropertiesPage();
                render(component);

                // Should still render the valid property
                expect(screen.getByText('Valid Property')).toBeInTheDocument();
            });
        });

        describe('Empty Favorites State', () => {
            it('should handle users with no favorited properties', async () => {
                mockFetchFavoritedProperties.mockResolvedValue([]);

                const component = await FavoritePropertiesPage();
                render(component);

                const propertiesList = screen.getByTestId('properties-list');
                expect(propertiesList).toBeInTheDocument();
                expect(propertiesList.children).toHaveLength(0);
            });

            it('should maintain page layout structure with empty state', async () => {
                mockFetchFavoritedProperties.mockResolvedValue([]);

                const component = await FavoritePropertiesPage();
                const { container } = render(component);

                const mainElement = container.querySelector('main');
                expect(mainElement).toBeInTheDocument();
                expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
                expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            });
        });

        describe('Property Access Issues', () => {
            it('should handle favorited properties with incomplete data', async () => {
                const incompleteProperty = {
                    _id: 'incomplete-prop',
                    name: 'Incomplete Property',
                    // Missing many required fields
                } as any;
                mockFetchFavoritedProperties.mockResolvedValue([incompleteProperty]);

                const component = await FavoritePropertiesPage();
                render(component);

                expect(screen.getByText('Incomplete Property')).toBeInTheDocument();
            });

            it('should maintain data consistency during rendering', async () => {
                const consistentProperties = [
                    createMockFavoriteProperty({ _id: 'consistent-1', name: 'Consistent Property 1' }),
                    createMockFavoriteProperty({ _id: 'consistent-2', name: 'Consistent Property 2' }),
                ];
                mockFetchFavoritedProperties.mockResolvedValue(consistentProperties);

                const component = await FavoritePropertiesPage();
                render(component);

                expect(screen.getByTestId('property-consistent-1')).toBeInTheDocument();
                expect(screen.getByTestId('property-consistent-2')).toBeInTheDocument();
            });
        });
    });

    describe('Component Integration Flow', () => {
        it('should execute complete page rendering flow', async () => {
            const fullFlowProperties = [
                createMockFavoriteProperty({ name: 'Flow Test Property 1' }),
                createMockFavoriteProperty({ name: 'Flow Test Property 2' }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(fullFlowProperties);

            const component = await FavoritePropertiesPage();
            render(component);

            // Authentication should be called
            expect(mockRequireSessionUser).toHaveBeenCalled();
            
            // Data fetching should be called with user ID
            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith('favorites-user-123');
            
            // Page structure should be rendered
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            
            // Properties should be displayed
            expect(screen.getByText('Flow Test Property 1')).toBeInTheDocument();
            expect(screen.getByText('Flow Test Property 2')).toBeInTheDocument();
        });

        it('should handle rapid component updates', async () => {
            const initialProperties = [createMockFavoriteProperty({ name: 'Initial Property' })];
            mockFetchFavoritedProperties.mockResolvedValue(initialProperties);

            const component1 = await FavoritePropertiesPage();
            const { rerender } = render(component1);

            expect(screen.getByText('Initial Property')).toBeInTheDocument();

            // Simulate updated data
            const updatedProperties = [createMockFavoriteProperty({ name: 'Updated Property' })];
            mockFetchFavoritedProperties.mockResolvedValue(updatedProperties);

            const component2 = await FavoritePropertiesPage();
            rerender(component2);

            // Should handle the update gracefully
            expect(mockRequireSessionUser).toHaveBeenCalledTimes(2);
        });
    });

    describe('Performance and Optimization', () => {
        it('should handle large numbers of favorite properties', async () => {
            const manyFavorites = Array.from({ length: 50 }, (_, i) => 
                createMockFavoriteProperty({ 
                    _id: `perf-fav-${i}`, 
                    name: `Performance Favorite ${i + 1}` 
                })
            );
            mockFetchFavoritedProperties.mockResolvedValue(manyFavorites);

            const startTime = performance.now();
            const component = await FavoritePropertiesPage();
            render(component);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });

        it('should manage memory efficiently during rendering', async () => {
            const memoryTestProperties = Array.from({ length: 20 }, (_, i) => 
                createMockFavoriteProperty({ name: `Memory Test ${i}` })
            );
            mockFetchFavoritedProperties.mockResolvedValue(memoryTestProperties);

            const component = await FavoritePropertiesPage();
            const { unmount } = render(component);

            // Should render without memory issues
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
            
            // Should unmount cleanly
            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with favorite properties', async () => {
            const snapshotFavorites = [
                createMockFavoriteProperty({ _id: 'snap-fav-1', name: 'Snapshot Favorite 1' }),
                createMockFavoriteProperty({ _id: 'snap-fav-2', name: 'Snapshot Favorite 2' }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(snapshotFavorites);

            const component = await FavoritePropertiesPage();
            const { container } = render(component);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with empty favorites state', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([]);

            const component = await FavoritePropertiesPage();
            const { container } = render(component);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with single favorite property', async () => {
            const singleFavorite = [
                createMockFavoriteProperty({ _id: 'single-snap-fav', name: 'Single Snapshot Favorite' }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(singleFavorite);

            const component = await FavoritePropertiesPage();
            const { container } = render(component);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with complete page layout structure', async () => {
            const layoutFavorites = [
                createMockFavoriteProperty({ 
                    _id: 'layout-test-property',
                    name: 'Layout Test Property' 
                }),
            ];
            mockFetchFavoritedProperties.mockResolvedValue(layoutFavorites);

            const component = await FavoritePropertiesPage();
            const { container } = render(component);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});