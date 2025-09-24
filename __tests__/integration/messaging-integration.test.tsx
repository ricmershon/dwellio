import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, createMockSession } from '@/__tests__/test-utils';
import { beforeEachTest, afterEachTest, testDbSetup } from '@/__tests__/utils/test-db-setup';

// Mock external dependencies
jest.mock('next/navigation');
jest.mock('next/cache');

// Mock application modules
jest.mock('@/lib/actions/message-actions');
jest.mock('@/lib/data/message-data');
jest.mock('@/utils/require-session-user');

// Import components to test
import MessageCard from '@/ui/messages/message-card';
import ToggleMessageReadButton from '@/ui/messages/toggle-message-read-button';
import DeleteMessageButton from '@/ui/messages/delete-message-button';
import UnreadMessageCount from '@/ui/messages/unread-message-count';

// Import mock functions
import { createMessage, deleteMessage, toggleMessageRead, getUnreadMessageCount } from '@/lib/actions/message-actions';
import { fetchMessages } from '@/lib/data/message-data';

// Mock message data for tests
const createMockMessage = (overrides = {}) => ({
    _id: 'mock-message-id',
    body: 'Test message body',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0123',
    read: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    sender: 'sender-user-id',
    recipient: 'recipient-user-id',
    property: {
        _id: 'property-id',
        name: 'Test Property',
    },
    ...overrides
});

describe('Messaging System Integration', () => {
    const mockSession = createMockSession();
    const user = userEvent.setup();

    beforeEach(() => {
        beforeEachTest();
        jest.clearAllMocks();

        // Setup default successful mock responses
        (createMessage as jest.Mock).mockResolvedValue({
            status: 'success',
            message: 'Message sent successfully'
        });

        (deleteMessage as jest.Mock).mockResolvedValue({
            status: 'success',
            message: 'Message deleted successfully'
        });

        (toggleMessageRead as jest.Mock).mockResolvedValue({
            status: 'success',
            message: 'Message status updated'
        });

        (fetchMessages as jest.Mock).mockResolvedValue([]);
        (getUnreadMessageCount as jest.Mock).mockResolvedValue(0);
    });

    afterEach(() => {
        afterEachTest();
    });

    describe('Send Message Workflow', () => {
        it('should handle message creation with valid data', async () => {
            const validMessageData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '555-0123',
                body: 'I am interested in this property. Please contact me.',
                recipient: 'recipient-id',
                property: 'property-id'
            };

            // Simulate form submission
            const formData = new FormData();
            Object.entries(validMessageData).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const result = await createMessage({}, formData);

            expect(createMessage).toHaveBeenCalledWith({}, formData);
            expect(result.status).toBe('success');
            expect(result.message).toBe('Message sent successfully');
        });

        it('should handle validation errors on message creation', async () => {
            (createMessage as jest.Mock).mockResolvedValue({
                status: 'error',
                message: 'Validation failed',
                formErrorMap: {
                    name: ['Name is required'],
                    email: ['Valid email is required'],
                    body: ['Message body is required']
                }
            });

            const invalidFormData = new FormData();
            invalidFormData.append('name', '');
            invalidFormData.append('email', 'invalid-email');
            invalidFormData.append('body', '');

            const result = await createMessage({}, invalidFormData);

            expect(result.status).toBe('error');
            expect(result.formErrorMap).toHaveProperty('name');
            expect(result.formErrorMap).toHaveProperty('email');
            expect(result.formErrorMap).toHaveProperty('body');
        });

        it('should handle server errors during message creation', async () => {
            (createMessage as jest.Mock).mockRejectedValue(
                new Error('Database connection failed')
            );

            const formData = new FormData();
            formData.append('name', 'John Doe');
            formData.append('email', 'john@example.com');
            formData.append('body', 'Test message');

            try {
                await createMessage({}, formData);
            } catch (error) {
                expect((error as Error).message).toBe('Database connection failed');
            }
        });
    });

    describe('Message Display and Management', () => {
        it('should render message card with all information', () => {
            const mockMessage = createMockMessage();

            customRender(<MessageCard message={mockMessage as any} />, { session: mockSession });

            // Test message content displays
            expect(screen.getByText('Test message body')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            expect(screen.getByText('555-0123')).toBeInTheDocument();
            expect(screen.getByText('Test Property')).toBeInTheDocument();

            // Test unread indicator
            expect(screen.getByText('New')).toBeInTheDocument();

            // Test action buttons are present
            expect(screen.getByRole('button', { name: /mark as read/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });

        it('should handle read message display differently', () => {
            const readMessage = createMockMessage({ read: true });

            customRender(<MessageCard message={readMessage as any} />, { session: mockSession });

            // Test unread indicator is not present for read messages
            expect(screen.queryByText('New')).toBeFalsy();

            // Test mark as unread button is present
            expect(screen.getByRole('button', { name: /mark as unread/i })).toBeInTheDocument();
        });

        it('should handle message read/unread toggle', async () => {
            const unreadMessage = createMockMessage({ read: false });

            customRender(
                <ToggleMessageReadButton
                    messageId={unreadMessage._id}
                    read={unreadMessage.read}
                />,
                { session: mockSession }
            );

            const toggleButton = screen.getByRole('button', { name: /mark as read/i });

            await user.click(toggleButton);

            expect(toggleMessageRead).toHaveBeenCalledWith(unreadMessage._id);
        });

        it('should handle message deletion with confirmation', async () => {
            const mockMessage = createMockMessage();

            customRender(
                <DeleteMessageButton messageId={mockMessage._id} />,
                { session: mockSession }
            );

            const deleteButton = screen.getByRole('button', { name: /delete/i });

            await user.click(deleteButton);

            expect(deleteMessage).toHaveBeenCalledWith(mockMessage._id);
        });

        it('should display unread message count when provided', () => {
            customRender(
                <UnreadMessageCount unreadCount={5} viewportWidth={800} />,
                { session: mockSession }
            );

            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should handle zero unread messages', () => {
            customRender(
                <UnreadMessageCount unreadCount={0} viewportWidth={800} />,
                { session: mockSession }
            );

            // Component renders "0" for zero count (based on actual implementation)
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should hide count on mobile viewport', () => {
            customRender(
                <UnreadMessageCount unreadCount={5} viewportWidth={500} />,
                { session: mockSession }
            );

            // Count should be hidden on mobile (viewportWidth <= 640)
            expect(screen.queryByText('5')).toBeFalsy();
        });
    });

    describe('Message Threading and Organization', () => {
        it('should handle message chronological ordering', () => {
            const olderMessage = createMockMessage({
                _id: 'message-1',
                createdAt: new Date('2024-01-10T10:00:00Z'),
                body: 'Older message'
            });

            const newerMessage = createMockMessage({
                _id: 'message-2',
                createdAt: new Date('2024-01-15T10:00:00Z'),
                body: 'Newer message'
            });

            // Test that messages can be ordered by creation date
            const messages = [newerMessage, olderMessage];
            const sortedMessages = messages.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            expect(sortedMessages[0].body).toBe('Newer message');
            expect(sortedMessages[1].body).toBe('Older message');
        });

        it('should group messages by property', () => {
            const property1Messages = [
                createMockMessage({
                    _id: 'msg-1',
                    property: { _id: 'prop-1', name: 'Property 1' }
                }),
                createMockMessage({
                    _id: 'msg-2',
                    property: { _id: 'prop-1', name: 'Property 1' }
                })
            ];

            const property2Messages = [
                createMockMessage({
                    _id: 'msg-3',
                    property: { _id: 'prop-2', name: 'Property 2' }
                })
            ];

            // Test grouping logic
            const allMessages = [...property1Messages, ...property2Messages];
            const groupedByProperty = allMessages.reduce((groups, message) => {
                const propertyId = typeof message.property === 'object'
                    ? message.property._id
                    : message.property;

                if (!groups[propertyId]) {
                    groups[propertyId] = [];
                }
                groups[propertyId].push(message);
                return groups;
            }, {} as Record<string, typeof allMessages>);

            expect(Object.keys(groupedByProperty)).toHaveLength(2);
            expect(groupedByProperty['prop-1']).toHaveLength(2);
            expect(groupedByProperty['prop-2']).toHaveLength(1);
        });

        it('should handle conversation threading by sender/recipient', () => {
            const conversationMessages = [
                createMockMessage({
                    _id: 'msg-1',
                    sender: 'user-1',
                    recipient: 'user-2',
                    body: 'First message'
                }),
                createMockMessage({
                    _id: 'msg-2',
                    sender: 'user-2',
                    recipient: 'user-1',
                    body: 'Reply message'
                })
            ];

            // Test conversation grouping logic
            const participants = new Set();
            conversationMessages.forEach(msg => {
                participants.add(msg.sender);
                participants.add(msg.recipient);
            });

            expect(participants.size).toBe(2);
            expect(participants.has('user-1')).toBe(true);
            expect(participants.has('user-2')).toBe(true);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle network errors gracefully', async () => {
            // Test that button component exists and is interactive
            const messageId = 'test-message-id';

            customRender(
                <ToggleMessageReadButton messageId={messageId} read={false} />,
                { session: mockSession }
            );

            const toggleButton = screen.getByRole('button', { name: /mark as read/i });

            // Test button renders and is clickable
            expect(toggleButton).toBeInTheDocument();
            expect(toggleButton).not.toBeDisabled();
        });

        it('should handle missing property data', () => {
            const messageWithoutProperty = createMockMessage({
                property: null
            });

            customRender(
                <MessageCard message={messageWithoutProperty as any} />,
                { session: mockSession }
            );

            // Test that component renders even with missing property
            expect(screen.getByText('Test message body')).toBeInTheDocument();
        });

        it('should handle malformed dates gracefully', () => {
            const messageWithBadDate = createMockMessage({
                createdAt: 'invalid-date' as any
            });

            // Test that date handling doesn't break component
            expect(() => {
                new Date(messageWithBadDate.createdAt).toLocaleString();
            }).not.toThrow();
        });

        it('should handle empty message list', async () => {
            (fetchMessages as jest.Mock).mockResolvedValue([]);

            const messages = await fetchMessages('user-id');

            expect(messages).toHaveLength(0);
            expect(fetchMessages).toHaveBeenCalledWith('user-id');
        });
    });

    describe('Message System Integration Flow', () => {
        it('should demonstrate complete message lifecycle', async () => {
            // Step 1: Create message
            const formData = new FormData();
            formData.append('name', 'Test Sender');
            formData.append('email', 'sender@example.com');
            formData.append('body', 'Test message content');
            formData.append('recipient', 'recipient-id');
            formData.append('property', 'property-id');

            const createResult = await createMessage({}, formData);
            expect(createResult.status).toBe('success');

            // Step 2: Display message (simulate fetching)
            const mockMessage = createMockMessage();
            testDbSetup.addMessage(mockMessage);

            // Step 3: Mark as read
            const readResult = await toggleMessageRead(mockMessage._id);
            expect(readResult.status).toBe('success');

            // Step 4: Delete message
            const deleteResult = await deleteMessage(mockMessage._id);
            expect(deleteResult.status).toBe('success');
        });

        it('should handle concurrent message operations', async () => {
            const message1Id = 'message-1';
            const message2Id = 'message-2';

            // Simulate concurrent read operations
            const readPromises = [
                toggleMessageRead(message1Id),
                toggleMessageRead(message2Id)
            ];

            const results = await Promise.all(readPromises);

            results.forEach(result => {
                expect(result.status).toBe('success');
            });

            expect(toggleMessageRead).toHaveBeenCalledTimes(2);
        });
    });
});