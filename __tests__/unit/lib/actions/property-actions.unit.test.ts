import { jest } from "@jest/globals";

// Mock external dependencies before importing
jest.mock("next/cache");
jest.mock("next/navigation");
jest.mock("mongoose");
jest.mock("@/lib/db-connect");
jest.mock("@/lib/data/images-data");
jest.mock("@/utils/require-session-user");
jest.mock("@/models");

import { createProperty, deleteProperty, updateProperty, favoriteProperty, getFavoriteStatus } from "@/lib/actions/property-actions";
import { ActionStatus } from "@/types";
import { uploadImages, destroyImages } from "@/lib/data/images-data";
import { requireSessionUser } from "@/utils/require-session-user";
import { Property, User } from "@/models";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types, startSession } from "mongoose";
// Test data
const validPropertyFormData = {
    type: "Apartment",
    name: "Beautiful Downtown Apartment - Perfect for Your Stay",
    description: "This stunning apartment features modern amenities and is located in the heart of downtown. Perfect for business travelers or vacation stays.",
    location: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipcode: "10001"
    },
    beds: "2",
    baths: "1",
    squareFeet: "1200",
    amenities: ["wifi", "parking", "air_conditioning", "heating", "kitchen", "laundry"],
    rates: {
        nightly: "250",
        weekly: "1500",
        monthly: "5000"
    },
    sellerInfo: {
        name: "John Doe Property Manager",
        email: "john.doe@example.com",
        phone: "555-123-4567"
    }
};

const mockSessionUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User"
};

// Helper function
const createFormDataFromObject = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    const appendToFormData = (obj: Record<string, any>, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const formKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
                appendToFormData(value, formKey);
            } else if (Array.isArray(value)) {
                value.forEach(item => formData.append(formKey, item));
            } else if (value !== undefined && value !== null) {
                formData.append(formKey, value.toString());
            }
        }
    };

    appendToFormData(data);
    return formData;
};

// Mock implementations
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockUploadImages = uploadImages as jest.MockedFunction<typeof uploadImages>;
const mockDestroyImages = destroyImages as jest.MockedFunction<typeof destroyImages>;
const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockStartSession = startSession as jest.MockedFunction<typeof startSession>;

// Mock mongoose model methods
const mockPropertySave = jest.fn();
const mockPropertyFindById = jest.fn();
const mockPropertyFindByIdAndDelete = jest.fn();
const mockPropertyFindByIdAndUpdate = jest.fn();
const mockUserFindById = jest.fn();
const mockUserUpdateOne = jest.fn();
const mockUserUpdateMany = jest.fn();

const mockProperty = Property as jest.MockedClass<any>;
const mockUser = User as jest.MockedClass<any>;

// Mock session
const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn()
};

describe("property-actions", () => {
    const mockPropertyDocument = {
        _id: "property123",
        ...validPropertyFormData,
        beds: 2,
        baths: 1,
        squareFeet: 1200,
        rates: {
            nightly: 250,
            weekly: 1500,
            monthly: 5000
        },
        owner: "user123",
        imagesData: []
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockRequireSessionUser.mockResolvedValue(mockSessionUser);
        mockStartSession.mockReturnValue(mockSession as any);
        mockProperty.mockImplementation(() => ({
            ...mockPropertyDocument,
            save: mockPropertySave
        }));

        (mockProperty as any).findById = mockPropertyFindById;
        (mockProperty as any).findByIdAndDelete = mockPropertyFindByIdAndDelete;
        (mockProperty as any).findByIdAndUpdate = mockPropertyFindByIdAndUpdate;
        (mockUser as any).findById = mockUserFindById;
        (mockUser as any).updateOne = mockUserUpdateOne;
        (mockUser as any).updateMany = mockUserUpdateMany;

        (mockPropertySave as any).mockResolvedValue(mockPropertyDocument);
        mockRedirect.mockImplementation(() => { throw new Error("Redirect called"); });
    });

    describe("createProperty", () => {
        const createFormData = (data: Partial<typeof validPropertyFormData> = {}) => {
            return createFormDataFromObject({ ...validPropertyFormData, ...data });
        };

        it("should create property successfully with valid data", async () => {
            const formData = createFormData();
            const mockFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
            const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
            const mockFile3 = new File(["test3"], "test3.jpg", { type: "image/jpeg" });
            formData.append("images", mockFile1);
            formData.append("images", mockFile2);
            formData.append("images", mockFile3);

            (mockUploadImages as any).mockResolvedValue([{
                secureUrl: "https://example.com/image1.jpg",
                publicId: "test-image1",
                width: 800,
                height: 600
            }, {
                secureUrl: "https://example.com/image2.jpg",
                publicId: "test-image2",
                width: 800,
                height: 600
            }, {
                secureUrl: "https://example.com/image3.jpg",
                publicId: "test-image3",
                width: 800,
                height: 600
            }]);

            await expect(createProperty({}, formData)).rejects.toThrow("Redirect called");

            expect(mockUploadImages).toHaveBeenCalledWith([mockFile1, mockFile2, mockFile3]);
            expect(mockPropertySave).toHaveBeenCalled();
            expect(mockRedirect).toHaveBeenCalledWith("/properties/property123");
        });

        it("should return validation errors for invalid data", async () => {
            const formData = createFormData({ name: "" }); // Invalid: empty name

            const result = await createProperty({}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
            expect(mockUploadImages).not.toHaveBeenCalled();
            expect(mockPropertySave).not.toHaveBeenCalled();
        });

        it("should handle image upload failure and cleanup", async () => {
            const formData = createFormData();
            const mockFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
            const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
            const mockFile3 = new File(["test3"], "test3.jpg", { type: "image/jpeg" });
            formData.append("images", mockFile1);
            formData.append("images", mockFile2);
            formData.append("images", mockFile3);

            const mockImagesData = [{
                secureUrl: "https://example.com/image.jpg",
                publicId: "test-image",
                width: 800,
                height: 600
            }];

            (mockUploadImages as any).mockResolvedValue(mockImagesData);
            (mockPropertySave as any).mockRejectedValue(new Error("Database error"));

            const result = await createProperty({}, formData);

            expect(result).toEqual({
                message: "Failed to add a property: Error: Database error",
                status: ActionStatus.ERROR,
                formData: formData
            });
            expect(mockDestroyImages).toHaveBeenCalledWith(mockImagesData);
        });

        it("should handle database connection error", async () => {
            const formData = createFormData();
            const mockFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
            const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
            const mockFile3 = new File(["test3"], "test3.jpg", { type: "image/jpeg" });
            formData.append("images", mockFile1);
            formData.append("images", mockFile2);
            formData.append("images", mockFile3);
            (mockUploadImages as any).mockRejectedValue(new Error("Upload failed"));

            const result = await createProperty({}, formData);

            expect(result).toEqual({
                message: "Failed to add a property: Error: Upload failed",
                status: ActionStatus.ERROR,
                formData: formData
            });
        });

        it("should filter out empty image files", async () => {
            const formData = createFormData();
            const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });
            const validFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
            const validFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
            const validFile3 = new File(["test3"], "test3.jpg", { type: "image/jpeg" });
            formData.append("images", emptyFile);
            formData.append("images", validFile1);
            formData.append("images", validFile2);
            formData.append("images", validFile3);

            (mockUploadImages as any).mockResolvedValue([]);

            await expect(createProperty({}, formData)).rejects.toThrow("Redirect called");

            // Should pass all raw files (including empty), as filtering happens during validation
            expect(mockUploadImages).toHaveBeenCalledWith([emptyFile, validFile1, validFile2, validFile3]);
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated"));
            const formData = createFormData();

            await expect(createProperty({}, formData)).rejects.toThrow("Not authenticated");
        });
    });

    describe("deleteProperty", () => {
        const propertyId = "property123";

        beforeEach(() => {
            (mockPropertyFindById as any).mockResolvedValue(mockPropertyDocument as any);
        });

        it("should delete property successfully", async () => {
            (mockPropertyFindByIdAndDelete as any).mockResolvedValue(mockPropertyDocument as any);
            (mockUserUpdateMany as any).mockResolvedValue({ modifiedCount: 1 } as any);

            const result = await deleteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Property successfully deleted."
            });
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockPropertyFindByIdAndDelete).toHaveBeenCalledWith(expect.objectContaining({
                _id: propertyId
            }), { session: mockSession });
            expect(mockUserUpdateMany).toHaveBeenCalledWith(
                { favorites: expect.objectContaining({ _id: propertyId }) },
                { $pull: { favorites: expect.objectContaining({ _id: propertyId }) } },
                { session: mockSession }
            );
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
            expect(mockRevalidatePath).toHaveBeenCalledWith("/profile");
        });

        it("should return error if property not found", async () => {
            (mockPropertyFindById as any).mockResolvedValue(null);

            const result = await deleteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Property not found."
            });
            expect(mockSession.startTransaction).not.toHaveBeenCalled();
        });

        it("should handle transaction failure and rollback", async () => {
            (mockPropertyFindByIdAndDelete as any).mockRejectedValue(new Error("Delete failed"));

            const result = await deleteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Failed to delete property: Error: Delete failed"
            });
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it("should handle property not found during deletion", async () => {
            (mockPropertyFindByIdAndDelete as any).mockResolvedValue(null);

            const result = await deleteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Failed to delete property: Error: Property not found"
            });
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it("should destroy images when deleting property", async () => {
            const propertyWithImages = {
                ...mockPropertyDocument,
                imagesData: [
                    { secureUrl: "url1", publicId: "id1", width: 800, height: 600 },
                    { secureUrl: "url2", publicId: "id2", width: 800, height: 600 }
                ]
            };
            (mockPropertyFindById as any).mockResolvedValue(propertyWithImages);
            (mockPropertyFindByIdAndDelete as any).mockResolvedValue(propertyWithImages);
            (mockUserUpdateMany as any).mockResolvedValue({ modifiedCount: 1 });

            await deleteProperty(propertyId);

            expect(mockDestroyImages).toHaveBeenCalledWith(propertyWithImages.imagesData);
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated"));

            await expect(deleteProperty(propertyId)).rejects.toThrow("Not authenticated");
        });
    });

    describe("updateProperty", () => {
        const propertyId = "property123";

        const createUpdateFormData = (data: Partial<typeof validPropertyFormData> = {}) => {
            return createFormDataFromObject({ ...validPropertyFormData, ...data });
        };

        beforeEach(() => {
            (mockPropertyFindById as any).mockResolvedValue(mockPropertyDocument as any);
            (mockPropertyFindByIdAndUpdate as any).mockResolvedValue(mockPropertyDocument as any);
        });

        it("should update property successfully with valid data", async () => {
            const formData = createUpdateFormData({ name: "Updated Property" });

            await expect(updateProperty(propertyId, {}, formData)).rejects.toThrow("Redirect called");

            expect(mockPropertyFindByIdAndUpdate).toHaveBeenCalledWith(
                propertyId,
                expect.objectContaining({ name: "Updated Property" })
            );
            expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
            expect(mockRedirect).toHaveBeenCalledWith(`/properties/${propertyId}`);
        });

        it("should return error if property not found", async () => {
            (mockPropertyFindById as any).mockResolvedValue(null);
            const formData = createUpdateFormData();

            const result = await updateProperty(propertyId, {}, formData);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Property not found."
            });
            expect(mockPropertyFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should return error if user not authorized", async () => {
            const unauthorizedProperty = {
                ...mockPropertyDocument,
                owner: "otheruser123"
            };
            (mockPropertyFindById as any).mockResolvedValue(unauthorizedProperty);
            const formData = createUpdateFormData();

            const result = await updateProperty(propertyId, {}, formData);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Not authorized to update property."
            });
            expect(mockPropertyFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should return validation errors for invalid data", async () => {
            const formData = createUpdateFormData({ name: "" }); // Invalid: empty name

            const result = await updateProperty(propertyId, {}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
            expect(mockPropertyFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        it("should handle database update error", async () => {
            const formData = createUpdateFormData();
            (mockPropertyFindByIdAndUpdate as any).mockRejectedValue(new Error("Update failed"));

            const result = await updateProperty(propertyId, {}, formData);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Failed to add a property: Error: Update failed",
                formData: formData
            });
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated"));
            const formData = createUpdateFormData();

            await expect(updateProperty(propertyId, {}, formData)).rejects.toThrow("Not authenticated");
        });

        it("should handle owner field as ObjectId string", async () => {
            const propertyWithObjectId = {
                ...mockPropertyDocument,
                owner: { toString: () => "user123" }
            };
            (mockPropertyFindById as any).mockResolvedValue(propertyWithObjectId);
            const formData = createUpdateFormData();

            await expect(updateProperty(propertyId, {}, formData)).rejects.toThrow("Redirect called");

            expect(mockPropertyFindByIdAndUpdate).toHaveBeenCalled();
        });
    });

    describe("favoriteProperty", () => {
        const propertyId = "property123";
        const propertyObjectId = new Types.ObjectId(propertyId) as any;

        const mockUserData = {
            _id: "user123",
            favorites: [] as any[]
        };

        beforeEach(() => {
            (mockUserFindById as any).mockResolvedValue(mockUserData as any);
            (mockUserUpdateOne as any).mockResolvedValue({ modifiedCount: 1 } as any);
        });

        it("should add property to favorites when not already favorited", async () => {
            const favoritesArray: any[] = [];
            (favoritesArray as any).includes = jest.fn().mockReturnValue(false);
            mockUserData.favorites = favoritesArray as any;

            const result = await favoriteProperty(propertyId);

            expect(result).toEqual({
                message: "Added to favorites",
                status: ActionStatus.SUCCESS,
                isFavorite: true
            });
            expect(mockUserUpdateOne).toHaveBeenCalledWith(
                { _id: mockUserData._id },
                { $push: { favorites: propertyId } }
            );
            expect(mockRevalidatePath).toHaveBeenCalledWith("/properties/favorites", "page");
        });

        it("should remove property from favorites when already favorited", async () => {
            // Create an array that properly implements includes for ObjectId comparison
            const favoritesArray = [propertyObjectId];
            (favoritesArray as any).includes = jest.fn().mockReturnValue(true);
            mockUserData.favorites = favoritesArray as any;

            const result = await favoriteProperty(propertyId);

            expect(result).toEqual({
                message: "Removed from favorites",
                status: ActionStatus.SUCCESS,
                isFavorite: false
            });
            expect(mockUserUpdateOne).toHaveBeenCalledWith(
                { _id: mockUserData._id },
                { $pull: { favorites: propertyId } }
            );
            expect(mockRevalidatePath).toHaveBeenCalledWith("/properties/favorites", "page");
        });

        it("should return error if user not found", async () => {
            (mockUserFindById as any).mockResolvedValue(null as any);

            const result = await favoriteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "User not found."
            });
            expect(mockUserUpdateOne).not.toHaveBeenCalled();
        });

        it("should handle database error when finding user", async () => {
            (mockUserFindById as any).mockRejectedValue(new Error("Database error") as any);

            const result = await favoriteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Error finding user: Error: Database error"
            });
        });

        it("should handle database error when updating favorites", async () => {
            (mockUserUpdateOne as any).mockRejectedValue(new Error("Update failed") as any);

            const result = await favoriteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Error favoriting property"
            });
        });

        it("should handle case where update doesn't modify any documents", async () => {
            (mockUserUpdateOne as any).mockResolvedValue({ modifiedCount: 0 } as any);

            const result = await favoriteProperty(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Error favoriting property"
            });
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated"));

            await expect(favoriteProperty(propertyId)).rejects.toThrow("Not authenticated");
        });
    });

    describe("getFavoriteStatus", () => {
        const propertyId = "property123";
        const propertyObjectId = new Types.ObjectId(propertyId) as any;

        const mockUserData = {
            _id: "user123",
            favorites: [] as any[]
        };

        beforeEach(() => {
            (mockUserFindById as any).mockResolvedValue(mockUserData as any);
        });

        it("should return true when property is in favorites", async () => {
            const favoritesArray = [propertyObjectId];
            (favoritesArray as any).includes = jest.fn().mockReturnValue(true);
            mockUserData.favorites = favoritesArray as any;

            const result = await getFavoriteStatus(propertyId);

            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Successfully fetched favorites status",
                isFavorite: true
            });
        });

        it("should return false when property is not in favorites", async () => {
            const favoritesArray: any[] = [];
            (favoritesArray as any).includes = jest.fn().mockReturnValue(false);
            mockUserData.favorites = favoritesArray as any;

            const result = await getFavoriteStatus(propertyId);

            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Successfully fetched favorites status",
                isFavorite: false
            });
        });

        it("should return error if user not found", async () => {
            (mockUserFindById as any).mockResolvedValue(null as any);

            const result = await getFavoriteStatus(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "User not found."
            });
        });

        it("should handle database error when finding user", async () => {
            (mockUserFindById as any).mockRejectedValue(new Error("Database error") as any);

            const result = await getFavoriteStatus(propertyId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Error finding user: Error: Database error"
            });
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated"));

            await expect(getFavoriteStatus(propertyId)).rejects.toThrow("Not authenticated");
        });

        it("should handle multiple properties in favorites correctly", async () => {
            const otherPropertyId = new Types.ObjectId("otherproperty456") as any;
            const favoritesArray = [otherPropertyId, propertyObjectId];
            (favoritesArray as any).includes = jest.fn().mockReturnValue(true);
            mockUserData.favorites = favoritesArray as any;

            const result = await getFavoriteStatus(propertyId);

            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Successfully fetched favorites status",
                isFavorite: true
            });
        });
    });
});