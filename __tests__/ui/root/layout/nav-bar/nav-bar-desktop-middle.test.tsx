import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import NavBarDesktopMiddle from '@/ui/root/layout/nav-bar/nav-bar-desktop-middle';

// Mock Next.js hooks
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
    const MockLink = ({ children, href, className }: {
        children: React.ReactNode;
        href: string;
        className?: string;
    }) => (
        <a href={href} className={className}>
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

describe('NavBarDesktopMiddle', () => {
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

    describe('Component Structure', () => {
        it('should render with proper responsive classes', () => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
            
            render(<NavBarDesktopMiddle />);
            
            const container = document.querySelector('.hidden.md\\:flex');
            
            expect(container).toBeInTheDocument();
        });

        it('should be hidden on mobile and visible on desktop', () => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
            
            const { container } = render(<NavBarDesktopMiddle />);
            
            const desktopMiddle = container.querySelector('.hidden.md\\:flex');
            expect(desktopMiddle).toBeInTheDocument();
            expect(desktopMiddle).toHaveClass('hidden', 'md:flex', 'md:flex-shrink-1', 'md:items-center', 'md:justify-center');
        });
    });

    describe('Navigation Links - Unauthenticated', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
        });

        it('should render Home and Properties links when logged out', () => {
            render(<NavBarDesktopMiddle />);
            
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
        });

        it('should not render Add Property link when logged out', () => {
            render(<NavBarDesktopMiddle />);
            
            expect(screen.queryByText('Add Property')).not.toBeInTheDocument();
        });

        it('should have correct href attributes for public links', () => {
            render(<NavBarDesktopMiddle />);
            
            const homeLink = screen.getByText('Home').closest('a');
            const propertiesLink = screen.getByText('Properties').closest('a');
            
            expect(homeLink).toHaveAttribute('href', '/');
            expect(propertiesLink).toHaveAttribute('href', '/properties');
        });
    });

    describe('Navigation Links - Authenticated', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should render all navigation links when logged in', () => {
            render(<NavBarDesktopMiddle />);
            
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
        });

        it('should have correct href for Add Property link', () => {
            render(<NavBarDesktopMiddle />);
            
            const addPropertyLink = screen.getByText('Add Property').closest('a');
            expect(addPropertyLink).toHaveAttribute('href', '/properties/add');
        });
    });

    describe('Active Path Highlighting', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
        });

        it('should highlight Home link when on home page', () => {
            mockUsePathname.mockReturnValue('/');
            
            render(<NavBarDesktopMiddle />);
            
            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveClass('menu-btn-desktop-current-path');
        });

        it('should highlight Properties link when on properties page', () => {
            mockUsePathname.mockReturnValue('/properties');
            
            render(<NavBarDesktopMiddle />);
            
            const propertiesLink = screen.getByText('Properties').closest('a');
            expect(propertiesLink).toHaveClass('menu-btn-desktop-current-path');
        });

        it('should highlight Add Property link when authenticated and on add page', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            mockUsePathname.mockReturnValue('/properties/add');
            
            render(<NavBarDesktopMiddle />);
            
            const addPropertyLink = screen.getByText('Add Property').closest('a');
            expect(addPropertyLink).toHaveClass('menu-btn-desktop-current-path');
        });

        it('should use non-current-path class for inactive links', () => {
            mockUsePathname.mockReturnValue('/');
            
            render(<NavBarDesktopMiddle />);
            
            const propertiesLink = screen.getByText('Properties').closest('a');
            expect(propertiesLink).toHaveClass('menu-btn-not-current-path');
        });
    });

    describe('CSS Classes', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
        });

        it('should apply correct base classes to all links', () => {
            render(<NavBarDesktopMiddle />);
            
            const homeLink = screen.getByText('Home').closest('a');
            const propertiesLink = screen.getByText('Properties').closest('a');
            
            expect(homeLink).toHaveClass('menu-btn', 'w-auto');
            expect(propertiesLink).toHaveClass('menu-btn', 'w-auto');
        });

        it('should space navigation links properly', () => {
            const { container } = render(<NavBarDesktopMiddle />);
            
            const linksContainer = container.querySelector('.flex.space-x-3');
            expect(linksContainer).toBeInTheDocument();
            expect(linksContainer).toHaveClass('space-x-3');
        });
    });

    describe('Responsive Behavior', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
        });

        it('should have responsive container classes', () => {
            const { container } = render(<NavBarDesktopMiddle />);
            
            const outerContainer = container.firstChild as Element;
            expect(outerContainer).toHaveClass('hidden', 'md:flex', 'md:flex-shrink-1', 'md:items-center', 'md:justify-center');
        });

        it('should have responsive inner container classes', () => {
            const { container } = render(<NavBarDesktopMiddle />);
            
            const innerContainer = container.querySelector('.hidden.md\\:block');
            expect(innerContainer).toBeInTheDocument();
            expect(innerContainer).toHaveClass('hidden', 'md:block');
        });
    });

    describe('Authentication State Changes', () => {
        it('should update navigation when session changes from logged out to logged in', () => {
            const { rerender } = render(<NavBarDesktopMiddle />);
            
            // Initially logged out
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
            rerender(<NavBarDesktopMiddle />);
            expect(screen.queryByText('Add Property')).not.toBeInTheDocument();
            
            // Change to logged in
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            rerender(<NavBarDesktopMiddle />);
            expect(screen.getByText('Add Property')).toBeInTheDocument();
        });

        it('should handle loading state gracefully', () => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'loading',
                update: jest.fn() 
            });
            
            render(<NavBarDesktopMiddle />);
            
            // Should still render basic navigation
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.queryByText('Add Property')).not.toBeInTheDocument();
        });
    });

    describe('Path Navigation', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should handle different path scenarios', () => {
            const paths = ['/profile', '/messages', '/properties/favorites', '/some-other-page'];
            
            paths.forEach(path => {
                mockUsePathname.mockReturnValue(path);
                const { unmount } = render(<NavBarDesktopMiddle />);
                
                // All links should still be present and functional
                expect(screen.getAllByText('Home')).toHaveLength(1);
                expect(screen.getAllByText('Properties')).toHaveLength(1);
                expect(screen.getAllByText('Add Property')).toHaveLength(1);
                
                // Only the matching path should have current-path class
                const homeLink = screen.getByText('Home').closest('a');
                const propertiesLink = screen.getByText('Properties').closest('a');
                const addPropertyLink = screen.getByText('Add Property').closest('a');
                
                if (path === '/') {
                    expect(homeLink).toHaveClass('menu-btn-desktop-current-path');
                } else {
                    expect(homeLink).toHaveClass('menu-btn-not-current-path');
                }
                
                if (path === '/properties') {
                    expect(propertiesLink).toHaveClass('menu-btn-desktop-current-path');
                } else {
                    expect(propertiesLink).toHaveClass('menu-btn-not-current-path');
                }
                
                if (path === '/properties/add') {
                    expect(addPropertyLink).toHaveClass('menu-btn-desktop-current-path');
                } else {
                    expect(addPropertyLink).toHaveClass('menu-btn-not-current-path');
                }
                
                unmount();
            });
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
        });

        it('should have proper navigation structure', () => {
            render(<NavBarDesktopMiddle />);
            
            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(3);
            
            links.forEach(link => {
                expect(link).toHaveAttribute('href');
            });
        });

        it('should have descriptive link text', () => {
            render(<NavBarDesktopMiddle />);
            
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when logged out', () => {
            mockUseSession.mockReturnValue({ 
                data: null, 
                status: 'unauthenticated',
                update: jest.fn() 
            });
            
            const { container } = render(<NavBarDesktopMiddle />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot when logged in', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            
            const { container } = render(<NavBarDesktopMiddle />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different active paths', () => {
            mockUseSession.mockReturnValue({
                data: mockSession,
                status: 'authenticated',
                update: jest.fn()
            });
            mockUsePathname.mockReturnValue('/properties/add');
            
            const { container } = render(<NavBarDesktopMiddle />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});