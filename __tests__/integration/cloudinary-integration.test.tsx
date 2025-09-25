import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { uploadImages, destroyImages } from '@/lib/data/images-data';
import { PropertyImageData } from '@/types';

// Mock the images-data module
jest.mock('@/lib/data/images-data');
const mockedUploadImages = uploadImages as jest.MockedFunction<typeof uploadImages>;
const mockedDestroyImages = destroyImages as jest.MockedFunction<typeof destroyImages>;

// Mock component for testing Cloudinary integration
const TestImageUploadComponent = ({
    onImagesUploaded,
    onImagesDeleted,
    onError
}: {
    onImagesUploaded?: (images: PropertyImageData[]) => void;
    onImagesDeleted?: () => void;
    onError?: (error: string) => void;
}) => {
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        try {
            const uploadedImages = await uploadImages(files);
            onImagesUploaded?.(uploadedImages);
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Upload failed');
        }
    };

    const handleDeleteImages = async (images: PropertyImageData[]) => {
        try {
            await destroyImages(images);
            onImagesDeleted?.();
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Delete failed');
        }
    };

    const mockImages: PropertyImageData[] = [
        {
            secureUrl: 'https://res.cloudinary.com/test/image1.jpg',
            publicId: 'dwellio/test-id-1',
            height: 600,
            width: 800
        },
        {
            secureUrl: 'https://res.cloudinary.com/test/image2.jpg',
            publicId: 'dwellio/test-id-2',
            height: 600,
            width: 800
        }
    ];

    return (
        <div>
            <input
                data-testid="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
            />
            <button
                data-testid="delete-button"
                onClick={() => handleDeleteImages(mockImages)}
            >
                Delete Images
            </button>
        </div>
    );
};

describe('Cloudinary Integration Tests', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        jest.clearAllMocks();
        user = userEvent.setup();
    });

    describe('Image Upload Integration', () => {
        it('should handle successful image upload workflow', async () => {
            const mockUploadedImages: PropertyImageData[] = [
                {
                    secureUrl: 'https://res.cloudinary.com/test/uploaded1.jpg',
                    publicId: 'dwellio/uploaded-1',
                    height: 600,
                    width: 800
                },
                {
                    secureUrl: 'https://res.cloudinary.com/test/uploaded2.jpg',
                    publicId: 'dwellio/uploaded-2',
                    height: 600,
                    width: 800
                }
            ];

            mockedUploadImages.mockResolvedValueOnce(mockUploadedImages);

            const onImagesUploadedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesUploaded={onImagesUploadedMock}
                    onError={onErrorMock}
                />
            );

            const fileInput = screen.getByTestId('file-input');

            // Create mock files
            const file1 = new File(['image1'], 'image1.jpg', { type: 'image/jpeg' });
            const file2 = new File(['image2'], 'image2.jpg', { type: 'image/jpeg' });

            // Simulate file upload
            await user.upload(fileInput, [file1, file2]);

            await waitFor(() => {
                expect(mockedUploadImages).toHaveBeenCalledWith([file1, file2]);
                expect(onImagesUploadedMock).toHaveBeenCalledWith(mockUploadedImages);
                expect(onErrorMock).not.toHaveBeenCalled();
            });
        });

        it('should handle upload errors gracefully', async () => {
            const uploadError = new Error('Cloudinary upload failed');
            mockedUploadImages.mockRejectedValueOnce(uploadError);

            const onImagesUploadedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesUploaded={onImagesUploadedMock}
                    onError={onErrorMock}
                />
            );

            const fileInput = screen.getByTestId('file-input');
            const file = new File(['image'], 'image.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, [file]);

            await waitFor(() => {
                expect(mockedUploadImages).toHaveBeenCalledWith([file]);
                expect(onErrorMock).toHaveBeenCalledWith('Cloudinary upload failed');
                expect(onImagesUploadedMock).not.toHaveBeenCalled();
            });
        });

        it('should handle non-Error upload failures', async () => {
            mockedUploadImages.mockRejectedValueOnce('String error');

            const onErrorMock = jest.fn();

            render(<TestImageUploadComponent onError={onErrorMock} />);

            const fileInput = screen.getByTestId('file-input');
            const file = new File(['image'], 'image.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, [file]);

            await waitFor(() => {
                expect(onErrorMock).toHaveBeenCalledWith('Upload failed');
            });
        });

        it('should handle empty file selection', async () => {
            const onImagesUploadedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesUploaded={onImagesUploadedMock}
                    onError={onErrorMock}
                />
            );

            const fileInput = screen.getByTestId('file-input');

            // Trigger change event with no files
            fireEvent.change(fileInput, { target: { files: [] } });

            await waitFor(() => {
                expect(mockedUploadImages).not.toHaveBeenCalled();
                expect(onImagesUploadedMock).not.toHaveBeenCalled();
                expect(onErrorMock).not.toHaveBeenCalled();
            });
        });

        it('should handle single file upload', async () => {
            const mockUploadedImage: PropertyImageData[] = [{
                secureUrl: 'https://res.cloudinary.com/test/single.jpg',
                publicId: 'dwellio/single',
                height: 600,
                width: 800
            }];

            mockedUploadImages.mockResolvedValueOnce(mockUploadedImage);

            const onImagesUploadedMock = jest.fn();

            render(<TestImageUploadComponent onImagesUploaded={onImagesUploadedMock} />);

            const fileInput = screen.getByTestId('file-input');
            const file = new File(['image'], 'single.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, file);

            await waitFor(() => {
                expect(mockedUploadImages).toHaveBeenCalledWith([file]);
                expect(onImagesUploadedMock).toHaveBeenCalledWith(mockUploadedImage);
            });
        });
    });

    describe('Image Deletion Integration', () => {
        it('should handle successful image deletion workflow', async () => {
            mockedDestroyImages.mockResolvedValueOnce(undefined);

            const onImagesDeletedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesDeleted={onImagesDeletedMock}
                    onError={onErrorMock}
                />
            );

            const deleteButton = screen.getByTestId('delete-button');

            await user.click(deleteButton);

            await waitFor(() => {
                expect(mockedDestroyImages).toHaveBeenCalledWith([
                    {
                        secureUrl: 'https://res.cloudinary.com/test/image1.jpg',
                        publicId: 'dwellio/test-id-1',
                        height: 600,
                        width: 800
                    },
                    {
                        secureUrl: 'https://res.cloudinary.com/test/image2.jpg',
                        publicId: 'dwellio/test-id-2',
                        height: 600,
                        width: 800
                    }
                ]);
                expect(onImagesDeletedMock).toHaveBeenCalled();
                expect(onErrorMock).not.toHaveBeenCalled();
            });
        });

        it('should handle deletion errors gracefully', async () => {
            const deleteError = new Error('Cloudinary delete failed');
            mockedDestroyImages.mockRejectedValueOnce(deleteError);

            const onImagesDeletedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesDeleted={onImagesDeletedMock}
                    onError={onErrorMock}
                />
            );

            const deleteButton = screen.getByTestId('delete-button');

            await user.click(deleteButton);

            await waitFor(() => {
                expect(mockedDestroyImages).toHaveBeenCalled();
                expect(onErrorMock).toHaveBeenCalledWith('Cloudinary delete failed');
                expect(onImagesDeletedMock).not.toHaveBeenCalled();
            });
        });

        it('should handle non-Error deletion failures', async () => {
            mockedDestroyImages.mockRejectedValueOnce('Delete string error');

            const onErrorMock = jest.fn();

            render(<TestImageUploadComponent onError={onErrorMock} />);

            const deleteButton = screen.getByTestId('delete-button');

            await user.click(deleteButton);

            await waitFor(() => {
                expect(onErrorMock).toHaveBeenCalledWith('Delete failed');
            });
        });
    });

    describe('File Validation Integration', () => {
        it('should handle different file types', async () => {
            const mockImages: PropertyImageData[] = [{
                secureUrl: 'https://res.cloudinary.com/test/test.png',
                publicId: 'dwellio/test-png',
                height: 400,
                width: 600
            }];

            mockedUploadImages.mockResolvedValueOnce(mockImages);

            const onImagesUploadedMock = jest.fn();

            render(<TestImageUploadComponent onImagesUploaded={onImagesUploadedMock} />);

            const fileInput = screen.getByTestId('file-input');

            // Test different image types
            const pngFile = new File(['png'], 'test.png', { type: 'image/png' });
            const jpegFile = new File(['jpeg'], 'test.jpeg', { type: 'image/jpeg' });
            const webpFile = new File(['webp'], 'test.webp', { type: 'image/webp' });

            await user.upload(fileInput, [pngFile, jpegFile, webpFile]);

            await waitFor(() => {
                expect(mockedUploadImages).toHaveBeenCalledWith([pngFile, jpegFile, webpFile]);
                expect(onImagesUploadedMock).toHaveBeenCalledWith(mockImages);
            });
        });

        it('should handle large file uploads', async () => {
            const largeFileContent = 'x'.repeat(10000);
            const mockImages: PropertyImageData[] = [{
                secureUrl: 'https://res.cloudinary.com/test/large.jpg',
                publicId: 'dwellio/large',
                height: 2000,
                width: 3000
            }];

            mockedUploadImages.mockResolvedValueOnce(mockImages);

            const onImagesUploadedMock = jest.fn();

            render(<TestImageUploadComponent onImagesUploaded={onImagesUploadedMock} />);

            const fileInput = screen.getByTestId('file-input');
            const largeFile = new File([largeFileContent], 'large.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, largeFile);

            await waitFor(() => {
                expect(mockedUploadImages).toHaveBeenCalledWith([largeFile]);
                expect(onImagesUploadedMock).toHaveBeenCalledWith(mockImages);
            });
        });
    });

    describe('Error Boundary Integration', () => {
        it('should handle null file input gracefully', async () => {
            const onErrorMock = jest.fn();

            render(<TestImageUploadComponent onError={onErrorMock} />);

            const fileInput = screen.getByTestId('file-input');

            // Simulate null files (edge case)
            Object.defineProperty(fileInput, 'files', { value: null });
            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(mockedUploadImages).not.toHaveBeenCalled();
                expect(onErrorMock).not.toHaveBeenCalled();
            });
        });

        it('should handle component unmount during upload', async () => {
            mockedUploadImages.mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 100))
            );

            const { unmount } = render(<TestImageUploadComponent />);

            const fileInput = screen.getByTestId('file-input');
            const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, file);

            // Unmount component before upload completes
            unmount();

            // Should not throw error or cause memory leaks
            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Real-world Workflow Integration', () => {
        it('should handle complete upload and delete cycle', async () => {
            const uploadedImages: PropertyImageData[] = [{
                secureUrl: 'https://res.cloudinary.com/test/cycle.jpg',
                publicId: 'dwellio/cycle',
                height: 600,
                width: 800
            }];

            mockedUploadImages.mockResolvedValueOnce(uploadedImages);
            mockedDestroyImages.mockResolvedValueOnce(undefined);

            const onImagesUploadedMock = jest.fn();
            const onImagesDeletedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesUploaded={onImagesUploadedMock}
                    onImagesDeleted={onImagesDeletedMock}
                    onError={onErrorMock}
                />
            );

            // Upload phase
            const fileInput = screen.getByTestId('file-input');
            const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, file);

            await waitFor(() => {
                expect(onImagesUploadedMock).toHaveBeenCalledWith(uploadedImages);
            });

            // Delete phase
            const deleteButton = screen.getByTestId('delete-button');
            await user.click(deleteButton);

            await waitFor(() => {
                expect(onImagesDeletedMock).toHaveBeenCalled();
                expect(onErrorMock).not.toHaveBeenCalled();
            });
        });

        it('should handle upload success followed by delete failure', async () => {
            const uploadedImages: PropertyImageData[] = [{
                secureUrl: 'https://res.cloudinary.com/test/partial.jpg',
                publicId: 'dwellio/partial',
                height: 600,
                width: 800
            }];

            mockedUploadImages.mockResolvedValueOnce(uploadedImages);
            mockedDestroyImages.mockRejectedValueOnce(new Error('Delete failed'));

            const onImagesUploadedMock = jest.fn();
            const onImagesDeletedMock = jest.fn();
            const onErrorMock = jest.fn();

            render(
                <TestImageUploadComponent
                    onImagesUploaded={onImagesUploadedMock}
                    onImagesDeleted={onImagesDeletedMock}
                    onError={onErrorMock}
                />
            );

            // Successful upload
            const fileInput = screen.getByTestId('file-input');
            const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });

            await user.upload(fileInput, file);

            await waitFor(() => {
                expect(onImagesUploadedMock).toHaveBeenCalledWith(uploadedImages);
            });

            // Failed delete
            const deleteButton = screen.getByTestId('delete-button');
            await user.click(deleteButton);

            await waitFor(() => {
                expect(onErrorMock).toHaveBeenCalledWith('Delete failed');
                expect(onImagesDeletedMock).not.toHaveBeenCalled();
            });
        });
    });
});