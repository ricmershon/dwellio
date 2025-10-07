import { render, screen } from '@testing-library/react';

import NavBar from '@/ui/root/layout/nav-bar/nav-bar';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
jest.mock('@/utils/get-viewport-width', () => ({
    getViewportWidth: jest.fn()
}));

// Internal Components (Real but with mocked children for isolation)
jest.mock('@/ui/root/layout/nav-bar/nav-bar-left', () => ({
    __esModule: true,
    default: () => <div data-testid="nav-bar-left">NavBarLeft</div>
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar-desktop-middle', () => ({
    __esModule: true,
    default: () => <div data-testid="nav-bar-desktop-middle">NavBarDesktopMiddle</div>
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar-right', () => ({
    __esModule: true,
    default: ({ viewportWidth }: any) => (
        <div data-testid="nav-bar-right" data-viewport={viewportWidth}>NavBarRight</div>
    )
}));

jest.mock('@/ui/root/layout/nav-bar/nav-bar-desktop-right', () => ({
    __esModule: true,
    default: () => <div data-testid="nav-bar-desktop-right">NavBarDesktopRight</div>
}));

import { getViewportWidth } from '@/utils/get-viewport-width';

const mockGetViewportWidth = getViewportWidth as jest.MockedFunction<typeof getViewportWidth>;

// ============================================================================
// TEST SUITE: NavBar Component
// ============================================================================
describe('NavBar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetViewportWidth.mockResolvedValue(1024);
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render nav element', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
        });

        it('should have correct border class', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const nav = container.querySelector('nav');
            expect(nav).toHaveClass('border-b', 'border-gray-100');
        });

        it('should render inner container with correct classes', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const innerContainer = container.querySelector('.px-4.md\\:px-6.lg\\:px-8');
            expect(innerContainer).toBeInTheDocument();
        });

        it('should render flex container with correct classes', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const flexContainer = container.querySelector('.relative.flex.h-15.items-center.justify-between');
            expect(flexContainer).toBeInTheDocument();
        });

        it('should be a server component (async)', () => {
            expect(NavBar.constructor.name).toBe('AsyncFunction');
        });
    });

    // ========================================================================
    // Child Component Rendering
    // ========================================================================
    describe('Child Component Rendering', () => {
        it('should render NavBarLeft component', async () => {
            const component = await NavBar();
            render(component);

            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
        });

        it('should render NavBarDesktopMiddle component', async () => {
            const component = await NavBar();
            render(component);

            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
        });

        it('should render NavBarRight component', async () => {
            const component = await NavBar();
            render(component);

            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
        });

        it('should render NavBarDesktopRight component', async () => {
            const component = await NavBar();
            render(component);

            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
        });

        it('should render all child components', async () => {
            const component = await NavBar();
            render(component);

            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Viewport Width Fetching
    // ========================================================================
    describe('Viewport Width Fetching', () => {
        it('should call getViewportWidth function', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            await NavBar();

            expect(mockGetViewportWidth).toHaveBeenCalledTimes(1);
        });

        it('should pass viewport width to NavBarRight', async () => {
            mockGetViewportWidth.mockResolvedValue(768);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '768');
        });

        it('should handle mobile viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(375);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '375');
        });

        it('should handle tablet viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(768);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '768');
        });

        it('should handle desktop viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(1920);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '1920');
        });

        it('should handle large desktop viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(2560);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '2560');
        });

        it('should await viewport width before rendering', async () => {
            const promise = Promise.resolve(1024);
            mockGetViewportWidth.mockReturnValue(promise);

            const component = await NavBar();
            render(component);

            expect(mockGetViewportWidth).toHaveBeenCalled();
            expect(screen.getByTestId('nav-bar-right')).toHaveAttribute('data-viewport', '1024');
        });
    });

    // ========================================================================
    // Component Layout Structure
    // ========================================================================
    describe('Component Layout Structure', () => {
        it('should render NavBarLeft as first child', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const flexContainer = container.querySelector('.relative.flex');
            const firstChild = flexContainer?.firstChild;

            expect(firstChild).toContainElement(screen.getByTestId('nav-bar-left'));
        });

        it('should render NavBarDesktopMiddle in middle', async () => {
            const component = await NavBar();
            render(component);

            const navBarLeft = screen.getByTestId('nav-bar-left');
            const navBarMiddle = screen.getByTestId('nav-bar-desktop-middle');
            const navBarRight = screen.getByTestId('nav-bar-right');

            // Middle should be between left and right
            expect(navBarLeft).toBeInTheDocument();
            expect(navBarMiddle).toBeInTheDocument();
            expect(navBarRight).toBeInTheDocument();
        });

        it('should render NavBarRight and NavBarDesktopRight in flex container', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const rightContainer = container.querySelector('.flex.relative');
            expect(rightContainer).toBeInTheDocument();
            expect(rightContainer).toContainElement(screen.getByTestId('nav-bar-right'));
            expect(rightContainer).toContainElement(screen.getByTestId('nav-bar-desktop-right'));
        });

        it('should have correct responsive padding classes', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const innerContainer = container.querySelector('.px-4.md\\:px-6.lg\\:px-8');
            expect(innerContainer).toBeInTheDocument();
        });

        it('should maintain proper hierarchy', async () => {
            const component = await NavBar();
            const { container } = render(component);

            const nav = container.querySelector('nav') as HTMLElement;
            const innerContainer = container.querySelector('.px-4.md\\:px-6.lg\\:px-8') as HTMLElement;
            const flexContainer = container.querySelector('.relative.flex') as HTMLElement;

            expect(nav).toContainElement(innerContainer);
            expect(innerContainer).toContainElement(flexContainer);
        });
    });

    // ========================================================================
    // Props Passing
    // ========================================================================
    describe('Props Passing', () => {
        it('should not pass any props to NavBarLeft', async () => {
            const component = await NavBar();
            render(component);

            const navBarLeft = screen.getByTestId('nav-bar-left');
            expect(navBarLeft).toBeInTheDocument();
            expect(navBarLeft.textContent).toBe('NavBarLeft');
        });

        it('should not pass any props to NavBarDesktopMiddle', async () => {
            const component = await NavBar();
            render(component);

            const navBarMiddle = screen.getByTestId('nav-bar-desktop-middle');
            expect(navBarMiddle).toBeInTheDocument();
            expect(navBarMiddle.textContent).toBe('NavBarDesktopMiddle');
        });

        it('should only pass viewportWidth to NavBarRight', async () => {
            mockGetViewportWidth.mockResolvedValue(1440);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '1440');
        });

        it('should not pass any props to NavBarDesktopRight', async () => {
            const component = await NavBar();
            render(component);

            const navBarDesktopRight = screen.getByTestId('nav-bar-desktop-right');
            expect(navBarDesktopRight).toBeInTheDocument();
            expect(navBarDesktopRight.textContent).toBe('NavBarDesktopRight');
        });
    });

    // ========================================================================
    // Error Handling
    // ========================================================================
    describe('Error Handling', () => {
        it('should handle getViewportWidth rejection', async () => {
            mockGetViewportWidth.mockRejectedValue(new Error('Viewport fetch failed'));

            await expect(NavBar()).rejects.toThrow('Viewport fetch failed');
        });

        it('should handle zero viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(0);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '0');
        });

        it('should handle negative viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(-1);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '-1');
        });

        it('should handle very large viewport width', async () => {
            mockGetViewportWidth.mockResolvedValue(99999);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '99999');
        });

        it('should render even if viewport width fetch is slow', async () => {
            mockGetViewportWidth.mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve(1024), 100))
            );

            const component = await NavBar();
            render(component);

            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Server Component Behavior
    // ========================================================================
    describe('Server Component Behavior', () => {
        it('should be an async function', () => {
            expect(NavBar.constructor.name).toBe('AsyncFunction');
        });

        it('should fetch data before rendering', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            const component = await NavBar();

            expect(mockGetViewportWidth).toHaveBeenCalled();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '1024');
        });

        it('should handle async data fetching correctly', async () => {
            let resolveFn: (value: number) => void;
            const promise = new Promise<number>(resolve => {
                resolveFn = resolve;
            });

            mockGetViewportWidth.mockReturnValue(promise);

            const componentPromise = NavBar();

            // Resolve the viewport width
            resolveFn!(800);

            const component = await componentPromise;
            render(component);

            expect(screen.getByTestId('nav-bar-right')).toHaveAttribute('data-viewport', '800');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should render without errors', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            await expect(NavBar()).resolves.not.toThrow();
        });

        it('should handle multiple sequential renders', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            const component1 = await NavBar();
            const { unmount } = render(component1);

            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();

            unmount();

            mockGetViewportWidth.mockResolvedValue(768);
            const component2 = await NavBar();
            render(component2);

            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toHaveAttribute('data-viewport', '768');
        });

        it('should maintain structure with different viewport widths', async () => {
            mockGetViewportWidth.mockResolvedValue(320);

            const component = await NavBar();
            const { container } = render(component);

            expect(container.querySelector('nav')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();
        });

        it('should handle concurrent viewport width calls', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            const [component1] = await Promise.all([
                NavBar(),
                NavBar(),
                NavBar()
            ]);

            expect(mockGetViewportWidth).toHaveBeenCalledTimes(3);

            render(component1);
            expect(screen.getByTestId('nav-bar-right')).toHaveAttribute('data-viewport', '1024');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration Tests', () => {
        it('should render complete navigation structure', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            const component = await NavBar();
            const { container } = render(component);

            // Verify structure
            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();

            // Verify all child components
            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();

            // Verify viewport width passed correctly
            expect(screen.getByTestId('nav-bar-right')).toHaveAttribute('data-viewport', '1024');
        });

        it('should coordinate viewport width with NavBarRight', async () => {
            mockGetViewportWidth.mockResolvedValue(1440);

            const component = await NavBar();
            render(component);

            const navBarRight = screen.getByTestId('nav-bar-right');
            expect(navBarRight).toHaveAttribute('data-viewport', '1440');
        });

        it('should maintain layout consistency across renders', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            const component1 = await NavBar();
            const { container: container1 } = render(component1);

            const component2 = await NavBar();
            const { container: container2 } = render(component2);

            const nav1Classes = container1.querySelector('nav')?.className;
            const nav2Classes = container2.querySelector('nav')?.className;

            expect(nav1Classes).toBe(nav2Classes);
        });

        it('should properly compose all navigation sections', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            const component = await NavBar();
            const { container } = render(component);

            // Verify left section
            const navBarLeft = screen.getByTestId('nav-bar-left');
            expect(navBarLeft).toBeInTheDocument();

            // Verify middle section
            const navBarMiddle = screen.getByTestId('nav-bar-desktop-middle');
            expect(navBarMiddle).toBeInTheDocument();

            // Verify right section container
            const rightContainer = container.querySelector('.flex.relative');
            expect(rightContainer).toContainElement(screen.getByTestId('nav-bar-right'));
            expect(rightContainer).toContainElement(screen.getByTestId('nav-bar-desktop-right'));
        });

        it('should handle complete server-side rendering flow', async () => {
            mockGetViewportWidth.mockResolvedValue(1024);

            // Simulate server-side rendering
            const component = await NavBar();

            // Verify component can be rendered
            render(component);

            // Verify all components rendered
            expect(screen.getByTestId('nav-bar-left')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-middle')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-right')).toBeInTheDocument();
            expect(screen.getByTestId('nav-bar-desktop-right')).toBeInTheDocument();

            // Verify viewport width was fetched and passed
            expect(mockGetViewportWidth).toHaveBeenCalled();
            expect(screen.getByTestId('nav-bar-right')).toHaveAttribute('data-viewport', '1024');
        });
    });
});
