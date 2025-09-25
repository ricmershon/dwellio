// Mock for next-auth/react module
import React from 'react';

export const useSession = jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
}));

export const signIn = jest.fn().mockResolvedValue({ ok: true });
export const signOut = jest.fn().mockResolvedValue({ ok: true });
export const getSession = jest.fn().mockResolvedValue(null);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => children;