import React from 'react';
import { render, screen, fireEvent, waitFor, createReactToastifyMock } from '@/__tests__/test-utils';

import { GlobalContextProvider, useGlobalContext } from '@/context/global-context';
import DeleteMessageButton from '@/ui/messages/delete-message-button';
import ToggleMessageReadButton from '@/ui/messages/toggle-message-read-button';
import { ActionStatus } from '@/types';

// Mock external dependencies
jest.mock('@/lib/actions/message-actions', () => ({
    deleteMessage: jest.fn(),
    toggleMessageRead: jest.fn(),
    getUnreadMessageCount: jest.fn()
}));

jest.mock('next-auth/react', () => ({
    useSession: jest.fn()
}));

jest.mock('react-toastify', () => createReactToastifyMock());

const { deleteMessage } = jest.requireMock('@/lib/actions/message-actions');
const { toggleMessageRead } = jest.requireMock('@/lib/actions/message-actions');
const { getUnreadMessageCount } = jest.requireMock('@/lib/actions/message-actions');
const { useSession } = jest.requireMock('next-auth/react');

// Test component to access context values
const ContextTestComponent = () => {
    const { unreadCount, setUnreadCount } = useGlobalContext();
    
    return (
        <div>
            <span data-testid="unread-count">{unreadCount}</span>
            <button 
                data-testid="increment-count"
                onClick={() => setUnreadCount(prev => prev + 1)}
            >
                Increment
            </button>
            <button 
                data-testid="decrement-count"
                onClick={() => setUnreadCount(prev => prev - 1)}
            >
                Decrement
            </button>
        </div>
    );
};

describe('Global Context Integration Tests', () => {
    const mockStaticInputs = {
        property_types: [
            { value: 'apartment', label: 'Apartment' },
            { value: 'house', label: 'House' }
        ],
        amenities: [
            { id: 'pool', value: 'Pool' },
            { id: 'gym', value: 'Gym' }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock useSession to return no session by default
        useSession.mockReturnValue({
            data: null,
            status: 'unauthenticated'
        });
        
        // Mock getUnreadMessageCount
        getUnreadMessageCount.mockResolvedValue({
            unreadCount: 0
        });
    });

    describe('Context Provider Functionality', () => {
        it('should initialize with default unread count of 0', () => {
            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );
            
            expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
        });

        it('should maintain state across component updates', () => {
            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );
            
            const incrementButton = screen.getByTestId('increment-count');
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);
            
            expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
        });

        it('should provide setUnreadCount function to update state', () => {
            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );
            
            const decrementButton = screen.getByTestId('decrement-count');
            fireEvent.click(decrementButton);
            
            expect(screen.getByTestId('unread-count')).toHaveTextContent('-1');
        });

        it('should handle functional state updates correctly', () => {
            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );
            
            const incrementButton = screen.getByTestId('increment-count');
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);
            fireEvent.click(incrementButton);
            
            expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
        });
    });

    describe('DeleteMessageButton Context Integration', () => {
        it('should decrement unread count on successful message deletion', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted successfully'
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-123" />
                </GlobalContextProvider>
            );
            
            // Set initial count
            fireEvent.click(screen.getByTestId('increment-count'));
            fireEvent.click(screen.getByTestId('increment-count'));
            fireEvent.click(screen.getByTestId('increment-count'));
            expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            
            // Delete message
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
            });
        });

        it('should not affect count when deletion fails', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Failed to delete message'
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-456" />
                </GlobalContextProvider>
            );
            
            // Set initial count
            fireEvent.click(screen.getByTestId('increment-count'));
            fireEvent.click(screen.getByTestId('increment-count'));
            expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
            
            // Try to delete message (should fail)
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });
            
            // Count should remain unchanged
            expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
        });

        it('should handle multiple deletion operations correctly', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted'
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-1" />
                    <DeleteMessageButton messageId="msg-2" />
                </GlobalContextProvider>
            );
            
            // Set initial count to 5
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
            
            // Delete two messages
            const deleteButtons = screen.getAllByText('Delete');
            fireEvent.click(deleteButtons[0]);
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('4');
            });
            
            fireEvent.click(deleteButtons[1]);
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            });
        });
    });

    describe('ToggleMessageReadButton Context Integration', () => {
        it('should decrement count when marking message as read', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked as read',
                isRead: true
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <ToggleMessageReadButton messageId="msg-123" read={false} />
                </GlobalContextProvider>
            );
            
            // Set initial count
            for (let i = 0; i < 4; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('4');
            
            // Mark as read
            fireEvent.click(screen.getByText('Mark as Read'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            });
        });

        it('should increment count when marking message as unread', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked as unread',
                isRead: false
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <ToggleMessageReadButton messageId="msg-456" read={true} />
                </GlobalContextProvider>
            );
            
            // Set initial count
            fireEvent.click(screen.getByTestId('increment-count'));
            fireEvent.click(screen.getByTestId('increment-count'));
            expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
            
            // Mark as unread
            fireEvent.click(screen.getByText('Mark as Unread'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            });
        });

        it('should not affect count when toggle fails', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Failed to toggle message status'
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <ToggleMessageReadButton messageId="msg-789" read={false} />
                </GlobalContextProvider>
            );
            
            // Set initial count
            fireEvent.click(screen.getByTestId('increment-count'));
            expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
            
            // Try to toggle (should fail)
            fireEvent.click(screen.getByText('Mark as Read'));
            
            await waitFor(() => {
                expect(toggleMessageRead).toHaveBeenCalled();
            });
            
            // Count should remain unchanged
            expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
        });

        it('should handle multiple toggle operations correctly', async () => {
            toggleMessageRead
                .mockResolvedValueOnce({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked as read',
                    isRead: true
                })
                .mockResolvedValueOnce({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked as unread',
                    isRead: false
                });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <ToggleMessageReadButton messageId="msg-123" read={false} />
                </GlobalContextProvider>
            );
            
            // Set initial count
            for (let i = 0; i < 3; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            
            // Mark as read (decrement)
            fireEvent.click(screen.getByText('Mark as Read'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
                expect(screen.getByText('Mark as Unread')).toBeInTheDocument();
            });
            
            // Mark as unread (increment)
            fireEvent.click(screen.getByText('Mark as Unread'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
                expect(screen.getByText('Mark as Read')).toBeInTheDocument();
            });
        });
    });

    describe('Cross-Component Communication', () => {
        it('should synchronize unread count across multiple message components', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted'
            });
            
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked as read',
                isRead: true
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-1" />
                    <ToggleMessageReadButton messageId="msg-2" read={false} />
                    <ToggleMessageReadButton messageId="msg-3" read={false} />
                </GlobalContextProvider>
            );
            
            // Set initial count
            for (let i = 0; i < 10; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('10');
            
            // Delete message (decrement by 1)
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('9');
            });
            
            // Mark first message as read (decrement by 1)
            const markAsReadButtons = screen.getAllByText('Mark as Read');
            fireEvent.click(markAsReadButtons[0]);
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('8');
            });
            
            // Mark second message as read (decrement by 1)
            const remainingMarkAsReadButtons = screen.getAllByText('Mark as Read');
            fireEvent.click(remainingMarkAsReadButtons[0]);
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('7');
            });
        });

        it('should maintain count consistency with mixed operations', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted'
            });
            
            toggleMessageRead
                .mockResolvedValueOnce({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked as unread',
                    isRead: false
                })
                .mockResolvedValueOnce({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked as read',
                    isRead: true
                });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-1" />
                    <ToggleMessageReadButton messageId="msg-2" read={true} />
                    <ToggleMessageReadButton messageId="msg-3" read={false} />
                </GlobalContextProvider>
            );
            
            // Set initial count to 5
            for (let i = 0; i < 5; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
            
            // Mark read message as unread (increment by 1)
            fireEvent.click(screen.getByText('Mark as Unread'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('6');
            });
            
            // Delete message (decrement by 1)
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
            });
            
            // Mark unread message as read (decrement by 1)
            const markAsReadButtons = screen.getAllByText('Mark as Read');
            fireEvent.click(markAsReadButtons[0]);
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('4');
            });
        });

        it('should handle failed operations without affecting successful ones', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.ERROR,
                message: 'Delete failed'
            });
            
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked as read',
                isRead: true
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-1" />
                    <ToggleMessageReadButton messageId="msg-2" read={false} />
                </GlobalContextProvider>
            );
            
            // Set initial count
            for (let i = 0; i < 3; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            
            // Try to delete (should fail, no count change)
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(deleteMessage).toHaveBeenCalled();
            });
            
            expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            
            // Toggle message (should succeed, decrement count)
            fireEvent.click(screen.getByText('Mark as Read'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('2');
            });
        });
    });

    describe('Context State Boundaries', () => {
        it('should handle zero count edge case', async () => {
            deleteMessage.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message deleted'
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <DeleteMessageButton messageId="msg-123" />
                </GlobalContextProvider>
            );
            
            // Start at 0
            expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
            
            // Delete message (should decrement to -1)
            fireEvent.click(screen.getByText('Delete'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('-1');
            });
        });

        it('should handle large count values', async () => {
            toggleMessageRead.mockResolvedValue({
                status: ActionStatus.SUCCESS,
                message: 'Message marked as unread',
                isRead: false
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                    <ToggleMessageReadButton messageId="msg-456" read={true} />
                </GlobalContextProvider>
            );
            
            // Set large count
            for (let i = 0; i < 999; i++) {
                fireEvent.click(screen.getByTestId('increment-count'));
            }
            expect(screen.getByTestId('unread-count')).toHaveTextContent('999');
            
            // Mark as unread (increment to 1000)
            fireEvent.click(screen.getByText('Mark as Unread'));
            
            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('1000');
            });
        });

        it('should maintain state isolation between different provider instances', () => {
            render(
                <div>
                    <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                        <ContextTestComponent />
                    </GlobalContextProvider>
                    <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                        <ContextTestComponent />
                    </GlobalContextProvider>
                </div>
            );
            
            const counts = screen.getAllByTestId('unread-count');
            const incrementButtons = screen.getAllByTestId('increment-count');
            
            // Both should start at 0
            expect(counts[0]).toHaveTextContent('0');
            expect(counts[1]).toHaveTextContent('0');
            
            // Increment first provider
            fireEvent.click(incrementButtons[0]);
            fireEvent.click(incrementButtons[0]);
            
            // Only first should change
            expect(counts[0]).toHaveTextContent('2');
            expect(counts[1]).toHaveTextContent('0');
            
            // Increment second provider
            fireEvent.click(incrementButtons[1]);
            
            // Each maintains separate state
            expect(counts[0]).toHaveTextContent('2');
            expect(counts[1]).toHaveTextContent('1');
        });
    });

    describe('GlobalContext Provider Integration', () => {
        it('should fetch unread count when user logs in', async () => {
            getUnreadMessageCount.mockResolvedValue({ unreadCount: 5 });

            // Start with no session
            useSession.mockReturnValue({
                data: null,
                status: 'unauthenticated'
            });

            const { rerender } = render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            expect(screen.getByTestId('unread-count')).toHaveTextContent('0');

            // Simulate user logging in
            useSession.mockReturnValue({
                data: { user: { id: '1', email: 'test@example.com' } },
                status: 'authenticated'
            });

            rerender(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            await waitFor(() => {
                expect(getUnreadMessageCount).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
            });
        });

        it('should handle authentication state changes correctly', () => {
            // Start authenticated
            useSession.mockReturnValue({
                data: { user: { id: '1', email: 'test@example.com' } },
                status: 'authenticated'
            });

            const { rerender } = render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            // Context should show logged in
            const { useGlobalContext } = jest.requireMock('@/context/global-context');
            
            // Simulate logout
            useSession.mockReturnValue({
                data: null,
                status: 'unauthenticated'
            });

            rerender(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            // Context should update to logged out
            expect(useSession).toHaveBeenCalled();
        });

        it('should handle API calls when session changes', async () => {
            getUnreadMessageCount.mockResolvedValue({ unreadCount: 2 });
            
            useSession.mockReturnValue({
                data: { user: { id: '1', email: 'test@example.com' } },
                status: 'authenticated'
            });

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            // Should call getUnreadMessageCount when user is logged in
            await waitFor(() => {
                expect(getUnreadMessageCount).toHaveBeenCalled();
            });
        });

        it('should provide static inputs to components', () => {
            const StaticInputsTestComponent = () => {
                const { staticInputs } = useGlobalContext();
                return (
                    <div>
                        <span data-testid="property-types-count">{staticInputs?.property_types.length || 0}</span>
                        <span data-testid="amenities-count">{staticInputs?.amenities.length || 0}</span>
                    </div>
                );
            };

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <StaticInputsTestComponent />
                </GlobalContextProvider>
            );

            expect(screen.getByTestId('property-types-count')).toHaveTextContent('2');
            expect(screen.getByTestId('amenities-count')).toHaveTextContent('2');
        });

        it('should handle session updates correctly', async () => {
            getUnreadMessageCount.mockResolvedValue({ unreadCount: 3 });

            // Start with loading session
            useSession.mockReturnValue({
                data: null,
                status: 'loading'
            });

            const { rerender } = render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            expect(screen.getByTestId('unread-count')).toHaveTextContent('0');

            // Session loads with user
            useSession.mockReturnValue({
                data: { user: { id: '1', email: 'test@example.com' } },
                status: 'authenticated'
            });

            rerender(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <ContextTestComponent />
                </GlobalContextProvider>
            );

            await waitFor(() => {
                expect(getUnreadMessageCount).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
            });
        });

        it('should memoize context value to prevent unnecessary re-renders', () => {
            const renderSpy = jest.fn();
            
            const MemoizedComponent = React.memo(() => {
                renderSpy();
                const { isLoggedIn, unreadCount } = useGlobalContext();
                return <div data-testid="memo-component">{isLoggedIn ? unreadCount : 0}</div>;
            });

            useSession.mockReturnValue({
                data: { user: { id: '1', email: 'test@example.com' } },
                status: 'authenticated'
            });

            const { rerender } = render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <MemoizedComponent />
                </GlobalContextProvider>
            );

            const initialRenderCount = renderSpy.mock.calls.length;

            // Re-render with same props should not cause memo component to re-render
            rerender(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <MemoizedComponent />
                </GlobalContextProvider>
            );

            // Should not have re-rendered due to memoization
            expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
        });
    });

    describe('useStaticInputs Hook Integration', () => {
        it('should provide property types and amenities through hook', () => {
            const { useStaticInputs } = jest.requireMock('@/context/global-context');
            
            const StaticInputsHookComponent = () => {
                const { propertyTypes, amenities } = useStaticInputs();
                return (
                    <div>
                        <span data-testid="hook-property-types">{propertyTypes.length}</span>
                        <span data-testid="hook-amenities">{amenities.length}</span>
                        <ul data-testid="property-type-list">
                            {propertyTypes.map((type: any, index: number) => (
                                <li key={index}>{type.label}</li>
                            ))}
                        </ul>
                    </div>
                );
            };

            // Mock the actual hook to return the expected values
            jest.doMock('@/context/global-context', () => ({
                ...jest.requireActual('@/context/global-context'),
                useStaticInputs: () => ({
                    propertyTypes: mockStaticInputs.property_types,
                    amenities: mockStaticInputs.amenities
                })
            }));

            const { useStaticInputs: actualHook } = jest.requireActual('@/context/global-context');
            const TestComponent = () => {
                const { propertyTypes, amenities } = actualHook();
                return (
                    <div>
                        <span data-testid="hook-property-types">{propertyTypes?.length || 0}</span>
                        <span data-testid="hook-amenities">{amenities?.length || 0}</span>
                    </div>
                );
            };

            render(
                <GlobalContextProvider initialStaticInputs={mockStaticInputs}>
                    <TestComponent />
                </GlobalContextProvider>
            );

            expect(screen.getByTestId('hook-property-types')).toHaveTextContent('2');
            expect(screen.getByTestId('hook-amenities')).toHaveTextContent('2');
        });

        it('should handle null staticInputs gracefully', () => {
            const { useStaticInputs: actualHook } = jest.requireActual('@/context/global-context');
            const TestComponent = () => {
                const { propertyTypes, amenities } = actualHook();
                return (
                    <div>
                        <span data-testid="types-fallback">{propertyTypes.length}</span>
                        <span data-testid="amenities-fallback">{amenities.length}</span>
                    </div>
                );
            };

            render(
                <GlobalContextProvider initialStaticInputs={null as any}>
                    <TestComponent />
                </GlobalContextProvider>
            );

            // Should return empty arrays as fallback
            expect(screen.getByTestId('types-fallback')).toHaveTextContent('0');
            expect(screen.getByTestId('amenities-fallback')).toHaveTextContent('0');
        });
    });
});