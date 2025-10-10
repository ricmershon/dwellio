/**
 * Property Actions Integration Tests
 *
 * Tests Server Actions integration with FormData handling, validation schemas,
 * and business logic flow (not real database interactions).
 */
import { jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('@/lib/db-connect');
jest.mock('@/lib/data/images-data');
jest.mock('@/utils/require-session-user');
jest.mock('next/cache');
jest.mock('next/navigation');
jest.mock('@/models');
jest.mock('mongoose');

import { Types, startSession } from 'mongoose';
import {
    createProperty,
    updateProperty,
    deleteProperty,
    favoriteProperty,
    getFavoriteStatus
} from '@/lib/actions/property-actions';
import { Property, User } from '@/models';
import { ActionStatus } from '@/types';
import { uploadImages, destroyImages } from '@/lib/data/images-data';
import { requireSessionUser } from '@/utils/require-session-user';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const mockUploadImages = uploadImages as jest.MockedFunction<typeof uploadImages>;
const mockDestroyImages = destroyImages as jest.MockedFunction<typeof destroyImages>;
const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockStartSession = startSession as jest.MockedFunction<typeof startSession>;

describe('Property Actions - Server Actions Integration', () => {
    const mockUserId = new Types.ObjectId().toString();
    const mockSessionUser = {
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        mockRequireSessionUser.mockResolvedValue(mockSessionUser as any);
        mockUploadImages.mockResolvedValue([
            { imageUrl: 'https://example.com/img1.jpg', publicId: 'pub1' },
            { imageUrl: 'https://example.com/img2.jpg', publicId: 'pub2' },
            { imageUrl: 'https://example.com/img3.jpg', publicId: 'pub3' }
        ] as any);
        mockDestroyImages.mockResolvedValue(undefined as any);
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`NEXT_REDIRECT:${url}`);
        });
        mockRevalidatePath.mockImplementation(() => {});
    });

    describe('createProperty - Form Data Integration', () => {
        it('should return validation errors for invalid FormData', async () => {
            const formData = new FormData();
            formData.append('type', 'InvalidType'); // Invalid enum value
            formData.append('name', ''); // Required field empty

            const result = await createProperty({}, formData);

            expect(result.status).not.toBe(ActionStatus.SUCCESS);
            expect(result.formErrorMap).toBeDefined();
            expect(result.formData).toBe(formData);
        });
    });

    describe('updateProperty - Authorization Integration', () => {
        const testPropertyId = new Types.ObjectId().toString();

        it('should verify property existence before update', async () => {
            (Property.findById as any).mockResolvedValue(null);

            const formData = new FormData();
            formData.append('name', 'Updated Name');

            const result = await updateProperty(testPropertyId, {}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Property not found.');
        });
    });

    describe('deleteProperty - Transaction Integration', () => {
        const testPropertyId = new Types.ObjectId().toString();

        it('should delete property and remove from favorites', async () => {
            const mockProperty = {
                _id: testPropertyId,
                imagesData: [
                    { url: 'img1.jpg', publicId: 'pub1' },
                    { url: 'img2.jpg', publicId: 'pub2' }
                ]
            };
            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };

            (Property.findById as any).mockResolvedValue(mockProperty);
            (Property.findByIdAndDelete as any).mockResolvedValue(mockProperty);
            (User.updateMany as any).mockResolvedValue({ modifiedCount: 1 });
            mockStartSession.mockResolvedValue(mockSession as any);

            const result = await deleteProperty(testPropertyId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(mockDestroyImages).toHaveBeenCalledWith(mockProperty.imagesData);
            expect(Property.findByIdAndDelete).toHaveBeenCalled();
            expect(User.updateMany).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockRevalidatePath).toHaveBeenCalledWith('/profile');
        });

        it('should rollback transaction on error', async () => {
            const mockProperty = {
                _id: testPropertyId,
                imagesData: [{ url: 'img.jpg', publicId: 'pub' }]
            };
            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn()
            };

            (Property.findById as any).mockResolvedValue(mockProperty);
            (User.updateMany as any).mockRejectedValue(new Error('Update failed'));
            mockStartSession.mockResolvedValue(mockSession as any);

            const result = await deleteProperty(testPropertyId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });
    });

    describe('favoriteProperty - Toggle Logic Integration', () => {
        const testPropertyId = new Types.ObjectId().toString();

        it('should add property to favorites when not favorited', async () => {
            const favorites: any[] = [];
            const mockUserDoc = {
                _id: mockUserId,
                favorites: {
                    includes: jest.fn((id: any) => {
                        return favorites.some(fav => fav.toString() === id.toString());
                    })
                }
            };
            (User.findById as any).mockResolvedValue(mockUserDoc);
            (User.updateOne as any).mockResolvedValue({ modifiedCount: 1 });

            const result = await favoriteProperty(testPropertyId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Added to favorites');
            expect(result.isFavorite).toBe(true);
            expect(mockRevalidatePath).toHaveBeenCalledWith('/properties/favorites', 'page');
        });

        it('should remove property from favorites when already favorited', async () => {
            const propertyObjectId = new Types.ObjectId(testPropertyId);
            const favorites = [propertyObjectId];
            const mockUserDoc = {
                _id: mockUserId,
                favorites: {
                    includes: jest.fn((id: any) => {
                        return favorites.some(fav => fav.toString() === id.toString());
                    })
                } as any
            };
            (User.findById as any).mockResolvedValue(mockUserDoc);
            (User.updateOne as any).mockResolvedValue({ modifiedCount: 1 });

            const result = await favoriteProperty(testPropertyId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Removed from favorites');
            expect(result.isFavorite).toBe(false);
        });
    });

    describe('getFavoriteStatus - Status Check Integration', () => {
        const testPropertyId = new Types.ObjectId().toString();

        it('should return true when property is favorited', async () => {
            const propertyObjectId = new Types.ObjectId(testPropertyId);
            const favorites = [propertyObjectId];
            const mockUserDoc = {
                _id: mockUserId,
                favorites: {
                    includes: jest.fn((id: any) => {
                        return favorites.some(fav => fav.toString() === id.toString());
                    })
                }
            };
            (User.findById as any).mockResolvedValue(mockUserDoc);

            const result = await getFavoriteStatus(testPropertyId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.isFavorite).toBe(true);
        });

        it('should return false when property is not favorited', async () => {
            const favorites: any[] = [];
            const mockUserDoc = {
                _id: mockUserId,
                favorites: {
                    includes: jest.fn((id: any) => {
                        return favorites.some(fav => fav.toString() === id.toString());
                    })
                }
            };
            (User.findById as any).mockResolvedValue(mockUserDoc);

            const result = await getFavoriteStatus(testPropertyId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.isFavorite).toBe(false);
        });

        it('should return error when user not found', async () => {
            (User.findById as any).mockResolvedValue(null);

            const result = await getFavoriteStatus(testPropertyId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('User not found.');
        });
    });
});
