import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Session } from 'next-auth';

import NavBarRight from '@/ui/root/layout/nav-bar/nav-bar-right';

// Type assertion for testing - NavBarRight accepts session and viewportWidth props in tests
const NavBarRightTest = NavBarRight as any;

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, className, onClick, role, id, tabIndex }: any) => (
        <a href={href} className={className} onClick={onClick} role={role} id={id} tabIndex={tabIndex}>
            {children}
        </a>
    )
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn()
}));

jest.mock('@/hocs/with-auth', () => ({
    __esModule: true,
    withAuth: (Component: any) => Component,
    WithAuthProps: {} as any
}));

jest.mock('@/hooks/use-click-outside');

jest.mock('@/context/global-context', () => ({
    useGlobalContext: jest.fn()
}));

// Internal Components (Real but with mocked child dependencies)
jest.mock('@/ui/auth/logout-button', () => ({
    __esModule: true,
    default: ({ setIsMenuOpen, id }: any) => (
        <button onClick={() => setIsMenuOpen(false)} data-testid="logout-button" id={id}>
            Logout
        </button>
    )
}));

jest.mock('@/ui/messages/unread-message-count', () => ({
    __esModule: true,
    default: ({ unreadCount, viewportWidth }: any) => (
        <div data-testid="unread-count" data-count={unreadCount} data-viewport={viewportWidth}>
            {unreadCount}
        </div>
    )
}));

jest.mock('@/ui/root/layout/nav-bar/login-or-signup-button', () => ({
    __esModule: true,
    default: () => <button data-testid="login-signup-button">Log In or Sign Up</button>
}));

import { usePathname } from 'next/navigation';
import { useClickOutside } from '@/hooks/use-click-outside';
import { useGlobalContext } from '@/context/global-context';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseClickOutside = useClickOutside as jest.MockedFunction<typeof useClickOutside>;
const mockUseGlobalContext = useGlobalContext as jest.MockedFunction<typeof useGlobalContext>;

// ============================================================================
// TEST DATA
// ============================================================================
const mockSession: Session = {
    user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
    },
    expires: '2025-12-31'
};

// ============================================================================
// TEST SUITE: NavBarRight Component
// ============================================================================
describe('NavBarRight Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/');
        mockUseGlobalContext.mockReturnValue({
            unreadCount: 0,
            setUnreadCount: jest.fn()
        } as any);
        mockUseClickOutside.mockImplementation(() => {});
    });

    // ========================================================================
    // Component Rendering - Authenticated
    // ========================================================================
    describe('Component Rendering - Authenticated', () => {
        it('should render bell icon when authenticated', () => {
            const { container } = render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const bellIcon = container.querySelector('svg');
            expect(bellIcon).toBeInTheDocument();
        });

        it('should render messages link when authenticated', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute('href', '/messages');
        });

        it('should not render login/signup button when authenticated', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.queryByTestId('login-signup-button')).not.toBeInTheDocument();
        });

        it('should render mobile menu button when authenticated', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });
            expect(menuButton).toHaveAttribute('id', 'mobile-menu-button');
        });

        it('should have correct bell icon classes', () => {
            const { container } = render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const bellIcon = container.querySelector('svg');
            expect(bellIcon).toHaveClass('size-8', 'rounded-full', 'btn', 'btn-alert', 'p-1');
        });
    });

    // ========================================================================
    // Component Rendering - Unauthenticated
    // ========================================================================
    describe('Component Rendering - Unauthenticated', () => {
        it('should render login/signup button when not authenticated', () => {
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            expect(screen.getByTestId('login-signup-button')).toBeInTheDocument();
        });

        it('should not render bell icon when not authenticated', () => {
            const { container } = render(<NavBarRightTest viewportWidth={1024} session={null} />);

            const messagesLink = container.querySelector('a[href="/messages"]');
            expect(messagesLink).not.toBeInTheDocument();
        });

        it('should still render mobile menu button when not authenticated', () => {
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            const menuButton = screen.getByRole('button', { name: '' });
            expect(menuButton).toHaveAttribute('id', 'mobile-menu-button');
        });
    });

    // ========================================================================
    // Unread Count Badge Display
    // ========================================================================
    describe('Unread Count Badge Display', () => {
        it('should display unread count badge when count is greater than 0', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 5,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.getByTestId('unread-count')).toBeInTheDocument();
            expect(screen.getByTestId('unread-count')).toHaveAttribute('data-count', '5');
        });

        it('should not display unread count badge when count is 0', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 0,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
        });

        it('should pass viewportWidth to UnreadMessageCount component', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 3,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={768} session={mockSession} />);

            const unreadCount = screen.getByTestId('unread-count');
            expect(unreadCount).toHaveAttribute('data-viewport', '768');
        });

        it('should update when unread count changes', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 2,
                setUnreadCount: jest.fn()
            } as any);

            const { rerender } = render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.getByTestId('unread-count')).toHaveAttribute('data-count', '2');

            mockUseGlobalContext.mockReturnValue({
                unreadCount: 7,
                setUnreadCount: jest.fn()
            } as any);

            rerender(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.getByTestId('unread-count')).toHaveAttribute('data-count', '7');
        });

        it('should hide badge when count goes to 0', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 4,
                setUnreadCount: jest.fn()
            } as any);

            const { rerender } = render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.getByTestId('unread-count')).toBeInTheDocument();

            mockUseGlobalContext.mockReturnValue({
                unreadCount: 0,
                setUnreadCount: jest.fn()
            } as any);

            rerender(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
        });
    });

    // ========================================================================
    // Mobile Menu Toggle
    // ========================================================================
    describe('Mobile Menu Toggle', () => {
        it('should not show mobile menu initially', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should open mobile menu when button is clicked', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });
            await user.click(menuButton);

            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });
        });

        it('should close mobile menu when button is clicked again', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });

            await user.click(menuButton);
            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });

            await user.click(menuButton);
            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });

        it('should apply open class to button when menu is open', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });

            await user.click(menuButton);

            await waitFor(() => {
                expect(menuButton).toHaveClass('mobile-menu-open');
            });
        });

        it('should have correct ARIA attributes on menu button', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });
            expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
            expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should render menu button spans (hamburger icon)', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });
            const spans = menuButton.querySelectorAll('span');

            expect(spans).toHaveLength(3);
            expect(spans[0]).toHaveClass('mobile-menu-top');
            expect(spans[1]).toHaveClass('mobile-menu-middle');
            expect(spans[2]).toHaveClass('mobile-menu-bottom');
        });
    });

    // ========================================================================
    // Mobile Menu Content - Authenticated
    // ========================================================================
    describe('Mobile Menu Content - Authenticated', () => {
        it('should render Home link in mobile menu', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const homeLinks = screen.getAllByRole('menuitem', { name: /home/i });
                expect(homeLinks.length).toBeGreaterThan(0);
            });
        });

        it('should render Properties link in mobile menu', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const propertyLinks = screen.getAllByRole('menuitem');
                const propertiesLink = propertyLinks.find(link => link.textContent === 'Properties');
                expect(propertiesLink).toBeInTheDocument();
            });
        });

        it('should render Add Property link in mobile menu when authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const addPropertyLink = menuItems.find(item => item.textContent === 'Add Property');
                expect(addPropertyLink).toBeInTheDocument();
            });
        });

        it('should render My Listings link in mobile menu when authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const myListingsLink = menuItems.find(item => item.textContent === 'My Listings');
                expect(myListingsLink).toBeInTheDocument();
            });
        });

        it('should render Favorite Properties link in mobile menu when authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const favoritesLink = menuItems.find(item => item.textContent === 'Favorite Properties');
                expect(favoritesLink).toBeInTheDocument();
            });
        });

        it('should render Logout button in mobile menu when authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByTestId('logout-button')).toBeInTheDocument();
            });
        });

        it('should render horizontal rules to separate menu sections', async () => {
            const user = userEvent.setup();
            const { container } = render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const hrs = container.querySelectorAll('hr');
                expect(hrs.length).toBeGreaterThanOrEqual(2);
            });
        });
    });

    // ========================================================================
    // Mobile Menu Content - Unauthenticated
    // ========================================================================
    describe('Mobile Menu Content - Unauthenticated', () => {
        it('should render Home and Properties links when not authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                expect(menuItems.length).toBe(2); // Only Home and Properties
            });
        });

        it('should not render Add Property link when not authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const addPropertyLink = menuItems.find(item => item.textContent === 'Add Property');
                expect(addPropertyLink).toBeUndefined();
            });
        });

        it('should not render My Listings link when not authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const myListingsLink = menuItems.find(item => item.textContent === 'My Listings');
                expect(myListingsLink).toBeUndefined();
            });
        });

        it('should not render Logout button when not authenticated', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Active Path Highlighting in Mobile Menu
    // ========================================================================
    describe('Active Path Highlighting in Mobile Menu', () => {
        it('should highlight Home link when on home page', async () => {
            mockUsePathname.mockReturnValue('/');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const homeLink = menuItems.find(item => item.textContent === 'Home');
                expect(homeLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should highlight Properties link when on properties page', async () => {
            mockUsePathname.mockReturnValue('/properties');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const propertiesLink = menuItems.find(item => item.textContent === 'Properties');
                expect(propertiesLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should highlight Add Property link when on add property page', async () => {
            mockUsePathname.mockReturnValue('/properties/add');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const addPropertyLink = menuItems.find(item => item.textContent === 'Add Property');
                expect(addPropertyLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should highlight My Listings link when on profile page', async () => {
            mockUsePathname.mockReturnValue('/profile');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const myListingsLink = menuItems.find(item => item.textContent === 'My Listings');
                expect(myListingsLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should highlight Favorite Properties link when on favorites page', async () => {
            mockUsePathname.mockReturnValue('/properties/favorites');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const favoritesLink = menuItems.find(item => item.textContent === 'Favorite Properties');
                expect(favoritesLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should apply not-current-path class to non-active links', async () => {
            mockUsePathname.mockReturnValue('/');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const propertiesLink = menuItems.find(item => item.textContent === 'Properties');
                expect(propertiesLink).toHaveClass('menu-btn-not-current-path');
            });
        });
    });

    // ========================================================================
    // Click Outside Behavior
    // ========================================================================
    describe('Click Outside Behavior', () => {
        it('should call useClickOutside hook with correct arguments', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(mockUseClickOutside).toHaveBeenCalled();

            const callArgs = mockUseClickOutside.mock.calls[0];
            expect(callArgs[0]).toHaveLength(2); // menuButtonRef and dropdownRef
            expect(typeof callArgs[1]).toBe('function'); // close callback
            expect(callArgs[2]).toBe(false); // initial isMenuOpen state
        });

        it('should pass isMenuOpen state to useClickOutside', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            // Initially false
            expect(mockUseClickOutside.mock.calls[0][2]).toBe(false);

            // Open menu
            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const lastCall = mockUseClickOutside.mock.calls[mockUseClickOutside.mock.calls.length - 1];
                expect(lastCall[2]).toBe(true);
            });
        });

        it('should close menu when clicking menu link', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });

            const menuItems = screen.getAllByRole('menuitem');
            const homeLink = menuItems.find(item => item.textContent === 'Home');

            await user.click(homeLink!);

            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });

        it('should close menu when logout button is clicked', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByTestId('logout-button')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('logout-button'));

            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Viewport Width Responsive Behavior
    // ========================================================================
    describe('Viewport Width Responsive Behavior', () => {
        it('should pass viewport width to component', () => {
            render(<NavBarRightTest viewportWidth={768} session={mockSession} />);

            // Component should render without errors with different viewport widths
            expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
        });

        it('should handle mobile viewport width', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 3,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={375} session={mockSession} />);

            const unreadCount = screen.getByTestId('unread-count');
            expect(unreadCount).toHaveAttribute('data-viewport', '375');
        });

        it('should handle tablet viewport width', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 2,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={768} session={mockSession} />);

            const unreadCount = screen.getByTestId('unread-count');
            expect(unreadCount).toHaveAttribute('data-viewport', '768');
        });

        it('should handle desktop viewport width', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 1,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={1920} session={mockSession} />);

            const unreadCount = screen.getByTestId('unread-count');
            expect(unreadCount).toHaveAttribute('data-viewport', '1920');
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have correct role on mobile menu', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toHaveAttribute('role', 'menu');
            });
        });

        it('should have correct aria-labelledby on mobile menu', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toHaveAttribute('aria-labelledby', 'mobile-menu-button');
            });
        });

        it('should have correct aria-orientation on mobile menu', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toHaveAttribute('aria-orientation', 'vertical');
            });
        });

        it('should have correct tabIndex on mobile menu', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toHaveAttribute('tabIndex', '-1');
            });
        });

        it('should have correct role on menu items', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                expect(menuItems.length).toBeGreaterThan(0);
            });
        });

        it('should have unique ids on menu items', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                const ids = menuItems.map(item => item.id);
                const uniqueIds = new Set(ids);
                expect(uniqueIds.size).toBe(ids.length);
            });
        });

        it('should have menu button spans structure', () => {
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });
            const spans = menuButton.querySelectorAll('span');
            expect(spans).toHaveLength(3);
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle null session gracefully', () => {
            expect(() => render(<NavBarRightTest viewportWidth={1024} session={null} />)).not.toThrow();
        });

        it('should handle undefined session gracefully', () => {
            expect(() => render(<NavBarRightTest viewportWidth={1024} session={undefined as any} />)).not.toThrow();
        });

        it('should handle zero viewport width', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 1,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={0} session={mockSession} />);

            const unreadCount = screen.getByTestId('unread-count');
            expect(unreadCount).toHaveAttribute('data-viewport', '0');
        });

        it('should handle negative unread count', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: -1,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            // Should not display badge for negative count
            expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
        });

        it('should handle very large unread count', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 999,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.getByTestId('unread-count')).toHaveAttribute('data-count', '999');
        });

        it('should handle rapid menu toggling', async () => {
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const menuButton = screen.getByRole('button', { name: '' });

            // Rapidly toggle menu
            await user.click(menuButton);
            await user.click(menuButton);
            await user.click(menuButton);
            await user.click(menuButton);

            // Menu should be closed (even number of clicks)
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should handle session change while menu is open', async () => {
            const user = userEvent.setup();
            const { rerender } = render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });

            // Change session to null
            rerender(<NavBarRightTest viewportWidth={1024} session={null} />);

            await waitFor(() => {
                const menuItems = screen.getAllByRole('menuitem');
                expect(menuItems.length).toBe(2); // Only Home and Properties
            });
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration Tests', () => {
        it('should render complete authenticated user interface', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 5,
                setUnreadCount: jest.fn()
            } as any);

            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            const messagesLink = screen.getByRole('link');
            expect(messagesLink).toBeInTheDocument();
            expect(messagesLink).toHaveAttribute('href', '/messages');
            expect(screen.getByTestId('unread-count')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
        });

        it('should render complete unauthenticated user interface', () => {
            render(<NavBarRightTest viewportWidth={1024} session={null} />);

            expect(screen.getByTestId('login-signup-button')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /messages/i })).not.toBeInTheDocument();
        });

        it('should handle complete menu interaction flow', async () => {
            mockUsePathname.mockReturnValue('/');
            const user = userEvent.setup();
            render(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            // Open menu
            await user.click(screen.getByRole('button', { name: '' }));

            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });

            // Verify all authenticated links
            const menuItems = screen.getAllByRole('menuitem');
            expect(menuItems.length).toBeGreaterThan(0);

            // Click a link to close menu
            const homeLink = menuItems.find(item => item.textContent === 'Home');
            await user.click(homeLink!);

            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });

        it('should coordinate all authentication-dependent features', () => {
            mockUseGlobalContext.mockReturnValue({
                unreadCount: 3,
                setUnreadCount: jest.fn()
            } as any);

            const { rerender } = render(<NavBarRightTest viewportWidth={1024} session={null} />);

            // Unauthenticated state
            expect(screen.getByTestId('login-signup-button')).toBeInTheDocument();
            expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();

            // Switch to authenticated
            rerender(<NavBarRightTest viewportWidth={1024} session={mockSession} />);

            expect(screen.queryByTestId('login-signup-button')).not.toBeInTheDocument();
            expect(screen.getByTestId('unread-count')).toBeInTheDocument();
        });
    });
});
