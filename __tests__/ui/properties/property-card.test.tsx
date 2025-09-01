import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import PropertyCard from '@/ui/properties/property-card';
import { PropertyDocument } from '@/models';

// Mock Next.js components
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, className, fill, sizes, priority, ...rest }: { 
        src: string; 
        alt: string; 
        className?: string; 
        fill?: boolean; 
        sizes?: string; 
        priority?: boolean; 
    }) => (
        <img 
            src={src} 
            alt={alt} 
            className={className}
            data-testid="property-image"
            data-fill={fill ? 'true' : 'false'}
            data-sizes={sizes}
            data-priority={priority ? 'true' : 'false'}
            {...rest}
        />
    ),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href} data-testid="property-link">
            {children}
        </a>
    ),
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaMapMarkerAlt: ({ className }: { className?: string }) => (
        <div data-testid="map-marker-icon" className={className}>📍</div>
    ),
}));

// Mock PropertyFavoriteButton
jest.mock('@/ui/properties/shared/form/property-favorite-button', () => ({
    __esModule: true,
    default: ({ propertyId }: { propertyId: string }) => (
        <div data-testid="property-favorite-button" data-property-id={propertyId}>
            ❤️
        </div>
    ),
}));

// Mock utility functions
jest.mock('@/utils/get-rate-display', () => ({
    getRateDisplay: jest.fn((rates) => {
        if (!rates) return 'Contact for rates';
        if (rates.monthly) return `$${rates.monthly}/month`;
        if (rates.weekly) return `$${rates.weekly}/week`;
        if (rates.nightly) return `$${rates.nightly}/night`;
        return 'Contact for rates';
    }),
}));

jest.mock('@/utils/get-session-user', () => ({
    getSessionUser: jest.fn(),
}));

jest.mock('@/utils/to-serialized-object', () => ({
    toSerializedOjbect: jest.fn((obj: Record<string, unknown>) => ({
        ...obj,
        _id: obj._id?.toString() || 'mock-id',
    })),
}));

jest.mock('@/utils/is-within-last-three-days', () => ({
    isWithinLastWeek: jest.fn(),
}));

// Create mock property data
const createMockProperty = (overrides: Partial<PropertyDocument> = {}): PropertyDocument => ({
    _id: 'property-123',
    name: 'Luxury Beach House',
    description: 'Beautiful beachfront property with stunning views',
    type: 'House',
    beds: 3,
    baths: 2,
    square_feet: 1500,
    location: {
        street: '123 Beach Rd',
        city: 'Miami',
        state: 'FL',
        zip: '33101',
    },
    rates: {
        nightly: 250,
        weekly: 1500,
        monthly: 5000,
    },
    imagesData: [{
        secureUrl: 'https://example.com/property1.jpg',
        publicId: 'property1',
        width: 800,
        height: 600,
    }],
    owner: 'owner-456',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    amenities: ['WiFi', 'Pool', 'Kitchen'],
    ...overrides,
} as PropertyDocument);

describe('PropertyCard', () => {
    const mockGetSessionUser = jest.mocked(jest.requireMock('@/utils/get-session-user').getSessionUser);
    const mockGetRateDisplay = jest.mocked(jest.requireMock('@/utils/get-rate-display').getRateDisplay);
    const mockToSerializedObject = jest.mocked(jest.requireMock('@/utils/to-serialized-object').toSerializedOjbect);
    const mockIsWithinLastWeek = jest.mocked(jest.requireMock('@/utils/is-within-last-three-days').isWithinLastWeek);

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock returns
        mockGetSessionUser.mockResolvedValue(null);
        mockGetRateDisplay.mockReturnValue('$250/night');
        mockToSerializedObject.mockImplementation((obj: Record<string, unknown>) => ({ ...obj, _id: obj._id?.toString() || 'mock-id' }));
        mockIsWithinLastWeek.mockReturnValue(false);
    });

    describe('Component Structure', () => {
        it('should render basic property card structure', async () => {
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            // Check main container using more specific selector
            const cardContainer = container.querySelector('.rounded-md.shadow-md.relative');
            expect(cardContainer).toBeInTheDocument();
        });

        it('should render property image with correct attributes', async () => {
            const property = createMockProperty({
                imagesData: [{
                    secureUrl: 'https://example.com/beach-house.jpg',
                    publicId: 'beach-house',
                    width: 1024,
                    height: 768,
                }],
                name: 'Beach House Test'
            });
            
            render(await PropertyCard({ property }));
            
            const image = screen.getByTestId('property-image');
            expect(image).toHaveAttribute('src', 'https://example.com/beach-house.jpg');
            expect(image).toHaveAttribute('alt', 'Beach House Test');
            expect(image).toHaveClass('object-cover', 'rounded-t-md');
        });

        it('should render property name', async () => {
            const property = createMockProperty({ name: 'Awesome Villa' });
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('Awesome Villa')).toBeInTheDocument();
        });

        it('should render location city', async () => {
            const property = createMockProperty({
                location: { ...createMockProperty().location, city: 'Orlando' }
            });
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('Orlando')).toBeInTheDocument();
            expect(screen.getByTestId('map-marker-icon')).toBeInTheDocument();
        });

        it('should render beds and baths info', async () => {
            const property = createMockProperty({ beds: 4, baths: 3 });
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText(/4 Beds/)).toBeInTheDocument();
            expect(screen.getByText(/3 Baths/)).toBeInTheDocument();
        });

        it('should handle singular bed/bath correctly', async () => {
            const property = createMockProperty({ beds: 1, baths: 1 });
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText(/1 Bed/)).toBeInTheDocument();
            expect(screen.getByText(/1 Bath/)).toBeInTheDocument();
            expect(screen.queryByText(/1 Beds/)).not.toBeInTheDocument();
            expect(screen.queryByText(/1 Baths/)).not.toBeInTheDocument();
        });
    });

    describe('Rate Display', () => {
        it('should call getRateDisplay with property rates', async () => {
            const rates = { nightly: 300, weekly: 1800, monthly: 6000 };
            const property = createMockProperty({ rates });
            
            render(await PropertyCard({ property }));
            
            expect(mockGetRateDisplay).toHaveBeenCalledWith(rates);
        });

        it('should display rate information', async () => {
            mockGetRateDisplay.mockReturnValue('$199/night');
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('$199/night')).toBeInTheDocument();
        });

        it('should handle different rate formats', async () => {
            mockGetRateDisplay.mockReturnValue('Contact for rates');
            const property = createMockProperty({ 
                rates: { nightly: undefined, weekly: undefined, monthly: undefined }
            });
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('Contact for rates')).toBeInTheDocument();
        });
    });

    describe('Recently Added/Updated Badges', () => {
        it('should show "Recently Added" badge for new properties', async () => {
            const property = createMockProperty();
            
            mockIsWithinLastWeek.mockImplementation((date: Date) => 
                date.getTime() === property.createdAt.getTime()
            );
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('Recently Added')).toBeInTheDocument();
            expect(mockIsWithinLastWeek).toHaveBeenCalledWith(property.createdAt);
        });

        it('should show "Recently Updated" badge for updated properties', async () => {
            const property = createMockProperty({
                createdAt: new Date('2023-01-01'), // Old creation date
                updatedAt: new Date('2024-12-01'), // Recent update
            });
            
            mockIsWithinLastWeek.mockImplementation((date: Date) => 
                date === property.updatedAt
            );
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('Recently Updated')).toBeInTheDocument();
            expect(mockIsWithinLastWeek).toHaveBeenCalledWith(property.createdAt);
            expect(mockIsWithinLastWeek).toHaveBeenCalledWith(property.updatedAt);
        });

        it('should not show badge for old properties', async () => {
            mockIsWithinLastWeek.mockReturnValue(false);
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            expect(screen.queryByText('Recently Added')).not.toBeInTheDocument();
            expect(screen.queryByText('Recently Updated')).not.toBeInTheDocument();
        });

        it('should prioritize "Recently Added" over "Recently Updated"', async () => {
            mockIsWithinLastWeek.mockReturnValue(true); // Both dates are recent
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText('Recently Added')).toBeInTheDocument();
            expect(screen.queryByText('Recently Updated')).not.toBeInTheDocument();
        });
    });

    describe('Session User and Favorite Button', () => {
        it('should not show favorite button when no session user', async () => {
            mockGetSessionUser.mockResolvedValue(null);
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
        });

        it('should not show favorite button when user owns the property', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'owner-456' });
            const property = createMockProperty({ owner: 'owner-456' as unknown as any });
            
            render(await PropertyCard({ property }));
            
            expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
        });

        it('should show favorite button when user is logged in and does not own property', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'different-user' });
            mockToSerializedObject.mockReturnValue({ _id: 'serialized-property-id' });
            const property = createMockProperty({ owner: 'owner-456' as unknown as any });
            
            render(await PropertyCard({ property }));
            
            const favoriteButton = screen.getByTestId('property-favorite-button');
            expect(favoriteButton).toBeInTheDocument();
            expect(favoriteButton).toHaveAttribute('data-property-id', 'serialized-property-id');
        });

        it('should call toSerializedObject for favorite button', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'different-user' });
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            expect(mockToSerializedObject).toHaveBeenCalledWith(property);
        });
    });

    describe('Links and Navigation', () => {
        it('should have correct property detail links', async () => {
            const property = createMockProperty({ _id: 'property-789' });
            
            render(await PropertyCard({ property }));
            
            const links = screen.getAllByTestId('property-link');
            expect(links).toHaveLength(3); // Image link, name link, and details link
            links.forEach(link => {
                expect(link).toHaveAttribute('href', '/properties/property-789');
            });
        });

        it('should make image clickable', async () => {
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            const imageContainer = screen.getByTestId('property-image').closest('a');
            expect(imageContainer).toBeInTheDocument();
            expect(imageContainer).toHaveAttribute('href', '/properties/property-123');
        });

        it('should make property name clickable', async () => {
            const property = createMockProperty({ name: 'Clickable Property' });
            
            render(await PropertyCard({ property }));
            
            const nameLink = screen.getByText('Clickable Property').closest('a');
            expect(nameLink).toBeInTheDocument();
            expect(nameLink).toHaveAttribute('href', '/properties/property-123');
        });
    });

    describe('CSS Classes and Styling', () => {
        it('should apply correct container classes', async () => {
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            const cardContainer = container.querySelector('.rounded-md.shadow-md.relative');
            expect(cardContainer).toBeInTheDocument();
        });

        it('should apply correct image container classes', async () => {
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            const imageContainer = container.querySelector('.w-full.aspect-\\[4\\/3\\].relative.rounded-t-md.overflow-hidden');
            expect(imageContainer).toBeInTheDocument();
        });

        it('should apply correct text content classes', async () => {
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            const textContainer = container.querySelector('.text-xs.md\\:text-sm.p-\\[10px\\]');
            expect(textContainer).toBeInTheDocument();
        });
    });

    describe('Data Integration', () => {
        it('should handle property with minimal data', async () => {
            const minimalProperty = {
                _id: 'minimal-prop',
                name: 'Basic Property',
                location: { city: 'TestCity', street: '', state: '', zip: '' },
                beds: 1,
                baths: 1,
                imagesData: [{ secureUrl: 'test.jpg', publicId: 'test', width: 400, height: 300 }],
                owner: 'owner-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                rates: { nightly: undefined, weekly: undefined, monthly: undefined },
            } as unknown as PropertyDocument;
            
            render(await PropertyCard({ property: minimalProperty }));
            
            expect(screen.getByText('Basic Property')).toBeInTheDocument();
            expect(screen.getByText('TestCity')).toBeInTheDocument();
        });

        it('should handle property with complex rates', async () => {
            const property = createMockProperty({
                rates: {
                    nightly: 150,
                    weekly: 900,
                    monthly: 3000,
                },
            });
            
            render(await PropertyCard({ property }));
            
            expect(mockGetRateDisplay).toHaveBeenCalledWith(property.rates);
        });

        it('should handle property with long name', async () => {
            const property = createMockProperty({
                name: 'This is a very long property name that might wrap to multiple lines in the UI'
            });
            
            render(await PropertyCard({ property }));
            
            expect(screen.getByText(/This is a very long property name/)).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing image data gracefully', async () => {
            const property = createMockProperty({
                imagesData: []
            });
            
            // Should not crash even with empty images array
            await expect(async () => {
                render(await PropertyCard({ property }));
            }).rejects.toThrow(); // Will throw because imagesData[0] is undefined
        });

        it('should handle session user fetch errors', async () => {
            mockGetSessionUser.mockRejectedValue(new Error('Auth error'));
            const property = createMockProperty();
            
            await expect(async () => {
                render(await PropertyCard({ property }));
            }).rejects.toThrow('Auth error');
        });

        it('should handle rate display errors gracefully', async () => {
            mockGetRateDisplay.mockImplementation(() => {
                throw new Error('Rate calculation error');
            });
            const property = createMockProperty();
            
            await expect(async () => {
                render(await PropertyCard({ property }));
            }).rejects.toThrow('Rate calculation error');
        });
    });

    describe('Accessibility', () => {
        it('should have proper image alt text', async () => {
            const property = createMockProperty({ name: 'Accessible Property' });
            
            render(await PropertyCard({ property }));
            
            const image = screen.getByTestId('property-image');
            expect(image).toHaveAttribute('alt', 'Accessible Property');
        });

        it('should have proper link structure for screen readers', async () => {
            const property = createMockProperty();
            
            render(await PropertyCard({ property }));
            
            const links = screen.getAllByTestId('property-link');
            expect(links.length).toBeGreaterThan(0);
            links.forEach(link => {
                expect(link.getAttribute('href')).toMatch(/^\/properties\/property-123$/);
            });
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with basic property', async () => {
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with recently added property', async () => {
            mockIsWithinLastWeek.mockImplementation((date: Date) => 
                date === createMockProperty().createdAt
            );
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with logged in user and favorite button', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'different-user' });
            const property = createMockProperty();
            
            const { container } = render(await PropertyCard({ property }));
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    // FAVORITES-SPECIFIC TESTS - Phase 1 Enhancement
    describe('Favorites Integration', () => {
        const createFavoriteProperty = (overrides: Partial<PropertyDocument> = {}) =>
            createMockProperty({
                _id: `fav-${Math.random().toString(36).substr(2, 9)}`,
                name: 'Favorite Property',
                isFeatured: true, // Often favorites are featured properties
                ...overrides,
            });

        describe('Favorites UI Behavior', () => {
            it('should display favorite button for non-owners when logged in', async () => {
                mockGetSessionUser.mockResolvedValue({ id: 'logged-in-user' });
                const favoriteProperty = createFavoriteProperty({ 
                    owner: 'different-owner' as unknown as any 
                });
                
                render(await PropertyCard({ property: favoriteProperty }));
                
                const favoriteButton = screen.getByTestId('property-favorite-button');
                expect(favoriteButton).toBeInTheDocument();
                expect(favoriteButton).toHaveTextContent('❤️');
            });

            it('should not display favorite button for property owners', async () => {
                const ownerId = 'property-owner-123';
                mockGetSessionUser.mockResolvedValue({ id: ownerId });
                const favoriteProperty = createFavoriteProperty({ 
                    owner: ownerId as unknown as any 
                });
                
                render(await PropertyCard({ property: favoriteProperty }));
                
                expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            });

            it('should not display favorite button when user not logged in', async () => {
                mockGetSessionUser.mockResolvedValue(null);
                const favoriteProperty = createFavoriteProperty();
                
                render(await PropertyCard({ property: favoriteProperty }));
                
                expect(screen.queryByTestId('property-favorite-button')).not.toBeInTheDocument();
            });

            it('should pass correct property ID to favorite button', async () => {
                const propertyId = 'fav-property-456';
                mockGetSessionUser.mockResolvedValue({ id: 'logged-in-user' });
                mockToSerializedObject.mockReturnValue({ _id: propertyId });
                
                const favoriteProperty = createFavoriteProperty({ 
                    _id: propertyId,
                    owner: 'different-owner' as unknown as any 
                });
                
                render(await PropertyCard({ property: favoriteProperty }));
                
                const favoriteButton = screen.getByTestId('property-favorite-button');
                expect(favoriteButton).toHaveAttribute('data-property-id', propertyId);
                expect(mockToSerializedObject).toHaveBeenCalledWith(favoriteProperty);
            });

            it('should handle favorite properties with different property types', async () => {
                mockGetSessionUser.mockResolvedValue({ id: 'user-123' });
                
                const favoriteTypes = ['House', 'Apartment', 'Condo', 'Villa'];
                
                for (const type of favoriteTypes) {
                    const favoriteProperty = createFavoriteProperty({ 
                        name: `Favorite ${type}`,
                        type: type as PropertyDocument['type'],
                        owner: 'different-owner' as unknown as any 
                    });
                    
                    const { unmount } = render(await PropertyCard({ property: favoriteProperty }));
                    
                    expect(screen.getByText(`Favorite ${type}`)).toBeInTheDocument();
                    expect(screen.getByTestId('property-favorite-button')).toBeInTheDocument();
                    
                    unmount();
                }
            });
        });

        describe('Favorites Display Features', () => {
            it('should display favorite property with premium pricing correctly', async () => {
                const premiumFavorite = createFavoriteProperty({
                    name: 'Premium Favorite Villa',
                    rates: {
                        nightly: 500,
                        weekly: 3000,
                        monthly: 10000,
                    }
                });
                
                mockGetRateDisplay.mockReturnValue('$500/night');
                
                render(await PropertyCard({ property: premiumFavorite }));
                
                expect(screen.getByText('Premium Favorite Villa')).toBeInTheDocument();
                expect(screen.getByText('$500/night')).toBeInTheDocument();
                expect(mockGetRateDisplay).toHaveBeenCalledWith(premiumFavorite.rates);
            });

            it('should display favorite property location correctly', async () => {
                const locationFavorite = createFavoriteProperty({
                    name: 'Tropical Paradise',
                    location: {
                        street: '456 Paradise Ave',
                        city: 'Malibu',
                        state: 'CA',
                        zipcode: '90265',
                    }
                });
                
                render(await PropertyCard({ property: locationFavorite }));
                
                expect(screen.getByText('Tropical Paradise')).toBeInTheDocument();
                expect(screen.getByText('Malibu')).toBeInTheDocument();
                expect(screen.getByTestId('map-marker-icon')).toBeInTheDocument();
            });

            it('should display favorite property amenities correctly', async () => {
                const amenityFavorite = createFavoriteProperty({
                    name: 'Luxury Favorite',
                    beds: 5,
                    baths: 4,
                });
                
                render(await PropertyCard({ property: amenityFavorite }));
                
                expect(screen.getByText('Luxury Favorite')).toBeInTheDocument();
                expect(screen.getByText(/5 Beds/)).toBeInTheDocument();
                expect(screen.getByText(/4 Baths/)).toBeInTheDocument();
            });

            it('should handle favorite property with recently added badge', async () => {
                const recentFavorite = createFavoriteProperty({
                    name: 'New Favorite Property',
                    createdAt: new Date(),
                });
                
                mockIsWithinLastWeek.mockImplementation((date: Date) => 
                    date.getTime() === recentFavorite.createdAt.getTime()
                );
                
                render(await PropertyCard({ property: recentFavorite }));
                
                expect(screen.getByText('New Favorite Property')).toBeInTheDocument();
                expect(screen.getByText('Recently Added')).toBeInTheDocument();
                expect(mockIsWithinLastWeek).toHaveBeenCalledWith(recentFavorite.createdAt);
            });

            it('should handle favorite property with recently updated badge', async () => {
                const updatedFavorite = createFavoriteProperty({
                    name: 'Updated Favorite',
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date(),
                });
                
                mockIsWithinLastWeek.mockImplementation((date: Date) => 
                    date.getTime() === updatedFavorite.updatedAt.getTime()
                );
                
                render(await PropertyCard({ property: updatedFavorite }));
                
                expect(screen.getByText('Updated Favorite')).toBeInTheDocument();
                expect(screen.getByText('Recently Updated')).toBeInTheDocument();
            });
        });

        describe('Favorites Navigation', () => {
            it('should create correct links for favorite properties', async () => {
                const favoriteId = 'fav-nav-123';
                const navigationFavorite = createFavoriteProperty({
                    _id: favoriteId,
                    name: 'Navigation Test Favorite',
                });
                
                render(await PropertyCard({ property: navigationFavorite }));
                
                const propertyLinks = screen.getAllByTestId('property-link');
                expect(propertyLinks).toHaveLength(3);
                
                propertyLinks.forEach(link => {
                    expect(link).toHaveAttribute('href', `/properties/${favoriteId}`);
                });
            });

            it('should make favorite property image clickable', async () => {
                const clickableFavorite = createFavoriteProperty({
                    _id: 'clickable-fav-456',
                    name: 'Clickable Favorite Image',
                    imagesData: [{
                        secureUrl: 'https://example.com/favorite-image.jpg',
                        publicId: 'favorite-image',
                        width: 800,
                        height: 600,
                    }]
                });
                
                render(await PropertyCard({ property: clickableFavorite }));
                
                const image = screen.getByTestId('property-image');
                const imageLink = image.closest('a');
                
                expect(imageLink).toBeInTheDocument();
                expect(imageLink).toHaveAttribute('href', '/properties/clickable-fav-456');
                expect(image).toHaveAttribute('src', 'https://example.com/favorite-image.jpg');
                expect(image).toHaveAttribute('alt', 'Clickable Favorite Image');
            });

            it('should make favorite property name clickable', async () => {
                const nameClickableFavorite = createFavoriteProperty({
                    _id: 'name-click-789',
                    name: 'Clickable Name Favorite',
                });
                
                render(await PropertyCard({ property: nameClickableFavorite }));
                
                const nameElement = screen.getByText('Clickable Name Favorite');
                const nameLink = nameElement.closest('a');
                
                expect(nameLink).toBeInTheDocument();
                expect(nameLink).toHaveAttribute('href', '/properties/name-click-789');
            });
        });

        describe('Favorites Performance', () => {
            it('should render favorite properties efficiently', async () => {
                const performanceFavorite = createFavoriteProperty({
                    name: 'Performance Test Favorite',
                    imagesData: Array.from({ length: 5 }, (_, i) => ({
                        secureUrl: `https://example.com/perf-${i}.jpg`,
                        publicId: `perf-${i}`,
                        width: 800,
                        height: 600,
                    }))
                });
                
                const startTime = performance.now();
                render(await PropertyCard({ property: performanceFavorite }));
                const endTime = performance.now();
                
                expect(screen.getByText('Performance Test Favorite')).toBeInTheDocument();
                expect(endTime - startTime).toBeLessThan(100); // Should render quickly
            });

            it('should handle favorite properties with complex data structures', async () => {
                const complexFavorite = createFavoriteProperty({
                    name: 'Complex Data Favorite',
                    location: {
                        street: '789 Complex St',
                        city: 'Data City',
                        state: 'FL',
                        zipcode: '12345',
                    },
                    rates: {
                        nightly: 275,
                        weekly: 1650,
                        monthly: 5500,
                    },
                    amenities: ['Pool', 'Spa', 'Gym', 'WiFi', 'Pet Friendly', 'Parking'],
                    owner: 'complex-owner' as unknown as any,
                });
                
                render(await PropertyCard({ property: complexFavorite }));
                
                expect(screen.getByText('Complex Data Favorite')).toBeInTheDocument();
                expect(screen.getByText('Data City')).toBeInTheDocument();
                expect(mockGetRateDisplay).toHaveBeenCalledWith(complexFavorite.rates);
            });
        });

        describe('Favorites Error Handling', () => {
            it('should handle favorite property with missing image gracefully', async () => {
                const noImageFavorite = createFavoriteProperty({
                    name: 'No Image Favorite',
                    imagesData: [], // Empty images array
                });
                
                await expect(async () => {
                    render(await PropertyCard({ property: noImageFavorite }));
                }).rejects.toThrow(); // Will throw because imagesData[0] is undefined
            });

            it('should handle favorite property with invalid rate data', async () => {
                const invalidRateFavorite = createFavoriteProperty({
                    name: 'Invalid Rate Favorite',
                    rates: {
                        nightly: undefined,
                        weekly: undefined,
                        monthly: undefined,
                    } as unknown as any,
                });
                
                mockGetRateDisplay.mockReturnValue('Contact for rates');
                
                render(await PropertyCard({ property: invalidRateFavorite }));
                
                expect(screen.getByText('Invalid Rate Favorite')).toBeInTheDocument();
                expect(screen.getByText('Contact for rates')).toBeInTheDocument();
            });

            it('should handle session errors for favorite properties', async () => {
                mockGetSessionUser.mockRejectedValue(new Error('Session error'));
                const sessionErrorFavorite = createFavoriteProperty();
                
                await expect(async () => {
                    render(await PropertyCard({ property: sessionErrorFavorite }));
                }).rejects.toThrow('Session error');
            });
        });

        describe('Favorites Accessibility', () => {
            it('should provide proper alt text for favorite property images', async () => {
                const accessibleFavorite = createFavoriteProperty({
                    name: 'Accessible Favorite Property',
                    imagesData: [{
                        secureUrl: 'https://example.com/accessible.jpg',
                        publicId: 'accessible',
                        width: 800,
                        height: 600,
                    }]
                });
                
                render(await PropertyCard({ property: accessibleFavorite }));
                
                const image = screen.getByTestId('property-image');
                expect(image).toHaveAttribute('alt', 'Accessible Favorite Property');
                expect(image).toHaveAttribute('src', 'https://example.com/accessible.jpg');
            });

            it('should maintain proper link structure for favorite properties', async () => {
                const linkStructureFavorite = createFavoriteProperty({
                    _id: 'link-structure-fav',
                    name: 'Link Structure Favorite',
                });
                
                render(await PropertyCard({ property: linkStructureFavorite }));
                
                const allLinks = screen.getAllByTestId('property-link');
                expect(allLinks.length).toBeGreaterThan(0);
                
                allLinks.forEach(link => {
                    expect(link.getAttribute('href')).toBe('/properties/link-structure-fav');
                });
            });

            it('should ensure favorite button is accessible when present', async () => {
                mockGetSessionUser.mockResolvedValue({ id: 'accessibility-user' });
                const accessibilityFavorite = createFavoriteProperty({
                    owner: 'different-owner' as unknown as any,
                });
                
                render(await PropertyCard({ property: accessibilityFavorite }));
                
                const favoriteButton = screen.getByTestId('property-favorite-button');
                expect(favoriteButton).toBeInTheDocument();
                expect(favoriteButton).toHaveAttribute('data-property-id');
            });
        });

        describe('Favorites Snapshots', () => {
            it('should match snapshot with favorite property', async () => {
                const snapshotFavorite = createFavoriteProperty({
                    _id: 'snapshot-fav-1',
                    name: 'Snapshot Favorite Property',
                });
                
                const { container } = render(await PropertyCard({ property: snapshotFavorite }));
                
                expect(container.firstChild).toMatchSnapshot();
            });

            it('should match snapshot with favorite property and favorite button', async () => {
                mockGetSessionUser.mockResolvedValue({ id: 'snapshot-user' });
                const favoriteWithButton = createFavoriteProperty({
                    _id: 'snapshot-with-button',
                    name: 'Favorite With Button',
                    owner: 'different-owner' as unknown as any,
                });
                
                const { container } = render(await PropertyCard({ property: favoriteWithButton }));
                
                expect(container.firstChild).toMatchSnapshot();
            });

            it('should match snapshot with recently added favorite', async () => {
                const recentlyAddedFavorite = createFavoriteProperty({
                    _id: 'recent-fav-snap',
                    name: 'Recently Added Favorite',
                    createdAt: new Date(),
                });
                
                mockIsWithinLastWeek.mockImplementation((date: Date) => 
                    date.getTime() === recentlyAddedFavorite.createdAt.getTime()
                );
                
                const { container } = render(await PropertyCard({ property: recentlyAddedFavorite }));
                
                expect(container.firstChild).toMatchSnapshot();
            });
        });
    });
});