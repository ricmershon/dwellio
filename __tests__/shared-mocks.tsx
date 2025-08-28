/**
 * Shared Mock Definitions
 * 
 * This file contains mock implementations that can be imported and used
 * across multiple test files to avoid duplication.
 */

import React from 'react';

// =============================================================================
// NEXT.JS LINK MOCK - Comprehensive version supporting all common props
// =============================================================================
export const createNextLinkMock = () => {
    const MockLink = ({ 
        children, 
        href, 
        className, 
        onClick, 
        role, 
        tabIndex, 
        id 
    }: {
        children: React.ReactNode;
        href: string;
        className?: string;
        onClick?: () => void;
        role?: string;
        tabIndex?: number;
        id?: string;
    }) => (
        <a 
            href={href} 
            className={className}
            onClick={onClick}
            role={role}
            tabIndex={tabIndex}
            id={id}
        >
            {children}
        </a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
};

// =============================================================================
// REACT ICONS MOCKS - Individual icon mock creators
// =============================================================================
export const createReactIconsMocks = () => ({
    HiHome: ({ className }: { className?: string }) => (
        <div data-testid="home-icon" className={className}>Home Icon</div>
    ),
    HiOutlineMenu: ({ className }: { className?: string }) => (
        <div data-testid="menu-icon" className={className}>Menu Icon</div>
    ),
    HiOutlineX: ({ className }: { className?: string }) => (
        <div data-testid="close-icon" className={className}>Close Icon</div>
    ),
    FaGoogle: ({ className }: { className?: string }) => (
        <div data-testid="google-icon" className={className}>Google Icon</div>
    ),
    FaSignOutAlt: ({ className }: { className?: string }) => (
        <div data-testid="signout-icon" className={className}>SignOut Icon</div>
    ),
});

// =============================================================================
// NEXTAUTH MOCK - Comprehensive NextAuth mock
// =============================================================================
export const createNextAuthMock = () => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(),
    getSession: jest.fn(),
    getProviders: jest.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="session-provider">{children}</div>
    ),
});

// =============================================================================
// USAGE EXAMPLES - How to use in test files
// =============================================================================
/*
import { createNextLinkMock, createReactIconsMocks } from '@/__tests__/shared-mocks';

// Basic Next.js Link mock
jest.mock('next/link', () => createNextLinkMock());

// React Icons mock - select only needed icons
jest.mock('react-icons/hi2', () => {
    const mocks = createReactIconsMocks();
    return {
        HiHome: mocks.HiHome,
        HiOutlineMenu: mocks.HiOutlineMenu,
    };
});

// NextAuth mock
jest.mock('next-auth/react', () => createNextAuthMock());
*/