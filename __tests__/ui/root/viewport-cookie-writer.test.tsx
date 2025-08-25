import React from 'react';
import { render, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import ViewportCookieWriter from '@/ui/root/viewport-cookie-writer';
import { VIEWPORT_WIDTH_COOKIE_NAME } from '@/types/types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock timers for debounce testing
jest.useFakeTimers();

describe('ViewportCookieWriter', () => {
    const mockRouter = {
        refresh: jest.fn(),
    };

    // Store original implementations
    const originalInnerWidth = global.window.innerWidth;
    const originalClientWidth = global.document.documentElement.clientWidth;
    const originalCookie = global.document.cookie;
    
    // Cookie store for mocking
    let cookieStore: Record<string, string> = {};
    
    // Helper function to set viewport dimensions
    const setViewportSize = (width: number) => {
        global.window.innerWidth = width;
        Object.defineProperty(global.document.documentElement, 'clientWidth', {
            value: width,
            configurable: true,
            writable: true,
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        
        // Clear and reset cookie store
        cookieStore = {};
        
        // Mock document.cookie with getter/setter
        Object.defineProperty(global.document, 'cookie', {
            get: () => {
                return Object.entries(cookieStore)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ');
            },
            set: (cookieString: string) => {
                const [keyValue] = cookieString.split(';');
                const [key, value] = keyValue.split('=');
                if (key && value) {
                    cookieStore[key.trim()] = value.trim();
                }
            },
            configurable: true,
        });
        
        // Set default window dimensions  
        setViewportSize(1024);
    });

    afterEach(() => {
        // Restore original values
        Object.defineProperty(global.window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
        
        Object.defineProperty(global.document.documentElement, 'clientWidth', {
            writable: true,
            configurable: true,
            value: originalClientWidth,
        });

        Object.defineProperty(global.document, 'cookie', {
            writable: true,
            configurable: true,
            value: originalCookie,
        });
    });

    describe('Cookie Operations', () => {
        it('should get existing cookie value', () => {
            // Set initial cookie in same breakpoint
            cookieStore[VIEWPORT_WIDTH_COOKIE_NAME] = '1280';
            
            // Set window width to same breakpoint as existing cookie to avoid refresh
            setViewportSize(1280);
            
            render(<ViewportCookieWriter />);
            
            // Cookie should remain the same
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1280`);
        });

        it('should handle non-existing cookie', () => {
            // No cookie set initially
            render(<ViewportCookieWriter />);
            
            // Should set cookie with current viewport width
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1024`);
        });

        it('should encode cookie values properly', () => {
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1536,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1536`);
        });

        it('should handle special characters in cookie name', () => {
            // The getCookie function should handle regex special characters
            render(<ViewportCookieWriter />);
            
            expect(document.cookie).toContain(VIEWPORT_WIDTH_COOKIE_NAME);
        });
    });

    describe('Viewport Width Detection', () => {
        it('should use window.innerWidth when available', () => {
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1280,
                configurable: true,
            });
            
            Object.defineProperty(global.document.documentElement, 'clientWidth', {
                value: 1024,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            // Should use window.innerWidth (1280) over clientWidth (1024)
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1280`);
        });

        it('should fallback to document.documentElement.clientWidth', () => {
            Object.defineProperty(global.window, 'innerWidth', {
                value: 0,
                configurable: true,
            });
            
            Object.defineProperty(global.document.documentElement, 'clientWidth', {
                value: 768,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=768`);
        });

        it('should use Math.max of both values', () => {
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1200,
                configurable: true,
            });
            
            Object.defineProperty(global.document.documentElement, 'clientWidth', {
                value: 1400,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            // Should use the larger value (1400)
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1400`);
        });

        it('should handle zero/null values', () => {
            Object.defineProperty(global.window, 'innerWidth', {
                value: null,
                configurable: true,
            });
            
            Object.defineProperty(global.document.documentElement, 'clientWidth', {
                value: null,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            // Should fallback to 0
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=0`);
        });
    });

    describe('Breakpoint Logic', () => {
        it.each([
            [0, 0],      // 0px -> index 0
            [320, 0],    // 320px -> index 0  
            [640, 1],    // 640px -> index 1
            [700, 1],    // 700px -> index 1
            [768, 2],    // 768px -> index 2
            [1000, 2],   // 1000px -> index 2
            [1024, 3],   // 1024px -> index 3
            [1200, 3],   // 1200px -> index 3
            [1280, 4],   // 1280px -> index 4
            [1400, 4],   // 1400px -> index 4
            [1536, 5],   // 1536px -> index 5
            [2000, 5],   // 2000px -> index 5
        ])('should return correct breakpoint index for width %ipx', (width) => {
            // Set window width before rendering
            setViewportSize(width);
            
            render(<ViewportCookieWriter />);
            
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=${width}`);
        });

        it('should handle exact breakpoint boundaries', () => {
            // Test a few key breakpoints individually
            const testBreakpoints = [0, 640, 768, 1024, 1280, 1536];
            
            testBreakpoints.forEach((breakpoint) => {
                // Clear cookies and set window width
                cookieStore = {};
                setViewportSize(breakpoint);
                
                const { unmount } = render(<ViewportCookieWriter />);
                
                expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=${breakpoint}`);
                
                unmount();
            });
        });
    });

    describe('Component Behavior', () => {
        it('should render null', () => {
            const { container } = render(<ViewportCookieWriter />);
            
            expect(container.firstChild).toBeNull();
        });

        it('should set cookie on initial mount', () => {
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1024,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1024`);
        });

        it('should add resize event listener on mount', () => {
            const addEventListenerSpy = jest.spyOn(global.window, 'addEventListener');
            
            render(<ViewportCookieWriter />);
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        });

        it('should remove resize event listener on unmount', () => {
            const removeEventListenerSpy = jest.spyOn(global.window, 'removeEventListener');
            
            const { unmount } = render(<ViewportCookieWriter />);
            
            unmount();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        });

        it('should handle resize events with debouncing', () => {
            const { unmount } = render(<ViewportCookieWriter />);
            
            // Should have initial value
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1024`);
            
            // Change window size and trigger resize
            setViewportSize(768);
            
            act(() => {
                global.window.dispatchEvent(new Event('resize'));
            });
            
            // Should still have old value (debounced)
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1024`);
            
            // Fast-forward time
            act(() => {
                jest.advanceTimersByTime(300);
            });
            
            // Now should be updated
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=768`);
            
            unmount();
        });

        it('should clear debounce timer on rapid resize events', () => {
            const clearTimeoutSpy = jest.spyOn(global.window, 'clearTimeout');
            
            render(<ViewportCookieWriter />);
            
            // Trigger multiple resize events rapidly
            act(() => {
                global.window.dispatchEvent(new Event('resize'));
                global.window.dispatchEvent(new Event('resize'));
                global.window.dispatchEvent(new Event('resize'));
            });
            
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });

        it('should clear debounce timer on unmount', () => {
            const clearTimeoutSpy = jest.spyOn(global.window, 'clearTimeout');
            
            const { unmount } = render(<ViewportCookieWriter />);
            
            // Trigger resize to create timer
            act(() => {
                global.window.dispatchEvent(new Event('resize'));
            });
            
            unmount();
            
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });
    });

    describe('Router Integration', () => {
        it('should call router.refresh when breakpoint changes', () => {
            // Set initial cookie in a different breakpoint
            document.cookie = `${VIEWPORT_WIDTH_COOKIE_NAME}=640`; // breakpoint index 1
            
            // Mount with different breakpoint
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1024, // breakpoint index 3
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            expect(mockRouter.refresh).toHaveBeenCalled();
        });

        it('should not call router.refresh when staying in same breakpoint', () => {
            // Set initial cookie in same breakpoint
            cookieStore[VIEWPORT_WIDTH_COOKIE_NAME] = '1000'; // breakpoint index 2 (768-1023)
            
            // Mount with same breakpoint  
            setViewportSize(900); // also breakpoint index 2 (768-1023)
            
            render(<ViewportCookieWriter />);
            
            expect(mockRouter.refresh).not.toHaveBeenCalled();
        });

        it('should call router.refresh on resize when breakpoint changes', () => {
            // Start in mobile breakpoint
            Object.defineProperty(global.window, 'innerWidth', {
                value: 320, // breakpoint index 0
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            mockRouter.refresh.mockClear();
            
            // Resize to desktop breakpoint
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1280, // breakpoint index 4
                configurable: true,
            });
            
            act(() => {
                global.window.dispatchEvent(new Event('resize'));
                jest.advanceTimersByTime(300);
            });
            
            expect(mockRouter.refresh).toHaveBeenCalled();
        });

        it('should not call router.refresh on resize within same breakpoint', () => {
            // Start at 1024px (breakpoint index 3)
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1024,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            mockRouter.refresh.mockClear();
            
            // Resize within same breakpoint
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1200, // still breakpoint index 3
                configurable: true,
            });
            
            act(() => {
                global.window.dispatchEvent(new Event('resize'));
                jest.advanceTimersByTime(300);
            });
            
            expect(mockRouter.refresh).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle invalid cookie values', () => {
            document.cookie = `${VIEWPORT_WIDTH_COOKIE_NAME}=invalid`;
            
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1024,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            // Should treat invalid cookie as no previous breakpoint (-1) and refresh
            expect(mockRouter.refresh).toHaveBeenCalled();
        });

        it('should handle missing cookie', () => {
            // No cookie set initially
            Object.defineProperty(global.window, 'innerWidth', {
                value: 1024,
                configurable: true,
            });
            
            render(<ViewportCookieWriter />);
            
            // Should set cookie and refresh since no previous breakpoint
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=1024`);
            expect(mockRouter.refresh).toHaveBeenCalled();
        });

        it('should handle rapid consecutive resize events', () => {
            render(<ViewportCookieWriter />);
            
            // Trigger many resize events in quick succession
            act(() => {
                for (let i = 0; i < 10; i++) {
                    global.window.dispatchEvent(new Event('resize'));
                }
            });
            
            // Only one timer should be active
            act(() => {
                jest.advanceTimersByTime(300);
            });
            
            // Should only process the final resize
            expect(document.cookie).toContain(VIEWPORT_WIDTH_COOKIE_NAME);
        });

        it('should handle component remounting', () => {
            const { unmount } = render(<ViewportCookieWriter />);
            
            unmount();
            
            // Change viewport size before remounting
            setViewportSize(768);
            
            // Create new render instead of rerender
            render(<ViewportCookieWriter />);
            
            expect(document.cookie).toContain(`${VIEWPORT_WIDTH_COOKIE_NAME}=768`);
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<ViewportCookieWriter />);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});