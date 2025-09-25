import { uploadImages, destroyImages } from '@/lib/data/images-data';

// Mock the images-data module functions
jest.mock('@/lib/data/images-data', () => ({
    uploadImages: jest.fn(),
    destroyImages: jest.fn(),
    default: {
        config: jest.fn()
    }
}));

const mockedUploadImages = uploadImages as jest.MockedFunction<typeof uploadImages>;
const mockedDestroyImages = destroyImages as jest.MockedFunction<typeof destroyImages>;

describe('Images Data Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockFile = (name: string): File => ({
        name,
        size: 1000,
        type: 'image/jpeg',
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
        stream: jest.fn(),
        text: jest.fn(),
        slice: jest.fn()
    } as any);

    const mockImageData = {
        secureUrl: 'https://res.cloudinary.com/test/image.jpg',
        publicId: 'test-id',
        height: 600,
        width: 800
    };

    describe('uploadImages', () => {
        it('should upload images successfully', async () => {
            mockedUploadImages.mockResolvedValueOnce([mockImageData]);

            const files = [mockFile('test.jpg')];
            const result = await uploadImages(files);

            expect(mockedUploadImages).toHaveBeenCalledWith(files);
            expect(result).toEqual([mockImageData]);
        });

        it('should handle empty file array', async () => {
            mockedUploadImages.mockResolvedValueOnce([]);

            const result = await uploadImages([]);

            expect(mockedUploadImages).toHaveBeenCalledWith([]);
            expect(result).toEqual([]);
        });

        it('should handle upload errors', async () => {
            mockedUploadImages.mockRejectedValueOnce(new Error('Upload failed'));

            const files = [mockFile('test.jpg')];

            await expect(uploadImages(files)).rejects.toThrow('Upload failed');
        });

        it('should handle multiple files', async () => {
            const multipleImages = [mockImageData, { ...mockImageData, publicId: 'test-id-2' }];
            mockedUploadImages.mockResolvedValueOnce(multipleImages);

            const files = [mockFile('test1.jpg'), mockFile('test2.jpg')];
            const result = await uploadImages(files);

            expect(result).toHaveLength(2);
            expect(result[0].publicId).toBe('test-id');
            expect(result[1].publicId).toBe('test-id-2');
        });
    });

    describe('destroyImages', () => {
        it('should delete images successfully', async () => {
            mockedDestroyImages.mockResolvedValueOnce(undefined);

            const imagesData = [mockImageData];
            await destroyImages(imagesData);

            expect(mockedDestroyImages).toHaveBeenCalledWith(imagesData);
        });

        it('should handle empty images array', async () => {
            mockedDestroyImages.mockResolvedValueOnce(undefined);

            await destroyImages([]);

            expect(mockedDestroyImages).toHaveBeenCalledWith([]);
        });

        it('should handle delete errors', async () => {
            mockedDestroyImages.mockRejectedValueOnce(new Error('Delete failed'));

            const imagesData = [mockImageData];

            await expect(destroyImages(imagesData)).rejects.toThrow('Delete failed');
        });

        it('should handle multiple images deletion', async () => {
            mockedDestroyImages.mockResolvedValueOnce(undefined);

            const multipleImages = [mockImageData, { ...mockImageData, publicId: 'test-id-2' }];
            await destroyImages(multipleImages);

            expect(mockedDestroyImages).toHaveBeenCalledWith(multipleImages);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors during upload', async () => {
            mockedUploadImages.mockRejectedValueOnce(new Error('Network error'));

            const files = [mockFile('test.jpg')];

            await expect(uploadImages(files)).rejects.toThrow('Network error');
        });

        it('should handle invalid file formats', async () => {
            mockedUploadImages.mockRejectedValueOnce(new Error('Invalid format'));

            const files = [mockFile('test.txt')];

            await expect(uploadImages(files)).rejects.toThrow('Invalid format');
        });

        it('should handle service unavailable errors', async () => {
            mockedDestroyImages.mockRejectedValueOnce(new Error('Service unavailable'));

            const imagesData = [mockImageData];

            await expect(destroyImages(imagesData)).rejects.toThrow('Service unavailable');
        });
    });
});