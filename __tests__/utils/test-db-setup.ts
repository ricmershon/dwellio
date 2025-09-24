// Test database setup utilities for Jest
import { Types } from 'mongoose';
import {
    basePropertyData,
    propertyVariations,
    mockUserId,
    propertiesListMock
} from '../fixtures/property-fixtures';

// Mock database state
let mockDatabaseState = {
    properties: [] as any[],
    users: [] as any[],
    messages: [] as any[],
    favorites: [] as any[],
};

// Test database utilities
export const testDbSetup = {
    // Clear all test data
    clear: () => {
        mockDatabaseState = {
            properties: [],
            users: [],
            messages: [],
            favorites: [],
        };
    },

    // Seed initial test data
    seed: () => {
        // Clear existing data
        testDbSetup.clear();

        // Add test user
        const testUser = {
            _id: mockUserId,
            email: 'test@example.com',
            name: 'Test User',
            image: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockDatabaseState.users.push(testUser);

        // Add test properties
        const properties = [
            {
                ...basePropertyData,
                _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
                owner: mockUserId,
                createdAt: new Date('2024-01-15T10:00:00Z'),
                updatedAt: new Date('2024-01-15T10:00:00Z'),
            },
            {
                ...propertyVariations.house,
                _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
                owner: mockUserId,
                createdAt: new Date('2024-01-16T10:00:00Z'),
                updatedAt: new Date('2024-01-16T10:00:00Z'),
            },
            {
                ...propertyVariations.studio,
                _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
                owner: mockUserId,
                createdAt: new Date('2024-01-17T10:00:00Z'),
                updatedAt: new Date('2024-01-17T10:00:00Z'),
            },
            {
                ...propertyVariations.cabin,
                _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
                owner: mockUserId,
                createdAt: new Date('2024-01-18T10:00:00Z'),
                updatedAt: new Date('2024-01-18T10:00:00Z'),
            },
        ];

        mockDatabaseState.properties.push(...properties);

        return {
            users: [...mockDatabaseState.users],
            properties: [...mockDatabaseState.properties],
        };
    },

    // Get current database state
    getState: () => ({
        properties: [...mockDatabaseState.properties],
        users: [...mockDatabaseState.users],
        messages: [...mockDatabaseState.messages],
        favorites: [...mockDatabaseState.favorites],
    }),

    // Add property to mock database
    addProperty: (property: any) => {
        const newProperty = {
            _id: new Types.ObjectId(),
            ...property,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockDatabaseState.properties.push(newProperty);
        return newProperty;
    },

    // Remove property from mock database
    removeProperty: (propertyId: string) => {
        mockDatabaseState.properties = mockDatabaseState.properties.filter(
            (p) => p._id.toString() !== propertyId
        );
    },

    // Update property in mock database
    updateProperty: (propertyId: string, updates: any) => {
        const index = mockDatabaseState.properties.findIndex(
            (p) => p._id.toString() === propertyId
        );
        if (index !== -1) {
            mockDatabaseState.properties[index] = {
                ...mockDatabaseState.properties[index],
                ...updates,
                updatedAt: new Date(),
            };
            return mockDatabaseState.properties[index];
        }
        return null;
    },

    // Find property by ID
    findPropertyById: (propertyId: string) => {
        return mockDatabaseState.properties.find(
            (p) => p._id.toString() === propertyId
        );
    },

    // Find properties with filters
    findProperties: (filters: any = {}) => {
        let results = [...mockDatabaseState.properties];

        if (filters.owner) {
            results = results.filter(p => p.owner.toString() === filters.owner.toString());
        }

        if (filters.type) {
            results = results.filter(p => p.type === filters.type);
        }

        if (filters.isFeatured !== undefined) {
            results = results.filter(p => p.isFeatured === filters.isFeatured);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower) ||
                p.location.city.toLowerCase().includes(searchLower) ||
                p.location.state.toLowerCase().includes(searchLower)
            );
        }

        // Apply pagination if provided
        if (filters.limit || filters.skip) {
            const skip = filters.skip || 0;
            const limit = filters.limit || 10;
            results = results.slice(skip, skip + limit);
        }

        return results;
    },

    // Add favorite
    addFavorite: (userId: string, propertyId: string) => {
        const favorite = {
            _id: new Types.ObjectId(),
            user: userId,
            property: propertyId,
            createdAt: new Date(),
        };
        mockDatabaseState.favorites.push(favorite);
        return favorite;
    },

    // Remove favorite
    removeFavorite: (userId: string, propertyId: string) => {
        mockDatabaseState.favorites = mockDatabaseState.favorites.filter(
            (f) => !(f.user.toString() === userId && f.property.toString() === propertyId)
        );
    },

    // Check if property is favorited
    isFavorite: (userId: string, propertyId: string) => {
        return mockDatabaseState.favorites.some(
            (f) => f.user.toString() === userId && f.property.toString() === propertyId
        );
    },
};

// Mock database operations to use the test database state
export const setupDatabaseMocks = () => {
    // Mock Property model operations to use test database state
    const mockPropertyOperations = {
        create: jest.fn().mockImplementation((data) => {
            const newProperty = testDbSetup.addProperty(data);
            return Promise.resolve(newProperty);
        }),

        findById: jest.fn().mockImplementation((id) => {
            const property = testDbSetup.findPropertyById(id.toString());
            return Promise.resolve(property ? {
                ...property,
                populate: jest.fn().mockResolvedValue(property),
            } : null);
        }),

        find: jest.fn().mockImplementation((filters = {}) => {
            const properties = testDbSetup.findProperties(filters);
            return {
                populate: jest.fn().mockResolvedValue(properties),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(properties),
            };
        }),

        findByIdAndUpdate: jest.fn().mockImplementation((id, updates) => {
            const updated = testDbSetup.updateProperty(id.toString(), updates);
            return Promise.resolve(updated);
        }),

        findByIdAndDelete: jest.fn().mockImplementation((id) => {
            const property = testDbSetup.findPropertyById(id.toString());
            if (property) {
                testDbSetup.removeProperty(id.toString());
            }
            return Promise.resolve(property);
        }),

        countDocuments: jest.fn().mockImplementation((filters = {}) => {
            const properties = testDbSetup.findProperties(filters);
            return Promise.resolve(properties.length);
        }),
    };

    return mockPropertyOperations;
};

// Test lifecycle helpers
export const beforeEachTest = () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Seed fresh test data
    testDbSetup.seed();

    // Setup database mocks
    setupDatabaseMocks();
};

export const afterEachTest = () => {
    // Clear test data
    testDbSetup.clear();

    // Clear all mocks
    jest.clearAllMocks();
};

// Test data generators
export const generateTestProperty = (overrides: any = {}) => ({
    name: `Test Property ${Date.now()}`,
    type: 'Apartment',
    description: 'A test property with all required fields for testing purposes.',
    location: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipcode: '90210',
    },
    beds: 2,
    baths: 1,
    squareFeet: 800,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pet Friendly'],
    rates: {
        nightly: 250,
        weekly: 1500,
        monthly: 5000,
    },
    sellerInfo: {
        name: 'Test Seller',
        email: 'seller@test.com',
        phone: '555-0123',
    },
    owner: mockUserId,
    ...overrides,
});

export default testDbSetup;