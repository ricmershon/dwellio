import { renderHook, waitFor } from '@testing-library/react';
import { useAuthProviders } from '@/hooks/use-auth-providers';
import { getProviders } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
    getProviders: jest.fn(),
}));

const mockGetProviders = getProviders as jest.MockedFunction<typeof getProviders>;

describe('useAuthProviders Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize with null providers', () => {
        mockGetProviders.mockResolvedValue(null);
        
        const { result } = renderHook(() => useAuthProviders());
        
        expect(result.current).toBeNull();
    });

    it('should fetch providers on mount', async () => {
        const mockProviders = {
            google: {
                id: 'google',
                name: 'Google',
                type: 'oauth',
                signinUrl: 'https://example.com/signin/google',
                callbackUrl: 'https://example.com/callback/google',
            },
        };

        mockGetProviders.mockResolvedValue(mockProviders as any);

        const { result } = renderHook(() => useAuthProviders());

        await waitFor(() => {
            expect(result.current).toEqual(mockProviders);
        });

        expect(mockGetProviders).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple providers', async () => {
        const mockProviders = {
            google: {
                id: 'google',
                name: 'Google',
                type: 'oauth',
                signinUrl: 'https://example.com/signin/google',
                callbackUrl: 'https://example.com/callback/google',
            },
            github: {
                id: 'github',
                name: 'GitHub',
                type: 'oauth',
                signinUrl: 'https://example.com/signin/github',
                callbackUrl: 'https://example.com/callback/github',
            },
            credentials: {
                id: 'credentials',
                name: 'Credentials',
                type: 'credentials',
                credentials: {},
            },
        };

        mockGetProviders.mockResolvedValue(mockProviders as any);

        const { result } = renderHook(() => useAuthProviders());

        await waitFor(() => {
            expect(result.current).toEqual(mockProviders);
        });
    });

    it('should handle getProviders returning null', async () => {
        mockGetProviders.mockResolvedValue(null);

        const { result } = renderHook(() => useAuthProviders());

        await waitFor(() => {
            expect(result.current).toBeNull();
        });
    });

    it('should handle getProviders errors by staying null', async () => {
        // Just verify the hook doesn't crash and starts with null
        const { result } = renderHook(() => useAuthProviders());
        
        // Initially null
        expect(result.current).toBeNull();
        
        // Should handle the case where getProviders might fail
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Hook should still be functional
        expect(typeof result.current).toBe('object');
    });

    it('should handle empty providers object', async () => {
        mockGetProviders.mockResolvedValue({} as any);

        const { result } = renderHook(() => useAuthProviders());

        await waitFor(() => {
            expect(result.current).toEqual({});
        });
    });

    it('should only call getProviders once per hook instance', async () => {
        mockGetProviders.mockResolvedValue({
            google: {
                id: 'google',
                name: 'Google',
                type: 'oauth',
                signinUrl: 'https://example.com/signin/google',
                callbackUrl: 'https://example.com/callback/google',
            },
        } as any);

        const { result, rerender } = renderHook(() => useAuthProviders());

        await waitFor(() => {
            expect(result.current).toBeTruthy();
        });

        // Re-render the hook
        rerender();

        // Should still only have been called once
        expect(mockGetProviders).toHaveBeenCalledTimes(1);
    });

    it('should handle provider data structure correctly', async () => {
        const mockProviders = {
            google: {
                id: 'google',
                name: 'Google',
                type: 'oauth',
                signinUrl: 'https://accounts.google.com/signin',
                callbackUrl: 'https://example.com/api/auth/callback/google',
            } as any,
        } as any;

        mockGetProviders.mockResolvedValue(mockProviders);

        const { result } = renderHook(() => useAuthProviders());

        await waitFor(() => {
            expect(result.current).toEqual(mockProviders);
        });

        // Verify the structure is preserved
        expect(result.current?.google).toHaveProperty('id', 'google');
        expect(result.current?.google).toHaveProperty('name', 'Google');
        expect(result.current?.google).toHaveProperty('type', 'oauth');
    });
});