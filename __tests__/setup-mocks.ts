/**
 * Shared Jest Mock Configurations
 * 
 * This file contains common mock setups that are used across multiple test files.
 * Import and call the relevant setup functions in your test files.
 */

import React from 'react';

// =============================================================================
// CSS MOCKS - Used in layout and component tests
// =============================================================================
export const setupCssMocks = () => {
    jest.mock('@/app/globals.css', () => ({}));
    jest.mock('react-toastify/dist/ReactToastify.css', () => ({}));
    jest.mock('react-loading-skeleton/dist/skeleton.css', () => ({}));
    jest.mock('photoswipe/dist/photoswipe.css', () => ({}));
};

// =============================================================================
// NEXT.JS MOCKS - Common across multiple tests
// =============================================================================
export const setupNextNavigationMocks = () => {
    jest.mock('next/navigation', () => ({
        useRouter: jest.fn(),
        useSearchParams: jest.fn(),
        usePathname: jest.fn(),
        useParams: jest.fn(),
        redirect: jest.fn(),
        notFound: jest.fn(),
    }));
};

export const setupNextAuthMocks = () => {
    jest.mock('next-auth/react', () => ({
        signIn: jest.fn(),
        signOut: jest.fn(),
        useSession: jest.fn(),
        getSession: jest.fn(),
        getProviders: jest.fn(),
        SessionProvider: ({ children }: { children: React.ReactNode }) => 
            React.createElement('div', { 'data-testid': 'session-provider' }, children),
    }));
};

// =============================================================================
// COMPONENT MOCKS - Layout-related components
// =============================================================================
export const setupLayoutComponentMocks = () => {
    // Mock data dependencies
    jest.mock('@/lib/data/static-inputs-data', () => ({
        fetchStaticInputs: jest.fn().mockResolvedValue({
            amenities: ['WiFi', 'Pool', 'Kitchen'],
            property_types: ['House', 'Apartment', 'Condo']
        })
    }));
    
    // Mock UI components
    jest.mock('@/ui/root/viewport-cookie-writer', () => ({
        __esModule: true,
        default: () => React.createElement('div', { 'data-testid': 'viewport-cookie-writer' }),
    }));
    
    jest.mock('@/ui/root/auth-provider', () => ({
        __esModule: true,
        default: ({ children }: { children: React.ReactNode }) => 
            React.createElement('div', { 'data-testid': 'auth-provider' }, children),
    }));
    
    jest.mock('@/context/global-context', () => ({
        __esModule: true,
        GlobalContextProvider: ({ 
            children, 
            initialStaticInputs 
        }: { 
            children: React.ReactNode;
            initialStaticInputs: Record<string, unknown>;
        }) => React.createElement('div', {
            'data-testid': 'global-context-provider',
            'data-initial-inputs': JSON.stringify(initialStaticInputs)
        }, children),
    }));
    
    jest.mock('@/ui/root/layout/nav-bar/nav-bar', () => ({
        __esModule: true,
        default: () => React.createElement('nav', { 'data-testid': 'navbar' }, 'Navigation'),
    }));
    
    jest.mock('@/ui/root/layout/footer', () => ({
        __esModule: true,
        default: () => React.createElement('footer', { 'data-testid': 'footer' }, 'Footer'),
    }));
    
    // Mock react-toastify
    jest.mock('react-toastify', () => ({
        ToastContainer: (props: { position?: string; theme?: string }) => 
            React.createElement('div', {
                'data-testid': 'toast-container',
                'data-position': props.position,
                'data-theme': props.theme
            }),
        Slide: 'slide'
    }));
};

// =============================================================================
// AUTH-RELATED MOCKS - Login components and hooks
// =============================================================================
export const setupAuthComponentMocks = () => {
    jest.mock('@/hooks/use-auth-providers', () => ({
        useAuthProviders: jest.fn(),
    }));
};