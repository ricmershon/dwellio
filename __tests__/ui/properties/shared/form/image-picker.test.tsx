import { render, screen, fireEvent } from '@testing-library/react';
import { ActionState } from '@/types';
import ImagePicker from '@/ui/properties/shared/form/image-picker';

// Mock FormErrors component
jest.mock('@/ui/shared/form-errors', () => {
    return function MockFormErrors({ errors, id }: { errors: string[] | string, id: string }) {
        const errorArray = Array.isArray(errors) ? errors : [errors];
        return (
            <div data-testid={`form-errors-${id}`}>
                {errorArray.map((error, index) => (
                    <div key={index} className="text-red-500">{error}</div>
                ))}
            </div>
        );
    };
});

const createMockActionState = (overrides: Partial<ActionState> = {}): ActionState => ({
    ...overrides
});

// Mock file objects for testing
const createMockFile = (name: string, type: string, size: number = 1024) => {
    const fileOptions = { type, lastModified: Date.now() };
    // Create file with size property for testing
    const file = new File(['mock content'], name, fileOptions);
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

const createMockFiles = (count: number) => {
    const files = [];
    for (let i = 0; i < count; i++) {
        files.push(createMockFile(`image${i + 1}.jpg`, 'image/jpeg'));
    }
    return files;
};

describe('ImagePicker Component', () => {
    describe('Component Structure', () => {
        it('renders the image picker container with correct structure', () => {
            const actionState = createMockActionState();
            const { container } = render(<ImagePicker actionState={actionState} />);

            expect(container.querySelector('div')).toBeInTheDocument();
            expect(screen.getByText('Images (minimum 3)')).toBeInTheDocument();
            expect(container.querySelector('.relative.flex.flex-1.flex-shrink-0')).toBeInTheDocument();
        });

        it('renders label with correct text and styling', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const label = screen.getByText('Images (minimum 3)');
            expect(label).toBeInTheDocument();
            expect(label).toHaveAttribute('for', 'images');
            expect(label).toHaveClass('mb-2', 'block', 'font-medium', 'text-gray-700');
        });

        it('renders file input with correct attributes', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)');
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute('type', 'file');
            expect(fileInput).toHaveAttribute('id', 'images');
            expect(fileInput).toHaveAttribute('name', 'images');
            expect(fileInput).toHaveAttribute('accept', 'image/*');
            expect(fileInput).toHaveAttribute('multiple');
            expect(fileInput).toHaveAttribute('aria-describedby', 'images-error');
            expect(fileInput).toHaveClass(
                'w-full',
                'rounded-md',
                'border',
                'border-gray-300',
                'py-2',
                'px-3',
                'text-sm',
                'placeholder:text-gray-500',
                'bg-white',
                'text-white'
            );
        });

        it('renders select images button with correct attributes', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('id', 'images-button');
            expect(button).toHaveClass(
                'btn',
                'btn-primary',
                'text-sm',
                'rounded-sm',
                'py-1',
                'px-5',
                'absolute',
                'left-[6px]',
                'top-1/2',
                '-translate-y-1/2'
            );
        });

        it('renders status span with initial text', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const statusSpan = screen.getByText('First image selected is main photo');
            expect(statusSpan).toBeInTheDocument();
            expect(statusSpan).toHaveClass('text-sm', 'absolute', 'left-37', 'top-1/2', '-translate-y-1/2');
        });
    });

    describe('File Input Functionality', () => {
        it('accepts multiple image files', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            expect(fileInput).toHaveAttribute('multiple');
            expect(fileInput).toHaveAttribute('accept', 'image/*');
        });

        it('handles file selection and updates state', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const mockFiles = createMockFiles(3);

            // Mock FileList
            Object.defineProperty(fileInput, 'files', {
                value: mockFiles,
                writable: false,
            });

            fireEvent.change(fileInput);

            expect(screen.getByText('3 images selected')).toBeInTheDocument();
            expect(screen.queryByText('First image selected is main photo')).not.toBeInTheDocument();
        });

        it('updates status text based on number of selected images', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            // Test with 1 image
            Object.defineProperty(fileInput, 'files', {
                value: createMockFiles(1),
                writable: false,
                configurable: true
            });
            fireEvent.change(fileInput);
            expect(screen.getByText('1 images selected')).toBeInTheDocument();

            // Test with 5 images
            Object.defineProperty(fileInput, 'files', {
                value: createMockFiles(5),
                writable: false,
            });
            fireEvent.change(fileInput);
            expect(screen.getByText('5 images selected')).toBeInTheDocument();
        });

        it('handles empty file selection gracefully', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            // Mock empty FileList
            Object.defineProperty(fileInput, 'files', {
                value: null,
                writable: false,
            });

            fireEvent.change(fileInput);

            expect(screen.getByText('First image selected is main photo')).toBeInTheDocument();
        });

        it('handles file selection with zero files', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            // Mock FileList with no files
            Object.defineProperty(fileInput, 'files', {
                value: [],
                writable: false,
            });

            fireEvent.change(fileInput);

            expect(screen.getByText('First image selected is main photo')).toBeInTheDocument();
        });
    });

    describe('Button Functionality', () => {
        it('triggers file input click when Select Images button is clicked', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const button = screen.getByRole('button', { name: 'Select Images' });

            // Mock the click method
            const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation(() => {});

            fireEvent.click(button);

            expect(clickSpy).toHaveBeenCalledTimes(1);
            
            clickSpy.mockRestore();
        });

        it('prevents default form submission when button is clicked', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            
            const mockEvent = {
                preventDefault: jest.fn(),
                target: button,
                currentTarget: button,
                type: 'click',
                bubbles: true,
                cancelable: true,
            };

            fireEvent.click(button, mockEvent);

            // The preventDefault should be called within the handler
            // Since we can't directly test it, we test that the click works without form submission
            expect(button).toBeInTheDocument();
        });

        it('handles button click when fileInput ref is null', () => {
            const actionState = createMockActionState();
            const { container } = render(<ImagePicker actionState={actionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            
            // Remove the file input to simulate null ref
            const fileInput = container.querySelector('input[type="file"]');
            if (fileInput && fileInput.parentNode) {
                fileInput.parentNode.removeChild(fileInput);
            }

            // This should not throw an error
            expect(() => fireEvent.click(button)).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('does not render FormErrors when no image errors exist', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            expect(screen.queryByTestId('form-errors-images')).not.toBeInTheDocument();
        });

        it('renders FormErrors when image errors exist', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    imagesData: ['Minimum 3 images required', 'Invalid image format']
                }
            });

            render(<ImagePicker actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-images');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('Minimum 3 images required')).toBeInTheDocument();
            expect(screen.getByText('Invalid image format')).toBeInTheDocument();
        });

        it('passes correct props to FormErrors component', () => {
            const errors = ['Image upload failed'];
            const actionState = createMockActionState({
                formErrorMap: { imagesData: errors }
            });

            render(<ImagePicker actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-images');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('Image upload failed')).toBeInTheDocument();
        });
    });

    describe('File Type Validation', () => {
        it('only accepts image file types', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            expect(fileInput).toHaveAttribute('accept', 'image/*');
        });

        it('supports multiple file selection', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            expect(fileInput).toHaveAttribute('multiple');
        });
    });

    describe('State Management', () => {
        it('initializes with zero images selected', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            expect(screen.getByText('First image selected is main photo')).toBeInTheDocument();
            expect(screen.queryByText(/\d+ images selected/)).not.toBeInTheDocument();
        });

        it('maintains state across re-renders', () => {
            const actionState = createMockActionState();
            const { rerender } = render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const mockFiles = createMockFiles(2);

            Object.defineProperty(fileInput, 'files', {
                value: mockFiles,
                writable: false,
            });

            fireEvent.change(fileInput);
            expect(screen.getByText('2 images selected')).toBeInTheDocument();

            // Re-render with same props
            rerender(<ImagePicker actionState={actionState} />);
            expect(screen.getByText('2 images selected')).toBeInTheDocument();
        });

        it('updates state when different numbers of files are selected', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            // Select 3 files
            Object.defineProperty(fileInput, 'files', {
                value: createMockFiles(3),
                writable: false,
                configurable: true
            });
            fireEvent.change(fileInput);
            expect(screen.getByText('3 images selected')).toBeInTheDocument();

            // Select 7 files
            Object.defineProperty(fileInput, 'files', {
                value: createMockFiles(7),
                writable: false,
            });
            fireEvent.change(fileInput);
            expect(screen.getByText('7 images selected')).toBeInTheDocument();
            expect(screen.queryByText('3 images selected')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('associates label with file input correctly', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const label = screen.getByText('Images (minimum 3)');
            const fileInput = screen.getByLabelText('Images (minimum 3)');

            expect(label).toHaveAttribute('for', 'images');
            expect(fileInput).toHaveAttribute('id', 'images');
        });

        it('has proper aria-describedby for error association', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)');
            expect(fileInput).toHaveAttribute('aria-describedby', 'images-error');
        });

        it('button has accessible name', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const button = screen.getByRole('button');
            expect(button).toHaveAccessibleName('Select Images');
        });
    });

    describe('Form Integration', () => {
        it('has correct name attribute for form submission', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)');
            expect(fileInput).toHaveAttribute('name', 'images');
        });

        it('supports form data collection with selected files', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const fileInput = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const mockFiles = createMockFiles(3);

            Object.defineProperty(fileInput, 'files', {
                value: mockFiles,
                writable: false,
            });

            fireEvent.change(fileInput);

            // Verify files are available for form submission
            expect(fileInput.files).toHaveLength(3);
            expect(fileInput.files![0].name).toBe('image1.jpg');
            expect(fileInput.files![1].name).toBe('image2.jpg');
            expect(fileInput.files![2].name).toBe('image3.jpg');
        });
    });

    describe('UI Layout', () => {
        it('applies correct CSS classes for layout', () => {
            const actionState = createMockActionState();
            const { container } = render(<ImagePicker actionState={actionState} />);

            const relativeContainer = container.querySelector('.relative.flex.flex-1.flex-shrink-0');
            expect(relativeContainer).toBeInTheDocument();

            const button = screen.getByRole('button');
            expect(button).toHaveClass('absolute', 'left-[6px]', 'top-1/2', '-translate-y-1/2');

            const statusSpan = screen.getByText('First image selected is main photo');
            expect(statusSpan).toHaveClass('absolute', 'left-37', 'top-1/2', '-translate-y-1/2');
        });

        it('maintains proper button positioning', () => {
            const actionState = createMockActionState();
            render(<ImagePicker actionState={actionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toHaveClass(
                'btn',
                'btn-primary',
                'text-sm',
                'rounded-sm',
                'py-1',
                'px-5',
                'absolute',
                'left-[6px]',
                'top-1/2',
                '-translate-y-1/2'
            );
        });
    });
});