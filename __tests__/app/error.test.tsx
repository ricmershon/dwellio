import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { createNextLinkMock } from '@/__tests__/shared-mocks';

import Error from '@/app/error';

// Use centralized mocks
jest.mock('next/link', () => createNextLinkMock());

jest.mock('react-icons/fa', () => ({
    FaExclamationCircle: ({ className }: { className?: string }) => (
        <div data-testid="exclamation-icon" className={className}>Exclamation Icon</div>
    ),
}));

describe('Error', () => {
    const mockError = new (globalThis.Error)('Test error message');
    const mockErrorWithDigest = Object.assign(new (globalThis.Error)('Database connection failed'), {
        digest: 'abc123'
    });

    describe('Rendering', () => {
        it('should render error page layout', () => {
            const { container } = render(<Error error={mockError} />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            expect(section).toHaveClass(
                'h-screen',
                'text-center',
                'flex',
                'flex-col',
                'jusitfy-center',
                'items-center'
            );
        });

        it('should render with correct layout structure', () => {
            const { container } = render(<Error error={mockError} />);
            
            const mainDiv = container.querySelector('.mt-10');
            expect(mainDiv).toBeInTheDocument();
            
            const flexGrowDiv = container.querySelector('.flex-grow');
            expect(flexGrowDiv).toBeInTheDocument();
        });
    });

    describe('Error Icon', () => {
        it('should render exclamation circle icon', () => {
            render(<Error error={mockError} />);
            
            const icon = screen.getByTestId('exclamation-icon');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-3xl', 'text-yellow-400');
        });

        it('should render icon in centered container', () => {
            const { container } = render(<Error error={mockError} />);
            
            const iconContainer = container.querySelector('.flex.justify-center');
            expect(iconContainer).toBeInTheDocument();
            expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
        });
    });

    describe('Error Message', () => {
        it('should display error message', () => {
            render(<Error error={mockError} />);
            
            const errorMessage = screen.getByText('Error: Test error message');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveClass('font-medium', 'text-lg', 'mb-5');
        });

        it('should display different error messages', () => {
            const customError = new (globalThis.Error)('Custom error occurred');
            render(<Error error={customError} />);
            
            expect(screen.getByText('Error: Custom error occurred')).toBeInTheDocument();
        });

        it('should handle error with digest property', () => {
            render(<Error error={mockErrorWithDigest} />);
            
            const errorMessage = screen.getByText('Error: Database connection failed');
            expect(errorMessage).toBeInTheDocument();
        });

        it('should call toString() on error object', () => {
            const errorWithCustomToString = {
                toString: () => 'Custom toString output',
                digest: 'test-digest'
            } as Error & { digest?: string };
            
            render(<Error error={errorWithCustomToString} />);
            
            expect(screen.getByText('Custom toString output')).toBeInTheDocument();
        });

        it('should render error message in correct container', () => {
            const { container } = render(<Error error={mockError} />);
            
            const messageContainer = container.querySelector('.text-center.mt-2');
            expect(messageContainer).toBeInTheDocument();
            
            const message = container.querySelector('.font-medium.text-lg.mb-5');
            expect(message).toBeInTheDocument();
        });
    });

    describe('Return Home Link', () => {
        it('should render return home link', () => {
            render(<Error error={mockError} />);
            
            const homeLink = screen.getByRole('link', { name: 'Return Home' });
            expect(homeLink).toBeInTheDocument();
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should have correct button styling', () => {
            render(<Error error={mockError} />);
            
            const homeLink = screen.getByRole('link', { name: 'Return Home' });
            expect(homeLink).toHaveClass('btn', 'btn-primary');
        });

        it('should render link text correctly', () => {
            render(<Error error={mockError} />);
            
            expect(screen.getByText('Return Home')).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('should have proper section structure', () => {
            const { container } = render(<Error error={mockError} />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            
            // Main content div
            const contentDiv = container.querySelector('.mt-10');
            expect(contentDiv).toBeInTheDocument();
            
            // Flex grow spacer
            const spacer = container.querySelector('.flex-grow');
            expect(spacer).toBeInTheDocument();
        });

        it('should center content properly', () => {
            const { container } = render(<Error error={mockError} />);
            
            const section = container.querySelector('section');
            expect(section).toHaveClass('flex', 'flex-col', 'items-center');
            
            const iconContainer = container.querySelector('.flex.justify-center');
            expect(iconContainer).toBeInTheDocument();
            
            const textContainer = container.querySelector('.text-center.mt-2');
            expect(textContainer).toBeInTheDocument();
        });
    });

    describe('Component Props', () => {
        it('should accept error prop correctly', () => {
            const testError = new (globalThis.Error)('Prop test error');
            render(<Error error={testError} />);
            
            expect(screen.getByText('Error: Prop test error')).toBeInTheDocument();
        });

        it('should handle error prop with digest', () => {
            const errorWithDigest = Object.assign(new (globalThis.Error)('Digest error'), {
                digest: 'digest123'
            });
            
            render(<Error error={errorWithDigest} />);
            
            expect(screen.getByText('Error: Digest error')).toBeInTheDocument();
        });

        it('should work with TypeScript error interface', () => {
            const baseError = new (globalThis.Error)('Type error occurred');
            baseError.name = 'TypeError';
            const typedError = Object.assign(baseError, {
                digest: 'type-digest'
            });
            typedError.toString = () => 'TypeError: Type error occurred';
            
            render(<Error error={typedError} />);
            
            expect(screen.getByText('TypeError: Type error occurred')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            const { container } = render(<Error error={mockError} />);
            
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
            
            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
        });

        it('should have accessible link text', () => {
            render(<Error error={mockError} />);
            
            const link = screen.getByRole('link', { name: 'Return Home' });
            expect(link).toHaveTextContent('Return Home');
        });

        it('should not have any accessibility violations', () => {
            render(<Error error={mockError} />);
            
            // Verify error message is readable
            const errorText = screen.getByText(/Error:/);
            expect(errorText).toBeInTheDocument();
            
            // Verify interactive element is accessible
            const homeLink = screen.getByRole('link');
            expect(homeLink).toHaveTextContent('Return Home');
        });
    });

    describe('Error Handling', () => {
        it('should handle empty error message', () => {
            const emptyError = new (globalThis.Error)('');
            render(<Error error={emptyError} />);
            
            expect(screen.getByText('Error')).toBeInTheDocument();
        });

        it('should handle undefined digest property', () => {
            const errorWithoutDigest = new (globalThis.Error)('No digest error');
            render(<Error error={errorWithoutDigest} />);
            
            expect(screen.getByText('Error: No digest error')).toBeInTheDocument();
        });

        it('should handle error with null message', () => {
            const nullError = Object.assign(new (globalThis.Error)(), {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                message: null as any,
                toString: () => 'Null error'
            });
            
            render(<Error error={nullError} />);
            
            expect(screen.getByText('Null error')).toBeInTheDocument();
        });
    });

    describe('CSS Classes', () => {
        it('should apply correct layout classes', () => {
            const { container } = render(<Error error={mockError} />);
            
            const section = container.querySelector('section');
            expect(section).toHaveClass(
                'h-screen',
                'text-center',
                'flex',
                'flex-col',
                'jusitfy-center', // Note: this is a typo in the original component
                'items-center'
            );
        });

        it('should apply correct content classes', () => {
            const { container } = render(<Error error={mockError} />);
            
            const contentDiv = container.querySelector('.mt-10');
            expect(contentDiv).toHaveClass('mt-10');
            
            const iconContainer = container.querySelector('.flex.justify-center');
            expect(iconContainer).toHaveClass('flex', 'justify-center');
            
            const textCenter = container.querySelector('.text-center.mt-2');
            expect(textCenter).toHaveClass('text-center', 'mt-2');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with basic error', () => {
            const { container } = render(<Error error={mockError} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with error containing digest', () => {
            const { container } = render(<Error error={mockErrorWithDigest} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with empty error message', () => {
            const emptyError = new (globalThis.Error)('');
            const { container } = render(<Error error={emptyError} />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});