// Property-specific test helpers and mock utilities
// This file provides helper functions for property integration tests
import { Types } from 'mongoose';
import { mockPropertyImageData, basePropertyData, mockUserId } from '../fixtures/property-fixtures';

// Mock creation helpers for Property integration tests
export const mockPropertyCreate = jest.fn();
export const mockPropertyFindById = jest.fn();
export const mockPropertyFindByIdAndUpdate = jest.fn();
export const mockPropertyFindByIdAndDelete = jest.fn();
export const mockPropertyFind = jest.fn();
export const mockPropertySave = jest.fn();

// Property action mocks - successful defaults
export const createSuccessfulPropertyMocks = () => {
    mockPropertyCreate.mockResolvedValue({
        _id: new Types.ObjectId(),
        ...basePropertyData,
        owner: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    mockPropertyFindById.mockResolvedValue({
        _id: new Types.ObjectId(),
        ...basePropertyData,
        owner: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    mockPropertyFind.mockResolvedValue([
        {
            _id: new Types.ObjectId(),
            ...basePropertyData,
            owner: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
};

// Property action mocks - error scenarios
export const createErrorPropertyMocks = () => {
    mockPropertyCreate.mockRejectedValue(new Error('Database error'));
};

// Reset all property mocks to default state
export const resetPropertyMocks = () => {
    jest.clearAllMocks();
    createSuccessfulPropertyMocks();
};

// Helper to create mock property with custom data
export const createMockPropertyDocument = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    ...basePropertyData,
    owner: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
});

// Helper to create mock form validation errors
export const createMockValidationErrors = () => ({
    name: ['Name is required'],
    type: ['Property type is required'],
    description: ['Description must be at least 20 characters'],
    'location.street': ['Street address is required'],
    'location.city': ['City is required'],
    'location.state': ['State is required'],
    'location.zipcode': ['Valid ZIP code is required'],
    beds: ['Must have at least 1 bedroom'],
    baths: ['Must have at least 1 bathroom'],
    squareFeet: ['Must be at least 250 square feet'],
    amenities: ['Select at least 5 amenities'],
    'rates.nightly': ['Nightly rate must be at least $200'],
    'sellerInfo.name': ['Seller name is required'],
    'sellerInfo.email': ['Valid email is required'],
    'sellerInfo.phone': ['Phone number is required'],
    imagesData: ['At least 3 images are required'],
});

// Helper to create mock Cloudinary error
export const createMockCloudinaryError = () => ({
    message: 'Upload failed',
    http_code: 400,
    name: 'CloudinaryError',
});

// Export for easier importing in tests
export const MockPropertyHelpers = {
    mockPropertyCreate,
    mockPropertyFindById,
    mockPropertyFindByIdAndUpdate,
    mockPropertyFindByIdAndDelete,
    mockPropertyFind,
    mockPropertySave,
};