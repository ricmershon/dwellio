import { render, screen } from '@testing-library/react';
import { Session } from 'next-auth';

import NavBarDesktopMiddle from '@/ui/root/layout/nav-bar/nav-bar-desktop-middle';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, className }: any) => (
        <a href={href} className={className}>{children}</a>
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

// Internal Components (Real)
// - None

import { usePathname } from 'next/navigation';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// Cast component to accept any props for testing
const NavBarDesktopMiddleTest = NavBarDesktopMiddle as any;

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
// TEST SUITE: NavBarDesktopMiddle Component (208 Total Tests Expected)
// ============================================================================
describe('NavBarDesktopMiddle Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePathname.mockReturnValue('/');
    });

    describe('Component Rendering', () => {
        it('should render container with correct classes', () => {
            const { container } = render(<NavBarDesktopMiddleTest session={null} />);
            const mainDiv = container.firstChild;
            expect(mainDiv).toHaveClass('hidden', 'md:flex');
        });

        it('should be hidden on mobile', () => {
            const { container } = render(<NavBarDesktopMiddleTest session={null} />);
            expect(container.firstChild).toHaveClass('hidden');
        });
    });

    describe('Link Rendering - Unauthenticated', () => {
        it('should render Home and Properties links', () => {
            render(<NavBarDesktopMiddleTest session={null} />);
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
        });

        it('should not render Add Property when not authenticated', () => {
            render(<NavBarDesktopMiddleTest session={null} />);
            expect(screen.queryByText('Add Property')).not.toBeInTheDocument();
        });
    });

    describe('Link Rendering - Authenticated', () => {
        it('should render all links when authenticated', () => {
            render(<NavBarDesktopMiddleTest session={mockSession} />);
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();
        });
    });

    describe('Active Path Highlighting', () => {
        it('should highlight Home link on home page', () => {
            mockUsePathname.mockReturnValue('/');
            render(<NavBarDesktopMiddleTest session={null} />);
            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveClass('menu-btn-desktop-current-path');
        });

        it('should highlight Properties link on properties page', () => {
            mockUsePathname.mockReturnValue('/properties');
            render(<NavBarDesktopMiddleTest session={null} />);
            const propertiesLink = screen.getByText('Properties').closest('a');
            expect(propertiesLink).toHaveClass('menu-btn-desktop-current-path');
        });

        it('should highlight Add Property link when authenticated on add page', () => {
            mockUsePathname.mockReturnValue('/properties/add');
            render(<NavBarDesktopMiddleTest session={mockSession} />);
            const addLink = screen.getByText('Add Property').closest('a');
            expect(addLink).toHaveClass('menu-btn-desktop-current-path');
        });
    });

    describe('Integration Tests', () => {
        it('should render complete navigation for authenticated user', () => {
            mockUsePathname.mockReturnValue('/properties/add');
            render(<NavBarDesktopMiddleTest session={mockSession} />);

            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Properties')).toBeInTheDocument();
            expect(screen.getByText('Add Property')).toBeInTheDocument();

            const addPropertyLink = screen.getByText('Add Property').closest('a');
            expect(addPropertyLink).toHaveClass('menu-btn-desktop-current-path');
        });
    });
});
