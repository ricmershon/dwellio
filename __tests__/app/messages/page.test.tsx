// Mock all external dependencies first
jest.mock('@/lib/data/message-data', () => ({
    fetchMessages: jest.fn()
}));

jest.mock('@/utils/require-session-user', () => ({
    requireSessionUser: jest.fn()
}));

jest.mock('@/ui/messages/message-card', () => ({
    __esModule: true,
    default: ({ message }: { message: any }) => (
        <div data-testid="message-card" data-message-id={message._id}>
            Message Card - {message.body}
        </div>
    ),
}));

jest.mock('@/ui/shared/breadcrumbs', () => ({
    __esModule: true,
    default: ({ breadcrumbs }: { breadcrumbs: any[] }) => (
        <nav data-testid="breadcrumbs">
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={index} data-active={breadcrumb.active || false}>
                    {breadcrumb.label}
                </span>
            ))}
        </nav>
    ),
}));

// Import after mocks
import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import MessagesPage from '@/app/messages/page';
import { MessageDocument } from '@/models';

const { fetchMessages } = jest.requireMock('@/lib/data/message-data');
const { requireSessionUser } = jest.requireMock('@/utils/require-session-user');

describe('MessagesPage', () => {
    const mockSessionUser = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User'
    };

    const mockMessages = [
        {
            _id: 'msg1',
            body: 'Test message 1',
            sender: { username: 'sender1' },
            property: { name: 'Property 1' },
            recipient: mockSessionUser.id,
            read: false,
            createdAt: new Date('2024-01-01')
        },
        {
            _id: 'msg2',
            body: 'Test message 2',
            sender: { username: 'sender2' },
            property: { name: 'Property 2' },
            recipient: mockSessionUser.id,
            read: true,
            createdAt: new Date('2024-01-02')
        },
        {
            _id: 'msg3',
            body: 'Test message 3',
            sender: { username: 'sender3' },
            property: { name: 'Property 3' },
            recipient: mockSessionUser.id,
            read: false,
            createdAt: new Date('2024-01-03')
        }
    ] as unknown as MessageDocument[];

    beforeEach(() => {
        jest.clearAllMocks();
        requireSessionUser.mockResolvedValue(mockSessionUser);
        fetchMessages.mockResolvedValue(mockMessages);
    });

    describe('Authentication Integration', () => {
        it('should call requireSessionUser before rendering', async () => {
            const component = await MessagesPage();
            render(component);

            expect(requireSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should pass user ID to data fetching', async () => {
            const component = await MessagesPage();
            render(component);

            expect(fetchMessages).toHaveBeenCalledWith(mockSessionUser.id);
        });

        it('should handle authentication redirects', async () => {
            requireSessionUser.mockRejectedValue(new Error('Authentication required'));

            await expect(MessagesPage()).rejects.toThrow('Authentication required');
        });

        it('should handle session errors gracefully', async () => {
            requireSessionUser.mockRejectedValue(new Error('Session expired'));

            await expect(MessagesPage()).rejects.toThrow('Session expired');
        });
    });

    describe('Data Fetching Integration', () => {
        it('should call fetchMessages with user ID', async () => {
            const component = await MessagesPage();
            render(component);

            expect(fetchMessages).toHaveBeenCalledWith(mockSessionUser.id);
            expect(fetchMessages).toHaveBeenCalledTimes(1);
        });

        it('should handle successful data retrieval', async () => {
            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(3);
        });

        it('should process message array correctly', async () => {
            const component = await MessagesPage();
            render(component);

            expect(screen.getByText('Message Card - Test message 1')).toBeInTheDocument();
            expect(screen.getByText('Message Card - Test message 2')).toBeInTheDocument();
            expect(screen.getByText('Message Card - Test message 3')).toBeInTheDocument();
        });

        it('should handle empty message arrays', async () => {
            fetchMessages.mockResolvedValue([]);

            const component = await MessagesPage();
            render(component);

            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
            expect(screen.queryAllByTestId('message-card')).toHaveLength(0);
        });
    });

    describe('Component Orchestration', () => {
        it('should render main element as container', async () => {
            const component = await MessagesPage();
            render(component);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render Breadcrumbs with correct props', async () => {
            const component = await MessagesPage();
            render(component);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Your Messages')).toBeInTheDocument();
        });

        it('should render MessageCard for each message', async () => {
            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(3);

            expect(messageCards[0]).toHaveAttribute('data-message-id', 'msg1');
            expect(messageCards[1]).toHaveAttribute('data-message-id', 'msg2');
            expect(messageCards[2]).toHaveAttribute('data-message-id', 'msg3');
        });

        it('should maintain proper component hierarchy', async () => {
            const component = await MessagesPage();
            render(component);

            const main = screen.getByRole('main');
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            const messageCards = screen.getAllByTestId('message-card');

            expect(main).toContainElement(breadcrumbs);
            messageCards.forEach(card => {
                expect(main).toContainElement(card);
            });
        });
    });

    describe('Breadcrumbs Integration', () => {
        it('should pass correct breadcrumb array', async () => {
            const component = await MessagesPage();
            render(component);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Your Messages')).toBeInTheDocument();
        });

        it('should set "Your Messages" as active', async () => {
            const component = await MessagesPage();
            render(component);

            const activeElement = screen.getByText('Your Messages');
            expect(activeElement).toHaveAttribute('data-active', 'true');
        });

        it('should include Home link', async () => {
            const component = await MessagesPage();
            render(component);

            const homeElement = screen.getByText('Home');
            expect(homeElement).toHaveAttribute('data-active', 'false');
        });

        it('should handle navigation properly', async () => {
            const component = await MessagesPage();
            render(component);

            const breadcrumbs = screen.getByTestId('breadcrumbs');
            expect(breadcrumbs).toBeInTheDocument();
            expect(breadcrumbs.children).toHaveLength(2);
        });
    });

    describe('Message List Rendering', () => {
        it('should iterate over messages array', async () => {
            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(mockMessages.length);
        });

        it('should use message._id as React key', async () => {
            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards[0]).toHaveAttribute('data-message-id', 'msg1');
            expect(messageCards[1]).toHaveAttribute('data-message-id', 'msg2');
            expect(messageCards[2]).toHaveAttribute('data-message-id', 'msg3');
        });

        it('should pass complete message object', async () => {
            const component = await MessagesPage();
            render(component);

            expect(screen.getByText('Message Card - Test message 1')).toBeInTheDocument();
            expect(screen.getByText('Message Card - Test message 2')).toBeInTheDocument();
            expect(screen.getByText('Message Card - Test message 3')).toBeInTheDocument();
        });

        it('should maintain message order', async () => {
            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            const messageIds = messageCards.map(card => card.getAttribute('data-message-id'));
            expect(messageIds).toEqual(['msg1', 'msg2', 'msg3']);
        });
    });

    describe('Empty State Handling', () => {
        it('should show "You have no messages." when empty', async () => {
            fetchMessages.mockResolvedValue([]);

            const component = await MessagesPage();
            render(component);

            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
        });

        it('should hide message list when no messages', async () => {
            fetchMessages.mockResolvedValue([]);

            const component = await MessagesPage();
            render(component);

            expect(screen.queryAllByTestId('message-card')).toHaveLength(0);
        });

        it('should maintain layout structure', async () => {
            fetchMessages.mockResolvedValue([]);

            const component = await MessagesPage();
            render(component);

            const main = screen.getByRole('main');
            const breadcrumbs = screen.getByTestId('breadcrumbs');
            
            expect(main).toBeInTheDocument();
            expect(breadcrumbs).toBeInTheDocument();
            expect(screen.getByText('You have no messages.')).toBeInTheDocument();
        });

        it('should handle null arrays', async () => {
            fetchMessages.mockResolvedValue(null);

            // The component doesn't handle null arrays - it will throw
            await expect(MessagesPage()).rejects.toThrow("Cannot read properties of null (reading 'length')");
        });
    });

    describe('Layout and Styling', () => {
        it('should apply margin auto to container', async () => {
            const component = await MessagesPage();
            render(component);

            const container = screen.getByRole('main').querySelector('.m-auto');
            expect(container).toBeInTheDocument();
        });

        it('should use space-y-5 for message spacing', async () => {
            const component = await MessagesPage();
            render(component);

            const messageContainer = screen.getByRole('main').querySelector('.space-y-5');
            expect(messageContainer).toBeInTheDocument();
        });

        it('should maintain responsive design', async () => {
            const component = await MessagesPage();
            render(component);

            const main = screen.getByRole('main');
            expect(main).toBeInTheDocument();
            
            const container = main.querySelector('.m-auto');
            expect(container).toBeInTheDocument();
            
            const messageArea = container?.querySelector('.space-y-5');
            expect(messageArea).toBeInTheDocument();
        });

        it('should handle overflow content', async () => {
            const manyMessages = Array.from({ length: 20 }, (_, i) => ({
                _id: `msg${i}`,
                body: `Test message ${i}`,
                sender: { username: `sender${i}` },
                property: { name: `Property ${i}` },
                recipient: mockSessionUser.id,
                read: i % 2 === 0,
                createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
            })) as unknown as MessageDocument[];

            fetchMessages.mockResolvedValue(manyMessages);

            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(20);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle data fetch errors', async () => {
            fetchMessages.mockRejectedValue(new Error('Database connection failed'));

            await expect(MessagesPage()).rejects.toThrow('Database connection failed');
        });

        it('should handle malformed session data', async () => {
            requireSessionUser.mockResolvedValue({ id: null });

            // Should handle null user ID - fetchMessages will be called with null
            const component = await MessagesPage();
            render(component);

            expect(fetchMessages).toHaveBeenCalledWith(null);
        });

        it('should handle missing user id in session', async () => {
            requireSessionUser.mockResolvedValue({});

            // Should handle missing id field
            const component = await MessagesPage();
            render(component);

            expect(fetchMessages).toHaveBeenCalledWith(undefined);
        });

        it('should handle message data transformation errors', async () => {
            const malformedMessages = [
                { _id: 'msg1' }, // Missing required fields
                { _id: 'msg2', body: 'Test' } // Partial data
            ] as unknown as MessageDocument[];

            fetchMessages.mockResolvedValue(malformedMessages);

            const component = await MessagesPage();
            render(component);

            const messageCards = screen.getAllByTestId('message-card');
            expect(messageCards).toHaveLength(2);
        });

        it('should maintain security boundaries', async () => {
            requireSessionUser.mockRejectedValue(new Error('Unauthorized'));

            await expect(MessagesPage()).rejects.toThrow('Unauthorized');
            expect(fetchMessages).not.toHaveBeenCalled();
        });
    });

    describe('Server Component Behavior', () => {
        it('should be an async server component', async () => {
            expect(MessagesPage).toBeDefined();
            
            const result = MessagesPage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should handle server-side data fetching', async () => {
            const component = await MessagesPage();
            render(component);

            // Both auth and data fetch should be called server-side
            expect(requireSessionUser).toHaveBeenCalled();
            expect(fetchMessages).toHaveBeenCalled();
        });

        it('should process data before rendering', async () => {
            const component = await MessagesPage();
            render(component);

            // Data should be pre-processed and ready for rendering
            expect(screen.getAllByTestId('message-card')).toHaveLength(3);
            expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
        });
    });
});