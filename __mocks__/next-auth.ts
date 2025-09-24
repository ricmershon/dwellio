// Mock for next-auth module (external dependency)
import React from 'react';
export const useSession = jest.fn(() => ({
    data: {
        user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            name: 'Test User',
            image: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
}));

export const signIn = jest.fn().mockResolvedValue({ ok: true });
export const signOut = jest.fn().mockResolvedValue({ ok: true });
export const getSession = jest.fn().mockResolvedValue({
    user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => children;

// Mock for next-auth/next
export const getServerSession = jest.fn().mockResolvedValue({
    user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});