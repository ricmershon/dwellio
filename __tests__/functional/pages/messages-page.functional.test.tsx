/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import MessagesPage from '@/app/(root)/messages/page';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Services (Mocked)
jest.mock('@/utils/require-session-user');
jest.mock('@/lib/data/message-data');

// ✅ Child Components (Mocked for functional test isolation)
jest.mock('@/ui/messages/message-card', () => {
    return function MockMessageCard({ message }: any) {
        return (
            <div data-testid="message-card" data-message-id={message._id}>
                Message from: {message.sender.username}
            </div>
        );
    };
});

jest.mock('@/ui/shared/breadcrumbs', () => {
    return function MockBreadcrumbs({ breadcrumbs }: any) {
        return (
            <div data-testid="breadcrumbs">
                {breadcrumbs.map((crumb: any, idx: number) => (
                    <span key={idx} data-active={crumb.active}>
                        {crumb.label}
                    </span>
                ))}
            </div>
        );
    };
});

import { requireSessionUser } from '@/utils/require-session-user';
import { fetchMessages } from '@/lib/data/message-data';

const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;
const mockFetchMessages = fetchMessages as jest.MockedFunction<typeof fetchMessages>;

describe('MessagesPage', () => {
    const mockSessionUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
    };

    const mockMessages = [
        {
            _id: 'msg1',
            sender: {
                username: 'Alice',
            },
            body: 'Hello, I am interested in your property',
            read: false,
        },
        {
            _id: 'msg2',
            sender: {
                username: 'Bob',
            },
            body: 'Is this property still available?',
            read: true,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireSessionUser.mockResolvedValue(mockSessionUser as any);
        mockFetchMessages.mockResolvedValue(mockMessages as any);
    });

    describe('Authentication', () => {
        it('should require authenticated user', async () => {
            await MessagesPage();

            expect(mockRequireSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should fetch messages with session user id', async () => {
            await MessagesPage();

            expect(mockFetchMessages).toHaveBeenCalledWith('user123');
        });

        it('should handle authentication check before data fetching', async () => {
            const callOrder: string[] = [];

            mockRequireSessionUser.mockImplementation(async () => {
                callOrder.push('auth');
                return mockSessionUser as any;
            });

            mockFetchMessages.mockImplementation(async () => {
                callOrder.push('fetch');
                return mockMessages as any;
            });

            await MessagesPage();

            expect(callOrder).toEqual(['auth', 'fetch']);
        });
    });

    describe('Page Structure', () => {
        it('should render main element', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render breadcrumbs', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
        });
    });

    describe('Breadcrumbs', () => {
        it('should render correct breadcrumb trail', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Home');
            expect(breadcrumbs).toHaveTextContent('Your Messages');
        });

        it('should mark Your Messages breadcrumb as active', async () => {
            const jsx = await MessagesPage();
            const { container } = render(jsx);

            const messagesCrumb = container.querySelector('[data-active="true"]');
            expect(messagesCrumb).toHaveTextContent('Your Messages');
        });
    });

    describe('Message List Display', () => {
        it('should render message cards for each message', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(2);
        });

        it('should pass message data to MessageCard components', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByText('Message from: Alice')).toBeInTheDocument();
            expect(screen.getByText('Message from: Bob')).toBeInTheDocument();
        });

        it('should render messages with correct IDs', async () => {
            const jsx = await MessagesPage();
            const { container } = render(jsx);

            const msg1 = container.querySelector('[data-message-id="msg1"]');
            const msg2 = container.querySelector('[data-message-id="msg2"]');

            expect(msg1).toBeInTheDocument();
            expect(msg2).toBeInTheDocument();
        });

        it('should preserve message order', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards[0]).toHaveTextContent('Alice');
            expect(messageCards[1]).toHaveTextContent('Bob');
        });
    });

    describe('Empty State', () => {
        it('should display "no messages" text when messages array is empty', async () => {
            mockFetchMessages.mockResolvedValue([] as any);

            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
        });

        it('should not render message cards when empty', async () => {
            mockFetchMessages.mockResolvedValue([] as any);

            const jsx = await MessagesPage();
            render(jsx);

            const messageCards = screen.queryAllByTestId('message-card');
            expect(messageCards).toHaveLength(0);
        });

        it('should still render breadcrumbs in empty state', async () => {
            mockFetchMessages.mockResolvedValue([] as any);

            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
        });
    });

    describe('Multiple Messages', () => {
        it('should handle many messages', async () => {
            const manyMessages = Array.from({ length: 20 }, (_, i) => ({
                _id: `msg${i}`,
                sender: { username: `User${i}` },
                body: `Message ${i}`,
                read: i % 2 === 0,
            }));

            mockFetchMessages.mockResolvedValue(manyMessages as any);

            const jsx = await MessagesPage();
            render(jsx);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(20);
        });

        it('should handle single message', async () => {
            mockFetchMessages.mockResolvedValue([mockMessages[0]] as any);

            const jsx = await MessagesPage();
            render(jsx);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(1);
        });
    });

    describe('Metadata', () => {
        it('should export metadata with Messages title', async () => {
            const { metadata } = await import('@/app/(root)/messages/page');
            expect(metadata.title).toBe('Messages');
        });

        it('should export dynamic as force-dynamic', async () => {
            const { dynamic } = await import('@/app/(root)/messages/page');
            expect(dynamic).toBe('force-dynamic');
        });
    });

    describe('Async Server Component', () => {
        it('should be an async function', () => {
            const result = MessagesPage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to JSX element', async () => {
            const jsx = await MessagesPage();
            expect(jsx).toBeDefined();
            expect(typeof jsx).toBe('object');
        });
    });

    describe('Error Handling', () => {
        it('should handle requireSessionUser errors', async () => {
            mockRequireSessionUser.mockRejectedValue(new Error('Unauthorized'));

            await expect(MessagesPage()).rejects.toThrow('Unauthorized');
        });

        it('should handle fetchMessages errors', async () => {
            mockFetchMessages.mockRejectedValue(new Error('Database error'));

            await expect(MessagesPage()).rejects.toThrow('Database error');
        });

        it('should handle null messages response', async () => {
            mockFetchMessages.mockResolvedValue(null as any);

            await expect(async () => {
                const jsx = await MessagesPage();
                render(jsx);
            }).rejects.toThrow();
        });
    });

    describe('Data Flow', () => {
        it('should complete full data flow', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            // Authentication completed
            expect(mockRequireSessionUser).toHaveBeenCalled();

            // Messages fetched
            expect(mockFetchMessages).toHaveBeenCalled();

            // UI rendered
            expect(screen.getAllByTestId('message-card')).toHaveLength(2);
        });

        it('should use session user id for fetching messages', async () => {
            await MessagesPage();

            expect(mockFetchMessages).toHaveBeenCalledWith(mockSessionUser.id);
        });
    });

    describe('Layout', () => {
        it('should render messages in space-y-5 container', async () => {
            const jsx = await MessagesPage();
            const { container } = render(jsx);

            const messagesContainer = container.querySelector('.space-y-5');
            expect(messagesContainer).toBeInTheDocument();
        });

        it('should apply m-auto to content container', async () => {
            const jsx = await MessagesPage();
            const { container } = render(jsx);

            const contentContainer = container.querySelector('.m-auto');
            expect(contentContainer).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should integrate breadcrumbs and message cards', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
            expect(screen.getAllByTestId('message-card')).toHaveLength(2);
        });

        it('should pass correct props to child components', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            // Breadcrumbs should have correct structure
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toHaveTextContent('Home');
            expect(breadcrumbs).toHaveTextContent('Your Messages');

            // Message cards should have correct data
            expect(screen.getByText('Message from: Alice')).toBeInTheDocument();
            expect(screen.getByText('Message from: Bob')).toBeInTheDocument();
        });
    });

    describe('Conditional Rendering', () => {
        it('should render messages when available', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.getAllByTestId('message-card')).toHaveLength(2);
            expect(screen.queryByText('You have no messages.')).not.toBeInTheDocument();
        });

        it('should render empty state when no messages', async () => {
            mockFetchMessages.mockResolvedValue([] as any);

            const jsx = await MessagesPage();
            render(jsx);

            expect(screen.queryAllByTestId('message-card')).toHaveLength(0);
            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
        });
    });

    describe('Message Array Handling', () => {
        it('should check messages.length for empty state', async () => {
            mockFetchMessages.mockResolvedValue([] as any);

            const jsx = await MessagesPage();
            render(jsx);

            // Empty state should be visible
            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
        });

        it('should use map to render message cards', async () => {
            const jsx = await MessagesPage();
            render(jsx);

            // Each message should be rendered
            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(mockMessages.length);
        });
    });
});
