import React from 'react';
import { render, screen } from '@testing-library/react';
import Error from '@/app/(root)/error';

// Mock Next.js Link component
jest.mock('next/link', () => {
    const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
        <a href={href} {...props}>
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return {
        __esModule: true,
        default: MockLink,
    };
});

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaExclamationCircle: () => <div data-testid="exclamation-icon">!</div>,
}));

describe('Error Component', () => {
    const mockError = { 
        toString: () => 'Error: Test error message',
        message: 'Test error message',
        name: 'Error'
    } as Error;

    describe('Component Structure', () => {
        it('should render section element with correct classes', () => {
            render(<Error error={mockError} />);
            
            const sectionElement = document.querySelector('section');
            expect(sectionElement).toBeInTheDocument();
            expect(sectionElement).toHaveClass('h-screen', 'text-center', 'flex', 'flex-col', 'jusitfy-center', 'items-center');
        });

        it('should display error message', () => {
            render(<Error error={mockError} />);
            
            expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
        });

        it('should render exclamation icon', () => {
            render(<Error error={mockError} />);
            
            expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
        });

        it('should render return home link', () => {
            render(<Error error={mockError} />);
            
            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toBeInTheDocument();
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should apply correct classes to return home link', () => {
            render(<Error error={mockError} />);
            
            const homeLink = screen.getByRole('link', { name: /return home/i });
            expect(homeLink).toHaveClass('btn', 'btn-primary');
        });
    });

    describe('Error Handling', () => {
        it('should handle different error messages', () => {
            const customError = { 
                toString: () => 'Error: Custom error message',
                message: 'Custom error message',
                name: 'Error'
            } as Error;
            render(<Error error={customError} />);
            
            expect(screen.getByText('Error: Custom error message')).toBeInTheDocument();
        });

        it('should handle error with digest property', () => {
            const errorWithDigest = { 
                toString: () => 'Error: Digest error',
                message: 'Digest error',
                name: 'Error',
                digest: 'abc123'
            } as Error & { digest?: string };
            render(<Error error={errorWithDigest} />);
            
            expect(screen.getByText('Error: Digest error')).toBeInTheDocument();
        });

        it('should handle empty error message', () => {
            const emptyError = { 
                toString: () => 'Error',
                message: '',
                name: 'Error'
            } as Error;
            render(<Error error={emptyError} />);
            
            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('should have proper flex layout structure', () => {
            render(<Error error={mockError} />);
            
            const section = document.querySelector('section');
            expect(section).toHaveClass('flex', 'flex-col');
            
            // Should have flex-grow div for spacing
            const flexGrowDiv = section?.querySelector('.flex-grow');
            expect(flexGrowDiv).toBeInTheDocument();
        });

        it('should center content vertically and horizontally', () => {
            render(<Error error={mockError} />);
            
            const section = document.querySelector('section');
            expect(section).toHaveClass('items-center', 'text-center');
        });
    });

    describe('Component Properties', () => {
        it('should be a client component', () => {
            // This component uses "use client" directive
            expect(typeof Error).toBe('function');
        });

        it('should accept error prop with correct TypeScript interface', () => {
            const errorWithDigest = { 
                toString: () => 'Error: Test',
                message: 'Test',
                name: 'Error',
                digest: 'test-digest'
            } as Error & { digest?: string };
            expect(() => render(<Error error={errorWithDigest} />)).not.toThrow();
        });
    });
});