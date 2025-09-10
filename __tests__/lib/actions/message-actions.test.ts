// Mock all external dependencies first to avoid module import issues
jest.mock('@/lib/db-connect', () => jest.fn());
jest.mock('@/models', () => ({
    Message: Object.assign(jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn()
    })), {
        findById: jest.fn(),
        countDocuments: jest.fn()
    })
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
jest.mock('@/schemas/message-schema', () => ({
    MessageInput: {
        safeParse: jest.fn()
    }
}));
jest.mock('@/utils/build-form-error-map', () => ({
    buildFormErrorMap: jest.fn()
}));

// Import after mocks
import { createMessage, toggleMessageRead, deleteMessage, getUnreadMessageCount } from '@/lib/actions/message-actions';
import { ActionStatus } from '@/types';

const mockDbConnect = jest.requireMock('@/lib/db-connect');
const mockMessage = jest.requireMock('@/models').Message;
const mockRequireSessionUser = jest.requireMock('@/utils/require-session-user').requireSessionUser;
const mockToActionState = jest.requireMock('@/utils/to-action-state').toActionState;
const mockRevalidatePath = jest.requireMock('next/cache').revalidatePath;
const mockMessageInput = jest.requireMock('@/schemas/message-schema').MessageInput;
const mockBuildFormErrorMap = jest.requireMock('@/utils/build-form-error-map').buildFormErrorMap;

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

    describe('createMessage', () => {
        const mockMessageSave = jest.fn();

        beforeEach(() => {
            // Reset the Message constructor mock
            mockMessage.mockImplementation((data: any) => ({
                ...data,
                save: mockMessageSave
            }));
            mockMessageSave.mockClear();
            
            // Mock validation to succeed by default
            mockMessageInput.safeParse.mockReturnValue({
                success: true,
                data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '555-1234',
                    body: 'Test message'
                }
            });
        });

        describe('Successful Message Creation', () => {
            it('should create message with valid data', async () => {
                const formData = new FormData();
                formData.set('name', 'John Doe');
                formData.set('email', 'john@example.com');
                formData.set('phone', '555-1234');
                formData.set('body', 'This is a test message with sufficient length to pass validation.');
                formData.set('recipient', 'recipient-id');
                formData.set('property', 'property-id');

                mockMessageSave.mockResolvedValue(true);

                const prevState: any = {};
                const result = await createMessage(prevState, formData);

                expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockMessageSave).toHaveBeenCalledTimes(1);
                expect(result.status).toBe(ActionStatus.SUCCESS);
                expect(result.message).toBe('Message sent.');
            });
        });

        describe('Validation Errors', () => {
            it('should handle form validation errors', async () => {
                // Mock validation to fail
                mockMessageInput.safeParse.mockReturnValue({
                    success: false,
                    error: {
                        issues: [
                            { path: ['name'], message: 'Name is required' },
                            { path: ['email'], message: 'Invalid email' }
                        ]
                    }
                });
                mockBuildFormErrorMap.mockReturnValue({
                    name: ['Name is required'],
                    email: ['Invalid email']
                });

                const invalidFormData = new FormData();
                invalidFormData.set('name', ''); // Empty name
                invalidFormData.set('email', 'invalid-email'); // Invalid email
                invalidFormData.set('phone', ''); // Empty phone
                invalidFormData.set('body', ''); // Empty body

                const prevState: any = {};
                const result = await createMessage(prevState, invalidFormData);

                expect(result.formData).toBe(invalidFormData);
                expect(result.formErrorMap).toBeDefined();
                expect(mockMessageSave).not.toHaveBeenCalled();
            });
        });

        describe('Database Errors', () => {
            it('should handle message save failures', async () => {
                const formData = new FormData();
                formData.set('name', 'John Doe');
                formData.set('email', 'john@example.com');
                formData.set('phone', '555-1234');
                formData.set('body', 'This is a test message with sufficient length to pass validation.');
                formData.set('recipient', 'recipient-id');
                formData.set('property', 'property-id');

                const saveError = new Error('Database save failed');
                mockMessageSave.mockRejectedValue(saveError);

                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                const prevState: any = {};
                const result = await createMessage(prevState, formData);

                expect(result.status).toBe(ActionStatus.ERROR);
                expect(result.message).toContain('Failed to send message');
                expect(result.formData).toBe(formData);
                expect(consoleSpy).toHaveBeenCalledWith('>>> Database error sending a message: Error: Database save failed');
                
                consoleSpy.mockRestore();
            });
        });
    });

    describe('toggleMessageRead - Missing Error Coverage', () => {
        it('should handle database errors when finding message', async () => {
            const dbError = new Error('Database connection failed');
            mockMessage.findById.mockRejectedValue(dbError);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await toggleMessageRead('message-id');

            expect(mockToActionState).toHaveBeenCalledWith({
                status: ActionStatus.ERROR,
                message: 'Error finding message: Error: Database connection failed'
            });
            expect(consoleSpy).toHaveBeenCalledWith('>>> Database error finding message: Error: Database connection failed');
            
            consoleSpy.mockRestore();
        });
    });

    describe('deleteMessage - Missing Error Coverage', () => {
        it('should handle database errors when finding message', async () => {
            const dbError = new Error('Database find failed');
            mockMessage.findById.mockRejectedValue(dbError);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await deleteMessage('message-id');

            expect(mockToActionState).toHaveBeenCalledWith({
                status: ActionStatus.ERROR,
                message: 'Error finding message: Error: Database find failed'
            });
            expect(consoleSpy).toHaveBeenCalledWith('>>> Database error finding message: Error: Database find failed');
            
            consoleSpy.mockRestore();
        });
    });
});