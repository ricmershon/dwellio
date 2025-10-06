import { render, screen } from '@testing-library/react';

import Breadcrumbs from '@/ui/shared/breadcrumbs';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Dependencies (Mocked)
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

// ============================================================================
// TEST SUITE: Breadcrumbs Component
// ============================================================================
describe('Breadcrumbs Component', () => {
    const mockBreadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Properties', href: '/properties' },
        { label: 'Details', href: '/properties/123', active: true },
    ];

    // ========================================================================
    // Breadcrumb Trail Rendering
    // ========================================================================
    describe('Breadcrumb Trail Rendering', () => {
        it('should render all breadcrumb items', () => {
            render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Details')).toBeInTheDocument();
        });

        it('should render correct number of breadcrumbs', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
        });

        it('should render single breadcrumb', () => {
            const single = [{ label: 'Home', href: '/' }];

            render(<Breadcrumbs breadcrumbs={single} />);

            expect(screen.getByText('Home')).toBeInTheDocument();
        });

        it('should handle empty breadcrumbs array', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={[]} />);

            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(0);
        });

        it('should render breadcrumbs in order', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const listItems = container.querySelectorAll('li');
            expect(listItems[0]).toHaveTextContent('Home');
            expect(listItems[1]).toHaveTextContent('Properties');
            expect(listItems[2]).toHaveTextContent('Details');
        });
    });

    // ========================================================================
    // Link Functionality
    // ========================================================================
    describe('Link Functionality', () => {
        it('should render breadcrumbs as links', () => {
            render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href', '/');

            const propertiesLink = screen.getByText('Properties').closest('a');
            expect(propertiesLink).toHaveAttribute('href', '/properties');
        });

        it('should render links with correct hrefs', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const links = container.querySelectorAll('a');
            expect(links[0]).toHaveAttribute('href', '/');
            expect(links[1]).toHaveAttribute('href', '/properties');
            expect(links[2]).toHaveAttribute('href', '/properties/123');
        });

        it('should wrap all breadcrumb labels in links', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const links = container.querySelectorAll('a');
            expect(links).toHaveLength(3);
        });
    });

    // ========================================================================
    // Current Page Indication
    // ========================================================================
    describe('Current Page Indication', () => {
        it('should mark active breadcrumb', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const activeLi = container.querySelector('[aria-current="true"]');
            expect(activeLi).toBeInTheDocument();
            expect(activeLi).toHaveTextContent('Details');
        });

        it('should apply pointer-events-none to active breadcrumb', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const activeLi = container.querySelector('[aria-current="true"]');
            expect(activeLi).toHaveClass('pointer-events-none');
        });

        it('should not apply pointer-events-none to non-active breadcrumbs', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const listItems = container.querySelectorAll('li');
            expect(listItems[0]).not.toHaveClass('pointer-events-none');
            expect(listItems[1]).not.toHaveClass('pointer-events-none');
        });

        it('should apply text-gray-400 to non-active breadcrumbs', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const listItems = container.querySelectorAll('li');
            expect(listItems[0]).toHaveClass('text-gray-400');
            expect(listItems[1]).toHaveClass('text-gray-400');
        });

        it('should not apply text-gray-400 to active breadcrumb', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const activeLi = container.querySelector('[aria-current="true"]');
            expect(activeLi).not.toHaveClass('text-gray-400');
        });

        it('should handle no active breadcrumb', () => {
            const breadcrumbs = [
                { label: 'Home', href: '/' },
                { label: 'Properties', href: '/properties' },
            ];

            const { container } = render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            const listItems = container.querySelectorAll('li');
            listItems.forEach((li) => {
                expect(li).toHaveClass('text-gray-400');
                expect(li).not.toHaveClass('pointer-events-none');
            });
        });
    });

    // ========================================================================
    // Separator Display
    // ========================================================================
    describe('Separator Display', () => {
        it('should render separators between breadcrumbs', () => {
            render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const separators = screen.getAllByText('/');
            expect(separators).toHaveLength(2); // Between 3 items = 2 separators
        });

        it('should not render separator after last breadcrumb', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const lastLi = container.querySelectorAll('li')[2];
            expect(lastLi.querySelector('span')).not.toBeInTheDocument();
        });

        it('should not render separator for single breadcrumb', () => {
            const single = [{ label: 'Home', href: '/' }];
            const { container } = render(<Breadcrumbs breadcrumbs={single} />);

            const separator = container.querySelector('span.mx-2');
            expect(separator).not.toBeInTheDocument();
        });

        it('should apply separator styling', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const separators = container.querySelectorAll('span.mx-2');
            separators.forEach((sep) => {
                expect(sep).toHaveClass('mx-2');
                expect(sep).toHaveClass('inline-block');
            });
        });

        it('should render correct number of separators', () => {
            const breadcrumbs = [
                { label: 'A', href: '/a' },
                { label: 'B', href: '/b' },
                { label: 'C', href: '/c' },
                { label: 'D', href: '/d' },
            ];

            const { container } = render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            const separators = container.querySelectorAll('span.mx-2');
            expect(separators).toHaveLength(3); // n-1 separators for n items
        });
    });

    // ========================================================================
    // Navigation Structure
    // ========================================================================
    describe('Navigation Structure', () => {
        it('should render as nav element', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
        });

        it('should have aria-label for breadcrumb navigation', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const nav = container.querySelector('nav');
            expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
        });

        it('should render ordered list', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const ol = container.querySelector('ol');
            expect(ol).toBeInTheDocument();
        });

        it('should render list items within ordered list', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const ol = container.querySelector('ol');
            const listItems = ol?.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
        });
    });

    // ========================================================================
    // Styling
    // ========================================================================
    describe('Styling', () => {
        it('should apply nav container classes', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const nav = container.querySelector('nav');
            expect(nav).toHaveClass('mb-6');
            expect(nav).toHaveClass('block');
        });

        it('should apply list classes', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const ol = container.querySelector('ol');
            expect(ol).toHaveClass('flex');
            expect(ol).toHaveClass('text-lg');
            expect(ol).toHaveClass('md:text-xl');
        });

        it('should use responsive text sizing', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const ol = container.querySelector('ol');
            expect(ol).toHaveClass('text-lg'); // Default
            expect(ol).toHaveClass('md:text-xl'); // Medium screens and up
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have proper aria-label on nav', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const nav = container.querySelector('nav');
            expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
        });

        it('should mark current page with aria-current', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const currentItem = container.querySelector('[aria-current="true"]');
            expect(currentItem).toBeInTheDocument();
        });

        it('should use semantic nav and list elements', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            expect(container.querySelector('nav')).toBeInTheDocument();
            expect(container.querySelector('ol')).toBeInTheDocument();
            expect(container.querySelectorAll('li')).toHaveLength(3);
        });

        it('should not have aria-current=true for non-active items', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            const listItems = container.querySelectorAll('li');
            // Non-active items should have aria-current="false" or undefined
            expect(listItems[0].getAttribute('aria-current')).not.toBe('true');
            expect(listItems[1].getAttribute('aria-current')).not.toBe('true');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle breadcrumb with empty label', () => {
            const breadcrumbs = [{ label: '', href: '/' }];

            const { container } = render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            const link = container.querySelector('a');
            expect(link).toHaveAttribute('href', '/');
        });

        it('should handle very long breadcrumb labels', () => {
            const longLabel = 'A'.repeat(100);
            const breadcrumbs = [{ label: longLabel, href: '/' }];

            render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            expect(screen.getByText(longLabel)).toBeInTheDocument();
        });

        it('should handle special characters in labels', () => {
            const breadcrumbs = [
                { label: 'Home & Garden', href: '/home' },
                { label: 'Price < $1000', href: '/cheap' },
            ];

            render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            expect(screen.getByText('Home & Garden')).toBeInTheDocument();
            expect(screen.getByText('Price < $1000')).toBeInTheDocument();
        });

        it('should use key from href for list items', () => {
            const { container } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            // React should render all items without key warnings
            const listItems = container.querySelectorAll('li');
            expect(listItems).toHaveLength(3);
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Navigation Breadcrumb Trail', () => {
        it('should render complete breadcrumb navigation', () => {
            const breadcrumbs = [
                { label: 'Home', href: '/' },
                { label: 'Properties', href: '/properties' },
                { label: 'Search Results', href: '/properties?query=downtown' },
                { label: 'Property Details', href: '/properties/123', active: true },
            ];

            const { container } = render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            // Check all links present
            const links = container.querySelectorAll('a');
            expect(links).toHaveLength(4);

            // Check separators
            const separators = container.querySelectorAll('span.mx-2');
            expect(separators).toHaveLength(3);

            // Check active state
            const activeItem = container.querySelector('[aria-current="true"]');
            expect(activeItem).toHaveTextContent('Property Details');
        });

        it('should handle nested route breadcrumbs', () => {
            const breadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Settings', href: '/dashboard/settings' },
                { label: 'Profile', href: '/dashboard/settings/profile', active: true },
            ];

            render(<Breadcrumbs breadcrumbs={breadcrumbs} />);

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Profile')).toBeInTheDocument();

            const profileLink = screen.getByText('Profile').closest('a');
            expect(profileLink).toHaveAttribute('href', '/dashboard/settings/profile');
        });

        it('should work in page header context', () => {
            render(
                <header>
                    <Breadcrumbs breadcrumbs={mockBreadcrumbs} />
                    <h1>Page Title</h1>
                </header>
            );

            expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
            expect(screen.getByText('Home')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Dynamic Updates
    // ========================================================================
    describe('Dynamic Updates', () => {
        it('should update when breadcrumbs prop changes', () => {
            const { rerender } = render(<Breadcrumbs breadcrumbs={mockBreadcrumbs} />);

            expect(screen.getByText('Details')).toBeInTheDocument();

            const newBreadcrumbs = [
                { label: 'Home', href: '/' },
                { label: 'Messages', href: '/messages', active: true },
            ];

            rerender(<Breadcrumbs breadcrumbs={newBreadcrumbs} />);

            expect(screen.queryByText('Properties')).not.toBeInTheDocument();
            expect(screen.getByText('Messages')).toBeInTheDocument();
        });

        it('should update active state', () => {
            const breadcrumbsV1 = [
                { label: 'Home', href: '/', active: true },
                { label: 'Properties', href: '/properties' },
            ];

            const { rerender, container } = render(<Breadcrumbs breadcrumbs={breadcrumbsV1} />);

            let activeItem = container.querySelector('[aria-current="true"]');
            expect(activeItem).toHaveTextContent('Home');

            const breadcrumbsV2 = [
                { label: 'Home', href: '/' },
                { label: 'Properties', href: '/properties', active: true },
            ];

            rerender(<Breadcrumbs breadcrumbs={breadcrumbsV2} />);

            activeItem = container.querySelector('[aria-current="true"]');
            expect(activeItem).toHaveTextContent('Properties');
        });
    });
});
