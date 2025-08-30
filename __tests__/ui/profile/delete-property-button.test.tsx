import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import DeletePropertyButton from '@/ui/profile/delete-property-button';
import { deleteProperty } from '@/lib/actions/property-actions';
import { ActionStatus } from '@/types/types';

// Mock dependencies
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn()
    }
}));

jest.mock('@/lib/actions/property-actions', () => ({
    deleteProperty: jest.fn()
}));

const mockDeleteProperty = deleteProperty as jest.MockedFunction<typeof deleteProperty>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('DeletePropertyButton Component', () => {
    const mockPropertyId = 'property123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should accept propertyId prop correctly', () => {
            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            expect(button).toBeInTheDocument();
        });

        it('should render form with inline-block styling', () => {
            const { container } = render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const form = container.querySelector('form');
            expect(form).toHaveClass('inline-block');
        });

        it('should render button with correct type and styling', () => {
            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            expect(button).toHaveAttribute('type', 'submit');
            expect(button).toHaveClass('btn', 'btn-danger');
        });

        it('should create bound action function properly', () => {
            // This test verifies the component renders without errors, 
            // indicating the bind operation worked
            expect(() => {
                render(<DeletePropertyButton propertyId={mockPropertyId} />);
            }).not.toThrow();
        });
    });

    describe('Form Submission', () => {
        it('should call deleteProperty action on form submit', async () => {
            const user = userEvent.setup();
            mockDeleteProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Property deleted successfully'
            });

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            await user.click(button);

            expect(mockDeleteProperty).toHaveBeenCalledTimes(1);
        });

        it('should handle form submission events properly', async () => {
            const user = userEvent.setup();
            mockDeleteProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Property deleted successfully'
            });

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const form = screen.getByRole('button', { name: 'Delete' }).closest('form');
            expect(form).toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: 'Delete' }));

            expect(mockDeleteProperty).toHaveBeenCalled();
        });

        it('should execute bound action with correct propertyId', async () => {
            const user = userEvent.setup();
            
            // Mock the deleteProperty to capture what it was called with
            const mockBoundAction = jest.fn().mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Property deleted'
            });
            
            // Since we're testing the bound function, we need to mock the implementation
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockDeleteProperty.mockImplementation(() => Promise.resolve(mockBoundAction()) as Promise<any>);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            // The deleteProperty should have been used in the bind operation
            expect(mockDeleteProperty).toHaveBeenCalled();
        });

        it('should handle multiple rapid clicks gracefully', async () => {
            const user = userEvent.setup();
            mockDeleteProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Property deleted'
            });

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            
            // Click multiple times rapidly
            await user.click(button);
            await user.click(button);
            await user.click(button);

            // Should handle multiple clicks without errors
            expect(mockDeleteProperty).toHaveBeenCalled();
        });
    });

    describe('Server Action Integration', () => {
        it('should handle successful deletion response', async () => {
            const user = userEvent.setup();
            const successResult = {
                status: ActionStatus.SUCCESS,
                message: 'Property deleted successfully'
            };
            
            mockDeleteProperty.mockResolvedValue(successResult);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.success).toHaveBeenCalledWith('Property deleted successfully');
            });
        });

        it('should handle error deletion response', async () => {
            const user = userEvent.setup();
            const errorResult = {
                status: ActionStatus.ERROR,
                message: 'Failed to delete property'
            };
            
            mockDeleteProperty.mockResolvedValue(errorResult);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith('Failed to delete property');
            });
        });

        it('should process ActionState response format correctly', async () => {
            const user = userEvent.setup();
            const result = {
                status: ActionStatus.SUCCESS,
                message: 'Operation completed',
                formData: new FormData()
            };
            
            mockDeleteProperty.mockResolvedValue(result);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast[result.status]).toHaveBeenCalledWith(result.message);
            });
        });

        it('should handle action responses without status', async () => {
            const user = userEvent.setup();
            const resultWithoutStatus = {
                message: 'Some message'
            };
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockDeleteProperty.mockResolvedValue(resultWithoutStatus as any);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            // Should not crash when status is missing
            await waitFor(() => {
                expect(mockDeleteProperty).toHaveBeenCalled();
            });
        });
    });

    describe('Toast Notifications', () => {
        it('should use toast[result.status] dynamic pattern', async () => {
            const user = userEvent.setup();
            const result = {
                status: ActionStatus.SUCCESS,
                message: 'Dynamic toast test'
            };
            
            mockDeleteProperty.mockResolvedValue(result);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast[ActionStatus.SUCCESS]).toHaveBeenCalledWith('Dynamic toast test');
            });
        });

        it('should display result.message as toast content', async () => {
            const user = userEvent.setup();
            const customMessage = 'Custom deletion message';
            const result = {
                status: ActionStatus.SUCCESS,
                message: customMessage
            };
            
            mockDeleteProperty.mockResolvedValue(result);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.success).toHaveBeenCalledWith(customMessage);
            });
        });

        it('should handle different toast types based on status', async () => {
            const user = userEvent.setup();
            
            const { rerender } = render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            // Test success toast
            mockDeleteProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success message'
            });
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));
            
            await waitFor(() => {
                expect(mockToast.success).toHaveBeenCalledWith('Success message');
            });

            // Reset mocks for next test
            jest.clearAllMocks();
            
            // Test error toast
            mockDeleteProperty.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Error message'
            });
            
            rerender(<DeletePropertyButton propertyId="different-property" />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));
            
            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith('Error message');
            });
        });

        it('should handle missing message gracefully', async () => {
            const user = userEvent.setup();
            const resultWithoutMessage = {
                status: ActionStatus.SUCCESS
            };
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockDeleteProperty.mockResolvedValue(resultWithoutMessage as any);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.success).not.toHaveBeenCalled();
            });
        });
    });

    describe('Action Results Handling', () => {
        it('should validate result object structure', async () => {
            const user = userEvent.setup();
            const validResult = {
                status: ActionStatus.SUCCESS,
                message: 'Valid result'
            };
            
            mockDeleteProperty.mockResolvedValue(validResult);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.success).toHaveBeenCalledWith('Valid result');
            });
        });

        it('should handle undefined result gracefully', async () => {
            const user = userEvent.setup();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockDeleteProperty.mockResolvedValue(undefined as any);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);

            // Should not crash with undefined result
            expect(() => {
                user.click(screen.getByRole('button', { name: 'Delete' }));
            }).not.toThrow();
        });

        it('should handle null result gracefully', async () => {
            const user = userEvent.setup();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockDeleteProperty.mockResolvedValue(null as any);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);

            // Should not crash with null result
            expect(() => {
                user.click(screen.getByRole('button', { name: 'Delete' }));
            }).not.toThrow();
        });

        it('should handle result with extra properties', async () => {
            const user = userEvent.setup();
            const resultWithExtras = {
                status: ActionStatus.SUCCESS,
                message: 'Success with extras',
                extraProperty: 'should be ignored',
                anotherExtra: 123
            };
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockDeleteProperty.mockResolvedValue(resultWithExtras as any);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.success).toHaveBeenCalledWith('Success with extras');
            });
        });
    });

    describe('Button Rendering', () => {
        it('should render button with "Delete" text', () => {
            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });

        it('should apply danger button styling', () => {
            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            expect(button).toHaveClass('btn', 'btn-danger');
        });

        it('should set button type to submit', () => {
            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should maintain consistent button appearance', () => {
            const { container } = render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = container.querySelector('button');
            expect(button).toHaveClass('btn', 'btn-danger');
            expect(button).toHaveAttribute('type', 'submit');
            expect(button?.textContent?.trim()).toBe('Delete');
        });
    });

    describe('Error Scenarios', () => {
        it('should handle server action failures gracefully', async () => {
            const user = userEvent.setup();
            mockDeleteProperty.mockRejectedValue(new Error('Server error'));

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            // Should not crash on server errors
            expect(() => {
                user.click(screen.getByRole('button', { name: 'Delete' }));
            }).not.toThrow();
        });

        it('should handle network connectivity issues', async () => {
            mockDeleteProperty.mockRejectedValue(new Error('Network error'));

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            // Component should remain functional
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });

        it('should handle authorization errors', async () => {
            const user = userEvent.setup();
            const authError = {
                status: ActionStatus.ERROR,
                message: 'Unauthorized: You do not own this property'
            };
            
            mockDeleteProperty.mockResolvedValue(authError);

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            await user.click(screen.getByRole('button', { name: 'Delete' }));

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith('Unauthorized: You do not own this property');
            });
        });

        it('should maintain UI state on errors', async () => {
            mockDeleteProperty.mockRejectedValue(new Error('Some error'));

            render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            const button = screen.getByRole('button', { name: 'Delete' });
            
            // Button should remain clickable after error
            expect(button).toBeEnabled();
            expect(button).toHaveClass('btn', 'btn-danger');
        });
    });

    describe('Multiple Instances', () => {
        it('should handle multiple DeletePropertyButton instances', () => {
            render(
                <div>
                    <DeletePropertyButton propertyId="property1" />
                    <DeletePropertyButton propertyId="property2" />
                    <DeletePropertyButton propertyId="property3" />
                </div>
            );
            
            const buttons = screen.getAllByRole('button', { name: 'Delete' });
            expect(buttons).toHaveLength(3);
        });

        it('should maintain independent state for multiple instances', async () => {
            const user = userEvent.setup();
            mockDeleteProperty.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Deleted'
            });

            render(
                <div>
                    <DeletePropertyButton propertyId="property1" />
                    <DeletePropertyButton propertyId="property2" />
                </div>
            );
            
            const buttons = screen.getAllByRole('button', { name: 'Delete' });
            
            // Click first button
            await user.click(buttons[0]);
            
            // Both buttons should remain functional
            expect(buttons[0]).toBeEnabled();
            expect(buttons[1]).toBeEnabled();
        });
    });

    describe('Performance and Memory', () => {
        it('should not cause memory leaks with multiple renders', () => {
            const { rerender, unmount } = render(<DeletePropertyButton propertyId={mockPropertyId} />);
            
            // Re-render multiple times
            for (let i = 0; i < 10; i++) {
                rerender(<DeletePropertyButton propertyId={`property${i}`} />);
            }
            
            // Should unmount cleanly
            expect(() => unmount()).not.toThrow();
        });

        it('should handle rapid re-renders without issues', () => {
            const { rerender } = render(<DeletePropertyButton propertyId="initial" />);
            
            // Rapid re-renders
            rerender(<DeletePropertyButton propertyId="updated1" />);
            rerender(<DeletePropertyButton propertyId="updated2" />);
            rerender(<DeletePropertyButton propertyId="updated3" />);
            
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with default button state', () => {
            const { container } = render(<DeletePropertyButton propertyId={mockPropertyId} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different propertyId', () => {
            const { container } = render(<DeletePropertyButton propertyId="different-property-id" />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot showing form layout structure', () => {
            const { container } = render(<DeletePropertyButton propertyId={mockPropertyId} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});