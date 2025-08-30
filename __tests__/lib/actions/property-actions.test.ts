import { ActionStatus, type ActionState, type PropertyImageData } from "@/types/types";

// Mock mongoose first
// Create a map to store ObjectId instances for consistent mocking
const objectIdInstances = new Map();

jest.mock("mongoose", () => ({
    Types: {
        ObjectId: jest.fn().mockImplementation((id) => {
            if (objectIdInstances.has(id)) {
                return objectIdInstances.get(id);
            }
            const instance = { 
                toString: () => id, 
                equals: jest.fn((other) => other.toString() === id),
                id: id  // Add id property to help with comparisons
            };
            objectIdInstances.set(id, instance);
            return instance;
        })
    },
    startSession: jest.fn(),
    HydratedDocument: jest.fn(),
    connection: {
        listeners: jest.fn().mockReturnValue([]),
        on: jest.fn()
    }
}));

// Mock database connection
jest.mock("@/lib/db-connect");

// Mock models
jest.mock("@/models", () => ({
    Property: Object.assign(jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn()
    })), {
        findById: jest.fn(),
        find: jest.fn(),
        findByIdAndDelete: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }),
    User: {
        findById: jest.fn(),
        updateOne: jest.fn(),
        updateMany: jest.fn()
    }
}));

// Mock other dependencies  
jest.mock("@/lib/data/images-data");
jest.mock("@/utils/require-session-user", () => ({
    requireSessionUser: jest.fn()
}));
jest.mock("next/cache");
jest.mock("next/navigation");

// Import after mocking
import { 
    createProperty, 
    deleteProperty, 
    updateProperty, 
    favoriteProperty, 
    getFavoriteStatus 
} from "@/lib/actions/property-actions";
import { PropertyDocument, UserDocument } from "@/models";
import { uploadImages, destroyImages } from "@/lib/data/images-data";
import { requireSessionUser } from "@/utils/require-session-user";
import dbConnect from "@/lib/db-connect";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { startSession } from "mongoose";

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Create mock instances
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockUploadImages = uploadImages as jest.MockedFunction<typeof uploadImages>;
const mockDestroyImages = destroyImages as jest.MockedFunction<typeof destroyImages>;
const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockStartSession = startSession as jest.MockedFunction<typeof startSession>;

// Access the mocked models and functions
const { Property: mockProperty, User: mockUser } = require("@/models");
const mockPropertySave = jest.fn();

// Create convenient accessors for the mocked functions
const mockPropertyFindById = mockProperty.findById;
const mockPropertyFind = mockProperty.find;
const mockPropertyFindByIdAndDelete = mockProperty.findByIdAndDelete;
const mockPropertyFindByIdAndUpdate = mockProperty.findByIdAndUpdate;
const mockUserFindById = mockUser.findById;
const mockUserUpdateOne = mockUser.updateOne;
const mockUserUpdateMany = mockUser.updateMany;

describe('Property Actions Tests', () => {
    const mockSessionUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com'
    };

    const mockPropertyData = {
        _id: 'property123',
        name: 'Test Property',
        type: 'House',
        description: 'A beautiful test property',
        location: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TX',
            zipcode: '12345'
        },
        beds: 3,
        baths: 2,
        squareFeet: 1500,
        amenities: ['WiFi', 'Pool'],
        rates: {
            nightly: 200,
            weekly: 1200,
            monthly: 4000
        },
        sellerInfo: {
            name: 'Seller Name',
            email: 'seller@example.com',
            phone: '555-1234'
        },
        owner: 'user123',
        imagesData: [
            {
                secureUrl: 'https://example.com/image1.jpg',
                publicId: 'image1',
                width: 800,
                height: 600
            }
        ] as PropertyImageData[]
    };

    let mockFormData: FormData;

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleError.mockClear();
        mockDbConnect.mockResolvedValue(undefined as any);
        mockRequireSessionUser.mockResolvedValue(mockSessionUser);
        
        // Reset Property constructor mock
        mockProperty.mockImplementation((data: any) => ({
            ...data,
            save: mockPropertySave.mockResolvedValue(true),
            _id: 'mock-property-id'
        }));
        
        // Reset images functions - individual tests will override as needed
        mockUploadImages.mockResolvedValue([]);
        mockDestroyImages.mockResolvedValue(undefined);
        
        // Create fresh FormData for each test
        mockFormData = new FormData();
        mockFormData.set('type', 'House');
        mockFormData.set('name', 'Test Property');
        mockFormData.set('description', 'A beautiful test property');
        mockFormData.set('location.street', '123 Test St');
        mockFormData.set('location.city', 'Test City');
        mockFormData.set('location.state', 'TX');
        mockFormData.set('location.zipcode', '12345');
        mockFormData.set('beds', '3');
        mockFormData.set('baths', '2');
        mockFormData.set('squareFeet', '1500');
        mockFormData.append('amenities', 'WiFi');
        mockFormData.append('amenities', 'Pool');
        mockFormData.append('amenities', 'Gym');
        mockFormData.append('amenities', 'Kitchen');
        mockFormData.append('amenities', 'Air Conditioning');
        mockFormData.set('rates.nightly', '200');
        mockFormData.set('rates.weekly', '1200');
        mockFormData.set('rates.monthly', '4000');
        mockFormData.set('sellerInfo.name', 'Seller Name');
        mockFormData.set('sellerInfo.email', 'seller@example.com');
        mockFormData.set('sellerInfo.phone', '555-1234');
        
        const mockFile1 = new File(['image content 1'], 'test1.jpg', { type: 'image/jpeg' });
        const mockFile2 = new File(['image content 2'], 'test2.jpg', { type: 'image/jpeg' });
        const mockFile3 = new File(['image content 3'], 'test3.jpg', { type: 'image/jpeg' });
        mockFormData.append('images', mockFile1);
        mockFormData.append('images', mockFile2);
        mockFormData.append('images', mockFile3);
    });

    describe('createProperty Action', () => {
        describe('Successful Property Creation', () => {
            it('should create property successfully with valid data', async () => {
                const mockImageData: PropertyImageData[] = [
                    {
                        secureUrl: 'https://example.com/uploaded.jpg',
                        publicId: 'uploaded123',
                        width: 800,
                        height: 600
                    }
                ];

                mockUploadImages.mockResolvedValue(mockImageData);
                const mockSave = mockPropertySave.mockResolvedValue(true);
                mockProperty.mockImplementation((data: any) => ({
                    ...data,
                    _id: 'new-property-123',
                    save: mockSave
                }));

                const prevState: ActionState = {};
                
                const result = await createProperty(prevState, mockFormData);

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockUploadImages).toHaveBeenCalledWith([expect.any(File), expect.any(File), expect.any(File)]);
                expect(mockPropertySave).toHaveBeenCalledTimes(1);
                expect(mockRedirect).toHaveBeenCalledWith('/properties/new-property-123');
            });

            it('should handle multiple image uploads', async () => {
                const mockFormDataWithMultipleImages = new FormData();
                
                // Copy all entries from mockFormData except images
                for (const [key, value] of mockFormData.entries()) {
                    if (key !== 'images') {
                        mockFormDataWithMultipleImages.append(key, value as string);
                    }
                }

                const file1 = new File(['content1'], 'image1.jpg', { type: 'image/jpeg' });
                const file2 = new File(['content2'], 'image2.png', { type: 'image/png' });
                const file3 = new File(['content3'], 'image3.webp', { type: 'image/webp' });
                
                mockFormDataWithMultipleImages.append('images', file1);
                mockFormDataWithMultipleImages.append('images', file2);
                mockFormDataWithMultipleImages.append('images', file3);

                const mockImageData: PropertyImageData[] = [
                    { secureUrl: 'https://example.com/1.jpg', publicId: 'img1', width: 800, height: 600 },
                    { secureUrl: 'https://example.com/2.png', publicId: 'img2', width: 800, height: 600 },
                    { secureUrl: 'https://example.com/3.webp', publicId: 'img3', width: 800, height: 600 }
                ];

                mockUploadImages.mockResolvedValue(mockImageData);
                const mockSave = mockPropertySave.mockResolvedValue(true);
                mockProperty.mockImplementation((data: any) => ({
                    ...data,
                    _id: 'multi-image-prop',
                    save: mockSave
                }));

                const prevState: ActionState = {};
                
                await createProperty(prevState, mockFormDataWithMultipleImages);

                expect(mockUploadImages).toHaveBeenCalledWith([file1, file2, file3]);
                expect(mockRedirect).toHaveBeenCalledWith('/properties/multi-image-prop');
            });

            it('should assign owner to property document', async () => {
                const mockImageData: PropertyImageData[] = [];
                
                mockUploadImages.mockResolvedValue(mockImageData);
                
                let capturedPropertyData: any;
                const mockSave = mockPropertySave.mockResolvedValue(true);
                mockProperty.mockImplementation((data: any) => {
                    capturedPropertyData = data;
                    return {
                        ...data,
                        save: mockSave,
                        _id: 'ownership-test'
                    };
                });

                const prevState: ActionState = {};
                
                await createProperty(prevState, mockFormData);

                expect(capturedPropertyData.owner).toBe(mockSessionUser.id);
            });
        });

        describe('Validation Errors', () => {
            it('should return validation errors for invalid data', async () => {
                const invalidFormData = new FormData();
                invalidFormData.set('type', ''); // Required field missing
                invalidFormData.set('name', ''); // Required field missing
                
                const prevState: ActionState = {};
                const result = await createProperty(prevState, invalidFormData);

                expect(result.formData).toBe(invalidFormData);
                expect(result.formErrorMap).toBeDefined();
                expect(mockUploadImages).not.toHaveBeenCalled();
                expect(mockRedirect).not.toHaveBeenCalled();
            });
        });

        describe('Database and Upload Errors', () => {
            it('should handle image upload failures', async () => {
                const uploadError = new Error('Image upload failed');
                mockUploadImages.mockRejectedValue(uploadError);

                const prevState: ActionState = {};
                const result = await createProperty(prevState, mockFormData);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toContain('Failed to add a property');
                expect(result.formData).toBe(mockFormData);
                expect(mockConsoleError).toHaveBeenCalledWith(
                    expect.stringContaining('Database error adding a property')
                );
            });

            it('should handle property save failures', async () => {
                const mockImageData: PropertyImageData[] = [
                    { secureUrl: 'https://example.com/test.jpg', publicId: 'test', width: 800, height: 600 }
                ];

                const saveError = new Error('Failed to save property');
                
                mockUploadImages.mockResolvedValue(mockImageData);
                const mockSave = mockPropertySave.mockRejectedValue(saveError);
                mockProperty.mockImplementation(() => ({
                    save: mockSave
                }));

                const prevState: ActionState = {};
                const result = await createProperty(prevState, mockFormData);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(mockDestroyImages).toHaveBeenCalledWith(mockImageData);
            });
        });
    });

    describe('deleteProperty Action', () => {
        describe('Successful Property Deletion', () => {
            it('should delete property successfully', async () => {
                const mockSession = {
                    startTransaction: jest.fn(),
                    commitTransaction: jest.fn(),
                    abortTransaction: jest.fn(),
                    endSession: jest.fn()
                };

                const mockPropertyDoc = {
                    ...mockPropertyData,
                    imagesData: [
                        { secureUrl: 'https://example.com/1.jpg', publicId: 'img1', width: 800, height: 600 }
                    ]
                } as unknown as PropertyDocument;

                mockStartSession.mockResolvedValue(mockSession as any);
                mockPropertyFindById.mockResolvedValue(mockPropertyDoc);
                mockPropertyFindByIdAndDelete.mockResolvedValue(mockPropertyDoc);
                mockUserUpdateMany.mockResolvedValue({ modifiedCount: 1 } as any);
                mockDestroyImages.mockResolvedValue(undefined);

                const result = await deleteProperty('property123');

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
                expect(mockDbConnect).toHaveBeenCalledTimes(2);
                expect(mockPropertyFindById).toHaveBeenCalledWith('property123');
                expect(mockDestroyImages).toHaveBeenCalledWith(mockPropertyDoc.imagesData);
                expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
                expect(mockPropertyFindByIdAndDelete).toHaveBeenCalledWith(
                    expect.any(Object),
                    { session: mockSession }
                );
                expect(mockUserUpdateMany).toHaveBeenCalledWith(
                    { favorites: expect.any(Object) },
                    { $pull: { favorites: expect.any(Object) } },
                    { session: mockSession }
                );
                expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
                expect(mockSession.endSession).toHaveBeenCalledTimes(1);
                expect(mockRevalidatePath).toHaveBeenCalledWith('/profile');
                expect(result.status).toBe(ActionStatus.SUCCESS);
                expect(result.message).toBe('Property successfully deleted.');
            });
        });

        describe('Property Not Found', () => {
            it('should return error when property not found', async () => {
                mockPropertyFindById.mockResolvedValue(null);

                const result = await deleteProperty('nonexistent');

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toBe('Property not found.');
            });
        });
    });

    describe('updateProperty Action', () => {
        describe('Successful Property Update', () => {
            it('should update property successfully', async () => {
                const mockPropertyDoc = {
                    ...mockPropertyData,
                    owner: { toString: () => mockSessionUser.id }
                } as unknown as PropertyDocument;

                mockPropertyFindById.mockResolvedValue(mockPropertyDoc);
                mockPropertyFindByIdAndUpdate.mockResolvedValue(mockPropertyDoc);

                const prevState: ActionState = {};
                await updateProperty('property123', prevState, mockFormData);

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockPropertyFindById).toHaveBeenCalledWith('property123');
                expect(mockPropertyFindByIdAndUpdate).toHaveBeenCalledWith(
                    'property123',
                    expect.objectContaining({
                        name: 'Test Property',
                        type: 'House',
                        description: 'A beautiful test property'
                    })
                );
                expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout');
                expect(mockRedirect).toHaveBeenCalledWith('/properties/property123');
            });
        });

        describe('Property Not Found', () => {
            it('should return error when property not found', async () => {
                mockPropertyFindById.mockResolvedValue(null);

                const prevState: ActionState = {};
                const result = await updateProperty('nonexistent', prevState, mockFormData);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toBe('Property not found.');
                expect(mockPropertyFindByIdAndUpdate).not.toHaveBeenCalled();
                expect(mockRedirect).not.toHaveBeenCalled();
            });
        });

        describe('Authorization Errors', () => {
            it('should return error when user is not property owner', async () => {
                const mockPropertyDoc = {
                    ...mockPropertyData,
                    owner: { toString: () => 'different-user-id' }
                } as unknown as PropertyDocument;

                mockPropertyFindById.mockResolvedValue(mockPropertyDoc);

                const prevState: ActionState = {};
                const result = await updateProperty('property123', prevState, mockFormData);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toBe('Not authorized to update property.');
                expect(mockPropertyFindByIdAndUpdate).not.toHaveBeenCalled();
            });
        });
    });

    describe('favoriteProperty Action', () => {
        const mockUserId = 'user123';
        const mockPropertyId = 'property456';
        
        const mockUserDoc = {
            _id: mockUserId,
            favorites: [] as any[]
        } as UserDocument;

        describe('Adding to Favorites', () => {
            it('should add property to favorites when not favorited', async () => {
                mockUserFindById.mockResolvedValue(mockUserDoc);
                mockUserUpdateOne.mockResolvedValue({ modifiedCount: 1 } as any);

                const result = await favoriteProperty(mockPropertyId);

                expect(mockUserFindById).toHaveBeenCalledWith(mockSessionUser.id);
                expect(mockUserUpdateOne).toHaveBeenCalledWith(
                    { _id: mockUserDoc._id },
                    { $push: { favorites: mockPropertyId } }
                );
                expect(result.status).toBe(ActionStatus.SUCCESS);
                expect(result.message).toBe('Added to favorites');
                expect(result.isFavorite).toBe(true);
                expect(mockRevalidatePath).toHaveBeenCalledWith('/properties/favorites', 'page');
            });
        });

        describe('Removing from Favorites', () => {
            it('should remove property from favorites when already favorited', async () => {
                // Import the ObjectId constructor after mocking
                const { Types } = require("mongoose");
                const mockPropertyObjectId = new Types.ObjectId(mockPropertyId);
                const userWithFavorites = {
                    ...mockUserDoc,
                    favorites: [mockPropertyObjectId]
                } as UserDocument;

                mockUserFindById.mockResolvedValue(userWithFavorites);
                mockUserUpdateOne.mockResolvedValue({ modifiedCount: 1 } as any);

                const result = await favoriteProperty(mockPropertyId);

                expect(mockUserUpdateOne).toHaveBeenCalledWith(
                    { _id: userWithFavorites._id },
                    { $pull: { favorites: mockPropertyId } }
                );
                expect(result.status).toBe(ActionStatus.SUCCESS);
                expect(result.message).toBe('Removed from favorites');
                expect(result.isFavorite).toBe(false);
            });
        });

        describe('Error Handling', () => {
            it('should handle user not found', async () => {
                mockUserFindById.mockResolvedValue(null);

                const result = await favoriteProperty(mockPropertyId);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toBe('User not found.');
            });
        });
    });

    describe('getFavoriteStatus Action', () => {
        const mockUserId = 'user123';
        const mockPropertyId = 'property456';
        
        const mockUserDoc = {
            _id: mockUserId,
            favorites: [] as any[]
        } as UserDocument;

        describe('Successful Status Retrieval', () => {
            it('should return false when property is not favorited', async () => {
                mockUserFindById.mockResolvedValue(mockUserDoc);

                const result = await getFavoriteStatus(mockPropertyId);

                expect(mockUserFindById).toHaveBeenCalledWith(mockSessionUser.id);
                expect(result.status).toBe(ActionStatus.SUCCESS);
                expect(result.message).toBe('Successfully fetched favorites status');
                expect(result.isFavorite).toBe(false);
            });

            it('should return true when property is favorited', async () => {
                // Import the ObjectId constructor after mocking
                const { Types } = require("mongoose");
                const mockPropertyObjectId = new Types.ObjectId(mockPropertyId);
                const userWithFavorites = {
                    ...mockUserDoc,
                    favorites: [mockPropertyObjectId]
                } as UserDocument;

                mockUserFindById.mockResolvedValue(userWithFavorites);

                const result = await getFavoriteStatus(mockPropertyId);

                expect(result.status).toBe(ActionStatus.SUCCESS);
                expect(result.isFavorite).toBe(true);
            });
        });

        describe('Error Handling', () => {
            it('should handle user not found', async () => {
                mockUserFindById.mockResolvedValue(null);

                const result = await getFavoriteStatus(mockPropertyId);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toBe('User not found.');
            });
        });
    });
});