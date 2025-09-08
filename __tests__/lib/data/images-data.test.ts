import { PropertyImageData } from "@/types";

// Create mock functions for cloudinary - must be defined before import
const mockUpload = jest.fn();
const mockDestroy = jest.fn();

// Mock cloudinary before import
jest.mock("cloudinary", () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: mockUpload,
            destroy: mockDestroy,
        },
    },
}));

// Import after mocking
import { uploadImages, destroyImages } from "@/lib/data/images-data";

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock File class with arrayBuffer method
class MockFile {
    content: Uint8Array;
    name: string;
    type: string;
    size: number;

    constructor(content: Uint8Array | string[], name: string, options?: { type?: string }) {
        this.content = content instanceof Uint8Array ? content : new Uint8Array(content as any);
        this.name = name;
        this.type = options?.type || '';
        this.size = this.content.length;
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        return this.content.buffer.slice() as ArrayBuffer;
    }
}

// Replace global File with MockFile
(global as any).File = MockFile;

describe('Images Data Layer Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleError.mockClear();
    });

    describe('uploadImages Function', () => {
        describe('Successful Image Upload', () => {
            const mockFile1 = new MockFile(new Uint8Array([1, 2, 3, 4]), 'test1.png', {
                type: 'image/png'
            }) as any as File;
            const mockFile2 = new MockFile(new Uint8Array([5, 6, 7, 8]), 'test2.jpg', {
                type: 'image/jpeg'
            }) as any as File;

            const mockUploadResult1 = {
                secure_url: 'https://res.cloudinary.com/test/image/upload/v1/dwellio/test1.png',
                public_id: 'dwellio/test1',
                height: 800,
                width: 600,
            };

            const mockUploadResult2 = {
                secure_url: 'https://res.cloudinary.com/test/image/upload/v1/dwellio/test2.jpg',
                public_id: 'dwellio/test2',
                height: 1200,
                width: 900,
            };

            it('should upload single image successfully', async () => {
                mockUpload.mockResolvedValueOnce(mockUploadResult1);

                const result = await uploadImages([mockFile1]);

                expect(mockUpload).toHaveBeenCalledTimes(1);
                expect(mockUpload).toHaveBeenCalledWith(
                    expect.stringMatching(/^data:image\/png;base64,/),
                    { folder: "dwellio" }
                );
                expect(result).toHaveLength(1);
                expect(result[0]).toEqual({
                    secureUrl: mockUploadResult1.secure_url,
                    publicId: mockUploadResult1.public_id,
                    height: mockUploadResult1.height,
                    width: mockUploadResult1.width,
                });
            });

            it('should upload multiple images successfully', async () => {
                mockUpload
                    .mockResolvedValueOnce(mockUploadResult1)
                    .mockResolvedValueOnce(mockUploadResult2);

                const result = await uploadImages([mockFile1, mockFile2]);

                expect(mockUpload).toHaveBeenCalledTimes(2);
                expect(result).toHaveLength(2);
                expect(result[0]).toEqual({
                    secureUrl: mockUploadResult1.secure_url,
                    publicId: mockUploadResult1.public_id,
                    height: mockUploadResult1.height,
                    width: mockUploadResult1.width,
                });
                expect(result[1]).toEqual({
                    secureUrl: mockUploadResult2.secure_url,
                    publicId: mockUploadResult2.public_id,
                    height: mockUploadResult2.height,
                    width: mockUploadResult2.width,
                });
            });

            it('should convert images to base64 correctly', async () => {
                const testBuffer = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
                const testFile = new MockFile(testBuffer, 'test.png', { type: 'image/png' }) as any as File;
                mockUpload.mockResolvedValueOnce(mockUploadResult1);

                await uploadImages([testFile]);

                const expectedBase64 = Buffer.from(testBuffer).toString('base64');
                expect(mockUpload).toHaveBeenCalledWith(
                    `data:image/png;base64,${expectedBase64}`,
                    { folder: "dwellio" }
                );
            });

            it('should process images sequentially', async () => {
                const uploadOrder: number[] = [];
                mockUpload
                    .mockImplementation(async () => {
                        uploadOrder.push(1);
                        return mockUploadResult1;
                    })
                    .mockImplementationOnce(async () => {
                        uploadOrder.push(1);
                        return mockUploadResult1;
                    });

                await uploadImages([mockFile1, mockFile2]);

                expect(uploadOrder).toEqual([1, 1]);
                expect(mockUpload).toHaveBeenCalledTimes(2);
            });

            it('should upload to dwellio folder', async () => {
                mockUpload.mockResolvedValueOnce(mockUploadResult1);

                await uploadImages([mockFile1]);

                expect(mockUpload).toHaveBeenCalledWith(
                    expect.any(String),
                    { folder: "dwellio" }
                );
            });
        });

        describe('Error Handling', () => {
            const mockFile = new MockFile(new Uint8Array([1, 2, 3, 4]), 'test.png', {
                type: 'image/png'
            }) as any as File;

            it('should handle cloudinary upload error with message', async () => {
                const uploadError = { message: 'Upload failed: Invalid image format' };
                mockUpload.mockRejectedValueOnce(uploadError);

                await expect(uploadImages([mockFile])).rejects.toThrow(
                    '>>> Error uploading images: Upload failed: Invalid image format'
                );
                expect(mockConsoleError).toHaveBeenCalledWith(
                    '>>> Error uploading images: Upload failed: Invalid image format'
                );
            });

            it('should handle cloudinary upload error without message', async () => {
                const uploadError = 'Network timeout';
                mockUpload.mockRejectedValueOnce(uploadError);

                await expect(uploadImages([mockFile])).rejects.toThrow(
                    '>>> Error uploading images: Network timeout'
                );
                expect(mockConsoleError).toHaveBeenCalledWith(
                    '>>> Error uploading images: Network timeout'
                );
            });

            it('should handle null/undefined errors', async () => {
                mockUpload.mockRejectedValueOnce(null);

                await expect(uploadImages([mockFile])).rejects.toThrow(
                    '>>> Error uploading images: null'
                );
            });

            it('should stop processing on first error', async () => {
                const mockFile2 = new MockFile(new Uint8Array([5, 6, 7, 8]), 'test2.jpg', {
                    type: 'image/jpeg'
                }) as any as File;
                const uploadError = { message: 'Upload failed' };
                
                mockUpload.mockRejectedValueOnce(uploadError);

                await expect(uploadImages([mockFile, mockFile2])).rejects.toThrow();

                expect(mockUpload).toHaveBeenCalledTimes(1);
            });

            it('should handle file processing errors', async () => {
                // Create a mock file that will cause an error during arrayBuffer conversion
                const badFile = {
                    arrayBuffer: jest.fn().mockRejectedValue(new Error('File read error'))
                } as unknown as File;

                await expect(uploadImages([badFile])).rejects.toThrow('File read error');
            });

            it('should handle empty images array', async () => {
                const result = await uploadImages([]);

                expect(result).toEqual([]);
                expect(mockUpload).not.toHaveBeenCalled();
            });
        });

        describe('File Processing', () => {
            it('should handle different image formats', async () => {
                const pngFile = new MockFile(new Uint8Array([1, 2, 3]), 'test.png', {
                    type: 'image/png'
                }) as any as File;
                const jpegFile = new MockFile(new Uint8Array([4, 5, 6]), 'test.jpg', {
                    type: 'image/jpeg'
                }) as any as File;
                const webpFile = new MockFile(new Uint8Array([7, 8, 9]), 'test.webp', {
                    type: 'image/webp'
                }) as any as File;

                const mockResult = {
                    secure_url: 'https://example.com/image.png',
                    public_id: 'test/image',
                    height: 800,
                    width: 600,
                };

                mockUpload.mockResolvedValue(mockResult);

                const result = await uploadImages([pngFile, jpegFile, webpFile]);

                expect(result).toHaveLength(3);
                expect(mockUpload).toHaveBeenCalledTimes(3);
            });

            it('should handle large image files', async () => {
                const largeBuffer = new Uint8Array(5 * 1024 * 1024); // 5MB
                largeBuffer.fill(255);
                const largeFile = new MockFile(largeBuffer, 'large.png', {
                    type: 'image/png'
                }) as any as File;

                const mockResult = {
                    secure_url: 'https://example.com/large.png',
                    public_id: 'test/large',
                    height: 3000,
                    width: 4000,
                };

                mockUpload.mockResolvedValueOnce(mockResult);

                const result = await uploadImages([largeFile]);

                expect(result).toHaveLength(1);
                expect(result[0]).toEqual({
                    secureUrl: mockResult.secure_url,
                    publicId: mockResult.public_id,
                    height: mockResult.height,
                    width: mockResult.width,
                });
            });
        });
    });

    describe('destroyImages Function', () => {
        describe('Successful Image Deletion', () => {
            const mockImageData: PropertyImageData[] = [
                {
                    secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/dwellio/test1.png',
                    publicId: 'dwellio/test1',
                    height: 800,
                    width: 600,
                },
                {
                    secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/dwellio/test2.jpg',
                    publicId: 'dwellio/test2',
                    height: 1200,
                    width: 900,
                },
            ];

            it('should delete single image successfully', async () => {
                mockDestroy.mockResolvedValueOnce({ result: 'ok' });

                await destroyImages([mockImageData[0]]);

                expect(mockDestroy).toHaveBeenCalledTimes(1);
                expect(mockDestroy).toHaveBeenCalledWith('dwellio/test1');
            });

            it('should delete multiple images successfully', async () => {
                mockDestroy
                    .mockResolvedValueOnce({ result: 'ok' })
                    .mockResolvedValueOnce({ result: 'ok' });

                await destroyImages(mockImageData);

                expect(mockDestroy).toHaveBeenCalledTimes(2);
                expect(mockDestroy).toHaveBeenNthCalledWith(1, 'dwellio/test1');
                expect(mockDestroy).toHaveBeenNthCalledWith(2, 'dwellio/test2');
            });

            it('should delete images sequentially', async () => {
                const deleteOrder: string[] = [];
                mockDestroy
                    .mockImplementation(async (publicId: string) => {
                        deleteOrder.push(publicId);
                        return { result: 'ok' };
                    });

                await destroyImages(mockImageData);

                expect(deleteOrder).toEqual(['dwellio/test1', 'dwellio/test2']);
            });

            it('should handle empty images array', async () => {
                await destroyImages([]);

                expect(mockDestroy).not.toHaveBeenCalled();
            });
        });

        describe('Error Handling', () => {
            const mockImageData: PropertyImageData[] = [
                {
                    secureUrl: 'https://res.cloudinary.com/test/image/upload/v1/dwellio/test1.png',
                    publicId: 'dwellio/test1',
                    height: 800,
                    width: 600,
                },
            ];

            it('should handle cloudinary destroy error', async () => {
                const destroyError = new Error('Deletion failed: Resource not found');
                mockDestroy.mockRejectedValueOnce(destroyError);

                await expect(destroyImages(mockImageData)).rejects.toThrow(
                    'Error deleting images: Error: Deletion failed: Resource not found'
                );
                expect(mockConsoleError).toHaveBeenCalledWith(
                    '>>> Error deleting images: Error: Deletion failed: Resource not found'
                );
            });

            it('should handle non-ok result from cloudinary', async () => {
                mockDestroy.mockResolvedValueOnce({ result: 'not found' });

                await expect(destroyImages(mockImageData)).rejects.toThrow(
                    'Error deleting images: Error: Error deleting image'
                );
                expect(mockConsoleError).toHaveBeenCalledWith(
                    '>>> Error deleting images: Error: Error deleting image'
                );
            });

            it('should stop on first deletion error', async () => {
                const multipleImages: PropertyImageData[] = [
                    ...mockImageData,
                    {
                        secureUrl: 'https://example.com/test2.png',
                        publicId: 'dwellio/test2',
                        height: 600,
                        width: 400,
                    }
                ];

                const destroyError = new Error('First image deletion failed');
                mockDestroy.mockRejectedValueOnce(destroyError);

                await expect(destroyImages(multipleImages)).rejects.toThrow();

                expect(mockDestroy).toHaveBeenCalledTimes(1);
            });

            it('should handle string errors from cloudinary', async () => {
                mockDestroy.mockRejectedValueOnce('Network error');

                await expect(destroyImages(mockImageData)).rejects.toThrow(
                    'Error deleting images: Network error'
                );
            });

            it('should handle null/undefined errors', async () => {
                mockDestroy.mockRejectedValueOnce(null);

                await expect(destroyImages(mockImageData)).rejects.toThrow(
                    'Error deleting images: null'
                );
            });
        });

        describe('Response Validation', () => {
            const mockImageData: PropertyImageData[] = [
                {
                    secureUrl: 'https://example.com/test.png',
                    publicId: 'dwellio/test',
                    height: 800,
                    width: 600,
                },
            ];

            it('should accept valid ok result', async () => {
                mockDestroy.mockResolvedValueOnce({ result: 'ok' });

                await expect(destroyImages(mockImageData)).resolves.not.toThrow();
            });

            it('should reject invalid result status', async () => {
                mockDestroy.mockResolvedValueOnce({ result: 'failed' });

                await expect(destroyImages(mockImageData)).rejects.toThrow(
                    'Error deleting image'
                );
            });

            it('should handle missing result field', async () => {
                mockDestroy.mockResolvedValueOnce({});

                await expect(destroyImages(mockImageData)).rejects.toThrow(
                    'Error deleting image'
                );
            });

            it('should handle malformed response', async () => {
                mockDestroy.mockResolvedValueOnce(null);

                await expect(destroyImages(mockImageData)).rejects.toThrow();
            });
        });

        describe('Edge Cases', () => {
            it('should handle special characters in publicId', async () => {
                const imageWithSpecialChars: PropertyImageData = {
                    secureUrl: 'https://example.com/test.png',
                    publicId: 'dwellio/test-image_with@special#chars',
                    height: 800,
                    width: 600,
                };

                mockDestroy.mockResolvedValueOnce({ result: 'ok' });

                await destroyImages([imageWithSpecialChars]);

                expect(mockDestroy).toHaveBeenCalledWith(
                    'dwellio/test-image_with@special#chars'
                );
            });

            it('should handle long publicId strings', async () => {
                const longPublicId = 'dwellio/' + 'a'.repeat(500);
                const imageWithLongId: PropertyImageData = {
                    secureUrl: 'https://example.com/test.png',
                    publicId: longPublicId,
                    height: 800,
                    width: 600,
                };

                mockDestroy.mockResolvedValueOnce({ result: 'ok' });

                await destroyImages([imageWithLongId]);

                expect(mockDestroy).toHaveBeenCalledWith(longPublicId);
            });
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle mixed success and failure in upload', async () => {
            const mockFiles = [
                new MockFile(new Uint8Array([1, 2, 3]), 'test1.png', { type: 'image/png' }) as any as File,
                new MockFile(new Uint8Array([4, 5, 6]), 'test2.jpg', { type: 'image/jpeg' }) as any as File,
            ];

            const mockResult1 = {
                secure_url: 'https://example.com/test1.png',
                public_id: 'test1',
                height: 800,
                width: 600,
            };

            mockUpload
                .mockResolvedValueOnce(mockResult1)
                .mockRejectedValueOnce(new Error('Second upload failed'));

            await expect(uploadImages(mockFiles)).rejects.toThrow('Second upload failed');
        });

        it('should handle realistic file sizes and formats', async () => {
            const files = [
                new MockFile(new Uint8Array(1024 * 100), 'small.jpg', { type: 'image/jpeg' }) as any as File,
                new MockFile(new Uint8Array(1024 * 500), 'medium.png', { type: 'image/png' }) as any as File,
                new MockFile(new Uint8Array(1024 * 1024), 'large.webp', { type: 'image/webp' }) as any as File,
            ];

            const mockResults = files.map((file, index) => ({
                secure_url: `https://example.com/${file.name}`,
                public_id: `dwellio/image_${index}`,
                height: 800 + (index * 200),
                width: 600 + (index * 150),
            }));

            mockUpload
                .mockResolvedValueOnce(mockResults[0])
                .mockResolvedValueOnce(mockResults[1])
                .mockResolvedValueOnce(mockResults[2]);

            const result = await uploadImages(files);

            expect(result).toHaveLength(3);
            mockResults.forEach((mockResult, index) => {
                expect(result[index]).toEqual({
                    secureUrl: mockResult.secure_url,
                    publicId: mockResult.public_id,
                    height: mockResult.height,
                    width: mockResult.width,
                });
            });
        });
    });
});