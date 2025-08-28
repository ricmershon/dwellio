import { PropertyImageData } from '@/types/types';

// Mock property image data
export const mockPropertyImageData: PropertyImageData[] = [
    {
        secureUrl: 'https://example.com/image1.jpg',
        publicId: 'property-image-1',
        width: 800,
        height: 600
    },
    {
        secureUrl: 'https://example.com/image2.jpg',
        publicId: 'property-image-2',
        width: 1024,
        height: 768
    },
    {
        secureUrl: 'https://example.com/image3.jpg',
        publicId: 'property-image-3',
        width: 900,
        height: 675
    }
];

// Mock property data matching PropertyDocument interface
export const mockPropertyData = {
    _id: '507f1f77bcf86cd799439011',
    owner: '507f1f77bcf86cd799439012',
    name: 'Luxury Downtown Apartment',
    type: 'Apartment',
    description: 'A beautiful downtown apartment with stunning city views and modern amenities.',
    location: {
        street: '123 Main St',
        city: 'Downtown',
        state: 'CA',
        zipcode: '90210'
    },
    beds: 2,
    baths: 2,
    squareFeet: 1200,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Pool', 'Gym'],
    rates: {
        nightly: 150,
        weekly: 900,
        monthly: 3500
    },
    sellerInfo: {
        name: 'John Seller',
        email: 'seller@example.com',
        phone: '(555) 123-4567'
    },
    imagesData: mockPropertyImageData,
    isFeatured: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z')
};

// Mock session user data
export const mockSessionUser = {
    id: 'user-789',
    email: 'user@example.com',
    name: 'Test User'
};

// Mock property data variations for different test scenarios
export const createMockPropertyData = (overrides: any = {}) => ({
    ...mockPropertyData,
    ...overrides,
    _id: overrides._id || mockPropertyData._id,
});

// Mock property with different types for hashtag testing
export const mockPropertyTypes = {
    apartment: createMockPropertyData({ type: 'Apartment', _id: 'mock-apartment-id' }),
    house: createMockPropertyData({ type: 'House', _id: 'mock-house-id' }),
    condo: createMockPropertyData({ type: 'Condo', _id: 'mock-condo-id' }),
    townhouse: createMockPropertyData({ type: 'Townhouse', _id: 'mock-townhouse-id' }),
    multiWordType: createMockPropertyData({ type: 'Studio Apartment', _id: 'mock-studio-id' })
};

// Environment variable mocks
export const mockEnvironment = {
    NEXT_PUBLIC_DOMAIN: 'https://test-domain.com'
};

// Common test utilities
export const getExpectedShareUrl = (propertyId: string) => 
    `${mockEnvironment.NEXT_PUBLIC_DOMAIN}/properties/${propertyId}`;

export const getExpectedHashtag = (propertyType: string) => 
    `#${propertyType.replace(/\s/g, "")}ForRent`;

export const getExpectedHashtagArray = (propertyType: string) => 
    [`${propertyType.replace(/\s/g, "")}ForRent`];