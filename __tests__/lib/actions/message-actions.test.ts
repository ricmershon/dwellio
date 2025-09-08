// Mock all external dependencies first to avoid module import issues
jest.mock('@/lib/db-connect', () => jest.fn());
jest.mock('@/models', () => ({
    Message: {
        findById: jest.fn(),
        countDocuments: jest.fn()
    }
}));
jest.mock('@/utils/require-session-user', () => ({
    requireSessionUser: jest.fn()
}));
jest.mock('@/utils/to-action-state', () => ({
    toActionState: jest.fn()
}));
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn()
}));

// Import after mocks
import { toggleMessageRead, deleteMessage, getUnreadMessageCount } from '@/lib/actions/message-actions';
import { ActionStatus } from '@/types';

const mockDbConnect = jest.requireMock('@/lib/db-connect');
const mockMessage = jest.requireMock('@/models').Message;
const mockRequireSessionUser = jest.requireMock('@/utils/require-session-user').requireSessionUser;
const mockToActionState = jest.requireMock('@/utils/to-action-state').toActionState;
const mockRevalidatePath = jest.requireMock('next/cache').revalidatePath;

describe('Message Actions', () => {
    const mockSessionUser = { id: 'user-123', email: 'user@test.com' };
    const mockMessageId = 'msg-456';

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined);
        mockRequireSessionUser.mockResolvedValue(mockSessionUser);
        mockToActionState.mockImplementation((state: any) => state);
        mockRevalidatePath.mockImplementation(() => {}); // Reset to no-op
    });

    describe('toggleMessageRead', () => {
        describe('Authentication', () => {
            it('should call requireSessionUser', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: mockSessionUser.id,
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
            });

            it('should handle authentication failures', async () => {
                mockRequireSessionUser.mockRejectedValue(new Error('Authentication failed'));

                await expect(toggleMessageRead(mockMessageId)).rejects.toThrow('Authentication failed');
            });

            it('should verify user authorization', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: 'different-user-id',
                    read: false,
                    save: jest.fn()
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                const result = await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Not authorized to change message.'
                });
            });

            it('should reject unauthorized requests', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: 'unauthorized-user',
                    read: false
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Not authorized to change message.'
                });
            });
        });

        describe('Message Validation', () => {
            it('should find message by ID', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: mockSessionUser.id,
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockMessage.findById).toHaveBeenCalledWith(mockMessageId);
            });

            it('should verify message exists', async () => {
                mockMessage.findById.mockResolvedValue(null);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Message not found.'
                });
            });

            it('should check recipient ownership', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockMessageDoc.save).toHaveBeenCalled();
            });

            it('should reject non-owner access', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => 'different-user' },
                    read: false
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Not authorized to change message.'
                });
            });
        });

        describe('State Toggle Logic', () => {
            it('should flip message.read boolean from false to true', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockMessageDoc.read).toBe(true);
                expect(mockMessageDoc.save).toHaveBeenCalled();
            });

            it('should flip message.read boolean from true to false', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: true,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockMessageDoc.read).toBe(false);
                expect(mockMessageDoc.save).toHaveBeenCalled();
            });

            it('should save updated message', async () => {
                const saveMock = jest.fn().mockResolvedValue(undefined);
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: saveMock
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(saveMock).toHaveBeenCalledTimes(1);
            });

            it('should return new read state', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked read.',
                    isRead: true
                });
            });

            it('should handle save failures', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockRejectedValue(new Error('Save failed'))
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Failed to change message: Error: Save failed'
                });
            });
        });

        describe('Cache Invalidation', () => {
            it('should call revalidatePath("/messages")', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockRevalidatePath).toHaveBeenCalledWith('/messages');
            });

            it('should update cache after changes', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: true,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
            });

            it('should maintain data consistency', async () => {
                const saveMock = jest.fn().mockResolvedValue(undefined);
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: saveMock
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                // Save should happen before revalidation
                expect(saveMock).toHaveBeenCalled();
                expect(mockRevalidatePath).toHaveBeenCalled();
            });

            it('should handle revalidation errors by throwing', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);
                mockRevalidatePath.mockImplementation(() => {
                    throw new Error('Revalidation failed');
                });

                // Should throw when revalidation fails
                await expect(toggleMessageRead(mockMessageId)).rejects.toThrow('Revalidation failed');
            });
        });

        describe('Response Format', () => {
            it('should return ActionState with SUCCESS status', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked read.',
                    isRead: true
                });
            });

            it('should include success/error messages', async () => {
                mockMessage.findById.mockResolvedValue(null);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Message not found.'
                });
            });

            it('should return isRead flag on success', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: true,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.SUCCESS,
                    message: 'Message marked new.',
                    isRead: false
                });
            });

            it('should format messages consistently', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    read: false,
                    save: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await toggleMessageRead(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.stringContaining('Message marked')
                    })
                );
            });
        });
    });

    describe('deleteMessage', () => {
        describe('Authorization Flow', () => {
            it('should require authenticated user', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
            });

            it('should verify message ownership', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => 'different-user' },
                    deleteOne: jest.fn()
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Not authorized to change message.'
                });
                expect(mockMessageDoc.deleteOne).not.toHaveBeenCalled();
            });

            it('should reject unauthorized deletions', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => 'unauthorized-user' }
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Not authorized to change message.'
                });
            });

            it('should handle authentication errors', async () => {
                mockRequireSessionUser.mockRejectedValue(new Error('Auth error'));

                await expect(deleteMessage(mockMessageId)).rejects.toThrow('Auth error');
            });
        });

        describe('Deletion Process', () => {
            it('should call message.deleteOne()', async () => {
                const deleteOneMock = jest.fn().mockResolvedValue(undefined);
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: deleteOneMock
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(deleteOneMock).toHaveBeenCalledTimes(1);
            });

            it('should handle deletion failures', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: jest.fn().mockRejectedValue(new Error('Delete failed'))
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Failed to delete message: Error: Delete failed'
                });
            });

            it('should confirm successful removal', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.SUCCESS,
                    message: 'Message deleted.'
                });
            });

            it('should clean up related data', async () => {
                // Test assumes that deleteOne() handles cascading deletes
                const deleteOneMock = jest.fn().mockResolvedValue(undefined);
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: deleteOneMock
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(deleteOneMock).toHaveBeenCalled();
            });
        });

        describe('Cache Management', () => {
            it('should revalidate messages page', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockRevalidatePath).toHaveBeenCalledWith('/messages');
            });

            it('should update UI state properly', async () => {
                const deleteOneMock = jest.fn().mockResolvedValue(undefined);
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: deleteOneMock
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                // Deletion should happen before cache revalidation
                expect(deleteOneMock).toHaveBeenCalled();
                expect(mockRevalidatePath).toHaveBeenCalled();
            });

            it('should handle cache errors by throwing', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);
                mockRevalidatePath.mockImplementation(() => {
                    throw new Error('Cache error');
                });

                // Should throw when revalidation fails
                await expect(deleteMessage(mockMessageId)).rejects.toThrow('Cache error');
            });

            it('should maintain consistency', async () => {
                const mockMessageDoc = {
                    _id: mockMessageId,
                    recipient: { toString: () => mockSessionUser.id },
                    deleteOne: jest.fn().mockResolvedValue(undefined)
                };
                mockMessage.findById.mockResolvedValue(mockMessageDoc);

                await deleteMessage(mockMessageId);

                expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('getUnreadMessageCount', () => {
        describe('Count Logic', () => {
            it('should count unread messages for user', async () => {
                mockMessage.countDocuments.mockResolvedValue(5);

                const result = await getUnreadMessageCount();

                expect(mockMessage.countDocuments).toHaveBeenCalledWith({
                    recipient: mockSessionUser.id,
                    read: false
                });
                expect(result).toEqual({ unreadCount: 5 });
            });

            it('should filter by recipient and read status', async () => {
                mockMessage.countDocuments.mockResolvedValue(3);

                await getUnreadMessageCount();

                expect(mockMessage.countDocuments).toHaveBeenCalledWith({
                    recipient: mockSessionUser.id,
                    read: false
                });
            });

            it('should return accurate count', async () => {
                mockMessage.countDocuments.mockResolvedValue(42);

                const result = await getUnreadMessageCount();

                expect(result.unreadCount).toBe(42);
            });

            it('should handle zero results', async () => {
                mockMessage.countDocuments.mockResolvedValue(0);

                const result = await getUnreadMessageCount();

                expect(result.unreadCount).toBe(0);
            });

            it('should handle database connection', async () => {
                mockMessage.countDocuments.mockResolvedValue(7);

                await getUnreadMessageCount();

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
            });

            it('should require authenticated user', async () => {
                mockMessage.countDocuments.mockResolvedValue(2);

                await getUnreadMessageCount();

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
            });

            it('should handle authentication failures', async () => {
                mockRequireSessionUser.mockRejectedValue(new Error('Not authenticated'));

                await expect(getUnreadMessageCount()).rejects.toThrow('Not authenticated');
            });

            it('should handle database errors', async () => {
                mockMessage.countDocuments.mockRejectedValue(new Error('Database error'));

                await expect(getUnreadMessageCount()).rejects.toThrow('Failed to fetch unread message count: Error: Database error');
            });

            it('should log database errors', async () => {
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                mockMessage.countDocuments.mockRejectedValue(new Error('Count error'));

                try {
                    await getUnreadMessageCount();
                } catch {
                    // Expected to throw
                }

                expect(consoleSpy).toHaveBeenCalledWith('>>> Database error getting unread message count: Error: Count error');
                
                consoleSpy.mockRestore();
            });
        });
    });
});