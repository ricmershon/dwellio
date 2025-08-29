import React from 'react';
import { render, screen } from '@/__tests__/test-utils';

import MessageCard from '@/ui/messages/message-card';
import { MessageDocument } from '@/models';

// Mock child components
jest.mock('@/ui/messages/toggle-message-read-button', () => {
    const MockToggleMessageReadButton = ({ messageId, read }: { messageId: string; read: boolean }) => (
        <div 
            data-testid="toggle-message-read-button"
            data-message-id={messageId}
            data-read={read}
        >
            {read ? 'Mark as Unread' : 'Mark as Read'}
        </div>
    );
    MockToggleMessageReadButton.displayName = 'MockToggleMessageReadButton';
    return MockToggleMessageReadButton;
});

jest.mock('@/ui/messages/delete-message-button', () => {
    const MockDeleteMessageButton = ({ messageId }: { messageId: string }) => (
        <div 
            data-testid="delete-message-button"
            data-message-id={messageId}
        >
            Delete
        </div>
    );
    MockDeleteMessageButton.displayName = 'MockDeleteMessageButton';
    return MockDeleteMessageButton;
});

describe('MessageCard', () => {
    const createMockMessage = (overrides = {}): MessageDocument => ({
        _id: 'message-123',
        sender: 'sender-123',
        recipient: 'recipient-123',
        property: {
            _id: 'property-123',
            name: 'Beautiful Downtown Condo'
        },
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        body: 'I am interested in this property. Please contact me for more information.',
        read: false,
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
        ...overrides
    } as unknown as MessageDocument);

    describe('Content Display', () => {
        it('should display property name from populated property object', () => {
            const message = createMockMessage();
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByText('Beautiful Downtown Condo')).toBeInTheDocument();
        });

        it('should render message body text', () => {
            const message = createMockMessage({
                body: 'Custom message content for testing purposes.'
            });
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByText('Custom message content for testing purposes.')).toBeInTheDocument();
        });

        it('should show formatted creation date with toLocaleString', () => {
            const message = createMockMessage({
                createdAt: new Date('2024-03-15T14:45:30Z')
            });
            
            render(<MessageCard message={message} />);
            
            const expectedDate = new Date('2024-03-15T14:45:30Z').toLocaleString();
            expect(screen.getByText(expectedDate)).toBeInTheDocument();
        });

        it('should display sender email with mailto link', () => {
            const message = createMockMessage({
                email: 'test.user@example.com'
            });
            
            render(<MessageCard message={message} />);
            
            const emailLink = screen.getByRole('link', { name: 'test.user@example.com' });
            expect(emailLink).toHaveAttribute('href', 'mailto:test.user@example.com');
            expect(emailLink).toHaveClass('text-blue-500');
        });

        it('should display sender phone with tel link', () => {
            const message = createMockMessage({
                phone: '+1-555-9999'
            });
            
            render(<MessageCard message={message} />);
            
            const phoneLink = screen.getByRole('link', { name: '+1-555-9999' });
            expect(phoneLink).toHaveAttribute('href', 'tel:+1-555-9999');
            expect(phoneLink).toHaveClass('text-blue-500');
        });
    });

    describe('Conditional Rendering', () => {
        it('should show "New" badge for unread messages', () => {
            const message = createMockMessage({ read: false });
            
            render(<MessageCard message={message} />);
            
            const newBadge = screen.getByText('New');
            expect(newBadge).toBeInTheDocument();
            expect(newBadge).toHaveClass('bg-yellow-500', 'text-white');
        });

        it('should hide "New" badge for read messages', () => {
            const message = createMockMessage({ read: true });
            
            render(<MessageCard message={message} />);
            
            expect(screen.queryByText('New')).not.toBeInTheDocument();
        });

        it('should handle property as object with name field', () => {
            const message = createMockMessage({
                property: {
                    _id: 'prop-456',
                    name: 'Luxury Apartment Complex'
                }
            });
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByText('Luxury Apartment Complex')).toBeInTheDocument();
        });

        it('should gracefully handle missing property data', () => {
            const message = createMockMessage({
                property: null
            });
            
            render(<MessageCard message={message} />);
            
            // Should not crash, property label should still be there
            expect(screen.getByText(/Property:/)).toBeInTheDocument();
        });

        it('should handle property without name field', () => {
            const message = createMockMessage({
                property: { _id: 'prop-789' }
            });
            
            render(<MessageCard message={message} />);
            
            // Should not crash, property label should still be there
            expect(screen.getByText(/Property:/)).toBeInTheDocument();
        });
    });

    describe('Link Generation', () => {
        it('should create correct mailto links with email addresses', () => {
            const message = createMockMessage({
                email: 'contact@realestate.com'
            });
            
            render(<MessageCard message={message} />);
            
            const emailLink = screen.getByRole('link', { name: 'contact@realestate.com' });
            expect(emailLink.getAttribute('href')).toBe('mailto:contact@realestate.com');
        });

        it('should create correct tel links with phone numbers', () => {
            const message = createMockMessage({
                phone: '(555) 123-4567'
            });
            
            render(<MessageCard message={message} />);
            
            const phoneLink = screen.getByRole('link', { name: '(555) 123-4567' });
            expect(phoneLink.getAttribute('href')).toBe('tel:(555) 123-4567');
        });

        it('should apply blue text color to contact links', () => {
            const message = createMockMessage();
            
            render(<MessageCard message={message} />);
            
            const emailLink = screen.getByRole('link', { name: message.email });
            const phoneLink = screen.getByRole('link', { name: message.phone });
            
            expect(emailLink).toHaveClass('text-blue-500');
            expect(phoneLink).toHaveClass('text-blue-500');
        });

        it('should handle special characters in email addresses', () => {
            const message = createMockMessage({
                email: 'user+test@example-domain.co.uk'
            });
            
            render(<MessageCard message={message} />);
            
            const emailLink = screen.getByRole('link', { name: 'user+test@example-domain.co.uk' });
            expect(emailLink.getAttribute('href')).toBe('mailto:user+test@example-domain.co.uk');
        });

        it('should handle special characters in phone numbers', () => {
            const message = createMockMessage({
                phone: '+44 (0)20 1234 5678'
            });
            
            render(<MessageCard message={message} />);
            
            const phoneLink = screen.getByRole('link', { name: '+44 (0)20 1234 5678' });
            expect(phoneLink.getAttribute('href')).toBe('tel:+44 (0)20 1234 5678');
        });
    });

    describe('Child Component Integration', () => {
        it('should render ToggleMessageReadButton with correct props', () => {
            const message = createMockMessage({ read: false });
            
            render(<MessageCard message={message} />);
            
            const toggleButton = screen.getByTestId('toggle-message-read-button');
            expect(toggleButton).toBeInTheDocument();
            expect(toggleButton).toHaveAttribute('data-message-id', 'message-123');
            expect(toggleButton).toHaveAttribute('data-read', 'false');
        });

        it('should render DeleteMessageButton with messageId', () => {
            const message = createMockMessage();
            
            render(<MessageCard message={message} />);
            
            const deleteButton = screen.getByTestId('delete-message-button');
            expect(deleteButton).toBeInTheDocument();
            expect(deleteButton).toHaveAttribute('data-message-id', 'message-123');
        });

        it('should pass message read state to toggle button', () => {
            const readMessage = createMockMessage({ read: true });
            
            render(<MessageCard message={readMessage} />);
            
            const toggleButton = screen.getByTestId('toggle-message-read-button');
            expect(toggleButton).toHaveAttribute('data-read', 'true');
            expect(toggleButton).toHaveTextContent('Mark as Unread');
        });

        it('should maintain component layout and spacing', () => {
            const message = createMockMessage();
            const { container } = render(<MessageCard message={message} />);
            
            // Check that both buttons are present in the card
            expect(screen.getByTestId('toggle-message-read-button')).toBeInTheDocument();
            expect(screen.getByTestId('delete-message-button')).toBeInTheDocument();
            
            // Verify card container structure
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass('relative', 'bg-white', 'p-4', 'rounded-md');
        });
    });

    describe('Data Handling', () => {
        it('should handle MessageDocument interface correctly', () => {
            const message = createMockMessage();
            
            expect(() => render(<MessageCard message={message} />)).not.toThrow();
        });

        it('should type-cast _id as string for child components', () => {
            const message = createMockMessage({
                _id: 'test-id-string'
            });
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByTestId('toggle-message-read-button')).toHaveAttribute('data-message-id', 'test-id-string');
            expect(screen.getByTestId('delete-message-button')).toHaveAttribute('data-message-id', 'test-id-string');
        });

        it('should access nested property object safely', () => {
            const message = createMockMessage({
                property: {
                    _id: 'nested-prop',
                    name: 'Nested Property Name'
                }
            });
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByText('Nested Property Name')).toBeInTheDocument();
        });

        it('should format dates consistently', () => {
            const testDate = new Date('2024-06-01T08:15:30Z');
            const message = createMockMessage({
                createdAt: testDate
            });
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByText(testDate.toLocaleString())).toBeInTheDocument();
        });
    });

    describe('Styling and Layout', () => {
        it('should apply card styling with shadow, border, and padding', () => {
            const message = createMockMessage();
            const { container } = render(<MessageCard message={message} />);
            
            const card = container.firstChild as HTMLElement;
            expect(card).toHaveClass(
                'relative',
                'bg-white',
                'p-4',
                'rounded-md',
                'text-sm',
                'shadow-md',
                'border',
                'border-gray-100',
                'text-gray-700'
            );
        });

        it('should position "New" badge in top-right corner', () => {
            const message = createMockMessage({ read: false });
            
            render(<MessageCard message={message} />);
            
            const newBadge = screen.getByText('New');
            expect(newBadge).toHaveClass(
                'absolute',
                'top-3',
                'right-3',
                'bg-yellow-500',
                'text-white',
                'px-2',
                'py-1',
                'text-sm',
                'rounded-md'
            );
        });

        it('should maintain proper text hierarchy and spacing', () => {
            const message = createMockMessage();
            
            render(<MessageCard message={message} />);
            
            // Check heading has bottom margin
            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveClass('mb-4');
            
            // Check list has top margin
            const list = screen.getByRole('list');
            expect(list).toHaveClass('mt-4');
        });

        it('should handle long message content gracefully', () => {
            const longMessage = 'A'.repeat(1000);
            const message = createMockMessage({
                body: longMessage
            });
            
            render(<MessageCard message={message} />);
            
            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it('should render as a div with proper semantic structure', () => {
            const message = createMockMessage();
            const { container } = render(<MessageCard message={message} />);
            
            const card = container.firstChild as HTMLElement;
            expect(card.tagName).toBe('DIV');
            
            // Check semantic elements exist
            expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
            expect(screen.getByRole('list')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty message body', () => {
            const message = createMockMessage({ body: '' });
            
            render(<MessageCard message={message} />);
            
            // Should still render the card structure
            expect(screen.getByRole('heading')).toBeInTheDocument();
        });

        it('should handle missing email', () => {
            const message = createMockMessage({ email: '' });
            
            render(<MessageCard message={message} />);
            
            // Should still render email label but with empty link
            expect(screen.getByText(/Reply Email:/)).toBeInTheDocument();
        });

        it('should handle missing phone', () => {
            const message = createMockMessage({ phone: '' });
            
            render(<MessageCard message={message} />);
            
            // Should still render phone label but with empty link
            expect(screen.getByText(/Reply Phone:/)).toBeInTheDocument();
        });

        it('should handle different date formats', () => {
            const message = createMockMessage({
                createdAt: new Date('2023-12-25')
            });
            
            render(<MessageCard message={message} />);
            
            const expectedDate = new Date('2023-12-25').toLocaleString();
            expect(screen.getByText(expectedDate)).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for read message state', () => {
            const message = createMockMessage({ read: true });
            const { container } = render(<MessageCard message={message} />);
            expect(container.firstChild).toMatchSnapshot('read-message-state');
        });

        it('should match snapshot for unread message state (with "New" badge)', () => {
            const message = createMockMessage({ read: false });
            const { container } = render(<MessageCard message={message} />);
            expect(container.firstChild).toMatchSnapshot('unread-message-with-new-badge');
        });

        it('should match snapshot for long message content', () => {
            const longMessage = createMockMessage({
                body: 'This is a very long message that contains multiple sentences and should test how the component handles extensive text content. It includes various details about the property inquiry and demonstrates the component\'s ability to display lengthy communications from potential tenants or property owners. The message continues with more information about specific requirements, preferences, and questions about the property features, amenities, and availability.'
            });
            const { container } = render(<MessageCard message={longMessage} />);
            expect(container.firstChild).toMatchSnapshot('long-message-content');
        });

        it('should match snapshot for different property types', () => {
            const apartmentMessage = createMockMessage({
                property: { name: 'Luxury Downtown Apartment Complex' }
            });
            const { container } = render(<MessageCard message={apartmentMessage} />);
            expect(container.firstChild).toMatchSnapshot('apartment-property-type');
        });

        it('should match snapshot for house property type', () => {
            const houseMessage = createMockMessage({
                property: { name: 'Spacious Family House with Garden' }
            });
            const { container } = render(<MessageCard message={houseMessage} />);
            expect(container.firstChild).toMatchSnapshot('house-property-type');
        });

        it('should match snapshot with all contact information', () => {
            const fullContactMessage = createMockMessage({
                email: 'john.doe@example.com',
                phone: '555-123-4567',
                body: 'Complete message with all contact details'
            });
            const { container } = render(<MessageCard message={fullContactMessage} />);
            expect(container.firstChild).toMatchSnapshot('full-contact-information');
        });

        it('should match snapshot with minimal contact information', () => {
            const minimalMessage = createMockMessage({
                email: '',
                phone: '',
                body: 'Message with minimal contact info'
            });
            const { container } = render(<MessageCard message={minimalMessage} />);
            expect(container.firstChild).toMatchSnapshot('minimal-contact-information');
        });
    });
});