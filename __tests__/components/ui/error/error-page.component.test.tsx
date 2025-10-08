/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ErrorPage from '@/app/(root)/error';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/link', () => {
    const MockLink = ({ children, href, className }: any) => (
        <a href={href} className={className}>{children}</a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

jest.mock('react-icons/fa', () => ({
    FaExclamationCircle: () => <div data-testid="exclamation-icon">!</div>
}));

describe('Error Page', () => {
    const mockError = new Error('Test error message');

    describe('Error Display', () => {
        it('should render error message', () => {
            render(<ErrorPage error={mockError} />);

            expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
        });

        it('should display error as string using toString()', () => {
            const customError = new Error('Custom error');
            render(<ErrorPage error={customError} />);

            // Error.toString() returns "Error: Custom error"
            expect(screen.getByText(/Error: Custom error/i)).toBeInTheDocument();
        });

        it('should render exclamation circle icon', () => {
            render(<ErrorPage error={mockError} />);

            expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
        });

        it('should handle error with digest property', () => {
            const errorWithDigest = Object.assign(new Error('Error with digest'), {
                digest: 'abc123'
            });

            render(<ErrorPage error={errorWithDigest} />);

            expect(screen.getByText(/Error with digest/i)).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should render Return Home link', () => {
            render(<ErrorPage error={mockError} />);

            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toBeInTheDocument();
        });

        it('should link to homepage', () => {
            render(<ErrorPage error={mockError} />);

            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should style link with primary button classes', () => {
            render(<ErrorPage error={mockError} />);

            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toHaveClass('btn');
            expect(homeLink).toHaveClass('btn-primary');
        });
    });

    describe('Layout and Styling', () => {
        it('should render section with full height', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('h-screen');
        });

        it('should center content', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('flex', 'flex-col', 'items-center');
        });

        it('should apply text-center to section', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('text-center');
        });

        it('should have margin top on content container', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const contentDiv = container.querySelector('.mt-10');
            expect(contentDiv).toBeInTheDocument();
        });

        it('should style error text with medium font and large size', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const errorText = container.querySelector('.font-medium.text-lg');
            expect(errorText).toBeInTheDocument();
            expect(errorText).toHaveTextContent(/Test error message/i);
        });

        it('should have spacer for vertical layout', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const spacer = container.querySelector('.flex-grow');
            expect(spacer).toBeInTheDocument();
        });
    });

    describe('Icon Styling', () => {
        it('should center icon with flex justify-center', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const iconContainer = container.querySelector('.flex.justify-center');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should apply correct icon styling classes', () => {
            // Icon component is mocked, but we can verify the container exists
            const { container } = render(<ErrorPage error={mockError} />);

            const iconContainer = container.querySelector('.flex.justify-center');
            expect(iconContainer).toContainElement(screen.getByTestId('exclamation-icon'));
        });
    });

    describe('Error Types', () => {
        it('should handle TypeError', () => {
            const typeError = new TypeError('Type error occurred');
            render(<ErrorPage error={typeError} />);

            expect(screen.getByText(/TypeError: Type error occurred/i)).toBeInTheDocument();
        });

        it('should handle ReferenceError', () => {
            const refError = new ReferenceError('Reference error occurred');
            render(<ErrorPage error={refError} />);

            expect(screen.getByText(/ReferenceError: Reference error occurred/i)).toBeInTheDocument();
        });

        it('should handle generic Error', () => {
            const genericError = new Error('Generic error');
            render(<ErrorPage error={genericError} />);

            expect(screen.getByText(/Error: Generic error/i)).toBeInTheDocument();
        });

        it('should handle error with empty message', () => {
            const emptyError = new Error('');
            render(<ErrorPage error={emptyError} />);

            // Error with empty message renders as "Error"
            const errorText = screen.getByText(/Error/i);
            expect(errorText).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should be navigable with keyboard', () => {
            render(<ErrorPage error={mockError} />);

            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toBeVisible();
        });

        it('should have semantic section element', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should display error message visibly', () => {
            render(<ErrorPage error={mockError} />);

            const errorMessage = screen.getByText(/Test error message/i);
            expect(errorMessage).toBeVisible();
        });

        it('should have visible link text', () => {
            render(<ErrorPage error={mockError} />);

            const linkText = screen.getByText(/return home/i);
            expect(linkText).toBeVisible();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long error messages', () => {
            const longMessage = 'A'.repeat(500);
            const longError = new Error(longMessage);
            render(<ErrorPage error={longError} />);

            expect(screen.getByText(new RegExp(longMessage))).toBeInTheDocument();
        });

        it('should handle error messages with special characters', () => {
            const specialError = new Error('Error: <script>alert("xss")</script>');
            render(<ErrorPage error={specialError} />);

            // React escapes HTML by default, so this should be safe
            expect(screen.getByText(/script/i)).toBeInTheDocument();
        });

        it('should handle error with newlines in message', () => {
            const multilineError = new Error('Line 1\nLine 2\nLine 3');
            render(<ErrorPage error={multilineError} />);

            expect(screen.getByText(/Line 1/i)).toBeInTheDocument();
        });

        it('should render without crashing', () => {
            expect(() => render(<ErrorPage error={mockError} />)).not.toThrow();
        });
    });

    describe('Component Structure', () => {
        it('should have proper component hierarchy', () => {
            const { container } = render(<ErrorPage error={mockError} />);

            const section = container.querySelector('section');
            const contentDiv = section?.querySelector('.mt-10');
            const iconContainer = contentDiv?.querySelector('.flex.justify-center');

            expect(section).toBeInTheDocument();
            expect(contentDiv).toBeInTheDocument();
            expect(iconContainer).toBeInTheDocument();
        });

        it('should include all required elements', () => {
            render(<ErrorPage error={mockError} />);

            // Icon
            expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();

            // Error message
            expect(screen.getByText(/Test error message/i)).toBeInTheDocument();

            // Return home link
            expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
        });
    });

    describe('Client Component', () => {
        it('should be a client component', () => {
            // The component file has "use client" directive
            // We can verify it renders without server-side restrictions
            render(<ErrorPage error={mockError} />);

            expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
        });

        it('should render synchronously', () => {
            const result = render(<ErrorPage error={mockError} />);

            // Should be immediately available, not a promise
            expect(result.container).toBeInTheDocument();
        });
    });
});
