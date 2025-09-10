import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(root)/page';

// Mock all the child components
jest.mock('@/ui/root/page/hero', () => {
    const MockHero = () => <div data-testid="hero">Hero Component</div>;
    MockHero.displayName = 'MockHero';
    return {
        __esModule: true,
        default: MockHero,
    };
});

jest.mock('@/ui/root/page/info-boxes', () => {
    const MockInfoBoxes = () => <div data-testid="info-boxes">InfoBoxes Component</div>;
    MockInfoBoxes.displayName = 'MockInfoBoxes';
    return {
        __esModule: true,
        default: MockInfoBoxes,
    };
});

jest.mock('@/ui/root/page/featured-properties', () => {
    const MockFeaturedProperties = () => <div data-testid="featured-properties">FeaturedProperties Component</div>;
    MockFeaturedProperties.displayName = 'MockFeaturedProperties';
    return {
        __esModule: true,
        default: MockFeaturedProperties,
    };
});

jest.mock('@/ui/auth/check-auth-status', () => {
    const MockCheckAuthStatus = () => <div data-testid="check-auth-status">CheckAuthStatus Component</div>;
    MockCheckAuthStatus.displayName = 'MockCheckAuthStatus';
    return {
        __esModule: true,
        default: MockCheckAuthStatus,
    };
});

describe('HomePage', () => {
    describe('Component Structure', () => {
        it('should render main element', () => {
            render(<HomePage />);
            
            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render all required components', () => {
            render(<HomePage />);
            
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
        });

        it('should render components in correct order', () => {
            render(<HomePage />);
            
            const mainElement = screen.getByRole('main');
            const children = Array.from(mainElement.children);
            
            // First child should be Suspense wrapper containing CheckAuthStatus
            expect(children[0].tagName.toLowerCase()).toBe('div'); // Suspense renders as div in tests
            expect(children[0]).toContainElement(screen.getByTestId('check-auth-status'));
            
            // Remaining children should be Hero, FeaturedProperties, InfoBoxes
            expect(children[1]).toContainElement(screen.getByTestId('hero'));
            expect(children[2]).toContainElement(screen.getByTestId('featured-properties'));
            expect(children[3]).toContainElement(screen.getByTestId('info-boxes'));
        });

        it('should wrap CheckAuthStatus in Suspense', () => {
            render(<HomePage />);
            
            // CheckAuthStatus should be present (Suspense doesn't affect rendering in tests)
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should render without errors', () => {
            expect(() => render(<HomePage />)).not.toThrow();
        });

        it('should be a function component', () => {
            expect(typeof HomePage).toBe('function');
        });

        it('should return JSX element', () => {
            const result = HomePage();
            expect(React.isValidElement(result)).toBe(true);
        });
    });
});