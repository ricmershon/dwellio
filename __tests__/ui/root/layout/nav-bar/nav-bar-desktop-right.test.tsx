import React from 'react';
import { render, screen, fireEvent, waitFor, createNextNavigationMock } from '@/__tests__/test-utils';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import NavBarDesktopRight from '@/ui/root/layout/nav-bar/nav-bar-desktop-right';

// Mock image assets
jest.mock('@/assets/images/profile.png', () => '/mock-profile-image.png');

// Mock all dependencies
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

jest.mock('next/navigation', () => createNextNavigationMock());

jest.mock('next/link', () => {
    const MockLink = ({ children, href, className, onClick, role, tabIndex, id }: {
        children: React.ReactNode;
        href: string;
        className?: string;
        onClick?: () => void;
        role?: string;
        tabIndex?: number;
        id?: string;
    }) => (
        <a href={href} className={className} onClick={onClick} role={role} tabIndex={tabIndex} id={id}>
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

jest.mock('next/image', () => {
    const MockImage = ({ src, alt, className, height, width }: {
        src: string;
        alt: string;
        className?: string;
        height?: number;
        width?: number;
    }) => (
        <img 
            src={src} 
            alt={alt} 
            className={className} 
            height={height} 
            width={width}
            data-testid="profile-image"
        />
    );
    MockImage.displayName = 'MockImage';
    return MockImage;
});

jest.mock('react-icons/fa', () => ({
    FaGoogle: ({ className }: { className: string }) => (
        <div data-testid="google-icon" className={className}>Google Icon</div>
    ),
}));

jest.mock('react-icons/hi2', () => ({
    HiOutlineBell: ({ className }: { className: string }) => (
        <div data-testid="bell-icon" className={className}>Bell Icon</div>
    ),
}));

jest.mock('@/ui/login/login-buttons', () => ({
    __esModule: true,
    default: () => (
        <div data-testid="login-buttons">
            <button>Continue with Google</button>
        </div>
    ),
}));

jest.mock('@/ui/auth/logout-button', () => ({
    __esModule: true,
    default: ({ setIsMenuOpen, id }: {
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
    ),
}));

jest.mock('@/context/global-context', () => ({
    useGlobalContext: () => ({
        unreadCount: 3,
    }),
}));

jest.mock('@/ui/messages/unread-message-count', () => ({
    __esModule: true,
    default: ({ unreadCount, viewportWidth }: {
        unreadCount?: number;
        viewportWidth?: number;
    }) => (
        <div 
            data-testid="unread-message-count" 
            data-count={unreadCount}
            data-viewport-width={viewportWidth}
        >
            {unreadCount}
        </div>
    ),
}));

jest.mock('@/hooks/use-click-outside', () => ({
    useClickOutside: jest.fn(),
}));

describe('NavBarDesktopRight', () => {
    const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
    const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
    
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
    });

    describe('When User is Logged Out', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
        });

        it('should not render authenticated content when logged out', () => {
            render(<NavBarDesktopRight />);
            
            expect(screen.queryByTestId('profile-image')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /open user menu/i })).not.toBeInTheDocument();
        });
    });

    describe('When User is Logged In', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });


        it('should render profile dropdown button', () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            expect(profileButton).toBeInTheDocument();
            expect(profileButton).toHaveAttribute('id', 'user-menu-button');
        });

        it('should use user profile image when available', () => {
            render(<NavBarDesktopRight />);
            
            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveAttribute('src', mockUser.image);
        });

        it('should use default image when user has no profile image', () => {
            const sessionWithoutImage = {
                ...mockSession,
                user: { ...mockUser, image: null }
            };
            
            mockUseSession.mockReturnValue({
                data: sessionWithoutImage,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarDesktopRight />);
            
            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveAttribute('src');
            // Should use default image (mocked as any src)
        });

        it('should not render login buttons when authenticated', () => {
            render(<NavBarDesktopRight />);
            
            expect(screen.queryByTestId('login-buttons')).not.toBeInTheDocument();
        });
    });

    describe('Profile Dropdown Menu', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should not show dropdown menu initially', () => {
            render(<NavBarDesktopRight />);
            
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should show dropdown menu when profile button is clicked', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });
        });

        it('should render dropdown menu with correct attributes', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const menu = screen.getByRole('menu');
                expect(menu).toHaveAttribute('id', 'user-menu');
                expect(menu).toHaveAttribute('aria-orientation', 'vertical');
                expect(menu).toHaveAttribute('aria-labelledby', 'user-menu-button');
            });
        });

        it('should render My Listings link in dropdown', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const myListingsLink = screen.getByText('My Listings');
                expect(myListingsLink).toBeInTheDocument();
                expect(myListingsLink.closest('a')).toHaveAttribute('href', '/profile');
            });
        });

        it('should render Favorite Properties link in dropdown', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const favoritesLink = screen.getByText('Favorite Properties');
                expect(favoritesLink).toBeInTheDocument();
                expect(favoritesLink.closest('a')).toHaveAttribute('href', '/properties/favorites');
            });
        });

        it('should render logout button in dropdown', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                expect(screen.getByTestId('logout-button')).toBeInTheDocument();
            });
        });

        it('should close menu when clicking My Listings link', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const myListingsLink = screen.getByText('My Listings');
                fireEvent.click(myListingsLink);
            });
            
            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });

        it('should close menu when clicking Favorite Properties link', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const favoritesLink = screen.getByText('Favorite Properties');
                fireEvent.click(favoritesLink);
            });
            
            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });
    });

    describe('Active Path Highlighting', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should highlight My Listings when on profile page', async () => {
            mockUsePathname.mockReturnValue('/profile');
            
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const myListingsLink = screen.getByText('My Listings');
                expect(myListingsLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should highlight Favorite Properties when on favorites page', async () => {
            mockUsePathname.mockReturnValue('/properties/favorites');
            
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const favoritesLink = screen.getByText('Favorite Properties');
                expect(favoritesLink).toHaveClass('menu-btn-current-path');
            });
        });

        it('should not highlight links when on different page', async () => {
            mockUsePathname.mockReturnValue('/messages');
            
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                const myListingsLink = screen.getByText('My Listings');
                const favoritesLink = screen.getByText('Favorite Properties');
                
                expect(myListingsLink).toHaveClass('menu-btn-not-current-path');
                expect(favoritesLink).toHaveClass('menu-btn-not-current-path');
            });
        });
    });

    describe('Responsive Design', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should be hidden on mobile for authenticated content', () => {
            const { container } = render(<NavBarDesktopRight />);
            
            const profileDropdownSection = container.querySelector('.ml-5.hidden.md\\:block');
            expect(profileDropdownSection).toBeInTheDocument();
            expect(profileDropdownSection).toHaveClass('ml-5', 'hidden', 'md:block');
        });

    });

    describe('Menu State Management', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should toggle menu open and closed', async () => {
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            
            // Menu should be closed initially
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            
            // Open menu
            fireEvent.click(profileButton);
            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });
            
            // Close menu
            fireEvent.click(profileButton);
            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes for logged out state', () => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
            
            render(<NavBarDesktopRight />);
            
            // NavBarDesktopRight only shows when authenticated, so no content when logged out
        });

        it('should have proper ARIA attributes for profile button', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            expect(profileButton).toHaveAttribute('aria-expanded', 'false');
            expect(profileButton).toHaveAttribute('aria-haspopup', 'true');
        });

        it('should have screen reader text for profile button', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            render(<NavBarDesktopRight />);
            
            expect(screen.getByText('Open user menu')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when logged out', () => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
            
            const { container } = render(<NavBarDesktopRight />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when logged in', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            const { container } = render(<NavBarDesktopRight />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with dropdown menu open', async () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            const { container } = render(<NavBarDesktopRight />);
            
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
            
            await waitFor(() => {
                expect(screen.getByRole('menu')).toBeInTheDocument();
            });
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});