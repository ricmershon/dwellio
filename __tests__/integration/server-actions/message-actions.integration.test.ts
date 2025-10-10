/**
 * Message Actions Integration Tests
 *
 * Tests Server Actions integration with FormData handling, validation schemas,
 * and business logic flow (not real database interactions).
 */
import { jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('@/lib/db-connect');
jest.mock('@/utils/require-session-user');
jest.mock('next/cache');
jest.mock('@/models');

import { Types } from 'mongoose';
import {
    createMessage,
    toggleMessageRead,
    deleteMessage,
    getUnreadMessageCount
} from '@/lib/actions/message-actions';
import { Message } from '@/models';
import { ActionStatus } from '@/types';
import { requireSessionUser } from '@/utils/require-session-user';
import { revalidatePath } from 'next/cache';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

describe('Message Actions - Server Actions Integration', () => {
    const mockUserId = new Types.ObjectId().toString();
    const mockRecipientId = new Types.ObjectId().toString();
    const mockPropertyId = new Types.ObjectId().toString();

    const mockSessionUser = {
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequireSessionUser.mockResolvedValue(mockSessionUser as any);
        mockRevalidatePath.mockImplementation(() => {});
    });

    describe('createMessage - Form Data Integration', () => {
        it('should create message with valid FormData', async () => {
            const mockMessageInstance = {
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (Message as any).mockImplementation(() => mockMessageInstance);

            const formData = new FormData();
            formData.append('name', 'John Sender');
            formData.append('email', 'john@example.com');
            formData.append('phone', '555-1234');
            formData.append('body', 'I am interested in this property');
            formData.append('recipient', mockRecipientId);
            formData.append('property', mockPropertyId);

            const result = await createMessage({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Message sent.');
            expect(mockMessageInstance.save).toHaveBeenCalled();
        });

        it('should return validation errors for invalid email', async () => {
            const formData = new FormData();
            formData.append('name', 'Test User');
            formData.append('email', 'invalid-email'); // Invalid format
            formData.append('phone', '555-0000');
            formData.append('body', 'Test message');

            const result = await createMessage({}, formData);

            expect(result.formErrorMap).toBeDefined();
            expect(result.formData).toBe(formData);
        });

        it('should return validation errors for missing required fields', async () => {
            const formData = new FormData();
            formData.append('name', 'Test');
            // Missing email, phone, body

            const result = await createMessage({}, formData);

            expect(result.formErrorMap).toBeDefined();
        });

        it('should validate phone number format', async () => {
            const formData = new FormData();
            formData.append('name', 'Test');
            formData.append('email', 'test@example.com');
            formData.append('phone', '123'); // Too short
            formData.append('body', 'Test message');

            const result = await createMessage({}, formData);

            expect(result.formErrorMap).toBeDefined();
        });

        it('should validate message body is not empty', async () => {
            const formData = new FormData();
            formData.append('name', 'Test User');
            formData.append('email', 'test@example.com');
            formData.append('phone', '555-1234');
            formData.append('body', ''); // Empty body

            const result = await createMessage({}, formData);

            expect(result.formErrorMap).toBeDefined();
            expect(result.formErrorMap?.body).toBeDefined();
        });
    });

    describe('toggleMessageRead - Authorization Integration', () => {
        const testMessageId = new Types.ObjectId().toString();

        it('should toggle message from unread to read', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => mockUserId },
                read: false,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await toggleMessageRead(testMessageId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Message marked read.');
            expect(result.isRead).toBe(true);
            expect(mockMessage.read).toBe(true);
            expect(mockMessage.save).toHaveBeenCalled();
            expect(mockRevalidatePath).toHaveBeenCalledWith('/messages');
        });

        it('should toggle message from read to unread', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => mockUserId },
                read: true,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await toggleMessageRead(testMessageId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Message marked new.');
            expect(result.isRead).toBe(false);
            expect(mockMessage.read).toBe(false);
        });

        it('should return error when message not found', async () => {
            (Message.findById as any).mockResolvedValue(null);

            const result = await toggleMessageRead(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Message not found.');
        });

        it('should verify ownership before toggling', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => 'different-user-id' },
                read: false
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await toggleMessageRead(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Not authorized to change message.');
        });

        it('should handle save errors', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => mockUserId },
                read: false,
                save: jest.fn().mockRejectedValue(new Error('Save error') as never)
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await toggleMessageRead(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toContain('Failed to change message');
        });

        it('should handle database findById errors', async () => {
            (Message.findById as any).mockRejectedValue(new Error('DB Error') as never);

            const result = await toggleMessageRead(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
        });
    });

    describe('deleteMessage - Authorization Integration', () => {
        const testMessageId = new Types.ObjectId().toString();

        it('should delete message successfully', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => mockUserId },
                deleteOne: jest.fn().mockResolvedValue(undefined as never)
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await deleteMessage(testMessageId);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Message deleted.');
            expect(mockMessage.deleteOne).toHaveBeenCalled();
            expect(mockRevalidatePath).toHaveBeenCalledWith('/messages');
        });

        it('should return error when message not found', async () => {
            (Message.findById as any).mockResolvedValue(null);

            const result = await deleteMessage(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Message not found.');
        });

        it('should verify ownership before deletion', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => 'different-user-id' }
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await deleteMessage(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Not authorized to change message.');
        });

        it('should handle deletion errors', async () => {
            const mockMessage = {
                _id: testMessageId,
                recipient: { toString: () => mockUserId },
                deleteOne: jest.fn().mockRejectedValue(new Error('Delete error') as never)
            };
            (Message.findById as any).mockResolvedValue(mockMessage);

            const result = await deleteMessage(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toContain('Failed to delete message');
        });

        it('should handle database findById errors', async () => {
            (Message.findById as any).mockRejectedValue(new Error('DB Error') as never);

            const result = await deleteMessage(testMessageId);

            expect(result.status).toBe(ActionStatus.ERROR);
        });
    });

    describe('getUnreadMessageCount - Query Integration', () => {
        it('should return zero when no unread messages', async () => {
            (Message.countDocuments as any).mockResolvedValue(0);

            const result = await getUnreadMessageCount();

            expect(result.unreadCount).toBe(0);
            expect(Message.countDocuments).toHaveBeenCalledWith({
                recipient: mockUserId,
                read: false
            });
        });

        it('should return correct count of unread messages', async () => {
            (Message.countDocuments as any).mockResolvedValue(5);

            const result = await getUnreadMessageCount();

            expect(result.unreadCount).toBe(5);
        });

        it('should query only for current user messages', async () => {
            (Message.countDocuments as any).mockResolvedValue(3);

            await getUnreadMessageCount();

            expect(Message.countDocuments).toHaveBeenCalledWith({
                recipient: mockUserId,
                read: false
            });
        });

        it('should throw error on database failure', async () => {
            (Message.countDocuments as any).mockRejectedValue(new Error('DB Error') as never);

            await expect(getUnreadMessageCount()).rejects.toThrow(
                'Failed to fetch unread message count'
            );
        });

        it('should handle large unread counts', async () => {
            (Message.countDocuments as any).mockResolvedValue(999);

            const result = await getUnreadMessageCount();

            expect(result.unreadCount).toBe(999);
        });

        it('should filter by both recipient and read status', async () => {
            (Message.countDocuments as any).mockResolvedValue(7);

            await getUnreadMessageCount();

            const callArgs = (Message.countDocuments as any).mock.calls[0][0];
            expect(callArgs).toHaveProperty('recipient', mockUserId);
            expect(callArgs).toHaveProperty('read', false);
        });
    });
});
