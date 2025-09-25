import { render, screen } from '@testing-library/react';
import ErrorPage from '@/app/(root)/error';

describe('Error Page', () => {
    describe('Error Display', () => {
        it('should display error message', () => {
            const error = new Error('Something went wrong');

            render(<ErrorPage error={error} />);

            expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument();
        });

        it('should display error message from toString method', () => {
            const error = new Error('Network connection failed');

            render(<ErrorPage error={error} />);

            expect(screen.getByText(error.toString())).toBeInTheDocument();
        });

        it('should display custom error message with digest', () => {
            const error = Object.assign(new Error('Custom error'), { digest: 'abc123' });

            render(<ErrorPage error={error} />);

            expect(screen.getByText(error.toString())).toBeInTheDocument();
        });
    });

    describe('Error UI Elements', () => {
        it('should display exclamation circle icon', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            const iconContainer = document.querySelector('.flex.justify-center');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should display return home link', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            const homeLink = screen.getByRole('link', { name: 'Return Home' });
            expect(homeLink).toBeInTheDocument();
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should have correct CSS classes for layout', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            const section = document.querySelector('section');
            expect(section).toHaveClass('h-screen', 'text-center', 'flex', 'flex-col', 'jusitfy-center', 'items-center');
        });

        it('should have return home button with primary styling', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            const homeLink = screen.getByRole('link', { name: 'Return Home' });
            expect(homeLink).toHaveClass('btn', 'btn-primary');
        });
    });

    describe('Error Handling Edge Cases', () => {
        it('should handle error with empty message', () => {
            const error = new Error('');

            render(<ErrorPage error={error} />);

            expect(screen.getByText('Error')).toBeInTheDocument();
        });

        it('should handle error with null message', () => {
            const error = new Error();
            Object.defineProperty(error, 'message', { value: null });

            render(<ErrorPage error={error} />);

            expect(screen.getByText(error.toString())).toBeInTheDocument();
        });

        it('should handle error with special characters in message', () => {
            const error = new Error('Error with special chars: <>&"\'');

            render(<ErrorPage error={error} />);

            expect(screen.getByText(error.toString())).toBeInTheDocument();
        });

        it('should handle very long error message', () => {
            const longMessage = 'A'.repeat(500);
            const error = new Error(longMessage);

            render(<ErrorPage error={error} />);

            expect(screen.getByText(error.toString())).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            expect(document.querySelector('section')).toBeInTheDocument();
            expect(screen.getByRole('link')).toBeInTheDocument();
        });

        it('should have readable error message', () => {
            const error = new Error('Database connection timeout');

            render(<ErrorPage error={error} />);

            const errorMessage = screen.getByText(error.toString());
            expect(errorMessage).toHaveClass('font-medium', 'text-lg', 'mb-5');
        });
    });

    describe('Layout Structure', () => {
        it('should have correct container structure', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            const section = document.querySelector('section');
            expect(section).not.toBeNull();
            expect(section!.children).toHaveLength(2);
            expect(section!.lastElementChild).toHaveClass('flex-grow');
        });

        it('should center content properly', () => {
            const error = new Error('Test error');

            render(<ErrorPage error={error} />);

            const section = document.querySelector('section');
            expect(section).toHaveClass('items-center');
        });
    });
});