/**
 * @jest-environment jsdom
 *
 * Messaging Workflow Test
 *
 * Tests message sending and management workflows.
 */
import { render, screen } from '@testing-library/react';
import MessagesPage from '@/app/(root)/messages/page';

jest.mock('@/utils/require-session-user');
jest.mock('@/lib/data/message-data');

jest.mock('@/ui/messages/message-card', () => {
    return function MockMessageCard({ message }: any) {
        return (
            <div data-testid={`message-${message._id}`}>
                <div>{message.sender.username}</div>
                <div>{message.body}</div>
                <span data-testid={`read-status-${message._id}`}>
                    {message.read ? 'Read' : 'Unread'}
                </span>
                <button data-testid={`delete-${message._id}`}>Delete</button>
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    const MockBreadcrumbs = () => <div data-testid="breadcrumbs">Messages</div>;
    MockBreadcrumbs.displayName = 'MockBreadcrumbs';
    return MockBreadcrumbs;
});

import { requireSessionUser } from '@/utils/require-session-user';
import { fetchMessages } from '@/lib/data/message-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchMessages = fetchMessages as jest.MockedFunction<typeof fetchMessages>;

describe('Messaging Workflow', () => {
    const mockUser = { id: 'user1', name: 'John' };
    const mockMessages = [
        { _id: 'msg1', sender: { username: 'Alice' }, body: 'Hello', read: false },
        { _id: 'msg2', sender: { username: 'Bob' }, body: 'Hi there', read: true },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockUser as any);
        mockFetchMessages.mockResolvedValue(mockMessages as any);
    });

    describe('Message List Display', () => {
        it('should display all messages', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByTestId('message-msg1')).toBeInTheDocument();
            expect(screen.getByTestId('message-msg2')).toBeInTheDocument();
        });

        it('should show message sender and content', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });
    });

    describe('Read/Unread Status', () => {
        it('should show read status for messages', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByTestId('read-status-msg1')).toHaveTextContent('Unread');
            expect(screen.getByTestId('read-status-msg2')).toHaveTextContent('Read');
        });
    });

    describe('Message Management', () => {
        it('should provide delete functionality for messages', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByTestId('delete-msg1')).toBeInTheDocument();
            expect(screen.getByTestId('delete-msg2')).toBeInTheDocument();
        });
    });

    describe('Empty State Workflow', () => {
        it('should show empty state when no messages', async () => {
            mockFetchMessages.mockResolvedValue([] as any);

            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
        });
    });
});
