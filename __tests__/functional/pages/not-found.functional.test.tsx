/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/(root)/not-found';

describe('NotFound Page', () => {
    describe('Component Rendering', () => {
        it('should render the page', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should display 404 error code', () => {
            render(<NotFound />);

            const errorCode = screen.getByText('404');
            expect(errorCode).toBeInTheDocument();
        });

        it('should display error message', () => {
            render(<NotFound />);

            const message = screen.getByText('This page could not be found.');
            expect(message).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('should have section as container element', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();
        });

        it('should have full screen height', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('h-screen');
        });

        it('should center content with flexbox', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('flex');
            expect(section).toHaveClass('flex-col');
            expect(section).toHaveClass('items-center');
        });

        it('should have text centered', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section).toHaveClass('text-center');
        });
    });

    describe('Error Code Display', () => {
        it('should render 404 in h1 tag', () => {
            render(<NotFound />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent('404');
        });

        it('should style 404 heading correctly', () => {
            const { container } = render(<NotFound />);

            const heading = container.querySelector('h1');
            expect(heading).toHaveClass('inline-block');
            expect(heading).toHaveClass('mt-10');
            expect(heading).toHaveClass('text-2xl');
        });

        it('should have border on the right of 404', () => {
            const { container } = render(<NotFound />);

            const heading = container.querySelector('h1');
            expect(heading).toHaveClass('border-r');
            expect(heading).toHaveClass('border-gray-800');
        });

        it('should display 404 inline', () => {
            const { container } = render(<NotFound />);

            const heading = container.querySelector('h1');
            expect(heading).toHaveClass('inline-block');
        });
    });

    describe('Error Message Display', () => {
        it('should render message in h2 tag', () => {
            render(<NotFound />);

            const message = screen.getByRole('heading', { level: 2 });
            expect(message).toHaveTextContent('This page could not be found.');
        });

        it('should style message correctly', () => {
            const { container } = render(<NotFound />);

            const message = container.querySelector('h2');
            expect(message).toHaveClass('font-medium');
            expect(message).toHaveClass('text-lg');
        });

        it('should display message inline', () => {
            const { container } = render(<NotFound />);

            const messageContainer = container.querySelector('div.inline-block');
            expect(messageContainer).toBeInTheDocument();
        });

        it('should have consistent vertical alignment', () => {
            const { container } = render(<NotFound />);

            const message = container.querySelector('h2');
            expect(message).toHaveClass('mt-10');
        });
    });

    describe('Layout Alignment', () => {
        it('should have 404 and message in same row', () => {
            const { container } = render(<NotFound />);

            const h1 = container.querySelector('h1');
            const messageDiv = container.querySelector('div.inline-block');

            expect(h1).toBeInTheDocument();
            expect(h1).toHaveClass('inline-block');
            expect(messageDiv).toBeInTheDocument();
            expect(messageDiv).toHaveClass('inline-block');
        });

        it('should separate 404 and message with border', () => {
            const { container } = render(<NotFound />);

            const h1 = container.querySelector('h1');
            expect(h1).toHaveClass('border-r');
            expect(h1).toHaveClass('mr-5');
            expect(h1).toHaveClass('pr-5');
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading hierarchy', () => {
            render(<NotFound />);

            const h1 = screen.getByRole('heading', { level: 1 });
            const h2 = screen.getByRole('heading', { level: 2 });

            expect(h1).toBeInTheDocument();
            expect(h2).toBeInTheDocument();
        });

        it('should be accessible to screen readers', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section).toBeVisible();
        });

        it('should have semantic HTML structure', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            const h1 = container.querySelector('h1');
            const h2 = container.querySelector('h2');

            expect(section).toBeInTheDocument();
            expect(h1).toBeInTheDocument();
            expect(h2).toBeInTheDocument();
        });
    });

    describe('Visual Structure', () => {
        it('should render error code and message together', () => {
            render(<NotFound />);

            const errorCode = screen.getByText('404');
            const message = screen.getByText('This page could not be found.');

            expect(errorCode).toBeInTheDocument();
            expect(message).toBeInTheDocument();
        });

        it('should have proper spacing classes', () => {
            const { container } = render(<NotFound />);

            const h1 = container.querySelector('h1');
            expect(h1).toHaveClass('mr-5');
            expect(h1).toHaveClass('pr-5');
        });

        it('should maintain consistent font styling', () => {
            const { container } = render(<NotFound />);

            const h1 = container.querySelector('h1');
            const h2 = container.querySelector('h2');

            expect(h1).toHaveClass('font-medium');
            expect(h2).toHaveClass('font-medium');
        });
    });

    describe('Edge Cases', () => {
        it('should render without errors', () => {
            expect(() => render(<NotFound />)).not.toThrow();
        });

        it('should handle rapid re-renders gracefully', () => {
            const { rerender } = render(<NotFound />);

            for (let i = 0; i < 5; i++) {
                rerender(<NotFound />);
            }

            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });

        it('should render consistently when unmounted and remounted', () => {
            const { unmount } = render(<NotFound />);
            unmount();

            render(<NotFound />);

            expect(screen.getByText('404')).toBeInTheDocument();
            expect(screen.getByText('This page could not be found.')).toBeInTheDocument();
        });

        it('should maintain structure across renders', () => {
            const { rerender } = render(<NotFound />);

            const initial404 = screen.getByText('404');
            expect(initial404).toBeInTheDocument();

            rerender(<NotFound />);

            const rerendered404 = screen.getByText('404');
            expect(rerendered404).toBeInTheDocument();
        });
    });

    describe('CSS Classes Verification', () => {
        it('should have all required section classes', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            expect(section?.className).toContain('h-screen');
            expect(section?.className).toContain('text-center');
            expect(section?.className).toContain('flex');
            expect(section?.className).toContain('flex-col');
            expect(section?.className).toContain('items-center');
        });

        it('should have all required h1 classes', () => {
            const { container } = render(<NotFound />);

            const h1 = container.querySelector('h1');
            expect(h1?.className).toContain('inline-block');
            expect(h1?.className).toContain('mt-10');
            expect(h1?.className).toContain('font-medium');
            expect(h1?.className).toContain('text-2xl');
            expect(h1?.className).toContain('border-r');
        });

        it('should have all required h2 classes', () => {
            const { container } = render(<NotFound />);

            const h2 = container.querySelector('h2');
            expect(h2?.className).toContain('font-medium');
            expect(h2?.className).toContain('text-lg');
            expect(h2?.className).toContain('mt-10');
        });
    });

    describe('Component Independence', () => {
        it('should be a pure component with no props', () => {
            const component = NotFound;
            expect(component).toBeDefined();
            expect(typeof component).toBe('function');
        });

        it('should render the same output every time', () => {
            const { container: container1 } = render(<NotFound />);
            const html1 = container1.innerHTML;

            const { container: container2 } = render(<NotFound />);
            const html2 = container2.innerHTML;

            expect(html1).toBe(html2);
        });

        it('should not require any external state', () => {
            expect(() => render(<NotFound />)).not.toThrow();
        });
    });

    describe('User Experience', () => {
        it('should display clear error information', () => {
            render(<NotFound />);

            // User should immediately see 404
            const errorCode = screen.getByText('404');
            expect(errorCode).toBeVisible();

            // User should see helpful message
            const message = screen.getByText('This page could not be found.');
            expect(message).toBeVisible();
        });

        it('should have visual separation between error code and message', () => {
            const { container } = render(<NotFound />);

            const h1 = container.querySelector('h1');
            expect(h1).toHaveClass('border-r');
            expect(h1).toHaveClass('mr-5');
        });
    });

    describe('Integration', () => {
        it('should render complete 404 page', () => {
            const { container } = render(<NotFound />);

            expect(container.querySelector('section')).toBeInTheDocument();
            expect(container.querySelector('h1')).toHaveTextContent('404');
            expect(container.querySelector('h2')).toHaveTextContent('This page could not be found.');
        });

        it('should maintain consistent layout', () => {
            const { container } = render(<NotFound />);

            const section = container.querySelector('section');
            const h1 = screen.getByRole('heading', { level: 1 });
            const h2 = screen.getByRole('heading', { level: 2 });

            expect(section).toContainElement(h1);
            expect(section).toContainElement(h2);
        });
    });
});
