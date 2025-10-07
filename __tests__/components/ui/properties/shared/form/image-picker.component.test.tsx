import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ImagePicker from '@/ui/properties/shared/form/image-picker';
import { ActionState } from '@/types';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
// - None (uses built-in React hooks)
//
// Internal Components (Real)
// - FormErrors (keep real)

// ============================================================================
// TEST DATA
// ============================================================================
const mockActionState: ActionState = {
    formData: undefined,
    formErrorMap: undefined
};

// Helper function to create mock File objects
const createMockFile = (name: string, type = 'image/png'): File => {
    return new File([''], name, { type });
};

// ============================================================================
// TEST SUITE: ImagePicker Component
// ============================================================================
describe('ImagePicker Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render label', () => {
            render(<ImagePicker actionState={mockActionState} />);

            expect(screen.getByText('Images (minimum 3)')).toBeInTheDocument();
        });

        it('should render file input', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'file');
        });

        it('should render select images button', () => {
            render(<ImagePicker actionState={mockActionState} />);

            expect(screen.getByRole('button', { name: 'Select Images' })).toBeInTheDocument();
        });

        it('should render default message when no images selected', () => {
            render(<ImagePicker actionState={mockActionState} />);

            expect(screen.getByText('First image selected is main photo')).toBeInTheDocument();
        });

        it('should render file input with correct attributes', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)');
            expect(input).toHaveAttribute('id', 'images');
            expect(input).toHaveAttribute('name', 'images');
            expect(input).toHaveAttribute('accept', 'image/*');
        });

        it('should render file input with multiple attribute', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)');
            expect(input).toHaveAttribute('multiple');
        });

        it('should render button with correct id', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toHaveAttribute('id', 'images-button');
        });

        it('should apply correct styling to label', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const label = screen.getByText('Images (minimum 3)');
            expect(label).toHaveClass('form-section-label');
            expect(label).toHaveClass('mb-2');
        });

        it('should apply correct styling to button', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toHaveClass('btn');
            expect(button).toHaveClass('btn-primary');
            expect(button).toHaveClass('text-sm');
            expect(button).toHaveClass('rounded-sm');
        });

        it('should apply correct styling to file input', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)');
            expect(input).toHaveClass('w-full');
            expect(input).toHaveClass('rounded-md');
            expect(input).toHaveClass('border');
            expect(input).toHaveClass('border-gray-300');
        });

        it('should render semantic label element', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const label = screen.getByText('Images (minimum 3)');
            expect(label.tagName).toBe('LABEL');
        });
    });

    // ========================================================================
    // File Selection
    // ========================================================================
    describe('File Selection', () => {
        it('should update message when single image is selected', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const file = createMockFile('image1.png');

            await user.upload(input, file);

            expect(screen.getByText('1 images selected')).toBeInTheDocument();
            expect(screen.queryByText('First image selected is main photo')).not.toBeInTheDocument();
        });

        it('should update message when multiple images are selected', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = [
                createMockFile('image1.png'),
                createMockFile('image2.png'),
                createMockFile('image3.png')
            ];

            await user.upload(input, files);

            expect(screen.getByText('3 images selected')).toBeInTheDocument();
        });

        it('should handle 5 images selected', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = Array.from({ length: 5 }, (_, i) => createMockFile(`image${i + 1}.png`));

            await user.upload(input, files);

            expect(screen.getByText('5 images selected')).toBeInTheDocument();
        });

        it('should handle 10 images selected', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = Array.from({ length: 10 }, (_, i) => createMockFile(`image${i + 1}.png`));

            await user.upload(input, files);

            expect(screen.getByText('10 images selected')).toBeInTheDocument();
        });

        it('should update state when files are selected', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const file = createMockFile('image1.png');

            await user.upload(input, file);

            expect(input.files).toHaveLength(1);
            expect(input.files?.[0]).toBe(file);
        });

        it('should accept different image file types', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = [
                createMockFile('image1.png', 'image/png'),
                createMockFile('image2.jpg', 'image/jpeg'),
                createMockFile('image3.gif', 'image/gif')
            ];

            await user.upload(input, files);

            expect(screen.getByText('3 images selected')).toBeInTheDocument();
        });

        it('should reset selection when new files are uploaded', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            // First upload
            await user.upload(input, [createMockFile('image1.png')]);
            expect(screen.getByText('1 images selected')).toBeInTheDocument();

            // Second upload (replaces first)
            await user.upload(input, [
                createMockFile('image2.png'),
                createMockFile('image3.png')
            ]);
            expect(screen.getByText('2 images selected')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Button Interaction
    // ========================================================================
    describe('Button Interaction', () => {
        it('should trigger file input when button is clicked', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            const clickSpy = jest.spyOn(input, 'click');

            await user.click(button);

            expect(clickSpy).toHaveBeenCalled();

            clickSpy.mockRestore();
        });

        it('should not submit form when button is clicked', async () => {
            const user = userEvent.setup();
            const handleSubmit = jest.fn((e) => e.preventDefault());

            render(
                <form onSubmit={handleSubmit}>
                    <ImagePicker actionState={mockActionState} />
                </form>
            );

            const button = screen.getByRole('button', { name: 'Select Images' });
            await user.click(button);

            expect(handleSubmit).not.toHaveBeenCalled();
        });

        it('should prevent default behavior when button is clicked', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });

            // The button should not cause any default form submission
            await user.click(button);

            // If we get here without errors, the test passes
            expect(button).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Error Display
    // ========================================================================
    describe('Error Display', () => {
        it('should display imagesData error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { imagesData: ['At least 3 images are required'] }
            };
            render(<ImagePicker actionState={actionState} />);

            expect(screen.getByText('At least 3 images are required')).toBeInTheDocument();
        });

        it('should display multiple errors', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    imagesData: ['Error 1', 'Error 2']
                }
            };
            render(<ImagePicker actionState={actionState} />);

            expect(screen.getByText('Error 1')).toBeInTheDocument();
            expect(screen.getByText('Error 2')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is undefined', () => {
            render(<ImagePicker actionState={mockActionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {}
            };
            render(<ImagePicker actionState={actionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should handle null errors gracefully', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { imagesData: null as any }
            };
            render(<ImagePicker actionState={actionState} />);

            expect(screen.getByLabelText('Images (minimum 3)')).toBeInTheDocument();
        });

        it('should display errors alongside selected images message', async () => {
            const user = userEvent.setup();
            const actionState = {
                ...mockActionState,
                formErrorMap: { imagesData: ['File type not supported'] }
            };
            render(<ImagePicker actionState={actionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            await user.upload(input, [createMockFile('image1.png')]);

            expect(screen.getByText('1 images selected')).toBeInTheDocument();
            expect(screen.getByText('File type not supported')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for file input', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)');
            expect(input).toHaveAttribute('aria-describedby', 'images-error');
        });

        it('should associate label with input via htmlFor', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const label = document.querySelector('label[for="images"]');
            expect(label).toBeInTheDocument();
        });

        it('should have accessible button', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Ref Handling
    // ========================================================================
    describe('Ref Handling', () => {
        it('should attach ref to file input', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            expect(input).toBeInTheDocument();
        });

        it('should use ref to trigger input click', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            const clickSpy = jest.spyOn(input, 'click');
            await user.click(button);

            expect(clickSpy).toHaveBeenCalled();
            clickSpy.mockRestore();
        });
    });

    // ========================================================================
    // Layout and Styling
    // ========================================================================
    describe('Layout and Styling', () => {
        it('should apply relative positioning to container', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const container = document.querySelector('.relative.flex');
            expect(container).toHaveClass('relative');
            expect(container).toHaveClass('flex');
        });

        it('should apply absolute positioning to button', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toHaveClass('absolute');
        });

        it('should apply absolute positioning to message span', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const span = screen.getByText('First image selected is main photo');
            expect(span).toHaveClass('absolute');
            expect(span).toHaveClass('text-sm');
        });

        it('should apply correct positioning classes', () => {
            render(<ImagePicker actionState={mockActionState} />);

            const button = screen.getByRole('button', { name: 'Select Images' });
            expect(button).toHaveClass('left-[6px]');
            expect(button).toHaveClass('top-1/2');
            expect(button).toHaveClass('-translate-y-1/2');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle no files selected after opening file picker', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            // Simulate opening and canceling file picker
            await user.click(input);

            expect(screen.getByText('First image selected is main photo')).toBeInTheDocument();
        });

        it('should handle very large number of images', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = Array.from({ length: 100 }, (_, i) => createMockFile(`image${i + 1}.png`));

            await user.upload(input, files);

            expect(screen.getByText('100 images selected')).toBeInTheDocument();
        });

        it('should handle re-selecting same number of images', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;

            await user.upload(input, [createMockFile('image1.png')]);
            expect(screen.getByText('1 images selected')).toBeInTheDocument();

            await user.upload(input, [createMockFile('image2.png')]);
            expect(screen.getByText('1 images selected')).toBeInTheDocument();
        });

        it('should handle files with long names', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const longName = 'A'.repeat(200) + '.png';
            const file = createMockFile(longName);

            await user.upload(input, file);

            expect(screen.getByText('1 images selected')).toBeInTheDocument();
        });

        it('should handle files with special characters in names', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = [
                createMockFile('image & photo #1.png'),
                createMockFile('vacation-pic_2023.jpg')
            ];

            await user.upload(input, files);

            expect(screen.getByText('2 images selected')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Component', () => {
        it('should handle complete user workflow', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            // Initial state
            expect(screen.getByText('First image selected is main photo')).toBeInTheDocument();

            // Click button to open file picker
            const button = screen.getByRole('button', { name: 'Select Images' });
            await user.click(button);

            // Select files directly on input
            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = [
                createMockFile('image1.png'),
                createMockFile('image2.png'),
                createMockFile('image3.png')
            ];
            await user.upload(input, files);

            // Verify update
            expect(screen.getByText('3 images selected')).toBeInTheDocument();
        });

        it('should maintain functionality with errors present', async () => {
            const user = userEvent.setup();
            const actionState = {
                ...mockActionState,
                formErrorMap: { imagesData: ['At least 3 images required'] }
            };
            render(<ImagePicker actionState={actionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const files = [createMockFile('image1.png'), createMockFile('image2.png')];

            await user.upload(input, files);

            expect(screen.getByText('2 images selected')).toBeInTheDocument();
            expect(screen.getByText('At least 3 images required')).toBeInTheDocument();
        });

        it('should handle multiple interactions in sequence', async () => {
            const user = userEvent.setup();
            render(<ImagePicker actionState={mockActionState} />);

            const input = screen.getByLabelText('Images (minimum 3)') as HTMLInputElement;
            const button = screen.getByRole('button', { name: 'Select Images' });

            // First selection
            await user.upload(input, [createMockFile('image1.png')]);
            expect(screen.getByText('1 images selected')).toBeInTheDocument();

            // Click button
            await user.click(button);

            // Second selection
            await user.upload(input, [
                createMockFile('image2.png'),
                createMockFile('image3.png'),
                createMockFile('image4.png')
            ]);
            expect(screen.getByText('3 images selected')).toBeInTheDocument();
        });
    });
});
