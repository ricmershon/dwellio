import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// =============================================================================
// SHARED MOCKS
// =============================================================================

// Mock all CSS imports - used across multiple test files
export const mockAllCssImports = () => {
    jest.mock('@/app/globals.css', () => ({}));
    jest.mock('react-toastify/dist/ReactToastify.css', () => ({}));
    jest.mock('react-loading-skeleton/dist/skeleton.css', () => ({}));
    jest.mock('photoswipe/dist/photoswipe.css', () => ({}));
};

// Next.js Navigation mocks - used in login-buttons and viewport-cookie-writer tests
export const createMockSearchParams = () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
    append: jest.fn(),
    delete: jest.fn(),
    set: jest.fn(),
    sort: jest.fn(),
    size: 0,
    [Symbol.iterator]: jest.fn(),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

export const createMockRouter = () => ({
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
});

// NextAuth mocks - used in login-buttons tests
export const mockNextAuth = () => {
    jest.mock('next-auth/react', () => ({
        signIn: jest.fn(),
        signOut: jest.fn(),
        useSession: jest.fn(),
        getSession: jest.fn(),
        SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    }));
};

// =============================================================================
// SHARED MOCK COMPONENTS
// =============================================================================

export const MockViewportCookieWriter = () => (
    <div data-testid="viewport-cookie-writer" />
);

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
);

export const MockGlobalContextProvider = ({ 
    children, 
    initialStaticInputs 
}: { 
    children: React.ReactNode;
    initialStaticInputs: Record<string, unknown>;
}) => (
    <div 
        data-testid="global-context-provider"
        data-initial-inputs={JSON.stringify(initialStaticInputs)}
    >
        {children}
    </div>
);

export const MockNavBar = () => (
    <nav data-testid="navbar">Navigation</nav>
);

export const MockFooter = () => (
    <footer data-testid="footer">Footer</footer>
);

export const MockToastContainer = (props: { position?: string; theme?: string }) => (
    <div 
        data-testid="toast-container"
        data-position={props.position}
        data-theme={props.theme}
    />
);

// Unified react-toastify mock that includes both ToastContainer and toast methods
export const createReactToastifyMock = () => ({
    ToastContainer: MockToastContainer,
    Slide: 'slide',
    toast: {
        error: jest.fn(),
        success: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
    },
});

// =============================================================================
// SHARED TEST UTILITIES
// =============================================================================

// Custom render function that can include common providers
const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// DOM Utilities for viewport and cookie testing
export const createMockViewportUtils = () => {
    const cookieStore = { current: {} as Record<string, string> };
    
    const setViewportSize = (width: number) => {
        global.window.innerWidth = width;
        Object.defineProperty(global.document.documentElement, 'clientWidth', {
            value: width,
            configurable: true,
            writable: true,
        });
    };
    
    const setupMockDocument = () => {
        Object.defineProperty(global.document, 'cookie', {
            get: () => {
                return Object.entries(cookieStore.current)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ');
            },
            set: (cookieString: string) => {
                const [keyValue] = cookieString.split(';');
                const [key, value] = keyValue.split('=');
                if (key && value) {
                    cookieStore.current[key.trim()] = value.trim();
                }
            },
            configurable: true,
        });
    };
    
    const clearCookies = () => {
        cookieStore.current = {};
    };
    
    return {
        cookieStore,
        setViewportSize,
        setupMockDocument,
        clearCookies,
    };
};

// Timer utilities for debounce testing
export const setupFakeTimers = () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
};

// Common beforeEach/afterEach patterns
export const setupCommonMocks = () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
};

// Export everything from testing library plus our custom render
export * from '@testing-library/react';
export { customRender as render };

// Export shared mocks
export { createNextNavigationMock } from './shared-mocks';