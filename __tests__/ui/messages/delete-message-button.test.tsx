import React from 'react';
import { render, screen, fireEvent, waitFor, createReactToastifyMock } from '@/__tests__/test-utils';

import DeleteMessageButton from '@/ui/messages/delete-message-button';
import { ActionStatus } from '@/types';

// Mock external dependencies
jest.mock('@/lib/actions/message-actions', () => ({
    deleteMessage: jest.fn()
}));

jest.mock('@/context/global-context', () => ({
    useGlobalContext: jest.fn()
}));

jest.mock('react-toastify', () => createReactToastifyMock());

// Import mocked functions
const { deleteMessage } = jest.requireMock('@/lib/actions/message-actions');
const { useGlobalContext } = jest.requireMock('@/context/global-context');
const { toast } = jest.requireMock('react-toastify');

// Add ActionStatus values to toast mock
toast[ActionStatus.SUCCESS] = jest.fn();
toast[ActionStatus.ERROR] = jest.fn();

describe('DeleteMessageButton', () => {
    const mockSetUnreadCount = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        useGlobalContext.mockReturnValue({
            unreadCount: 3,
            setUnreadCount: mockSetUnreadCount,
            staticInputs: {},
            setStaticInputs: jest.fn()
        });
    });

    describe('Form Submission', () => {
        it('should call deleteMessage server action', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted successfully'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalledWith('msg-123');
            });
        });

        it('should pass correct messageId to action', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Deleted'
            });

            render(<DeleteMessageButton messageId="unique-message-id" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalledWith('unique-message-id');
            });
        });

        it('should handle form submission events', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted'
            });

            render(<DeleteMessageButton messageId="msg-456" />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });
        });

        it('should use inline-block form styling', () => {
            render(<DeleteMessageButton messageId="msg-789" />);
            
            const form = screen.getByRole('button').closest('form');
            expect(form).toHaveClass('inline-block');
        });
    });

    describe('Global Context Integration', () => {
        it('should call setUnreadCount on successful deletion', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted successfully'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(mockSetUnreadCount).toHaveBeenCalledTimes(1);
                expect(mockSetUnreadCount).toHaveBeenCalledWith(expect.any(Function));
            });

            // Test the function passed to setUnreadCount
            const updateFunction = mockSetUnreadCount.mock.calls[0][0];
            expect(updateFunction(5)).toBe(4); // Should decrement by 1
        });

        it('should decrement unread count by 1', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted'
            });

            render(<DeleteMessageButton messageId="msg-456" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(mockSetUnreadCount).toHaveBeenCalledWith(expect.any(Function));
            });

            // Test the decrement function
            const decrementFunction = mockSetUnreadCount.mock.calls[0][0];
            expect(decrementFunction(10)).toBe(9);
            expect(decrementFunction(1)).toBe(0);
            expect(decrementFunction(0)).toBe(-1); // Edge case
        });

        it('should not update count on action failure', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Failed to delete message'
            });

            render(<DeleteMessageButton messageId="msg-789" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });

            expect(mockSetUnreadCount).not.toHaveBeenCalled();
        });

        it('should handle context updates properly', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Deletion successful'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(mockSetUnreadCount).toHaveBeenCalledTimes(1);
            });

            // Verify it's called with a function, not a direct value
            expect(typeof mockSetUnreadCount.mock.calls[0][0]).toBe('function');
        });
    });

    describe('Toast Notifications', () => {
        it('should show dynamic toast based on result status', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted successfully'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.SUCCESS]).toHaveBeenCalledWith('Message deleted successfully');
            });
        });

        it('should use toast[result.status] pattern', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Authorization failed'
            });

            render(<DeleteMessageButton messageId="msg-456" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.ERROR]).toHaveBeenCalledWith('Authorization failed');
            });
        });

        it('should display success messages for deletions', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message has been deleted'
            });

            render(<DeleteMessageButton messageId="msg-789" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.SUCCESS]).toHaveBeenCalledWith('Message has been deleted');
            });
        });

        it('should display error messages for failures', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Database connection failed'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.ERROR]).toHaveBeenCalledWith('Database connection failed');
            });
        });
    });

    describe('Action Integration', () => {
        it('should handle ActionStatus.SUCCESS responses', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Successfully deleted'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.SUCCESS]).toHaveBeenCalled();
                expect(mockSetUnreadCount).toHaveBeenCalled();
            });
        });

        it('should handle ActionStatus.ERROR responses', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Deletion failed'
            });

            render(<DeleteMessageButton messageId="msg-456" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.ERROR]).toHaveBeenCalledWith('Deletion failed');
                expect(mockSetUnreadCount).not.toHaveBeenCalled();
            });
        });

        it('should process result.message correctly', async () => {
            const testMessage = 'Custom deletion message';
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: testMessage
            });

            render(<DeleteMessageButton messageId="msg-789" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.SUCCESS]).toHaveBeenCalledWith(testMessage);
            });
        });

        it('should validate result.status existence', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message exists'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });

            // Should only show toast and update context when both message and status exist
            expect(toast[ActionStatus.SUCCESS]).toHaveBeenCalled();
            expect(mockSetUnreadCount).toHaveBeenCalled();
        });

        it('should handle missing message or status gracefully', async () => {
            deleteMessage.mockResolvedValue({
                status: undefined,
                message: undefined
            });

            render(<DeleteMessageButton messageId="msg-456" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });

            // Should not show toast or update context when message/status are missing
            expect(toast[ActionStatus.SUCCESS]).not.toHaveBeenCalled();
            expect(toast[ActionStatus.ERROR]).not.toHaveBeenCalled();
            expect(mockSetUnreadCount).not.toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle authorization errors (not owner)', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Not authorized to change message.'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.ERROR]).toHaveBeenCalledWith('Not authorized to change message.');
            });
        });

        it('should handle database errors gracefully', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Database error occurred'
            });

            render(<DeleteMessageButton messageId="msg-456" />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast[ActionStatus.ERROR]).toHaveBeenCalledWith('Database error occurred');
            });
        });

        it('should handle network failures', async () => {
            deleteMessage.mockRejectedValue(new Error('Network error'));

            render(<DeleteMessageButton messageId="msg-789" />);
            
            // Should not crash on network error
            expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
        });

        it('should maintain UI state on errors', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Failed to delete'
            });

            render(<DeleteMessageButton messageId="msg-123" />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Delete');
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(toast[ActionStatus.ERROR]).toHaveBeenCalled();
            });

            // Button should still be present and functional
            expect(button).toHaveTextContent('Delete');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Button Styling', () => {
        it('should apply danger button styling', () => {
            render(<DeleteMessageButton messageId="msg-123" />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveClass('btn', 'btn-danger');
        });

        it('should display "Delete" text', () => {
            render(<DeleteMessageButton messageId="msg-456" />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Delete');
        });

        it('should maintain consistent button appearance', () => {
            render(<DeleteMessageButton messageId="msg-789" />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveClass('btn', 'btn-danger');
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should handle hover and focus states', () => {
            render(<DeleteMessageButton messageId="msg-123" />);
            
            const button = screen.getByRole('button');
            
            // Should be focusable
            button.focus();
            expect(document.activeElement).toBe(button);
            
            // Should be clickable
            expect(button).not.toBeDisabled();
        });
    });

    describe('Component Props', () => {
        it('should accept messageId prop', () => {
            render(<DeleteMessageButton messageId="test-message-id" />);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('Delete');
        });

        it('should handle different messageId formats', async () => {
            const testIds = ['msg-123', 'message_456', '507f1f77bcf86cd799439011'];
            
            for (const messageId of testIds) {
                deleteMessage.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    message: 'Deleted'
                });

                const { unmount } = render(<DeleteMessageButton messageId={messageId} />);
                
                fireEvent.click(screen.getByRole('button'));
                
                await waitFor(() => {
                    expect(deleteMessage).toHaveBeenCalledWith(messageId);
                });

                // Clean up for next iteration
                unmount();
                jest.clearAllMocks();
            }
        });

        it('should render consistently with same props', () => {
            const { rerender } = render(<DeleteMessageButton messageId="msg-123" />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Delete');
            
            rerender(<DeleteMessageButton messageId="msg-123" />);
            
            expect(button).toHaveTextContent('Delete');
            expect(button).toHaveClass('btn', 'btn-danger');
        });
    });

    describe('Form Integration', () => {
        it('should wrap button in form element', () => {
            render(<DeleteMessageButton messageId="msg-123" />);
            
            const form = screen.getByRole('button').closest('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveClass('inline-block');
        });

        it('should use server action as form action', () => {
            render(<DeleteMessageButton messageId="msg-456" />);
            
            const form = screen.getByRole('button').closest('form');
            expect(form).toHaveAttribute('action');
        });

        it('should handle form submission properly', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success'
            });

            render(<DeleteMessageButton messageId="msg-789" />);
            
            const button = screen.getByRole('button');
            const form = button.closest('form');
            
            expect(button).toHaveAttribute('type', 'submit');
            expect(form).toBeInTheDocument();
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for delete button styling', () => {
            const { container } = render(<DeleteMessageButton messageId="msg-123" />);
            expect(container.firstChild).toMatchSnapshot('delete-button-styling');
        });

        it('should match snapshot for different message ID', () => {
            const { container } = render(<DeleteMessageButton messageId="different-msg-456" />);
            expect(container.firstChild).toMatchSnapshot('different-message-id');
        });

        it('should match snapshot for form structure', () => {
            const { container } = render(<DeleteMessageButton messageId="form-structure-test" />);
            expect(container.firstChild).toMatchSnapshot('form-structure');
        });

        it('should match snapshot for danger button appearance', () => {
            const { container } = render(<DeleteMessageButton messageId="danger-btn-test" />);
            expect(container.firstChild).toMatchSnapshot('danger-button-appearance');
        });
    });
});