import { render, screen } from '@testing-library/react';

import DwellioLogo from '@/ui/shared/logo';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children, className }: any) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

jest.mock('@heroicons/react/24/solid', () => ({
    HomeIcon: ({ className }: { className?: string }) => (
        <svg data-testid="home-icon" className={className} />
    ),
}));

// ============================================================================
// TEST SUITE: DwellioLogo Component
// ============================================================================
describe('DwellioLogo Component', () => {
    // ========================================================================
    // Image and Icon Rendering
    // ========================================================================
    describe('Image and Icon Rendering', () => {
        it('should render HomeIcon', () => {
            render(<DwellioLogo />);

            expect(screen.getByTestId('home-icon')).toBeInTheDocument();
        });

        it('should apply icon classes', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            expect(icon).toHaveClass('h-10');
            expect(icon).toHaveClass('w-auto');
            expect(icon).toHaveClass('text-blue-800');
            expect(icon).toHaveClass('p-[4px]');
        });

        it('should render Dwellio text', () => {
            render(<DwellioLogo />);

            expect(screen.getByText('Dwellio')).toBeInTheDocument();
        });

        it('should render both icon and text together', () => {
            render(<DwellioLogo />);

            expect(screen.getByTestId('home-icon')).toBeInTheDocument();
            expect(screen.getByText('Dwellio')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Link Functionality
    // ========================================================================
    describe('Link Functionality', () => {
        it('should render as link to home page', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/');
        });

        it('should wrap both icon and text in link', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toContainElement(screen.getByTestId('home-icon'));
            expect(link).toContainElement(screen.getByText('Dwellio'));
        });

        it('should have correct link classes', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toHaveClass('flex');
            expect(link).toHaveClass('flex-shrink-0');
            expect(link).toHaveClass('items-center');
            expect(link).toHaveClass('justify-center');
        });
    });

    // ========================================================================
    // Text Styling
    // ========================================================================
    describe('Text Styling', () => {
        it('should apply text styling classes', () => {
            render(<DwellioLogo />);

            const text = screen.getByText('Dwellio');
            expect(text).toHaveClass('block');
            expect(text).toHaveClass('text-xl');
            expect(text).toHaveClass('md:text-lg');
            expect(text).toHaveClass('text-blue-800');
            expect(text).toHaveClass('ml-1');
        });

        it('should use span element for text', () => {
            render(<DwellioLogo />);

            const text = screen.getByText('Dwellio');
            expect(text.tagName).toBe('SPAN');
        });
    });

    // ========================================================================
    // Responsive Sizing
    // ========================================================================
    describe('Responsive Sizing', () => {
        it('should have responsive text size', () => {
            render(<DwellioLogo />);

            const text = screen.getByText('Dwellio');
            expect(text).toHaveClass('text-xl'); // Default
            expect(text).toHaveClass('md:text-lg'); // Medium screens and up
        });

        it('should have fixed icon height', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            expect(icon).toHaveClass('h-10');
        });

        it('should have auto icon width', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            expect(icon).toHaveClass('w-auto');
        });
    });

    // ========================================================================
    // Brand Colors
    // ========================================================================
    describe('Brand Colors', () => {
        it('should use blue-800 for icon', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            expect(icon).toHaveClass('text-blue-800');
        });

        it('should use blue-800 for text', () => {
            render(<DwellioLogo />);

            const text = screen.getByText('Dwellio');
            expect(text).toHaveClass('text-blue-800');
        });

        it('should have consistent brand color', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            const text = screen.getByText('Dwellio');

            // Both should have same color class
            expect(icon).toHaveClass('text-blue-800');
            expect(text).toHaveClass('text-blue-800');
        });
    });

    // ========================================================================
    // Layout and Spacing
    // ========================================================================
    describe('Layout and Spacing', () => {
        it('should use flexbox layout', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toHaveClass('flex');
            expect(link).toHaveClass('items-center');
        });

        it('should center items', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toHaveClass('justify-center');
        });

        it('should prevent shrinking', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toHaveClass('flex-shrink-0');
        });

        it('should add left margin to text', () => {
            render(<DwellioLogo />);

            const text = screen.getByText('Dwellio');
            expect(text).toHaveClass('ml-1');
        });

        it('should add padding to icon', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            expect(icon).toHaveClass('p-[4px]');
        });
    });

    // ========================================================================
    // Component Structure
    // ========================================================================
    describe('Component Structure', () => {
        it('should render in correct order: icon then text', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            const children = Array.from(link?.children || []);

            // First child should be the icon (svg), second should be text (span)
            expect(children[0].getAttribute('data-testid')).toBe('home-icon');
            expect(children[1].textContent).toBe('Dwellio');
        });

        it('should render without errors', () => {
            expect(() => render(<DwellioLogo />)).not.toThrow();
        });

        it('should render only once per instance', () => {
            const { container } = render(<DwellioLogo />);

            const links = container.querySelectorAll('a[href="/"]');
            expect(links).toHaveLength(1);
        });
    });

    // ========================================================================
    // Navigation
    // ========================================================================
    describe('Navigation', () => {
        it('should navigate to home page', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toHaveAttribute('href', '/');
        });

        it('should be clickable', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a');
            expect(link).toBeInTheDocument();
            expect(link?.tagName).toBe('A');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Header/Navigation Usage', () => {
        it('should render within navigation bar', () => {
            const { container } = render(
                <nav data-testid="navbar">
                    <DwellioLogo />
                </nav>
            );

            const navbar = container.querySelector('[data-testid="navbar"]');
            const link = container.querySelector('a[href="/"]') as HTMLElement;

            expect(navbar).toContainElement(link);
        });

        it('should work alongside other nav elements', () => {
            render(
                <nav>
                    <DwellioLogo />
                    <span>Properties</span>
                    <span>Login</span>
                </nav>
            );

            expect(screen.getByText('Dwellio')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Login')).toBeInTheDocument();
        });

        it('should maintain branding across multiple instances', () => {
            render(
                <div>
                    <DwellioLogo />
                    <DwellioLogo />
                </div>
            );

            const logos = screen.getAllByText('Dwellio');
            expect(logos).toHaveLength(2);

            logos.forEach((logo) => {
                expect(logo).toHaveClass('text-blue-800');
            });
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should be accessible via link role', () => {
            render(<DwellioLogo />);

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
        });

        it('should have descriptive text content', () => {
            render(<DwellioLogo />);

            const link = screen.getByRole('link');
            expect(link).toHaveTextContent('Dwellio');
        });

        it('should provide navigation context through href', () => {
            const { container } = render(<DwellioLogo />);

            const link = container.querySelector('a[href="/"]');
            expect(link).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Visual Consistency
    // ========================================================================
    describe('Visual Consistency', () => {
        it('should use consistent spacing between icon and text', () => {
            render(<DwellioLogo />);

            const text = screen.getByText('Dwellio');
            expect(text).toHaveClass('ml-1');
        });

        it('should maintain brand identity with blue-800', () => {
            render(<DwellioLogo />);

            const icon = screen.getByTestId('home-icon');
            const text = screen.getByText('Dwellio');

            expect(icon).toHaveClass('text-blue-800');
            expect(text).toHaveClass('text-blue-800');
        });

        it('should render consistently across re-renders', () => {
            const { rerender } = render(<DwellioLogo />);

            expect(screen.getByText('Dwellio')).toBeInTheDocument();

            rerender(<DwellioLogo />);

            expect(screen.getByText('Dwellio')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle unmount and remount', () => {
            const { unmount } = render(<DwellioLogo />);

            expect(screen.getByText('Dwellio')).toBeInTheDocument();

            unmount();
            expect(screen.queryByText('Dwellio')).not.toBeInTheDocument();

            // Render fresh instance after unmount
            render(<DwellioLogo />);
            expect(screen.getByText('Dwellio')).toBeInTheDocument();
        });

        it('should render in nested components', () => {
            render(
                <div>
                    <div>
                        <div>
                            <DwellioLogo />
                        </div>
                    </div>
                </div>
            );

            expect(screen.getByText('Dwellio')).toBeInTheDocument();
        });
    });
});
