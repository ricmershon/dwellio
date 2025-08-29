import React from 'react';
import { render, screen, fireEvent, waitFor, createReactToastifyMock } from '@/__tests__/test-utils';

import ToggleMessageReadButton from '@/ui/messages/toggle-message-read-button';
import { ActionStatus } from '@/types/types';

// Mock external dependencies
jest.mock('@/lib/actions/message-actions', () => ({
    toggleMessageRead: jest.fn()
}));

jest.mock('@/context/global-context', () => ({
    useGlobalContext: jest.fn()
}));

jest.mock('react-toastify', () => createReactToastifyMock());

// Import mocked functions
const { toggleMessageRead } = jest.requireMock('@/lib/actions/message-actions');
const { useGlobalContext } = jest.requireMock('@/context/global-context');
const { toast } = jest.requireMock('react-toastify');

describe('ToggleMessageReadButton', () => {
    const mockSetUnreadCount = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        
        useGlobalContext.mockReturnValue({
            unreadCount: 5,
            setUnreadCount: mockSetUnreadCount,
            staticInputs: {},
            setStaticInputs: jest.fn()
        });
    });

    describe('State Management', () => {
        it('should initialize isRead state from props', () => {
            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Read');
        });

        it('should initialize with read state true', () => {
            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Unread');
        });

        it('should update local state when action succeeds', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked read.',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Read');
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(button).toHaveTextContent('Mark as Unread');
            });
        });

        it('should sync state with server response isRead flag', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked unread.',
                isRead: false
            });

            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(button).toHaveTextContent('Mark as Read');
            });
        });

        it('should maintain state consistency across re-renders', () => {
            const { rerender } = render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Read');
            
            rerender(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            expect(button).toHaveTextContent('Mark as Read');
        });
    });

    describe('User Interactions', () => {
        it('should handle form submission on button click', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-789" read={false} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalledWith('msg-789');
            });
        });

        it('should call toggleMessageRead server action', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="test-msg-id" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalledTimes(1);
                expect(toggleMessageRead).toHaveBeenCalledWith('test-msg-id');
            });
        });

        it('should pass correct messageId to action', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: false
            });

            render(<ToggleMessageReadButton messageId="unique-message-id" read={true} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalledWith('unique-message-id');
            });
        });

        it('should handle multiple sequential clicks', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            
            // First click
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalledTimes(1);
            });

            // Should allow subsequent clicks
            expect(() => fireEvent.click(button)).not.toThrow();
        });
    });

    describe('Global Context Integration', () => {
        it('should call setUnreadCount on successful toggle to read', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked read.',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(mockSetUnreadCount).toHaveBeenCalledTimes(1);
                expect(mockSetUnreadCount).toHaveBeenCalledWith(expect.any(Function));
            });

            // Test the function passed to setUnreadCount
            const updateFunction = mockSetUnreadCount.mock.calls[0][0];
            expect(updateFunction(10)).toBe(9); // Should decrement by 1
        });

        it('should increment count when marking as unread', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked unread.',
                isRead: false
            });

            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(mockSetUnreadCount).toHaveBeenCalledWith(expect.any(Function));
            });

            // Test the function passed to setUnreadCount
            const updateFunction = mockSetUnreadCount.mock.calls[0][0];
            expect(updateFunction(5)).toBe(6); // Should increment by 1
        });

        it('should decrement count when marking as read', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked read.',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-789" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(mockSetUnreadCount).toHaveBeenCalledWith(expect.any(Function));
            });

            // Test the function passed to setUnreadCount
            const updateFunction = mockSetUnreadCount.mock.calls[0][0];
            expect(updateFunction(8)).toBe(7); // Should decrement by 1
        });

        it('should not update count on action failure', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Failed to update message'
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalled();
            });

            expect(mockSetUnreadCount).not.toHaveBeenCalled();
        });
    });

    describe('Toast Notifications', () => {
        it('should not show toast on successful actions', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message updated successfully'
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalled();
            });

            expect(toast.error).not.toHaveBeenCalled();
        });

        it('should show error toast for failed actions', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Failed to toggle message status'
            });

            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to toggle message status');
            });
        });

        it('should handle ActionStatus.SUCCESS responses', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked as read',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalled();
            });

            expect(toast.error).not.toHaveBeenCalled();
        });

        it('should handle ActionStatus.ERROR responses', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Database connection failed'
            });

            render(<ToggleMessageReadButton messageId="msg-789" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Database connection failed');
            });
        });
    });

    describe('Button Text Logic', () => {
        it('should show "Mark as Read" for unread messages', () => {
            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Read');
        });

        it('should show "Mark as Unread" for read messages', () => {
            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Unread');
        });

        it('should update button text after successful toggle', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Read');
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(button).toHaveTextContent('Mark as Unread');
            });
        });

        it('should maintain text consistency with state', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: false
            });

            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            const button = screen.getByRole('button');
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(button).toHaveTextContent('Mark as Read');
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle server action failures gracefully', async () => {
            toggleMessageRead.mockRejectedValue(new Error('Network error'));

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            
            // Should not crash on error
            expect(() => fireEvent.click(button)).not.toThrow();
        });

        it('should maintain original state on error', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Update failed'
            });

            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Read');
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled();
            });

            // Button text should remain the same
            expect(button).toHaveTextContent('Mark as Read');
        });

        it('should display error messages to user', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Authorization failed'
            });

            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Authorization failed');
            });
        });

        it('should not update global context on error', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Database error'
            });

            render(<ToggleMessageReadButton messageId="msg-789" read={false} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalled();
            });

            expect(mockSetUnreadCount).not.toHaveBeenCalled();
        });
    });

    describe('Form Integration', () => {
        it('should wrap button in form element', () => {
            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const form = screen.getByRole('button').closest('form');
            expect(form).toBeInTheDocument();
        });

        it('should use server action as form action', () => {
            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            const form = screen.getByRole('button').closest('form');
            expect(form).toHaveAttribute('action');
        });

        it('should handle form submission properly', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Success',
                isRead: true
            });

            render(<ToggleMessageReadButton messageId="msg-789" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
            
            fireEvent.click(button);
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalled();
            });
        });

        it('should apply correct CSS classes', () => {
            render(<ToggleMessageReadButton messageId="msg-123" read={false} />);
            
            const form = screen.getByRole('button').closest('form');
            expect(form).toHaveClass('inline-block');
            
            const button = screen.getByRole('button');
            expect(button).toHaveClass('btn', 'btn-primary', 'mt-4', 'mr-2');
        });
    });

    describe('Component Props', () => {
        it('should accept messageId prop', () => {
            render(<ToggleMessageReadButton messageId="test-id-123" read={false} />);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should accept read boolean prop', () => {
            render(<ToggleMessageReadButton messageId="msg-456" read={true} />);
            
            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Mark as Unread');
        });

        it('should handle different messageId formats', async () => {
            const testIds = ['msg-123', 'message_456', '507f1f77bcf86cd799439011'];
            
            for (const messageId of testIds) {
                toggleMessageRead.mockResolvedValue({
                    status: ActionStatus.SUCCESS,
                    message: 'Success',
                    isRead: true
                });

                const { unmount } = render(<ToggleMessageReadButton messageId={messageId} read={false} />);
                
                fireEvent.click(screen.getByRole('button'));
                
                await waitFor(() => {
                    expect(toggleMessageRead).toHaveBeenCalledWith(messageId);
                });

                // Clean up for next iteration
                unmount();
                jest.clearAllMocks();
            }
        });
    });
});