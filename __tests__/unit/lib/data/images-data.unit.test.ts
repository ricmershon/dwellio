import { jest } from "@jest/globals";

// Mock cloudinary before importing
jest.mock("cloudinary", () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn(),
            destroy: jest.fn()
        }
    }
}));

import { uploadImages, destroyImages } from "@/lib/data/images-data";
import { v2 as cloudinary } from "cloudinary";
import { PropertyImageData } from "@/types";

// Mock implementations
const mockCloudinaryUpload = cloudinary.uploader.upload as jest.MockedFunction<any>;
const mockCloudinaryDestroy = cloudinary.uploader.destroy as jest.MockedFunction<any>;

// Mock File.arrayBuffer() method
const mockArrayBuffer = jest.fn<() => Promise<ArrayBuffer>>();
Object.defineProperty(File.prototype, 'arrayBuffer', {
    value: mockArrayBuffer,
    writable: true,
    configurable: true
});

describe("images-data", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock for arrayBuffer returns a simple buffer
        mockArrayBuffer.mockResolvedValue(new ArrayBuffer(8));
    });

    describe("uploadImages", () => {
        it("should upload single image successfully", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const mockResult = {
                secure_url: "https://cloudinary.com/test.jpg",
                public_id: "dwellio/test123",
                height: 600,
                width: 800
            };

            mockCloudinaryUpload.mockResolvedValue(mockResult);

            const result = await uploadImages([mockFile]);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                secureUrl: "https://cloudinary.com/test.jpg",
                publicId: "dwellio/test123",
                height: 600,
                width: 800
            });
            expect(mockCloudinaryUpload).toHaveBeenCalledTimes(1);
            expect(mockCloudinaryUpload).toHaveBeenCalledWith(
                expect.stringContaining("data:image/png;base64,"),
                { folder: "dwellio" }
            );
        });

        it("should upload multiple images successfully", async () => {
            const mockFile1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
            const mockFile2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });
            const mockFile3 = new File(["content3"], "test3.jpg", { type: "image/jpeg" });

            const mockResults = [
                {
                    secure_url: "https://cloudinary.com/test1.jpg",
                    public_id: "dwellio/test1",
                    height: 600,
                    width: 800
                },
                {
                    secure_url: "https://cloudinary.com/test2.jpg",
                    public_id: "dwellio/test2",
                    height: 400,
                    width: 600
                },
                {
                    secure_url: "https://cloudinary.com/test3.jpg",
                    public_id: "dwellio/test3",
                    height: 800,
                    width: 1200
                }
            ];

            mockCloudinaryUpload
                .mockResolvedValueOnce(mockResults[0])
                .mockResolvedValueOnce(mockResults[1])
                .mockResolvedValueOnce(mockResults[2]);

            const result = await uploadImages([mockFile1, mockFile2, mockFile3]);

            expect(result).toHaveLength(3);
            expect(result[0].secureUrl).toBe("https://cloudinary.com/test1.jpg");
            expect(result[1].secureUrl).toBe("https://cloudinary.com/test2.jpg");
            expect(result[2].secureUrl).toBe("https://cloudinary.com/test3.jpg");
            expect(mockCloudinaryUpload).toHaveBeenCalledTimes(3);
        });

        it("should handle empty image array", async () => {
            const result = await uploadImages([]);

            expect(result).toEqual([]);
            expect(mockCloudinaryUpload).not.toHaveBeenCalled();
        });

        it("should throw error when cloudinary upload fails", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const uploadError = new Error("Upload failed");

            mockCloudinaryUpload.mockRejectedValue(uploadError);

            await expect(uploadImages([mockFile])).rejects.toThrow("Error uploading images: Upload failed");

            expect(mockCloudinaryUpload).toHaveBeenCalledTimes(1);
        });

        it("should throw error with message property from cloudinary error", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const uploadError = { message: "Invalid API credentials" };

            mockCloudinaryUpload.mockRejectedValue(uploadError);

            await expect(uploadImages([mockFile])).rejects.toThrow("Error uploading images: Invalid API credentials");
        });

        it("should throw error when cloudinary returns non-object error", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });

            mockCloudinaryUpload.mockRejectedValue("String error");

            await expect(uploadImages([mockFile])).rejects.toThrow("Error uploading images: String error");
        });

        it("should handle upload failure for one image and stop processing", async () => {
            const mockFile1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
            const mockFile2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

            const mockResult1 = {
                secure_url: "https://cloudinary.com/test1.jpg",
                public_id: "dwellio/test1",
                height: 600,
                width: 800
            };

            mockCloudinaryUpload
                .mockResolvedValueOnce(mockResult1)
                .mockRejectedValueOnce(new Error("Upload failed for image 2"));

            await expect(uploadImages([mockFile1, mockFile2])).rejects.toThrow("Error uploading images");

            expect(mockCloudinaryUpload).toHaveBeenCalledTimes(2);
        });

        it("should upload images to dwellio folder", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const mockResult = {
                secure_url: "https://cloudinary.com/test.jpg",
                public_id: "dwellio/test123",
                height: 600,
                width: 800
            };

            mockCloudinaryUpload.mockResolvedValue(mockResult);

            await uploadImages([mockFile]);

            expect(mockCloudinaryUpload).toHaveBeenCalledWith(
                expect.any(String),
                { folder: "dwellio" }
            );
        });

        it("should convert image file to base64 format", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const mockResult = {
                secure_url: "https://cloudinary.com/test.jpg",
                public_id: "dwellio/test123",
                height: 600,
                width: 800
            };

            mockCloudinaryUpload.mockResolvedValue(mockResult);

            await uploadImages([mockFile]);

            expect(mockCloudinaryUpload).toHaveBeenCalledWith(
                expect.stringMatching(/^data:image\/png;base64,/),
                expect.any(Object)
            );
        });

        it("should handle images with different dimensions", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const mockResult = {
                secure_url: "https://cloudinary.com/test.jpg",
                public_id: "dwellio/test123",
                height: 1080,
                width: 1920
            };

            mockCloudinaryUpload.mockResolvedValue(mockResult);

            const result = await uploadImages([mockFile]);

            expect(result[0].height).toBe(1080);
            expect(result[0].width).toBe(1920);
        });

        it("should handle very large image files", async () => {
            const largeContent = new Array(1024 * 1024).fill("a").join(""); // 1MB
            const mockFile = new File([largeContent], "large.jpg", { type: "image/jpeg" });
            const mockResult = {
                secure_url: "https://cloudinary.com/large.jpg",
                public_id: "dwellio/large123",
                height: 4000,
                width: 6000
            };

            mockCloudinaryUpload.mockResolvedValue(mockResult);

            const result = await uploadImages([mockFile]);

            expect(result).toHaveLength(1);
            expect(result[0].secureUrl).toBe("https://cloudinary.com/large.jpg");
        });

        it("should handle cloudinary timeout error", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const timeoutError = new Error("Request timeout");

            mockCloudinaryUpload.mockRejectedValue(timeoutError);

            await expect(uploadImages([mockFile])).rejects.toThrow("Error uploading images: Request timeout");
        });

        it("should return imageData with all required fields", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
            const mockResult = {
                secure_url: "https://cloudinary.com/test.jpg",
                public_id: "dwellio/test123",
                height: 600,
                width: 800
            };

            mockCloudinaryUpload.mockResolvedValue(mockResult);

            const result = await uploadImages([mockFile]);

            expect(result[0]).toHaveProperty("secureUrl");
            expect(result[0]).toHaveProperty("publicId");
            expect(result[0]).toHaveProperty("height");
            expect(result[0]).toHaveProperty("width");
        });

        it("should handle null or undefined in error object", async () => {
            const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });

            mockCloudinaryUpload.mockRejectedValue(null);

            await expect(uploadImages([mockFile])).rejects.toThrow("Error uploading images");
        });
    });

    describe("destroyImages", () => {
        const mockImagesData: PropertyImageData[] = [
            {
                secureUrl: "https://cloudinary.com/test1.jpg",
                publicId: "dwellio/test1",
                height: 600,
                width: 800
            },
            {
                secureUrl: "https://cloudinary.com/test2.jpg",
                publicId: "dwellio/test2",
                height: 400,
                width: 600
            }
        ];

        it("should destroy single image successfully", async () => {
            const singleImage: PropertyImageData[] = [mockImagesData[0]];
            mockCloudinaryDestroy.mockResolvedValue({ result: "ok" });

            await destroyImages(singleImage);

            expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(1);
            expect(mockCloudinaryDestroy).toHaveBeenCalledWith("dwellio/test1");
        });

        it("should destroy multiple images successfully", async () => {
            mockCloudinaryDestroy.mockResolvedValue({ result: "ok" });

            await destroyImages(mockImagesData);

            expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(2);
            expect(mockCloudinaryDestroy).toHaveBeenCalledWith("dwellio/test1");
            expect(mockCloudinaryDestroy).toHaveBeenCalledWith("dwellio/test2");
        });

        it("should handle empty images array", async () => {
            await destroyImages([]);

            expect(mockCloudinaryDestroy).not.toHaveBeenCalled();
        });

        it("should throw error when destroy fails", async () => {
            mockCloudinaryDestroy.mockResolvedValue({ result: "not found" });

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");

            expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(1);
        });

        it("should throw error when cloudinary returns error result", async () => {
            mockCloudinaryDestroy.mockResolvedValue({ result: "error" });

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");
        });

        it("should handle cloudinary destroy rejection", async () => {
            mockCloudinaryDestroy.mockRejectedValue(new Error("Network error"));

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images: Error: Network error");

            expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(1);
        });

        it("should stop on first image deletion error", async () => {
            mockCloudinaryDestroy
                .mockResolvedValueOnce({ result: "ok" })
                .mockResolvedValueOnce({ result: "not found" });

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");

            expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(2);
        });

        it("should use publicId from imageData", async () => {
            const customImage: PropertyImageData[] = [{
                secureUrl: "https://cloudinary.com/custom.jpg",
                publicId: "dwellio/custom-id-123",
                height: 500,
                width: 700
            }];

            mockCloudinaryDestroy.mockResolvedValue({ result: "ok" });

            await destroyImages(customImage);

            expect(mockCloudinaryDestroy).toHaveBeenCalledWith("dwellio/custom-id-123");
        });

        it("should handle images with special characters in publicId", async () => {
            const specialImage: PropertyImageData[] = [{
                secureUrl: "https://cloudinary.com/special.jpg",
                publicId: "dwellio/special-image_2024-01",
                height: 600,
                width: 800
            }];

            mockCloudinaryDestroy.mockResolvedValue({ result: "ok" });

            await destroyImages(specialImage);

            expect(mockCloudinaryDestroy).toHaveBeenCalledWith("dwellio/special-image_2024-01");
        });

        it("should handle cloudinary timeout during destroy", async () => {
            mockCloudinaryDestroy.mockRejectedValue(new Error("Request timeout"));

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images: Error: Request timeout");
        });

        it("should handle multiple images when first deletion succeeds", async () => {
            const threeImages: PropertyImageData[] = [
                ...mockImagesData,
                {
                    secureUrl: "https://cloudinary.com/test3.jpg",
                    publicId: "dwellio/test3",
                    height: 800,
                    width: 1000
                }
            ];

            mockCloudinaryDestroy.mockResolvedValue({ result: "ok" });

            await destroyImages(threeImages);

            expect(mockCloudinaryDestroy).toHaveBeenCalledTimes(3);
        });

        it("should throw descriptive error for deletion failure", async () => {
            mockCloudinaryDestroy.mockResolvedValue({ result: "failed" });

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");
        });

        it("should handle case-sensitive result field", async () => {
            mockCloudinaryDestroy.mockResolvedValue({ result: "OK" });

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");
        });

        it("should handle missing result field", async () => {
            mockCloudinaryDestroy.mockResolvedValue({});

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");
        });

        it("should handle undefined result", async () => {
            mockCloudinaryDestroy.mockResolvedValue({ result: undefined });

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");
        });

        it("should handle null response from cloudinary", async () => {
            mockCloudinaryDestroy.mockResolvedValue(null);

            await expect(destroyImages(mockImagesData)).rejects.toThrow("Error deleting images");
        });
    });
});
