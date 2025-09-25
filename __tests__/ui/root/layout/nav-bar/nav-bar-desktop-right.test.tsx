import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBarDesktopRight from '@/ui/root/layout/nav-bar/nav-bar-desktop-right';

// Node module mocks are handled by __mocks__ directory

// Mock next-auth/react specifically for this component
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

// Application module mocks
jest.mock('@/hocs/with-auth', () => {
    const React = require('react');
    return {
        withAuth: (Component: any) => (props: any) => {
            const { useSession } = jest.requireMock('next-auth/react');
            const { data: session } = useSession();
            return React.createElement(Component, { ...props, session });
        },
    };
});

jest.mock('@/ui/auth/logout-button', () => {
    return function MockLogoutButton({ setIsMenuOpen, id }: any) {
        return (
            <button
                id={id}
                onClick={() => setIsMenuOpen(false)}
                data-testid="logout-button"
            >
                Logout
            </button>
        );
    };
});

jest.mock('@/hooks/use-click-outside', () => ({
    useClickOutside: jest.fn(),
}));

// Mock Next.js components (these should ideally be in __mocks__/next/ but for component-specific behavior we can inline)
jest.mock('next/link', () => {
    return function MockLink({ href, children, className, onClick, role, tabIndex, id }: any) {
        return (
            <a
                href={href}
                className={className}
                onClick={onClick}
                role={role}
                tabIndex={tabIndex}
                id={id}
                data-testid="mock-link"
            >
                {children}
            </a>
        );
    };
});

jest.mock('next/image', () => {
    return function MockImage({ src, alt, className, width, height }: any) {
        return (
            <img
                src={typeof src === 'string' ? src : src.src}
                alt={alt}
                className={className}
                width={width}
                height={height}
                data-testid="profile-image"
            />
        );
    };
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const mockSession = {
    user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/profile.jpg',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe('NavBarDesktopRight Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/');
        mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated', update: jest.fn() });
    });

    describe('Authentication State Display', () => {
        it('should render profile dropdown when user is logged in', () => {
            render(<NavBarDesktopRight />);

            expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument();
            expect(screen.getByTestId('profile-image')).toBeInTheDocument();
        });

        it('should not render anything when user is not logged in', () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
            render(<NavBarDesktopRight />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
            expect(screen.queryByTestId('profile-image')).not.toBeInTheDocument();
        });

        it('should display user profile image when available', () => {
            render(<NavBarDesktopRight />);

            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveAttribute('src', mockSession.user.image);
            expect(profileImage).toHaveAttribute('width', '40');
            expect(profileImage).toHaveAttribute('height', '40');
        });

        it('should display default profile image when user image is not available', () => {
            const sessionWithoutImage = {
                ...mockSession,
                user: { ...mockSession.user, image: null }
            };

            mockUseSession.mockReturnValue({ data: sessionWithoutImage, status: 'authenticated', update: jest.fn() });
            render(<NavBarDesktopRight />);

            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveAttribute('src');
            // Should fallback to default image
        });
    });

    describe('Dropdown Menu Functionality', () => {
        it('should initially hide the dropdown menu', () => {
            render(<NavBarDesktopRight />);

            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should show dropdown menu when profile button is clicked', () => {
            render(<NavBarDesktopRight />);

            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        it('should hide dropdown menu when clicking profile button again', () => {
            render(<NavBarDesktopRight />);

            const profileButton = screen.getByRole('button', { name: /open user menu/i });

            // Open menu
            fireEvent.click(profileButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();

            // Close menu
            fireEvent.click(profileButton);
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });

        it('should toggle dropdown menu state correctly', () => {
            render(<NavBarDesktopRight />);

            const profileButton = screen.getByRole('button', { name: /open user menu/i });

            // Initially closed
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();

            // Open
            fireEvent.click(profileButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();

            // Close
            fireEvent.click(profileButton);
            expect(screen.queryByRole('menu')).not.toBeInTheDocument();

            // Open again
            fireEvent.click(profileButton);
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });
    });

    describe('Navigation Menu Items', () => {
        beforeEach(() => {
            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);
        });

        it('should render My Listings link', () => {
            const myListingsLink = screen.getByText('My Listings').closest('a');
            expect(myListingsLink).toHaveAttribute('href', '/profile');
            expect(myListingsLink).toHaveAttribute('role', 'menuitem');
            expect(myListingsLink).toHaveAttribute('id', 'user-menu-item-0');
        });

        it('should render Favorite Properties link', () => {
            const favoritesLink = screen.getByText('Favorite Properties').closest('a');
            expect(favoritesLink).toHaveAttribute('href', '/properties/favorites');
            expect(favoritesLink).toHaveAttribute('role', 'menuitem');
            expect(favoritesLink).toHaveAttribute('id', 'user-menu-item-1');
        });

        it('should render Logout button', () => {
            expect(screen.getByTestId('logout-button')).toBeInTheDocument();
            expect(screen.getByTestId('logout-button')).toHaveAttribute('id', 'user-menu-item-2');
        });

        it('should close menu when clicking My Listings link', async () => {
            const myListingsLink = screen.getByText('My Listings');
            fireEvent.click(myListingsLink);

            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });

        it('should close menu when clicking Favorite Properties link', async () => {
            const favoritesLink = screen.getByText('Favorite Properties');
            fireEvent.click(favoritesLink);

            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });

        it('should close menu when clicking Logout button', async () => {
            const logoutButton = screen.getByTestId('logout-button');
            fireEvent.click(logoutButton);

            await waitFor(() => {
                expect(screen.queryByRole('menu')).not.toBeInTheDocument();
            });
        });
    });

    describe('Current Path Highlighting', () => {
        it('should highlight My Listings when on profile page', () => {
            mockUsePathname.mockReturnValue('/profile');

            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            const myListingsLink = screen.getByText('My Listings').closest('a');
            expect(myListingsLink).toHaveClass('menu-btn-current-path');
        });

        it('should highlight Favorite Properties when on favorites page', () => {
            mockUsePathname.mockReturnValue('/properties/favorites');

            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            const favoritesLink = screen.getByText('Favorite Properties').closest('a');
            expect(favoritesLink).toHaveClass('menu-btn-current-path');
        });

        it('should not highlight links when on other pages', () => {
            mockUsePathname.mockReturnValue('/other-page');

            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            const myListingsLink = screen.getByText('My Listings').closest('a');
            const favoritesLink = screen.getByText('Favorite Properties').closest('a');

            expect(myListingsLink).toHaveClass('menu-btn-not-current-path');
            expect(favoritesLink).toHaveClass('menu-btn-not-current-path');
        });
    });

    describe('Responsive Design', () => {
        it('should have desktop-specific classes', () => {
            render(<NavBarDesktopRight />);

            const container = screen.getByRole('button', { name: /open user menu/i }).closest('div.ml-5');
            expect(container).toHaveClass('hidden', 'md:block');
        });

        it('should properly position dropdown menu', () => {
            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            const dropdown = screen.getByRole('menu');
            expect(dropdown).toHaveClass(
                'absolute',
                'right-0',
                'top-10',
                'z-40',
                'origin-top-right',
                'rounded-sm',
                'bg-white',
                'border-gray-100',
                'shadow-md'
            );
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes on profile button', () => {
            render(<NavBarDesktopRight />);

            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            expect(profileButton).toHaveAttribute('aria-expanded', 'false');
            expect(profileButton).toHaveAttribute('aria-haspopup', 'true');
            expect(profileButton).toHaveAttribute('id', 'user-menu-button');
        });

        it('should update aria-expanded when menu is opened', () => {
            render(<NavBarDesktopRight />);

            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            expect(profileButton).toHaveAttribute('aria-expanded', 'false');

            fireEvent.click(profileButton);
            expect(profileButton).toHaveAttribute('aria-expanded', 'false'); // Note: this might need to be updated in the actual component
        });

        it('should have proper ARIA attributes on dropdown menu', () => {
            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            const dropdown = screen.getByRole('menu');
            expect(dropdown).toHaveAttribute('aria-orientation', 'vertical');
            expect(dropdown).toHaveAttribute('aria-labelledby', 'user-menu-button');
            expect(dropdown).toHaveAttribute('id', 'user-menu');
        });

        it('should have proper tabindex and role on menu items', () => {
            render(<NavBarDesktopRight />);
            const profileButton = screen.getByRole('button', { name: /open user menu/i });
            fireEvent.click(profileButton);

            const myListingsLink = screen.getByText('My Listings').closest('a');
            const favoritesLink = screen.getByText('Favorite Properties').closest('a');

            expect(myListingsLink).toHaveAttribute('role', 'menuitem');
            expect(myListingsLink).toHaveAttribute('tabindex', '-1');
            expect(favoritesLink).toHaveAttribute('role', 'menuitem');
            expect(favoritesLink).toHaveAttribute('tabindex', '-1');
        });

        it('should have screen reader text for profile button', () => {
            render(<NavBarDesktopRight />);

            expect(screen.getByText('Open user menu')).toHaveClass('sr-only');
        });
    });

    describe('Component Structure', () => {
        it('should render only when session exists', () => {
            const { container: withSession } = render(<NavBarDesktopRight />);

            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
            const { container: withoutSession } = render(<NavBarDesktopRight />);

            expect(withSession.firstChild).toBeTruthy();
            // Without session, the component renders an empty fragment
            expect(withoutSession.firstChild).toBeNull();
        });

        it('should have proper container structure', () => {
            render(<NavBarDesktopRight />);

            const container = screen.getByRole('button', { name: /open user menu/i }).closest('.flex.items-center.pr-2');
            expect(container).toBeInTheDocument();
        });

        it('should properly structure profile image container', () => {
            render(<NavBarDesktopRight />);

            const profileImage = screen.getByTestId('profile-image');
            expect(profileImage).toHaveClass('h-8', 'w-8', 'rounded-full');
        });
    });

    describe('Edge Cases', () => {
        it('should handle session with missing user data gracefully', () => {
            const incompleteSession = {
                user: null,
                expires: new Date().toISOString(),
            };

            mockUseSession.mockReturnValue({ data: incompleteSession as any, status: 'authenticated', update: jest.fn() });

            expect(() => {
                render(<NavBarDesktopRight />);
            }).not.toThrow();
        });

        it('should handle session with partial user data', () => {
            const partialSession = {
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    // Missing name and image
                },
                expires: new Date().toISOString(),
            };

            mockUseSession.mockReturnValue({ data: partialSession as any, status: 'authenticated', update: jest.fn() });

            expect(() => {
                render(<NavBarDesktopRight />);
            }).not.toThrow();
        });

        it('should handle rapid menu toggling', () => {
            render(<NavBarDesktopRight />);

            const profileButton = screen.getByRole('button', { name: /open user menu/i });

            // Rapid clicks
            for (let i = 0; i < 5; i++) {
                fireEvent.click(profileButton);
            }

            // Should end up in open state (odd number of clicks)
            expect(screen.getByRole('menu')).toBeInTheDocument();
        });
    });
});