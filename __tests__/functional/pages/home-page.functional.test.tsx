/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/(root)/page';

// Mock the child components
jest.mock('@/ui/root/page/hero', () => {
    return function MockHero() {
        return <div data-testid="hero">Hero Component</div>;
    };
});

jest.mock('@/ui/root/page/info-boxes', () => {
    return function MockInfoBoxes() {
        return <div data-testid="info-boxes">Info Boxes Component</div>;
    };
});

jest.mock('@/ui/root/page/featured-properties', () => {
    return function MockFeaturedProperties() {
        return <div data-testid="featured-properties">Featured Properties Component</div>;
    };
});

jest.mock('@/ui/auth/check-auth-status', () => {
    return function MockCheckAuthStatus() {
        return <div data-testid="check-auth-status">Check Auth Status Component</div>;
    };
});

describe('HomePage', () => {
    describe('Component Rendering', () => {
        it('should render the main element', () => {
            render(<HomePage />);

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
        });

        it('should render Hero component', () => {
            render(<HomePage />);

            const hero = screen.getByTestId('hero');
            expect(hero).toBeInTheDocument();
            expect(hero).toHaveTextContent('Hero Component');
        });

        it('should render FeaturedProperties component', () => {
            render(<HomePage />);

            const featuredProperties = screen.getByTestId('featured-properties');
            expect(featuredProperties).toBeInTheDocument();
            expect(featuredProperties).toHaveTextContent('Featured Properties Component');
        });

        it('should render InfoBoxes component', () => {
            render(<HomePage />);

            const infoBoxes = screen.getByTestId('info-boxes');
            expect(infoBoxes).toBeInTheDocument();
            expect(infoBoxes).toHaveTextContent('Info Boxes Component');
        });

        it('should render CheckAuthStatus component', () => {
            render(<HomePage />);

            const checkAuthStatus = screen.getByTestId('check-auth-status');
            expect(checkAuthStatus).toBeInTheDocument();
            expect(checkAuthStatus).toHaveTextContent('Check Auth Status Component');
        });
    });

    describe('Component Order', () => {
        it('should render components in correct order', () => {
            const { container } = render(<HomePage />);

            const main = container.querySelector('main');
            const children = main?.children;

            // CheckAuthStatus is wrapped in Suspense, so it comes first
            expect(children?.[0]).toContainHTML('check-auth-status');
            // Hero should be second
            expect(children?.[1]).toContainHTML('hero');
            // FeaturedProperties should be third
            expect(children?.[2]).toContainHTML('featured-properties');
            // InfoBoxes should be fourth
            expect(children?.[3]).toContainHTML('info-boxes');
        });
    });

    describe('Layout Structure', () => {
        it('should have all child components within main tag', () => {
            const { container } = render(<HomePage />);

            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();

            const hero = screen.getByTestId('hero');
            const featuredProperties = screen.getByTestId('featured-properties');
            const infoBoxes = screen.getByTestId('info-boxes');
            const checkAuthStatus = screen.getByTestId('check-auth-status');

            expect(main).toContainElement(hero);
            expect(main).toContainElement(featuredProperties);
            expect(main).toContainElement(infoBoxes);
            expect(main).toContainElement(checkAuthStatus);
        });

        it('should render without errors', () => {
            expect(() => render(<HomePage />)).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        it('should render complete home page with all sections', () => {
            render(<HomePage />);

            // Verify all main sections are present
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
        });

        it('should maintain consistent structure across renders', () => {
            const { rerender } = render(<HomePage />);

            const initialMain = screen.getByRole('main');
            expect(initialMain).toBeInTheDocument();

            rerender(<HomePage />);

            const rerenderedMain = screen.getByRole('main');
            expect(rerenderedMain).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', () => {
            render(<HomePage />);

            const main = screen.getByRole('main');
            expect(main.tagName).toBe('MAIN');
        });

        it('should be accessible to screen readers', () => {
            render(<HomePage />);

            const main = screen.getByRole('main');
            expect(main).toBeVisible();
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid re-renders gracefully', () => {
            const { rerender } = render(<HomePage />);

            for (let i = 0; i < 5; i++) {
                rerender(<HomePage />);
            }

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
        });

        it('should render consistently when unmounted and remounted', () => {
            const { unmount } = render(<HomePage />);
            unmount();

            render(<HomePage />);

            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
        });
    });
});
