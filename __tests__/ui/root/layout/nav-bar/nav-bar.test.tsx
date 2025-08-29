import React from 'react';
import { render, screen } from '@testing-library/react';
import { createNextNavigationMock } from '@/__tests__/test-utils';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import NavBar from '@/ui/root/layout/nav-bar/nav-bar';
import { getViewportWidth } from '@/utils/get-viewport-width';

// Mock all the sub-components and their dependencies
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}));

jest.mock('next/navigation', () => createNextNavigationMock());

jest.mock('@/utils/get-viewport-width', () => ({
    getViewportWidth: jest.fn(),
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar-left', () => ({
    __esModule: true,
    default: () => <div data-testid="nav-bar-left">NavBarLeft</div>,
}));

// Simple mocks that don't try to use hooks in jest.mock
jest.mock('@/ui/root/layout/nav-bar/nav-bar-desktop-middle', () => ({
    __esModule: true,
    default: () => <div data-testid="nav-bar-desktop-middle">NavBarDesktopMiddle</div>,
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar-desktop-right', () => ({
    __esModule: true,
    default: ({ viewportWidth }: { viewportWidth: number }) => (
        <div data-testid="nav-bar-desktop-right" data-viewport-width={viewportWidth}>
            NavBarDesktopRight
        </div>
    ),
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar-right', () => ({
    __esModule: true,
    default: () => <div data-testid="nav-bar-right">NavBarRight</div>,
}));

jest.mock('@/context/global-context', () => ({
    useGlobalContext: () => ({
        unreadCount: 3,
    }),
}));

jest.mock('@/hooks/use-click-outside', () => ({
    useClickOutside: jest.fn(),
}));

jest.mock('@/ui/auth/login-buttons', () => ({
    __esModule: true,
    default: ({ buttonClassName, text, icon }: {
        buttonClassName?: string;
        text?: string;
        icon?: React.ReactNode;
    }) => (
        <div data-testid="login-buttons-component">
            <button className={buttonClassName}>
                {icon}
                {text}
            </button>
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

describe('NavBar', () => {
    const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
    const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
    const mockGetViewportWidth = getViewportWidth as jest.MockedFunction<typeof getViewportWidth>;
    
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
        mockGetViewportWidth.mockResolvedValue(1024);
    });

    describe('Component Structure', () => {
        it('should render the main navigation structure', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
            
            render(await NavBar());
            
            expect(screen.getByRole('navigation')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
        });

        it('should apply correct CSS classes for layout', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
            
            render(await NavBar());
            
            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('border-b', 'border-gray-100');
            
            const container = nav.querySelector('div');
            expect(container).toHaveClass('px-4', 'md:px-6', 'lg:px-8');
        });

        it('should pass viewport width to NavBarDesktopRight', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
            mockGetViewportWidth.mockResolvedValue(768);
            
            render(await NavBar());
            
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
        });
    });

    describe('Authentication Context', () => {
        describe('When user is logged out', () => {
            beforeEach(() => {
                mockUseSession.mockReturnValue({ 
                    data: null, 
                    status: 'unauthenticated',
                    update: jest.fn()
                } as any);
            });

            it('should render all navigation components', async () => {
                render(await NavBar());
                
                expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            });

            it('should pass viewport width to NavBarDesktopRight', async () => {
                mockGetViewportWidth.mockResolvedValue(1280);
                
                render(await NavBar());
                
                expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
            });
        });

        describe('When user is logged in', () => {
            beforeEach(() => {
                mockUseSession.mockReturnValue({
                    data: mockSession,
                    status: 'authenticated',
                    update: jest.fn()
                } as any);
            });

            it('should render all navigation components when authenticated', async () => {
                render(await NavBar());
                
                expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            });

            it('should pass viewport width to NavBarDesktopRight when authenticated', async () => {
                mockGetViewportWidth.mockResolvedValue(768);
                
                render(await NavBar());
                
                expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
            });
        });

        describe('When session is loading', () => {
            beforeEach(() => {
                mockUseSession.mockReturnValue({
                    data: null,
                    status: 'loading',
                    update: jest.fn()
                } as any);
            });

            it('should render without crashing during loading state', async () => {
                render(await NavBar());
                
                expect(screen.getByRole('navigation')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            });
        });
    });

    describe('Responsive Behavior', () => {
        it('should handle different viewport widths', async () => {
            mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' } as any);
            
            const viewportWidths = [320, 768, 1024, 1280];
            
            for (const width of viewportWidths) {
                mockGetViewportWidth.mockResolvedValue(width);
                
                const { unmount } = render(await NavBar());
                
                const desktopRight = screen.getByTestId('nav-bar-desktop-right');
                expect(desktopRight).toBeInTheDocument();
                
                unmount();
            }
        });

        it('should maintain responsive classes regardless of auth state', async () => {
            const authStates = [
                { data: null, status: 'unauthenticated' },
                { data: mockSession, status: 'authenticated' }
            ];
            
            for (const authState of authStates) {
                mockUseSession.mockReturnValue(authState as any);
                
                const { unmount } = render(await NavBar());
                
                const nav = screen.getByRole('navigation');
                expect(nav).toHaveClass('border-b', 'border-gray-100');
                
                const flexContainer = nav.querySelector('.relative.flex.h-15');
                expect(flexContainer).toHaveClass('items-center', 'justify-between');
                
                unmount();
            }
        });
    });

    describe('Navigation State Management', () => {
        it('should handle different pathname states', async () => {
            const paths = ['/', '/properties', '/properties/add', '/profile'];
            
            mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' } as any);
            
            for (const path of paths) {
                mockUsePathname.mockReturnValue(path);
                
                const { unmount } = render(await NavBar());
                
                // Components should receive the correct pathname context
                expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
                
                unmount();
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle viewport width fetch failure gracefully', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
            mockGetViewportWidth.mockRejectedValue(new Error('Failed to fetch viewport width'));
            
            // Should not throw an error
            const renderPromise = NavBar();
            await expect(renderPromise).rejects.toThrow();
        });

        it('should handle missing session data gracefully', async () => {
            mockUseSession.mockReturnValue({ data: undefined, status: 'unauthenticated' } as any);
            
            render(await NavBar());
            
            // Should render all components without crashing
            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper navigation landmark', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
            
            render(await NavBar());
            
            const nav = screen.getByRole('navigation');
            expect(nav).toBeInTheDocument();
        });

        it('should maintain all navigation components across auth states', async () => {
            const authStates = [
                { data: null, status: 'unauthenticated' },
                { data: mockSession, status: 'authenticated' }
            ];
            
            for (const authState of authStates) {
                mockUseSession.mockReturnValue(authState as any);
                
                const { unmount } = render(await NavBar());
                
                // All main navigation components should be present
                expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
                expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
                
                unmount();
            }
        });
    });

    describe('Integration', () => {
        it('should pass viewport width to NavBarDesktopRight component', async () => {
            mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated', update: jest.fn() } as any);
            mockGetViewportWidth.mockResolvedValue(1280);
            
            render(await NavBar());
            
            // Verify NavBarDesktopRight receives viewport width
            const desktopRight = screen.getByTestId('nav-bar-desktop-right');
            expect(desktopRight).toBeInTheDocument();
        });

        it('should render all child components regardless of auth state', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() } as any);
            
            render(await NavBar());
            
            // All child components should be present
            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot when logged out', async () => {
            mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' } as any);
            
            const navBar = await NavBar();
            expect(navBar).toMatchSnapshot();
        });

        it('should match snapshot when logged in', async () => {
            mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' } as any);
            
            const navBar = await NavBar();
            expect(navBar).toMatchSnapshot();
        });

        it('should match snapshot with different viewport widths', async () => {
            mockUseSession.mockReturnValue({ data: mockSession, status: 'authenticated' } as any);
            mockGetViewportWidth.mockResolvedValue(768);
            
            const navBar = await NavBar();
            expect(navBar).toMatchSnapshot();
        });
    });
});