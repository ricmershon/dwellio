/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import PropertyPage from '@/app/(root)/properties/[id]/page';
import { fetchProperty } from '@/lib/data/property-data';
import { getSessionUser } from '@/utils/get-session-user';
import { PropertyDocument } from '@/models';

// Mock dependencies
jest.mock('@/lib/data/property-data');
jest.mock('@/utils/get-session-user');

// Mock child components
jest.mock('@/ui/properties/id/details', () => {
    return function MockPropertyDetails({ property }: any) {
        return (
            <div data-testid="property-details">
                <div data-testid="property-name">{property.name}</div>
            </div>
        );
    };
});

jest.mock('@/ui/properties/id/images', () => {
    return function MockPropertyImages({ imagesData }: any) {
        return (
            <div data-testid="property-images">
                Images: {imagesData?.length || 0}
            </div>
        );
    };
});

jest.mock('@/ui/properties/id/aside', () => {
    return function MockPropertyPageAside({ property }: any) {
        return (
            <aside data-testid="property-aside">
                Contact Owner for {property.name}
            </aside>
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

jest.mock('@/ui/properties/shared/form/property-favorite-button', () => {
    return function MockPropertyFavoriteButton({ propertyId }: any) {
        return (
            <button data-testid="favorite-button" data-property-id={propertyId}>
                Favorite
            </button>
        );
    };
});

jest.mock('@/ui/properties/id/share-buttons', () => {
    return function MockShareButtons({ property }: any) {
        return (
            <div data-testid="share-buttons">
                Share {property.name}
            </div>
        );
    };
});

const mockFetchProperty = fetchProperty as jest.MockedFunction<typeof fetchProperty>;
const mockGetSessionUser = getSessionUser as jest.MockedFunction<typeof getSessionUser>;

const mockProperty: Partial<PropertyDocument> = {
    _id: 'property-123',
    name: 'Luxury Downtown Apartment',
    type: 'Apartment',
    description: 'A beautiful apartment in the heart of downtown',
    location: {
        street: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zip: '33101'
    },
    owner: 'owner-456',
    imagesData: [
        { publicId: 'img1', url: 'https://example.com/img1.jpg' },
        { publicId: 'img2', url: 'https://example.com/img2.jpg' }
    ],
    beds: 2,
    baths: 2,
    squareFeet: 1200,
    amenities: ['Pool', 'Gym'],
    rates: {
        nightly: 150,
        weekly: 900,
        monthly: 3000
    }
} as any;

describe('PropertyPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetchProperty.mockResolvedValue(mockProperty as any);
        mockGetSessionUser.mockResolvedValue(null);
    });

    describe('Component Rendering', () => {
        it('should render main element', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs with property info', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            expect(breadcrumbs).toHaveTextContent('Properties');
            expect(breadcrumbs).toHaveTextContent('Apartment in Miami');
        });

        it('should render property images', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const images = screen.getByTestId('property-images');
            expect(images).toBeInTheDocument();
            expect(images).toHaveTextContent('Images: 2');
        });

        it('should render property details', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const details = screen.getByTestId('property-details');
            expect(details).toBeInTheDocument();
            expect(details).toHaveTextContent('Luxury Downtown Apartment');
        });

        it('should render share buttons', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const shareButtons = screen.getByTestId('share-buttons');
            expect(shareButtons).toBeInTheDocument();
            expect(shareButtons).toHaveTextContent('Share Luxury Downtown Apartment');
        });
    });

    describe('Property Ownership Logic', () => {
        it('should not show aside or favorite button for property owner', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'owner-456', user: { name: 'Owner' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const aside = screen.queryByTestId('property-aside');
            const favoriteButton = screen.queryByTestId('favorite-button');

            expect(aside).not.toBeInTheDocument();
            expect(favoriteButton).not.toBeInTheDocument();
        });

        it('should show aside and favorite button for non-owners', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user-789', user: { name: 'User' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const aside = screen.getByTestId('property-aside');
            const favoriteButton = screen.getByTestId('favorite-button');

            expect(aside).toBeInTheDocument();
            expect(favoriteButton).toBeInTheDocument();
        });

        it('should not show aside or favorite button for unauthenticated users', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const aside = screen.queryByTestId('property-aside');
            const favoriteButton = screen.queryByTestId('favorite-button');

            expect(aside).not.toBeInTheDocument();
            expect(favoriteButton).not.toBeInTheDocument();
        });

        it('should pass correct propertyId to favorite button', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user-789', user: { name: 'User' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const favoriteButton = screen.getByTestId('favorite-button');
            expect(favoriteButton).toHaveAttribute('data-property-id', 'property-123');
        });
    });

    describe('Layout Variations', () => {
        it('should use two-column layout for non-owners', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user-789', user: { name: 'User' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            const { container } = render(jsx);

            const grid = container.querySelector('.md\\:grid-cols-70\\/30');
            expect(grid).toBeInTheDocument();
        });

        it('should use single-column layout for owners', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'owner-456', user: { name: 'Owner' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            const { container } = render(jsx);

            const grid = container.querySelector('.md\\:grid-cols-70\\/30');
            expect(grid).not.toBeInTheDocument();
        });

        it('should use single-column layout for unauthenticated users', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            const { container } = render(jsx);

            const grid = container.querySelector('.md\\:grid-cols-70\\/30');
            expect(grid).not.toBeInTheDocument();
        });
    });

    describe('Data Fetching', () => {
        it('should call fetchProperty with correct id', async () => {
            const params = Promise.resolve({ id: 'test-property-456' });
            await PropertyPage({ params });

            expect(mockFetchProperty).toHaveBeenCalledTimes(1);
            expect(mockFetchProperty).toHaveBeenCalledWith('test-property-456');
        });

        it('should call getSessionUser', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            await PropertyPage({ params });

            expect(mockGetSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should handle property with no images', async () => {
            const propertyNoImages = { ...mockProperty, imagesData: [] };
            mockFetchProperty.mockResolvedValue(propertyNoImages as any);

            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const images = screen.getByTestId('property-images');
            expect(images).toHaveTextContent('Images: 0');
        });
    });

    describe('Metadata', () => {
        it('should export metadata object', async () => {
            const { metadata } = await import('@/app/(root)/properties/[id]/page');
            expect(metadata).toBeDefined();
            expect(metadata.title).toBe('Property');
        });
    });

    describe('Integration Tests', () => {
        it('should render complete page for authenticated non-owner', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user-789', user: { name: 'User' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
            expect(screen.getByTestId('property-aside')).toBeInTheDocument();
        });

        it('should render complete page for property owner', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'owner-456', user: { name: 'Owner' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
            expect(screen.queryByTestId('property-aside')).not.toBeInTheDocument();
        });

        it('should render complete page for unauthenticated user', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
            expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument();
            expect(screen.getByTestId('property-images')).toBeInTheDocument();
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
            expect(screen.queryByTestId('property-aside')).not.toBeInTheDocument();
        });
    });

    describe('Props Passing', () => {
        it('should pass correct property data to PropertyDetails', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const details = screen.getByTestId('property-details');
            expect(details).toHaveTextContent('Luxury Downtown Apartment');
        });

        it('should pass correct property data to PropertyPageAside', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user-789', user: { name: 'User' } } as any);
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const aside = screen.getByTestId('property-aside');
            expect(aside).toHaveTextContent('Contact Owner for Luxury Downtown Apartment');
        });

        it('should pass serialized property object', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            // Property should be properly serialized and passed
            expect(screen.getByTestId('property-details')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle property with minimal data', async () => {
            const minimalProperty = {
                _id: 'prop-min',
                name: 'Basic Property',
                type: 'House',
                location: { city: 'TestCity', state: 'TS', street: '', zip: '' },
                owner: 'owner-123',
                imagesData: []
            };
            mockFetchProperty.mockResolvedValue(minimalProperty as any);

            const params = Promise.resolve({ id: 'prop-min' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            expect(screen.getByRole('main')).toBeInTheDocument();
        });

        it('should handle different property types', async () => {
            const houseProperty = { ...mockProperty, type: 'House' };
            mockFetchProperty.mockResolvedValue(houseProperty as any);

            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('House in Miami');
        });

        it('should handle different property IDs in params', async () => {
            const params = Promise.resolve({ id: 'different-property' });
            await PropertyPage({ params });

            expect(mockFetchProperty).toHaveBeenCalledWith('different-property');
        });
    });

    describe('Async Behavior', () => {
        it('should properly await params promise', async () => {
            const params = Promise.resolve({ id: 'async-property' });
            await PropertyPage({ params });

            expect(mockFetchProperty).toHaveBeenCalledWith('async-property');
        });

        it('should properly await all async operations', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            expect(mockFetchProperty).toHaveBeenCalled();
            expect(mockGetSessionUser).toHaveBeenCalled();
            expect(screen.getByRole('main')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const main = screen.getByRole('main');
            expect(main.tagName).toBe('MAIN');
        });

        it('should have breadcrumb navigation', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs.tagName).toBe('NAV');
        });

        it('should have proper section for property details', async () => {
            const params = Promise.resolve({ id: 'property-123' });
            const jsx = await PropertyPage({ params });
            const { container } = render(jsx);

            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });
    });
});
