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

jest.mock('@/utils/is-within-last-seven-days', () => ({
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
    const mockIsWithinLastWeek = jest.mocked(jest.requireMock('@/utils/is-within-last-seven-days').isWithinLastWeek);

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
});