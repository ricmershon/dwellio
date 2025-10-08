/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import FavoritePropertiesPage from '@/app/(root)/properties/favorites/page';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Services (Mocked)
jest.mock('@/utils/require-session-user');
jest.mock('@/lib/data/property-data');

// ✅ Child Components (Mocked for functional test isolation)
jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <div data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, idx: number) => (
                    <span key={idx} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </div>
        );
    };
});

jest.mock('@/ui/properties/properties-list', () => {
    return function MockPropertiesList({ properties }: any) {
        return (
            <div data-testid="properties-list">
                Properties List: {properties.length} properties
            </div>
        );
    };
});

import { requireSessionUser } from '@/utils/require-session-user';
import { fetchFavoritedProperties } from '@/lib/data/property-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchFavoritedProperties = fetchFavoritedProperties as jest.MockedFunction<
    typeof fetchFavoritedProperties
>;

describe('FavoritePropertiesPage', () => {
    const mockSessionUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
    };

    const mockFavoriteProperties = [
        {
            _id: 'prop1',
            name: 'Beach House',
            type: 'House',
            location: {
                city: 'Miami',
            },
        },
        {
            _id: 'prop2',
            name: 'Downtown Apartment',
            type: 'Apartment',
            location: {
                city: 'New York',
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockSessionUser as any);
        mockFetchFavoritedProperties.mockResolvedValue(mockFavoriteProperties as any);
    });

    describe('Authentication', () => {
        it('should require authenticated user', async () => {
            await FavoritePropertiesPage();

            expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should fetch favorited properties with session user id', async () => {
            await FavoritePropertiesPage();

            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith('user123');
        });

        it('should handle authentication check before data fetching', async () => {
            const callOrder: string[] = [];

            mockRequireSessionUser.mockImplementation(async () => {
                callOrder.push('auth');
                return mockSessionUser as any;
            });

            mockFetchFavoritedProperties.mockImplementation(async () => {
                callOrder.push('fetch');
                return mockFavoriteProperties as any;
            });

            await FavoritePropertiesPage();

            expect(callOrder).toEqual(['auth', 'fetch']);
        });
    });

    describe('Page Structure', () => {
        it('should render main element', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
        });

        it('should render properties list', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toBeInTheDocument();
        });
    });

    describe('Breadcrumbs', () => {
        it('should render correct breadcrumb trail', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Profile');
            expect(breadcrumbs).toHaveTextContent('Favorite Properties');
        });

        it('should mark Favorite Properties breadcrumb as active', async () => {
            const jsx = await FavoritePropertiesPage();
            const { container } = render(jsx);

            const favoritesCrumb = container.querySelector('[data-active="true"]');
            expect(favoritesCrumb).toHaveTextContent('Favorite Properties');
        });

        it('should link to profile page in breadcrumbs', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Profile');
        });
    });

    describe('Properties List', () => {
        it('should pass fetched properties to PropertiesList component', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('2 properties');
        });

        it('should handle empty favorites list', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([] as any);

            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('0 properties');
        });

        it('should handle multiple favorite properties', async () => {
            const manyProperties = Array.from({ length: 15 }, (_, i) => ({
                _id: `prop${i}`,
                name: `Property ${i}`,
                type: 'Apartment',
            }));

            mockFetchFavoritedProperties.mockResolvedValue(manyProperties as any);

            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('15 properties');
        });

        it('should handle single favorite property', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([mockFavoriteProperties[0]] as any);

            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('1 properties');
        });
    });

    describe('Metadata', () => {
        it('should export metadata with Favorite Properties title', async () => {
            const { metadata } = await import('@/app/(root)/properties/favorites/page');
            expect(metadata.title).toBe('Favorite Properties');
        });
    });

    describe('Async Server Component', () => {
        it('should be an async function', () => {
            const result = FavoritePropertiesPage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to JSX element', async () => {
            const jsx = await FavoritePropertiesPage();
            expect(jsx).toBeDefined();
            expect(typeof jsx).toBe('object');
        });
    });

    describe('Error Handling', () => {
        it('should handle requireSessionUser errors', async () => {
            mockRequireSessionUser.mockRejectedValue(new Error('Unauthorized'));

            await expect(FavoritePropertiesPage()).rejects.toThrow('Unauthorized');
        });

        it('should handle fetchFavoritedProperties errors', async () => {
            mockFetchFavoritedProperties.mockRejectedValue(new Error('Database error'));

            await expect(FavoritePropertiesPage()).rejects.toThrow('Database error');
        });
    });

    describe('Data Flow', () => {
        it('should complete full data flow', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            // Authentication completed
            expect(mockRequireSessionUser).toHaveBeenCalled();

            // Favorites fetched
            expect(mockFetchFavoritedProperties).toHaveBeenCalled();

            // UI rendered
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });

        it('should use session user id for fetching favorites', async () => {
            await FavoritePropertiesPage();

            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith(mockSessionUser.id);
        });
    });

    describe('Component Integration', () => {
        it('should integrate breadcrumbs and properties list', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });

        it('should render components in correct order', async () => {
            const jsx = await FavoritePropertiesPage();
            const { container } = render(jsx);

            const main = container.querySelector('main');
            const children = main?.children;

            // Breadcrumbs should be first
            expect(children?.[0]).toContainElement(screen.getByTestId('breadcrumbs'));

            // Properties list should be second
            expect(children?.[1]).toContainElement(screen.getByTestId('properties-list'));
        });

        it('should pass correct props to child components', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            // Breadcrumbs should have correct structure
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Profile');
            expect(breadcrumbs).toHaveTextContent('Favorite Properties');

            // Properties list should receive correct data
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('2 properties');
        });
    });

    describe('Empty State Handling', () => {
        it('should pass empty array to PropertiesList when no favorites', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([] as any);

            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('0 properties');
        });

        it('should still render all components with empty favorites', async () => {
            mockFetchFavoritedProperties.mockResolvedValue([] as any);

            const jsx = await FavoritePropertiesPage();
            render(jsx);

            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });
    });

    describe('User Context', () => {
        it('should fetch favorites specific to logged-in user', async () => {
            await FavoritePropertiesPage();

            expect(mockFetchFavoritedProperties).toHaveBeenCalledWith('user123');
        });

        it('should not fetch favorites for different user', async () => {
            await FavoritePropertiesPage();

            expect(mockFetchFavoritedProperties).not.toHaveBeenCalledWith('other-user-id');
        });
    });

    describe('PropertiesList Integration', () => {
        it('should use PropertiesList component for display', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            // PropertiesList is the component used to display properties
            expect(screen.getByTestId('properties-list')).toBeInTheDocument();
        });

        it('should pass property documents to PropertiesList', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            // Properties are passed to PropertiesList
            const propertiesList = screen.getByTestId('properties-list');
            expect(propertiesList).toHaveTextContent('2 properties');
        });
    });

    describe('Navigation Context', () => {
        it('should indicate user came from profile page', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Profile');
        });

        it('should show current page in breadcrumbs', async () => {
            const jsx = await FavoritePropertiesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Favorite Properties');
        });
    });
});
