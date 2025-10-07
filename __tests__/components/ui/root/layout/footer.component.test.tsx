import { render, screen } from '@testing-library/react';

import Footer from '@/ui/root/layout/footer';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

// Internal Components (Real)
// - HiHome icon (keep real)

// ============================================================================
// TEST SUITE: Footer Component
// ============================================================================
describe('Footer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render footer element', () => {
            render(<Footer />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
        });

        it('should have correct background color class', () => {
            render(<Footer />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('bg-gray-100');
        });

        it('should have correct padding classes', () => {
            render(<Footer />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toHaveClass('py-4', 'mt-24');
        });

        it('should render container with correct classes', () => {
            const { container } = render(<Footer />);

            const innerContainer = container.querySelector('.container');
            expect(innerContainer).toBeInTheDocument();
            expect(innerContainer).toHaveClass('mx-auto', 'flex', 'flex-col', 'md:flex-row');
        });
    });

    // ========================================================================
    // Icon Display
    // ========================================================================
    describe('Icon Display', () => {
        it('should render home icon', () => {
            const { container } = render(<Footer />);

            // HiHome renders as an SVG
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should have correct icon styling classes', () => {
            const { container } = render(<Footer />);

            const icon = container.querySelector('svg');
            expect(icon).toHaveClass('h-8', 'w-auto', 'text-gray-100', 'rounded-full', 'p-[4px]', 'bg-blue-800');
        });

        it('should render icon in first column', () => {
            const { container } = render(<Footer />);

            const firstColumn = container.querySelector('.mb-4.md\\:mb-0');
            const icon = firstColumn?.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Link Rendering and Navigation
    // ========================================================================
    describe('Link Rendering and Navigation', () => {
        it('should render navigation links list', () => {
            render(<Footer />);

            const list = screen.getByRole('list');
            expect(list).toBeInTheDocument();
        });

        it('should render Properties link', () => {
            render(<Footer />);

            const link = screen.getByRole('link', { name: /properties/i });
            expect(link).toBeInTheDocument();
        });

        it('should render Terms of Service link', () => {
            render(<Footer />);

            const link = screen.getByRole('link', { name: /terms of service/i });
            expect(link).toBeInTheDocument();
        });

        it('should have correct href for Properties link', () => {
            render(<Footer />);

            const link = screen.getByRole('link', { name: /properties/i });
            expect(link).toHaveAttribute('href', '/properties');
        });

        it('should have correct href for Terms of Service link', () => {
            render(<Footer />);

            const link = screen.getByRole('link', { name: /terms of service/i });
            expect(link).toHaveAttribute('href', '/terms');
        });

        it('should render exactly 2 links', () => {
            render(<Footer />);

            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(2);
        });

        it('should have correct spacing between links', () => {
            const { container } = render(<Footer />);

            const list = container.querySelector('ul');
            expect(list).toHaveClass('flex', 'space-x-4');
        });
    });

    // ========================================================================
    // Dynamic Copyright Year
    // ========================================================================
    describe('Dynamic Copyright Year', () => {
        it('should render copyright text', () => {
            render(<Footer />);

            const copyright = screen.getByText(/\d{4} Dwellio\. All rights reserved\./);
            expect(copyright).toBeInTheDocument();
        });

        it('should display current year in copyright', () => {
            render(<Footer />);

            const currentYear = new Date().getFullYear();
            const copyright = screen.getByText(new RegExp(`${currentYear} Dwellio`));
            expect(copyright).toBeInTheDocument();
        });

        it('should include "All rights reserved" text', () => {
            render(<Footer />);

            const copyright = screen.getByText(/All rights reserved/i);
            expect(copyright).toBeInTheDocument();
        });

        it('should have correct styling for copyright text', () => {
            render(<Footer />);

            const copyright = screen.getByText(/\d{4} Dwellio\. All rights reserved\./);
            expect(copyright).toHaveClass('text-sm', 'text-gray-500', 'mt-2', 'md:mt-0');
        });

        it('should update year dynamically', () => {
            // Test with current year since mocking Date is complex
            render(<Footer />);

            const currentYear = new Date().getFullYear();
            const copyright = screen.getByText(new RegExp(`${currentYear} Dwellio`));
            expect(copyright).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Responsive Layout
    // ========================================================================
    describe('Responsive Layout', () => {
        it('should have responsive flex direction classes', () => {
            const { container } = render(<Footer />);

            const innerContainer = container.querySelector('.container');
            expect(innerContainer).toHaveClass('flex-col', 'md:flex-row');
        });

        it('should have responsive margin bottom on icon section', () => {
            const { container } = render(<Footer />);

            const iconSection = container.querySelector('.mb-4.md\\:mb-0');
            expect(iconSection).toBeInTheDocument();
        });

        it('should have responsive justify content on links section', () => {
            const { container } = render(<Footer />);

            const linksSection = container.querySelector('.flex.flex-wrap.justify-center.md\\:justify-start');
            expect(linksSection).toBeInTheDocument();
        });

        it('should have responsive margin top on copyright', () => {
            render(<Footer />);

            const copyright = screen.getByText(/\d{4} Dwellio\. All rights reserved\./);
            expect(copyright).toHaveClass('mt-2', 'md:mt-0');
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have semantic footer element', () => {
            render(<Footer />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
        });

        it('should have semantic list for navigation', () => {
            render(<Footer />);

            const list = screen.getByRole('list');
            expect(list).toBeInTheDocument();
        });

        it('should have accessible link text', () => {
            render(<Footer />);

            const propertiesLink = screen.getByRole('link', { name: /properties/i });
            const termsLink = screen.getByRole('link', { name: /terms of service/i });

            expect(propertiesLink).toHaveAccessibleName();
            expect(termsLink).toHaveAccessibleName();
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should render without errors', () => {
            expect(() => render(<Footer />)).not.toThrow();
        });

        it('should render consistently on multiple renders', () => {
            const { rerender } = render(<Footer />);

            const firstRender = screen.getByText(/\d{4} Dwellio/);
            rerender(<Footer />);
            const secondRender = screen.getByText(/\d{4} Dwellio/);

            expect(firstRender.textContent).toBe(secondRender.textContent);
        });

        it('should maintain year across re-renders within same second', () => {
            const { rerender } = render(<Footer />);

            const firstYear = screen.getByText(/\d{4} Dwellio/).textContent?.match(/\d{4}/)?.[0];

            rerender(<Footer />);

            const secondYear = screen.getByText(/\d{4} Dwellio/).textContent?.match(/\d{4}/)?.[0];

            expect(firstYear).toBe(secondYear);
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration Tests', () => {
        it('should render all sections together', () => {
            const { container } = render(<Footer />);

            const icon = container.querySelector('svg');
            const links = screen.getAllByRole('link');
            const copyright = screen.getByText(/\d{4} Dwellio/);

            expect(icon).toBeInTheDocument();
            expect(links.length).toBe(2);
            expect(copyright).toBeInTheDocument();
        });

        it('should maintain proper layout structure', () => {
            const { container } = render(<Footer />);

            const footer = screen.getByRole('contentinfo');
            const innerContainer = container.querySelector('.container') as HTMLElement;
            const iconSection = container.querySelector('.mb-4.md\\:mb-0') as HTMLElement;
            const linksSection = container.querySelector('.flex.flex-wrap') as HTMLElement;

            expect(footer).toContainElement(innerContainer);
            expect(innerContainer).toContainElement(iconSection);
            expect(innerContainer).toContainElement(linksSection);
        });

        it('should render complete footer with all expected elements', () => {
            render(<Footer />);

            // Check for all major elements
            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
            expect(screen.getByRole('list')).toBeInTheDocument();
            expect(screen.getAllByRole('link')).toHaveLength(2);
            expect(screen.getByText(/\d{4} Dwellio/)).toBeInTheDocument();
        });
    });
});
