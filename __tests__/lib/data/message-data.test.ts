// Mock all external dependencies first
jest.mock('@/lib/db-connect', () => jest.fn());
jest.mock('@/models', () => ({
    Message: {
        find: jest.fn()
    }
}));
jest.mock('@/utils/to-serialized-object', () => ({
    toSerializedObject: jest.fn()
}));

// Import after mocks
import { fetchMessages } from '@/lib/data/message-data';

const mockDbConnect = jest.requireMock('@/lib/db-connect');
const { Message: mockMessage } = jest.requireMock('@/models');
const { toSerializedObject: mockToSerializedObject } = jest.requireMock('@/utils/to-serialized-object');

describe('fetchMessages', () => {
    const testUserId = '507f1f77bcf86cd799439011';

    // Helper function to create a proper query chain mock
    const createQueryChainMock = (finalResult: any) => {
        const query = {
            sort: jest.fn(),
            populate: jest.fn()
        };
        
        query.sort.mockReturnValue(query);
        query.populate.mockReturnValue(query);
        
        // The final populate call resolves with the data
        query.populate.mockImplementationOnce(() => query)
                      .mockImplementationOnce(() => Promise.resolve(finalResult));
        
        return query;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined);
        mockToSerializedObject.mockImplementation((doc: any) => doc);
    });

    describe('Query Logic', () => {
        it('should fetch unread messages first with read: false filter', async () => {
            const mockUnreadMessages: any[] = [
                { _id: 'msg1', read: false, createdAt: new Date('2024-01-01'), recipient: testUserId }
            ];
            const mockReadMessages: any[] = [];

            const unreadQuery = createQueryChainMock(mockUnreadMessages);
            const readQuery = createQueryChainMock(mockReadMessages);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(testUserId);

            expect(mockMessage.find).toHaveBeenNthCalledWith(1, {
                recipient: testUserId,
                read: false
            });
        });

        it('should fetch read messages second with read: true filter', async () => {
            const mockUnreadMessages: any[] = [];
            const mockReadMessages: any[] = [
                { _id: 'msg3', read: true, createdAt: new Date('2024-01-03'), recipient: testUserId }
            ];

            const unreadQuery = createQueryChainMock(mockUnreadMessages);
            const readQuery = createQueryChainMock(mockReadMessages);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(testUserId);

            expect(mockMessage.find).toHaveBeenNthCalledWith(2, {
                recipient: testUserId,
                read: true
            });
        });

        it('should filter messages by recipient userId', async () => {
            const differentUserId = '507f1f77bcf86cd799439012';

            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(differentUserId);

            expect(mockMessage.find).toHaveBeenNthCalledWith(1, {
                recipient: differentUserId,
                read: false
            });
            expect(mockMessage.find).toHaveBeenNthCalledWith(2, {
                recipient: differentUserId,
                read: true
            });
        });

        it('should sort both queries by createdAt desc', async () => {
            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(testUserId);

            expect(unreadQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(readQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });
    });

    describe('Data Population', () => {
        it('should populate sender with username field', async () => {
            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(testUserId);

            expect(unreadQuery.populate).toHaveBeenNthCalledWith(1, 'sender', 'username');
            expect(readQuery.populate).toHaveBeenNthCalledWith(1, 'sender', 'username');
        });

        it('should populate property with name field', async () => {
            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(testUserId);

            expect(unreadQuery.populate).toHaveBeenNthCalledWith(2, 'property', 'name');
            expect(readQuery.populate).toHaveBeenNthCalledWith(2, 'property', 'name');
        });

        it('should handle missing population data gracefully', async () => {
            const mockMessagesWithNullRefs = [
                { _id: 'msg1', sender: null, property: null, recipient: testUserId, read: false }
            ];

            const unreadQuery = createQueryChainMock(mockMessagesWithNullRefs);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            const result = await fetchMessages(testUserId);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockMessagesWithNullRefs[0]);
        });

        it('should maintain original document structure after population', async () => {
            const mockPopulatedMessages = [
                {
                    _id: 'msg1',
                    sender: { _id: 'user1', username: 'testuser' },
                    property: { _id: 'prop1', name: 'Test Property' },
                    recipient: testUserId,
                    read: false,
                    body: 'Test message content',
                    createdAt: new Date('2024-01-01')
                }
            ];

            const unreadQuery = createQueryChainMock(mockPopulatedMessages);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            const result = await fetchMessages(testUserId);

            expect(result[0]).toMatchObject({
                _id: 'msg1',
                sender: { _id: 'user1', username: 'testuser' },
                property: { _id: 'prop1', name: 'Test Property' },
                body: 'Test message content'
            });
        });
    });

    describe('Data Transformation', () => {
        it('should apply toSerializedObject to each message', async () => {
            const mockMessages = [
                { _id: 'msg1', read: false },
                { _id: 'msg2', read: true }
            ];

            const unreadQuery = createQueryChainMock([mockMessages[0]]);
            const readQuery = createQueryChainMock([mockMessages[1]]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            mockToSerializedObject.mockImplementation((doc: any) => ({ ...doc, serialized: true }));

            const result = await fetchMessages(testUserId);

            expect(mockToSerializedObject).toHaveBeenCalledTimes(2);
            expect(result).toEqual([
                { _id: 'msg1', read: false, serialized: true },
                { _id: 'msg2', read: true, serialized: true }
            ]);
        });

        it('should combine unread and read arrays correctly', async () => {
            const mockUnreadMessages = [
                { _id: 'msg1', read: false, createdAt: new Date('2024-01-02') },
                { _id: 'msg2', read: false, createdAt: new Date('2024-01-01') }
            ];
            const mockReadMessages = [
                { _id: 'msg3', read: true, createdAt: new Date('2024-01-03') }
            ];

            const unreadQuery = createQueryChainMock(mockUnreadMessages);
            const readQuery = createQueryChainMock(mockReadMessages);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            const result = await fetchMessages(testUserId);

            expect(result).toHaveLength(3);
            // Unread messages should come first
            expect(result[0]).toEqual(mockUnreadMessages[0]);
            expect(result[1]).toEqual(mockUnreadMessages[1]);
            expect(result[2]).toEqual(mockReadMessages[0]);
        });

        it('should maintain message ordering with unread first', async () => {
            const mockUnreadMessages = [
                { _id: 'unread1', read: false, createdAt: new Date('2024-01-01') }
            ];
            const mockReadMessages = [
                { _id: 'read1', read: true, createdAt: new Date('2024-01-05') }
            ];

            const unreadQuery = createQueryChainMock(mockUnreadMessages);
            const readQuery = createQueryChainMock(mockReadMessages);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            const result = await fetchMessages(testUserId);

            // Even though read message has a later date, unread should come first
            expect(result[0]._id).toBe('unread1');
            expect(result[1]._id).toBe('read1');
        });

        it('should handle empty result sets', async () => {
            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            const result = await fetchMessages(testUserId);

            expect(result).toEqual([]);
            expect(mockToSerializedObject).not.toHaveBeenCalled();
        });
    });

    describe('Database Integration', () => {
        it('should call dbConnect before making queries', async () => {
            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            await fetchMessages(testUserId);

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
        });

        it('should handle connection failures', async () => {
            mockDbConnect.mockRejectedValue(new Error('Database connection failed'));

            await expect(fetchMessages(testUserId)).rejects.toThrow('Failed to fetch messages data: Error: Database connection failed');
        });

        it('should handle query errors gracefully', async () => {
            const errorQuery = {
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis()
            };
            errorQuery.populate.mockImplementationOnce(() => errorQuery)
                               .mockRejectedValueOnce(new Error('Query failed'));

            mockMessage.find.mockReturnValueOnce(errorQuery);

            await expect(fetchMessages(testUserId)).rejects.toThrow('Failed to fetch messages data: Error: Query failed');
        });

        it('should log appropriate error messages', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockDbConnect.mockRejectedValue(new Error('Test error'));

            try {
                await fetchMessages(testUserId);
            } catch (error) {
                // Expected to throw
            }

            expect(consoleSpy).toHaveBeenCalledWith('>>> Database error fetching messages: Error: Test error');
            
            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        it('should throw descriptive errors on failure', async () => {
            const testError = new Error('Specific database error');
            mockDbConnect.mockRejectedValue(testError);

            await expect(fetchMessages(testUserId)).rejects.toThrow('Failed to fetch messages data: Error: Specific database error');
        });

        it('should log database errors to console', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const testError = new Error('Console test error');
            
            const errorQuery = {
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis()
            };
            errorQuery.populate.mockImplementationOnce(() => errorQuery)
                               .mockRejectedValueOnce(testError);

            mockMessage.find.mockReturnValueOnce(errorQuery);

            try {
                await fetchMessages(testUserId);
            } catch (error) {
                // Expected to throw
            }

            expect(consoleSpy).toHaveBeenCalledWith('>>> Database error fetching messages: Error: Console test error');
            
            consoleSpy.mockRestore();
        });

        it('should propagate errors to calling code', async () => {
            const testError = new Error('Propagation test');
            mockDbConnect.mockRejectedValue(testError);

            let caughtError: unknown;
            try {
                await fetchMessages(testUserId);
            } catch (error) {
                caughtError = error;
            }

            expect(caughtError).toBeInstanceOf(Error);
            expect((caughtError as Error).message).toContain('Failed to fetch messages data');
        });

        it('should handle malformed userId parameters', async () => {
            const malformedUserId = '';

            const unreadQuery = createQueryChainMock([]);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            // Should not throw for empty string, just return empty results
            const result = await fetchMessages(malformedUserId);
            expect(result).toEqual([]);
        });

        it('should handle serialization errors', async () => {
            const mockMessages = [{ _id: 'msg1', read: false }];

            const unreadQuery = createQueryChainMock(mockMessages);
            const readQuery = createQueryChainMock([]);

            mockMessage.find.mockReturnValueOnce(unreadQuery)
                           .mockReturnValueOnce(readQuery);

            mockToSerializedObject.mockImplementation(() => {
                throw new Error('Serialization failed');
            });

            await expect(fetchMessages(testUserId)).rejects.toThrow('Failed to fetch messages data: Error: Serialization failed');
        });
    });
});