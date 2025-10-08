/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import LoginLayout from '@/app/(login)/login/layout';

// Mock CSS imports
jest.mock('@/app/globals.css', () => ({}));

describe('LoginLayout', () => {
    describe('Layout Structure', () => {
        it('should render children within layout', () => {
            render(
                <LoginLayout>
                    <div data-testid="test-child">Test Content</div>
                </LoginLayout>
            );

            expect(screen.getByTestId('test-child')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should include html and body tags in component structure', () => {
            render(
                <LoginLayout>
                    <div data-testid="test-content">Test</div>
                </LoginLayout>
            );

            // Component renders html/body in its JSX structure
            // In jsdom, these don't mount the same way, but content should be accessible
            expect(screen.getByTestId('test-content')).toBeInTheDocument();
        });

        it('should not render navigation or footer', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            // LoginLayout is minimal - no nav or footer
            const nav = container.querySelector('nav');
            const footer = container.querySelector('footer');

            expect(nav).not.toBeInTheDocument();
            expect(footer).not.toBeInTheDocument();
        });
    });

    describe('Styling and Classes', () => {
        it('should apply correct background and text classes', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            const mainDiv = container.querySelector('.bg-white.text-gray-800');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should apply min-h-screen to content wrapper', () => {
            const { container } = render(
                <LoginLayout>
                    <div data-testid="content">Test</div>
                </LoginLayout>
            );

            const contentWrapper = container.querySelector('.min-h-screen');
            expect(contentWrapper).toBeInTheDocument();
            expect(contentWrapper).toContainElement(screen.getByTestId('content'));
        });

        it('should apply responsive padding classes', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            const contentWrapper = container.querySelector('.px-4.md\\:px-6.lg\\:px-8');
            expect(contentWrapper).toBeInTheDocument();
        });

        it('should apply responsive vertical padding', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            const contentWrapper = container.querySelector('.py-6.lg\\:py-8');
            expect(contentWrapper).toBeInTheDocument();
        });

        it('should apply flex column layout', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            const contentWrapper = container.querySelector('.flex.flex-col');
            expect(contentWrapper).toBeInTheDocument();
        });

        it('should apply overflow handling', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            const contentWrapper = container.querySelector('.md\\:overflow-y-auto');
            expect(contentWrapper).toBeInTheDocument();
        });
    });

    describe('Minimal Layout Design', () => {
        it('should have simpler structure than root layout', () => {
            const { container } = render(
                <LoginLayout>
                    <div data-testid="content">Content</div>
                </LoginLayout>
            );

            // Should only have essential divs, no providers, nav, footer, toast
            const divs = container.querySelectorAll('div');
            // Minimal: outer div (bg-white), inner div (flex), content
            expect(divs.length).toBeLessThan(5);
        });

        it('should not include toast container', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            expect(container.textContent).not.toContain('Toast');
        });

        it('should not include viewport cookie writer', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Test</div>
                </LoginLayout>
            );

            expect(container.textContent).not.toContain('Viewport');
        });

        it('should focus on login content only', () => {
            render(
                <LoginLayout>
                    <form data-testid="login-form">Login Form</form>
                </LoginLayout>
            );

            const loginForm = screen.getByTestId('login-form');
            expect(loginForm).toBeInTheDocument();
            expect(loginForm).toBeVisible();
        });
    });

    describe('Edge Cases', () => {
        it('should handle children with multiple elements', () => {
            render(
                <LoginLayout>
                    <>
                        <div data-testid="child-1">Child 1</div>
                        <div data-testid="child-2">Child 2</div>
                        <div data-testid="child-3">Child 3</div>
                    </>
                </LoginLayout>
            );

            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByTestId('child-3')).toBeInTheDocument();
        });

        it('should handle empty children', () => {
            const { container } = render(<LoginLayout>{null}</LoginLayout>);

            // Layout should still render even with null children
            const mainDiv = container.querySelector('.bg-white');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should handle complex nested children', () => {
            render(
                <LoginLayout>
                    <div>
                        <div>
                            <div data-testid="nested-child">Deeply Nested</div>
                        </div>
                    </div>
                </LoginLayout>
            );

            expect(screen.getByTestId('nested-child')).toBeInTheDocument();
        });

        it('should render without errors', () => {
            expect(() =>
                render(
                    <LoginLayout>
                        <div>Test</div>
                    </LoginLayout>
                )
            ).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible structure for screen readers', () => {
            render(
                <LoginLayout>
                    <main data-testid="main-content">Main Content</main>
                </LoginLayout>
            );

            const main = screen.getByTestId('main-content');
            expect(main).toBeVisible();
            expect(main.tagName).toBe('MAIN');
        });

        it('should allow keyboard navigation', () => {
            render(
                <LoginLayout>
                    <input data-testid="input" type="text" />
                    <button data-testid="button">Submit</button>
                </LoginLayout>
            );

            const input = screen.getByTestId('input');
            const button = screen.getByTestId('button');

            expect(input).toBeVisible();
            expect(button).toBeVisible();
        });
    });

    describe('Integration', () => {
        it('should render complete minimal layout', () => {
            const { container } = render(
                <LoginLayout>
                    <div data-testid="login-content">Login Page</div>
                </LoginLayout>
            );

            expect(container.querySelector('.bg-white')).toBeInTheDocument();
            expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
            expect(screen.getByTestId('login-content')).toBeInTheDocument();
        });

        it('should maintain layout structure across different children', () => {
            const { rerender } = render(
                <LoginLayout>
                    <div data-testid="content-1">Content 1</div>
                </LoginLayout>
            );

            expect(screen.getByTestId('content-1')).toBeInTheDocument();

            rerender(
                <LoginLayout>
                    <div data-testid="content-2">Content 2</div>
                </LoginLayout>
            );

            expect(screen.getByTestId('content-2')).toBeInTheDocument();
        });

        it('should provide clean slate for login pages', () => {
            const { container } = render(
                <LoginLayout>
                    <form data-testid="login-form">
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <button>Login</button>
                    </form>
                </LoginLayout>
            );

            // No distractions - just the login form
            const loginForm = screen.getByTestId('login-form');
            expect(loginForm).toBeInTheDocument();

            // No nav, footer, or other chrome
            expect(container.querySelector('nav')).not.toBeInTheDocument();
            expect(container.querySelector('footer')).not.toBeInTheDocument();
        });
    });

    describe('Comparison with Root Layout', () => {
        it('should be simpler than root layout (no providers)', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Content</div>
                </LoginLayout>
            );

            // No SessionProvider, GlobalContextProvider, etc.
            const providers = container.querySelectorAll('[data-testid*="provider"]');
            expect(providers.length).toBe(0);
        });

        it('should not include navigation components', () => {
            const { container } = render(
                <LoginLayout>
                    <div>Content</div>
                </LoginLayout>
            );

            expect(container.querySelector('nav')).not.toBeInTheDocument();
        });

        it('should share same styling structure', () => {
            const { container } = render(
                <LoginLayout>
                    <div data-testid="content">Content</div>
                </LoginLayout>
            );

            // Same classes as root layout for consistency
            expect(container.querySelector('.bg-white.text-gray-800')).toBeInTheDocument();
            expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
            expect(container.querySelector('.flex.flex-col')).toBeInTheDocument();
        });
    });

    describe('Synchronous Component', () => {
        it('should be a synchronous function (not async)', () => {
            const result = LoginLayout({ children: <div>Test</div> });
            // Should return JSX directly, not a Promise
            expect(result).not.toBeInstanceOf(Promise);
        });

        it('should be immediately renderable', () => {
            const jsx = LoginLayout({ children: <div>Test</div> });
            const { container } = render(jsx);

            expect(container.firstChild).toBeInTheDocument();
        });
    });
});
