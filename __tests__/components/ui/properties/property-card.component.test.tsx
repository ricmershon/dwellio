import { render, screen } from '@testing-library/react';
import { Types } from 'mongoose';

import PropertyCard from '@/ui/properties/property-card';
import { PropertyDocument } from '@/models/property-model';
import * as getSessionUser from '@/utils/get-session-user';
import * as getRateDisplay from '@/utils/get-rate-display';
import * as toSerializedObject from '@/utils/to-serialized-object';
import * as isWithinLastThreeDays from '@/utils/is-within-last-three-days';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, fill, sizes, className, priority }: any) => (
        <img
            src={src}
            alt={alt}
            data-fill={fill}
            data-sizes={sizes}
            className={className}
            data-priority={priority}
        />
    ),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

jest.mock('react-icons/fa', () => ({
    FaMapMarkerAlt: () => <span data-testid="map-marker-icon" />,
}));

jest.mock('@/ui/properties/shared/form/property-favorite-button', () => ({
    __esModule: true,
    default: ({ propertyId }: { propertyId: string }) => (
        <button data-testid="favorite-button" data-property-id={propertyId}>
            Favorite
        </button>
    ),
}));

// ✅ Internal Dependencies (Real - spied)
jest.spyOn(getSessionUser, 'getSessionUser');
jest.spyOn(getRateDisplay, 'getRateDisplay');
jest.spyOn(toSerializedObject, 'toSerializedObject');
jest.spyOn(isWithinLastThreeDays, 'isWithinLastThreeDays');

// ============================================================================
// TEST DATA
// ============================================================================
const mockPropertyId = new Types.ObjectId('507f1f77bcf86cd799439011');
const mockOwnerId = new Types.ObjectId('507f1f77bcf86cd799439012');
const mockSessionUserId = new Types.ObjectId('507f1f77bcf86cd799439013');

const createMockProperty = (overrides?: Partial<PropertyDocument>): PropertyDocument => ({
    _id: mockPropertyId,
    owner: mockOwnerId,
    name: 'Luxury Downtown Apartment',
    type: 'Apartment',
    description: 'Beautiful apartment in the heart of downtown',
    location: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
    },
    beds: 2,
    baths: 2,
    squareFeet: 1200,
    amenities: ['WiFi', 'Pool', 'Gym'],
    rates: {
        nightly: 150,
        weekly: 900,
        monthly: 3000,
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
    ...overrides,
} as PropertyDocument);

// ============================================================================
// TEST SUITE
// ============================================================================
describe('PropertyCard Component', () => {
    beforeEach(() => {
        // Reset mocks completely
        (getSessionUser.getSessionUser as jest.Mock).mockReset().mockResolvedValue(null);
        (getRateDisplay.getRateDisplay as jest.Mock).mockReset().mockReturnValue('$150/night');
        (toSerializedObject.toSerializedObject as jest.Mock).mockReset().mockImplementation((obj) => ({
            ...obj,
            _id: obj._id.toString(),
        }));
        (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock).mockReset().mockReturnValue(false);
    });

    // ========================================================================
    // Property Information Rendering
    // ========================================================================
    describe('Property Information Rendering', () => {
        it('should render property name', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
        });

        it('should render property location city', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('New York')).toBeInTheDocument();
        });

        it('should render beds count with singular label', async () => {
            const property = createMockProperty({ beds: 1 });
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText(/1 Bed/)).toBeInTheDocument();
        });

        it('should render beds count with plural label', async () => {
            const property = createMockProperty({ beds: 3 });
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText(/3 Beds/)).toBeInTheDocument();
        });

        it('should render baths count with singular label', async () => {
            const property = createMockProperty({ baths: 1 });
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText(/1 Bath/)).toBeInTheDocument();
        });

        it('should render baths count with plural label', async () => {
            const property = createMockProperty({ baths: 2 });
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText(/2 Baths/)).toBeInTheDocument();
        });

        it('should render map marker icon', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByTestId('map-marker-icon')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Image Handling and Display
    // ========================================================================
    describe('Image Handling and Display', () => {
        it('should render property image with correct src', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            const image = screen.getByAltText('Luxury Downtown Apartment');
            expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
        });

        it('should render image with fill and priority attributes', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            const image = screen.getByAltText('Luxury Downtown Apartment');
            expect(image).toHaveAttribute('data-fill', 'true');
            expect(image).toHaveAttribute('data-priority', 'true');
        });

        it('should use first image from imagesData array', async () => {
            const property = createMockProperty({
                imagesData: [
                    {
                        secureUrl: 'https://example.com/first.jpg',
                        publicId: 'first',
                        height: 800,
                        width: 1200,
                    },
                    {
                        secureUrl: 'https://example.com/second.jpg',
                        publicId: 'second',
                        height: 800,
                        width: 1200,
                    },
                ],
            });
            const Component = await PropertyCard({ property });
            render(Component);

            const image = screen.getByAltText('Luxury Downtown Apartment');
            expect(image).toHaveAttribute('src', 'https://example.com/first.jpg');
        });
    });

    // ========================================================================
    // Price Display Formatting
    // ========================================================================
    describe('Price Display Formatting', () => {
        it('should call getRateDisplay with property rates', async () => {
            const property = createMockProperty();
            await PropertyCard({ property });

            expect(getRateDisplay.getRateDisplay).toHaveBeenCalledWith(property.rates);
        });

        it('should render rate display returned by utility', async () => {
            const property = createMockProperty();
            (getRateDisplay.getRateDisplay as jest.Mock).mockReturnValue('$900/week');
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('$900/week')).toBeInTheDocument();
        });

        it('should handle nightly rate display', async () => {
            const property = createMockProperty({ rates: { nightly: 200, weekly: undefined, monthly: undefined } });
            (getRateDisplay.getRateDisplay as jest.Mock).mockReturnValue('$200/night');
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('$200/night')).toBeInTheDocument();
        });

        it('should handle weekly rate display', async () => {
            const property = createMockProperty({ rates: { nightly: undefined, weekly: 1200, monthly: undefined } });
            (getRateDisplay.getRateDisplay as jest.Mock).mockReturnValue('$1200/week');
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('$1200/week')).toBeInTheDocument();
        });

        it('should handle monthly rate display', async () => {
            const property = createMockProperty({ rates: { nightly: undefined, weekly: undefined, monthly: 4000 } });
            (getRateDisplay.getRateDisplay as jest.Mock).mockReturnValue('$4000/month');
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('$4000/month')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Navigation Links
    // ========================================================================
    describe('Click Handlers and Navigation', () => {
        it('should render link to property details page on image', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            const links = screen.getAllByRole('link', { hidden: true });
            const imageLink = links.find(link =>
                link.getAttribute('href') === `/properties/${mockPropertyId}`
            );

            expect(imageLink).toBeInTheDocument();
        });

        it('should render link to property details page on property name', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            const propertyNameLinks = screen.getAllByRole('link', { name: /Luxury Downtown Apartment/i });
            expect(propertyNameLinks.length).toBeGreaterThan(0);
            expect(propertyNameLinks[0]).toHaveAttribute('href', `/properties/${mockPropertyId}`);
        });

        it('should render multiple links to same property details page', async () => {
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            const links = screen.getAllByRole('link', { hidden: true });
            const propertyLinks = links.filter(link =>
                link.getAttribute('href') === `/properties/${mockPropertyId}`
            );

            expect(propertyLinks.length).toBeGreaterThan(1);
        });
    });

    // ========================================================================
    // Favorite Button Functionality
    // ========================================================================
    describe('Favorite Button Functionality', () => {
        it('should not render favorite button when user is not logged in', async () => {
            (getSessionUser.getSessionUser as jest.Mock).mockResolvedValue(null);
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument();
        });

        it('should render favorite button when user is logged in and not the owner', async () => {
            (getSessionUser.getSessionUser as jest.Mock).mockResolvedValue({
                id: mockSessionUserId.toString(),
            });
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
        });

        it('should not render favorite button when user is the owner', async () => {
            (getSessionUser.getSessionUser as jest.Mock).mockResolvedValue({
                id: mockOwnerId.toString(),
            });
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument();
        });

        it('should pass serialized property ID to favorite button', async () => {
            (getSessionUser.getSessionUser as jest.Mock).mockResolvedValue({
                id: mockSessionUserId.toString(),
            });
            (toSerializedObject.toSerializedObject as jest.Mock).mockReturnValue({
                _id: 'serialized-property-id',
            });
            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            const favoriteButton = screen.getByTestId('favorite-button');
            expect(favoriteButton).toHaveAttribute('data-property-id', 'serialized-property-id');
        });

        it('should call toSerializedObject with property', async () => {
            const property = createMockProperty();
            await PropertyCard({ property });

            expect(toSerializedObject.toSerializedObject).toHaveBeenCalledWith(property);
        });
    });

    // ========================================================================
    // Recently Added/Updated Badge
    // ========================================================================
    describe('Recently Added/Updated Badge', () => {
        it('should display "Recently Added" badge when property created within last three days', async () => {
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(true)   // createdAt check
                .mockReturnValueOnce(false); // updatedAt check

            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('Recently Added')).toBeInTheDocument();
        });

        it('should display "Recently Updated" badge when property updated within last three days but not created', async () => {
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(false)  // createdAt check
                .mockReturnValueOnce(true);  // updatedAt check

            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('Recently Updated')).toBeInTheDocument();
        });

        it('should not display badge when property is not recently created or updated', async () => {
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(false)  // createdAt check
                .mockReturnValueOnce(false); // updatedAt check

            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.queryByText('Recently Added')).not.toBeInTheDocument();
            expect(screen.queryByText('Recently Updated')).not.toBeInTheDocument();
        });

        it('should prioritize "Recently Added" over "Recently Updated"', async () => {
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(true)  // createdAt check
                .mockReturnValueOnce(true); // updatedAt check

            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            expect(screen.getByText('Recently Added')).toBeInTheDocument();
            expect(screen.queryByText('Recently Updated')).not.toBeInTheDocument();
        });

        it('should call isWithinLastThreeDays with createdAt date', async () => {
            const createdDate = new Date('2024-06-15');
            const property = createMockProperty({ createdAt: createdDate });
            await PropertyCard({ property });

            expect(isWithinLastThreeDays.isWithinLastThreeDays).toHaveBeenCalledWith(createdDate);
        });

        it('should call isWithinLastThreeDays with updatedAt date when not recently created', async () => {
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(false)  // createdAt check
                .mockReturnValueOnce(true);  // updatedAt check

            const updatedDate = new Date('2024-06-20');
            const property = createMockProperty({
                createdAt: new Date('2024-01-01'),
                updatedAt: updatedDate
            });
            await PropertyCard({ property });

            expect(isWithinLastThreeDays.isWithinLastThreeDays).toHaveBeenCalledWith(updatedDate);
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Full Component Rendering', () => {
        it('should render complete property card with all elements', async () => {
            (getSessionUser.getSessionUser as jest.Mock).mockResolvedValue({
                id: mockSessionUserId.toString(),
            });
            (getRateDisplay.getRateDisplay as jest.Mock).mockReturnValue('$150/night');
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false);

            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            // Verify all major elements
            expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
            expect(screen.getByAltText('Luxury Downtown Apartment')).toBeInTheDocument();
            expect(screen.getByText('$150/night')).toBeInTheDocument();
            expect(screen.getByText('New York')).toBeInTheDocument();
            expect(screen.getByText(/2 Beds/)).toBeInTheDocument();
            expect(screen.getByText(/2 Baths/)).toBeInTheDocument();
            expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
            expect(screen.getByText('Recently Added')).toBeInTheDocument();
        });

        it('should render minimal property card when user not logged in', async () => {
            (getSessionUser.getSessionUser as jest.Mock).mockResolvedValue(null);
            (getRateDisplay.getRateDisplay as jest.Mock).mockReturnValue('$3000/month');
            (isWithinLastThreeDays.isWithinLastThreeDays as jest.Mock)
                .mockReturnValueOnce(false)  // createdAt check
                .mockReturnValueOnce(false); // updatedAt check

            const property = createMockProperty();
            const Component = await PropertyCard({ property });
            render(Component);

            // Verify core elements present
            expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument();
            expect(screen.getByText('$3000/month')).toBeInTheDocument();

            // Verify optional elements absent
            expect(screen.queryByTestId('favorite-button')).not.toBeInTheDocument();
            expect(screen.queryByText('Recently Added')).not.toBeInTheDocument();
        });
    });
});
