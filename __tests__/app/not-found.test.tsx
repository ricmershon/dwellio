import { render, screen } from '@testing-library/react';
import NotFound from '@/app/(root)/not-found';

describe('NotFound Page', () => {
    describe('Content Display', () => {
        it('should display 404 status code', () => {
            render(<NotFound />);

            expect(screen.getByText('404')).toBeInTheDocument();
        });

        it('should display not found message', () => {
            render(<NotFound />);

            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });

        it('should display heading with proper hierarchy', () => {
            render(<NotFound />);

            const statusHeading = screen.getByRole('heading', { level: 1 });
            expect(statusHeading).toHaveTextContent('404');

            const messageHeading = screen.getByRole('heading', { level: 2 });
            expect(messageHeading).toHaveTextContent('This page could not be found.');
        });
    });

    describe('Layout and Styling', () => {
        it('should have correct section layout classes', () => {
            render(<NotFound />);

            const section = document.querySelector('section');
            expect(section).toHaveClass(
                'h-screen',
                'text-center',
                'flex',
                'flex-col',
                'jusitfy-center',
                'items-center'
            );
        });

        it('should have 404 with proper styling', () => {
            render(<NotFound />);

            const statusHeading = screen.getByRole('heading', { level: 1 });
            expect(statusHeading).toHaveClass(
                'inline-block',
                'mt-10',
                'mr-5',
                'pr-5',
                'font-medium',
                'align-top',
                'leading-12',
                'border-r',
                'border-gray-800',
                'text-2xl'
            );
        });

        it('should have message with proper styling', () => {
            render(<NotFound />);

            const messageHeading = screen.getByRole('heading', { level: 2 });
            expect(messageHeading).toHaveClass(
                'font-medium',
                'text-lg',
                'leading-12',
                'mt-10'
            );
        });

        it('should have proper container structure', () => {
            render(<NotFound />);

            const section = document.querySelector('section');
            expect(section).not.toBeNull();
            expect(section!.children).toHaveLength(1);

            const container = section!.firstElementChild;
            expect(container).not.toBeNull();
            expect(container?.children).toHaveLength(2);
        });
    });

    describe('Typography and Design', () => {
        it('should display 404 and message as separate inline blocks', () => {
            render(<NotFound />);

            const statusHeading = screen.getByRole('heading', { level: 1 });
            const messageContainer = statusHeading.nextElementSibling;

            expect(statusHeading).toHaveClass('inline-block');
            expect(messageContainer).toHaveClass('inline-block');
        });

        it('should have border separator between 404 and message', () => {
            render(<NotFound />);

            const statusHeading = screen.getByRole('heading', { level: 1 });
            expect(statusHeading).toHaveClass('border-r', 'border-gray-800');
        });

        it('should center content horizontally and vertically', () => {
            render(<NotFound />);

            const section = document.querySelector('section');
            expect(section).toHaveClass('text-center', 'items-center');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic heading structure', () => {
            render(<NotFound />);

            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
        });

        it('should provide meaningful content for screen readers', () => {
            render(<NotFound />);

            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });

        it('should have proper section role', () => {
            render(<NotFound />);

            expect(document.querySelector('section')).toBeInTheDocument();
        });
    });

    describe('Layout Structure Validation', () => {
        it('should maintain full screen height', () => {
            render(<NotFound />);

            const section = document.querySelector('section');
            expect(section).toHaveClass('h-screen');
        });

        it('should use flexbox layout correctly', () => {
            render(<NotFound />);

            const section = document.querySelector('section');
            expect(section).toHaveClass('flex', 'flex-col');
        });

        it('should have proper spacing with mt-10 classes', () => {
            render(<NotFound />);

            const statusHeading = screen.getByRole('heading', { level: 1 });
            const messageHeading = screen.getByRole('heading', { level: 2 });

            expect(statusHeading).toHaveClass('mt-10');
            expect(messageHeading).toHaveClass('mt-10');
        });
    });

    describe('Component Rendering', () => {
        it('should render without crashing', () => {
            expect(() => render(<NotFound />)).not.toThrow();
        });

        it('should export default component', () => {
            expect(NotFound).toBeDefined();
            expect(typeof NotFound).toBe('function');
        });

        it('should render consistently on multiple calls', () => {
            const { unmount } = render(<NotFound />);

            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();

            // Unmount and render again
            unmount();
            render(<NotFound />);

            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });
    });
});