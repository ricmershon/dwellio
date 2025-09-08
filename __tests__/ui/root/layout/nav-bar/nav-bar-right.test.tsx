import React from 'react';
import { render, screen, fireEvent, createNextNavigationMock } from '@/__tests__/test-utils';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import NavBarRight from '@/ui/root/layout/nav-bar/nav-bar-right';

// Mock Next.js navigation
jest.mock('next/navigation', () => createNextNavigationMock());

// Mock NextAuth
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
    const MockLink = ({ children, href, className, onClick, role, id, tabIndex }: {
        children: React.ReactNode;
        href: string;
        className?: string;
        onClick?: () => void;
        role?: string;
        id?: string;
        tabIndex?: number;
    }) => (
        <a href={href} className={className} onClick={onClick} role={role} id={id} tabIndex={tabIndex}>
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

// Mock React Icons
jest.mock('react-icons/fa', () => ({
    FaGoogle: ({ className }: { className: string }) => (
        <span data-testid="google-icon" className={className}>G</span>
    ),
}));

jest.mock('react-icons/hi2', () => ({
    HiOutlineBell: ({ className }: { className: string }) => (
        <div data-testid="bell-icon" className={className}>Bell Icon</div>
    ),
}));

// Note: NavBarRight component doesn't use LoginButtons, it renders a simple login link

// Mock Global Context
jest.mock('@/context/global-context', () => ({
    useGlobalContext: jest.fn()
}));

// Mock UnreadMessageCount component
jest.mock('@/ui/messages/unread-message-count', () => {
    const MockUnreadMessageCount = ({ unreadCount, viewportWidth }: {
        unreadCount: number;
        viewportWidth: number;
    }) => (
        <div 
            data-testid="unread-message-count" 
            data-count={unreadCount}
            data-viewport-width={viewportWidth}
        >
            {unreadCount}
        </div>
    );
    MockUnreadMessageCount.displayName = 'MockUnreadMessageCount';
    return MockUnreadMessageCount;
});

// Mock LogoutButton component  
jest.mock('@/ui/auth/logout-button', () => {
    const MockLogoutButton = ({ setIsMenuOpen, id }: {
        setIsMenuOpen?: (value: boolean) => void;
        id?: string;
    }) => (
        <button 
            data-testid="logout-button" 
            id={id}
            onClick={() => setIsMenuOpen?.(false)}
        >
            Logout
        </button>
    );
    MockLogoutButton.displayName = 'MockLogoutButton';
    return MockLogoutButton;
});

// Mock useClickOutside hook
jest.mock('@/hooks/use-click-outside', () => ({
    useClickOutside: jest.fn(),
}));

describe('NavBarRight', () => {
    const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
    const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
    const { useGlobalContext: mockUseGlobalContext } = jest.requireMock('@/context/global-context');
    
    const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/profile.jpg',
    };
    
    const mockSession = {
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/');
        mockUseSession.mockReturnValue({ 
            data: null, 
            status: 'unauthenticated',
            update: jest.fn() 
        });
        
        // Mock useGlobalContext
        mockUseGlobalContext.mockReturnValue({
            unreadCount: 3,
            setUnreadCount: jest.fn(),
            staticInputs: {},
            setStaticInputs: jest.fn()
        });
    });

    describe('Mobile Menu Button', () => {
        it('should render mobile menu button with correct attributes', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const menuButton = screen.getByRole('button');
            expect(menuButton).toBeInTheDocument();
            expect(menuButton).toHaveAttribute('id', 'mobile-menu-button');
            expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
            expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should have correct CSS classes', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const menuButton = screen.getByRole('button');
            expect(menuButton).toHaveClass('md:hidden', 'z-40', 'block', 'mobile-menu', 'focus:outline-none', 'mt-2', 'ml-4');
        });

        it('should toggle menu state when clicked', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const menuButton = screen.getByRole('button');
            
            // Initially menu should be closed
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            
            // Click to open menu
            fireEvent.click(menuButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();
            
            // Click again to close menu
            fireEvent.click(menuButton);
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should add mobile-menu-open class when menu is open', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const menuButton = screen.getByRole('button');
            
            // Initially should not have open class
            expect(menuButton).not.toHaveClass('mobile-menu-open');
            
            // Open menu
            fireEvent.click(menuButton);
            expect(menuButton).toHaveClass('mobile-menu-open');
        });

        it('should render hamburger menu spans', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const menuButton = screen.getByRole('button');
            const spans = menuButton.querySelectorAll('span');
            
            expect(spans).toHaveLength(3);
            expect(spans[0]).toHaveClass('mobile-menu-top');
            expect(spans[1]).toHaveClass('mobile-menu-middle');
            expect(spans[2]).toHaveClass('mobile-menu-bottom');
        });
    });

    describe('Mobile Menu - Unauthenticated', () => {
        beforeEach(() => {
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button')); // Open menu
        });

        it('should render mobile menu with correct attributes', () => {
            const menu = screen.getByRole('menu');
            
            expect(menu).toHaveAttribute('id', 'mobile-menu');
            expect(menu).toHaveAttribute('aria-orientation', 'vertical');
            expect(menu).toHaveAttribute('aria-labelledby', 'mobile-menu-button');
            expect(menu).toHaveAttribute('tabIndex', '-1');
        });

        it('should have correct CSS classes for mobile menu', () => {
            const menu = screen.getByRole('menu');
            
            expect(menu).toHaveClass(
                'md:hidden', 'absolute', 'w-screen', '-mr-4', 'p-3', 
                'rounded-sm', 'bg-white', 'text-sm', 'right-0', 'top-10', 
                'z-40', 'border', 'border-gray-100', 'shadow-md', 'flex', 
                'flex-col', 'items-center', 'justify-center', 'space-y-3'
            );
        });

        it('should render basic navigation links', () => {
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.queryByText('Add Property')).not.toBeInTheDocument();
        });

        it('should render login link for unauthenticated users', () => {
            expect(screen.getByText('Log In or Sign Up')).toBeInTheDocument();
            expect(screen.getByText('Log In or Sign Up').closest('a')).toHaveAttribute('href', '/login');
        });

        it('should not render authenticated menu items', () => {
            expect(screen.queryByText('My Listings')).not.toBeInTheDocument();
            expect(screen.queryByText('Favorite Properties')).not.toBeInTheDocument();
            expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
        });

        it('should have correct href attributes for navigation links', () => {
            const homeLink = screen.getByText('Home').closest('a');
            const propertiesLink = screen.getByText('Properties').closest('a');
            
            expect(homeLink).toHaveAttribute('href', '/');
            expect(propertiesLink).toHaveAttribute('href', '/properties');
        });

        it('should have proper menu item attributes', () => {
            const homeLink = screen.getByText('Home').closest('a');
            const propertiesLink = screen.getByText('Properties').closest('a');
            
            expect(homeLink).toHaveAttribute('role', 'menuitem');
            expect(homeLink).toHaveAttribute('id', 'mobile-menu-item-0');
            expect(homeLink).toHaveAttribute('tabIndex', '-1');
            
            expect(propertiesLink).toHaveAttribute('role', 'menuitem');
            expect(propertiesLink).toHaveAttribute('id', 'mobile-menu-item-1');
            expect(propertiesLink).toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('Mobile Menu - Authenticated', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button')); // Open menu
        });

        it('should render all navigation links when authenticated', () => {
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
            expect(screen.getByText('My Listings')).toBeInTheDocument();
            expect(screen.getByText('Favorite Properties')).toBeInTheDocument();
        });

        it('should not render login buttons when authenticated', () => {
            expect(screen.queryByText('Log In or Sign Up')).not.toBeInTheDocument();
        });

        it('should render logout button when authenticated', () => {
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        });

        it('should have correct href attributes for authenticated links', () => {
            const addPropertyLink = screen.getByText('Add Property').closest('a');
            const profileLink = screen.getByText('My Listings').closest('a');
            const favoritesLink = screen.getByText('Favorite Properties').closest('a');
            
            expect(addPropertyLink).toHaveAttribute('href', '/properties/add');
            expect(profileLink).toHaveAttribute('href', '/profile');
            expect(favoritesLink).toHaveAttribute('href', '/properties/favorites');
        });

        it('should have proper menu item attributes for authenticated links', () => {
            const addPropertyLink = screen.getByText('Add Property').closest('a');
            const profileLink = screen.getByText('My Listings').closest('a');
            const favoritesLink = screen.getByText('Favorite Properties').closest('a');
            
            expect(addPropertyLink).toHaveAttribute('role', 'menuitem');
            expect(addPropertyLink).toHaveAttribute('id', 'mobile-menu-item-2');
            
            expect(profileLink).toHaveAttribute('role', 'menuitem');
            expect(profileLink).toHaveAttribute('id', 'mobile-menu-item-4');
            
            expect(favoritesLink).toHaveAttribute('role', 'menuitem');
            expect(favoritesLink).toHaveAttribute('id', 'mobile-menu-item-5');
        });

        it('should render horizontal separators', () => {
            const separators = screen.getAllByRole('separator');
            expect(separators).toHaveLength(2);
            
            separators.forEach(separator => {
                expect(separator).toHaveClass('w-full', 'border-t', 'border-gray-200');
            });
        });
    });

    describe('Path Highlighting', () => {
        it('should highlight Home link when on home page', () => {
            mockUsePathname.mockReturnValue('/');
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveClass('menu-btn-current-path');
        });

        it('should highlight Properties link when on properties page', () => {
            mockUsePathname.mockReturnValue('/properties');
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const propertiesLink = screen.getByText('Properties').closest('a');
            expect(propertiesLink).toHaveClass('menu-btn-current-path');
        });

        it('should highlight Add Property link when authenticated and on add page', () => {
            mockUsePathname.mockReturnValue('/properties/add');
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const addPropertyLink = screen.getByText('Add Property').closest('a');
            expect(addPropertyLink).toHaveClass('menu-btn-current-path');
        });

        it('should highlight My Listings link when on profile page', () => {
            mockUsePathname.mockReturnValue('/profile');
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const profileLink = screen.getByText('My Listings').closest('a');
            expect(profileLink).toHaveClass('menu-btn-current-path');
        });

        it('should highlight Favorite Properties link when on favorites page', () => {
            mockUsePathname.mockReturnValue('/properties/favorites');
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const favoritesLink = screen.getByText('Favorite Properties').closest('a');
            expect(favoritesLink).toHaveClass('menu-btn-current-path');
        });

        it('should use non-current-path class for inactive links', () => {
            mockUsePathname.mockReturnValue('/');
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const propertiesLink = screen.getByText('Properties').closest('a');
            const addPropertyLink = screen.getByText('Add Property').closest('a');
            
            expect(propertiesLink).toHaveClass('menu-btn-not-current-path');
            expect(addPropertyLink).toHaveClass('menu-btn-not-current-path');
        });
    });

    describe('Menu Interactions', () => {
        it('should close menu when navigation link is clicked', () => {
            render(<NavBarRight viewportWidth={1024} />);
            const menuButton = screen.getByRole('button');
            
            // Open menu
            fireEvent.click(menuButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();
            
            // Click navigation link
            const homeLink = screen.getByText('Home').closest('a');
            fireEvent.click(homeLink!);
            
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should close menu when authenticated navigation link is clicked', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            const menuButton = screen.getByRole('button');
            
            // Open menu
            fireEvent.click(menuButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();
            
            // Click authenticated navigation link
            const profileLink = screen.getByText('My Listings').closest('a');
            fireEvent.click(profileLink!);
            
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should close menu when logout button is clicked', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            const menuButton = screen.getByRole('button');
            
            // Open menu
            fireEvent.click(menuButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();
            
            // Click logout button
            const logoutButton = screen.getByTestId('logout-button');
            fireEvent.click(logoutButton);
            
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should handle rapid menu toggle clicks', () => {
            render(<NavBarRight viewportWidth={1024} />);
            const menuButton = screen.getByRole('button');
            
            // Rapid clicks
            fireEvent.click(menuButton);
            fireEvent.click(menuButton);
            fireEvent.click(menuButton);
            
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });
    });

    describe('Authentication State Changes', () => {
        it('should update menu content when authentication state changes', () => {
            // Test separately: unauthenticated state
            const { unmount } = render(<NavBarRight viewportWidth={1024} />);
            let menuButton = document.getElementById('mobile-menu-button')!;
            fireEvent.click(menuButton);
            
            // Initially unauthenticated - should show login buttons
            expect(screen.getByText('Log In or Sign Up')).toBeInTheDocument();
            expect(screen.queryByText('Add Property')).not.toBeInTheDocument();
            
            unmount();
            
            // Test authenticated state separately
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            menuButton = document.getElementById('mobile-menu-button')!;
            fireEvent.click(menuButton);
            
            // Now authenticated - should show authenticated menu items
            expect(screen.queryByText('Log In or Sign Up')).not.toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
            expect(screen.getByText('My Listings')).toBeInTheDocument();
            expect(screen.getByText('Favorite Properties')).toBeInTheDocument();
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        });

        it('should handle component remount properly', () => {
            // Test that component can be unmounted and remounted with different auth states
            const { unmount } = render(<NavBarRight viewportWidth={1024} />);
            
            // Open menu while unauthenticated
            let menuButton = document.getElementById('mobile-menu-button')!;
            fireEvent.click(menuButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();
            
            unmount();
            
            // Remount with authenticated state
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            menuButton = document.getElementById('mobile-menu-button')!;
            fireEvent.click(menuButton);
            
            // Should show authenticated menu items
            expect(screen.getByText('Add Property')).toBeInTheDocument();
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        });
    });

    describe('Component Props', () => {
        it('should handle unauthenticated session state', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            expect(screen.getByRole('button')).toBeInTheDocument();
            fireEvent.click(screen.getByRole('button'));
            
            expect(screen.getByText('Log In or Sign Up')).toBeInTheDocument();
        });

        it('should handle authenticated session state', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            
            fireEvent.click(screen.getByRole('button'));
            
            expect(screen.getByText('Add Property')).toBeInTheDocument();
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
        });
    });

    describe('CSS Classes', () => {
        it('should apply correct base classes to all navigation links', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const links = screen.getAllByRole('menuitem');
            
            links.forEach(link => {
                if (link.tagName === 'A') {
                    expect(link).toHaveClass('menu-btn');
                }
            });
        });

        it('should apply login link styling correctly', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const loginLink = screen.getByText('Log In or Sign Up').closest('a');
            expect(loginLink).toHaveClass('btn', 'btn-login-logout', 'py-[6px]', 'px-3');
        });

        it('should render login link correctly', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            expect(screen.getByText('Log In or Sign Up')).toBeInTheDocument();
            expect(screen.getByText('Log In or Sign Up').closest('a')).toHaveAttribute('href', '/login');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes on menu button', () => {
            render(<NavBarRight viewportWidth={1024} />);
            
            const menuButton = screen.getByRole('button');
            expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
            expect(menuButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should have proper ARIA attributes on menu', () => {
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const menu = screen.getByRole('menu');
            expect(menu).toHaveAttribute('aria-orientation', 'vertical');
            expect(menu).toHaveAttribute('aria-labelledby', 'mobile-menu-button');
        });

        it('should have proper role attributes on menu items', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const menuItems = screen.getAllByRole('menuitem');
            expect(menuItems.length).toBeGreaterThan(0);
            
            menuItems.forEach(item => {
                expect(item).toHaveAttribute('role', 'menuitem');
                expect(item).toHaveAttribute('tabIndex', '-1');
            });
        });

        it('should have unique IDs for menu items', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            
            const expectedIds = [
                'mobile-menu-item-0',
                'mobile-menu-item-1', 
                'mobile-menu-item-2',
                'mobile-menu-item-4',
                'mobile-menu-item-5'
            ];
            
            expectedIds.forEach(id => {
                expect(document.getElementById(id)).toBeInTheDocument();
            });
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when unauthenticated with menu closed', () => {
            const { container } = render(<NavBarRight viewportWidth={1024} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when unauthenticated with menu open', () => {
            const { container } = render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when authenticated with menu closed', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            const { container } = render(<NavBarRight viewportWidth={1024} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when authenticated with menu open', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            const { container } = render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different active paths', () => {
            mockUsePathname.mockReturnValue('/properties/favorites');
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            const { container } = render(<NavBarRight viewportWidth={1024} />);
            fireEvent.click(screen.getByRole('button'));
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});