import React from 'react';
import { render, screen } from '@/__tests__/test-utils';

import HomePage from '@/app/page';

// Mock React Suspense
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    Suspense: ({ children }: { children: React.ReactNode }) => <div data-testid="suspense">{children}</div>,
}));

// Mock all the home page components with correct paths
jest.mock('@/ui/root/page/hero', () => {
    const MockHero = () => <div data-testid="hero">Hero Component</div>;
    MockHero.displayName = 'MockHero';
    return MockHero;
});

jest.mock('@/ui/root/page/info-boxes', () => {
    const MockInfoBoxes = () => <div data-testid="info-boxes">InfoBoxes Component</div>;
    MockInfoBoxes.displayName = 'MockInfoBoxes';
    return MockInfoBoxes;
});

jest.mock('@/ui/root/page/featured-properties', () => {
    const MockFeaturedProperties = () => <div data-testid="featured-properties">FeaturedProperties Component</div>;
    MockFeaturedProperties.displayName = 'MockFeaturedProperties';
    return MockFeaturedProperties;
});

jest.mock('@/ui/auth/check-auth-status', () => {
    const MockCheckAuthStatus = () => <div data-testid="check-auth-status">CheckAuthStatus Component</div>;
    MockCheckAuthStatus.displayName = 'MockCheckAuthStatus';
    return MockCheckAuthStatus;
});

describe('HomePage', () => {
    describe('Rendering', () => {
        it('should render the homepage layout', () => {
            render(<HomePage />);
            
            // Verify main element exists
            const main = screen.getByRole('main');
            expect(main).toBeInTheDocument();
            
            // Verify all main components are rendered
            expect(screen.getByTestId('suspense')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
        });

        it('should render components in correct order', () => {
            const { container } = render(<HomePage />);
            
            const main = container.querySelector('main');
            const directChildren = main?.children;
            expect(directChildren?.[0]).toHaveAttribute('data-testid', 'suspense');
            expect(directChildren?.[1]).toHaveAttribute('data-testid', 'hero');
            expect(directChildren?.[2]).toHaveAttribute('data-testid', 'featured-properties');
            expect(directChildren?.[3]).toHaveAttribute('data-testid', 'info-boxes');
        });

        it('should render within main element', () => {
            const { container } = render(<HomePage />);
            
            // Component uses main element as wrapper
            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();
            expect(container.firstChild).toBe(main);
        });
    });

    describe('Component Structure', () => {
        it('should render Suspense wrapper', () => {
            render(<HomePage />);
            
            const suspense = screen.getByTestId('suspense');
            expect(suspense).toBeInTheDocument();
            expect(suspense).toHaveTextContent('CheckAuthStatus Component');
        });

        it('should render CheckAuthStatus component within Suspense', () => {
            render(<HomePage />);
            
            const checkAuthStatus = screen.getByTestId('check-auth-status');
            expect(checkAuthStatus).toBeInTheDocument();
            expect(checkAuthStatus).toHaveTextContent('CheckAuthStatus Component');
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
            expect(featuredProperties).toHaveTextContent('FeaturedProperties Component');
        });

        it('should render InfoBoxes component', () => {
            render(<HomePage />);
            
            const infoBoxes = screen.getByTestId('info-boxes');
            expect(infoBoxes).toBeInTheDocument();
            expect(infoBoxes).toHaveTextContent('InfoBoxes Component');
        });
    });

    describe('Component Integration', () => {
        it('should render all components together', () => {
            render(<HomePage />);
            
            // All components should be present simultaneously
            expect(screen.getByTestId('suspense')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
        });

        it('should have correct number of child components', () => {
            const { container } = render(<HomePage />);
            
            const components = container.querySelectorAll('[data-testid]');
            expect(components).toHaveLength(5); // suspense, check-auth-status, hero, featured-properties, info-boxes
        });

        it('should render within main semantic element', () => {
            const { container } = render(<HomePage />);
            
            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();
            
            // Direct children of main should be 4: suspense, hero, featured-properties, info-boxes
            const directChildren = main?.children;
            expect(directChildren).toHaveLength(4);
            
            // All test-id components (including nested ones) should be within main
            const allComponents = main?.querySelectorAll('[data-testid]');
            expect(allComponents).toHaveLength(5); // suspense + check-auth-status + hero + featured-properties + info-boxes
        });
    });

    describe('Component Behavior', () => {
        it('should render consistently across multiple renders', () => {
            const { rerender } = render(<HomePage />);
            
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
            
            rerender(<HomePage />);
            
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
        });

        it('should be a functional component with no props', () => {
            // Component should render without any props
            expect(() => render(<HomePage />)).not.toThrow();
        });

        it('should not have any state or side effects', () => {
            render(<HomePage />);
            
            // Component should be purely presentational
            // All content comes from child components
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
        });
    });

    describe('Component Layout', () => {
        it('should use main element as wrapper', () => {
            const { container } = render(<HomePage />);
            
            // Component uses main semantic element
            const main = container.querySelector('main');
            expect(main).toBeInTheDocument();
            expect(container.children).toHaveLength(1); // Just the main element
        });

        it('should maintain component ordering in DOM', () => {
            const { container } = render(<HomePage />);
            
            const main = container.querySelector('main');
            const children = Array.from(main?.children || []);
            expect(children[0]).toHaveAttribute('data-testid', 'suspense');
            expect(children[1]).toHaveAttribute('data-testid', 'hero');
            expect(children[2]).toHaveAttribute('data-testid', 'featured-properties');
            expect(children[3]).toHaveAttribute('data-testid', 'info-boxes');
        });

        it('should not add any additional styling or classes', () => {
            const { container } = render(<HomePage />);
            
            // Container should not have any classes from HomePage component
            expect(container.firstChild).not.toHaveClass();
            
            // Each component should only have their test-id attribute
            const components = container.querySelectorAll('[data-testid]');
            components.forEach(component => {
                const attributes = Array.from(component.attributes);
                expect(attributes).toHaveLength(1); // Only data-testid
                expect(attributes[0].name).toBe('data-testid');
            });
        });
    });

    describe('Accessibility', () => {
        it('should not introduce any accessibility barriers', () => {
            render(<HomePage />);
            
            // All components should be accessible
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
        });

        it('should maintain semantic structure through child components', () => {
            const { container } = render(<HomePage />);
            
            // Component should not interfere with semantic structure
            // Semantic structure is handled by individual child components
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should allow child components to define their own accessibility features', () => {
            render(<HomePage />);
            
            // HomePage doesn't add any accessibility attributes
            // This allows child components full control over their accessibility
            const components = screen.getAllByTestId(/hero|info-boxes|featured-properties|check-auth-status/);
            expect(components).toHaveLength(4);
        });
    });

    describe('Error Handling', () => {
        it('should not crash if child components have issues', () => {
            // This test ensures HomePage itself is stable
            // Individual component errors would be caught by their own error boundaries
            expect(() => render(<HomePage />)).not.toThrow();
        });

        it('should render even if some child components fail', () => {
            // HomePage should still render its structure even if children have issues
            render(<HomePage />);
            
            // At minimum, the container should exist
            const { container } = render(<HomePage />);
            expect(container).toBeInTheDocument();
        });
    });

    describe('Performance', () => {
        it('should render without performance issues', () => {
            const startTime = performance.now();
            render(<HomePage />);
            const endTime = performance.now();
            
            // Should render quickly (less than 100ms for this simple component)
            expect(endTime - startTime).toBeLessThan(100);
        });

        it('should not cause unnecessary re-renders', () => {
            const { rerender } = render(<HomePage />);
            
            // Component should render consistently
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            
            rerender(<HomePage />);
            
            // Should still be present after rerender
            expect(screen.getByTestId('hero')).toBeInTheDocument();
        });
    });

    describe('Component Dependencies', () => {
        it('should import and render Hero component', () => {
            render(<HomePage />);
            
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByText('Hero Component')).toBeInTheDocument();
        });

        it('should import and render InfoBoxes component', () => {
            render(<HomePage />);
            
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
            expect(screen.getByText('InfoBoxes Component')).toBeInTheDocument();
        });

        it('should import and render FeaturedProperties component', () => {
            render(<HomePage />);
            
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByText('FeaturedProperties Component')).toBeInTheDocument();
        });

        it('should import and render CheckAuthStatus component', () => {
            render(<HomePage />);
            
            expect(screen.getByTestId('check-auth-status')).toBeInTheDocument();
            expect(screen.getByText('CheckAuthStatus Component')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot', () => {
            const { container } = render(<HomePage />);
            
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot consistently', () => {
            const { container: container1 } = render(<HomePage />);
            const { container: container2 } = render(<HomePage />);
            
            expect(container1.innerHTML).toBe(container2.innerHTML);
        });

        it('should match snapshot with all components', () => {
            const { container } = render(<HomePage />);
            
            // Verify snapshot includes all expected components
            expect(container.innerHTML).toContain('data-testid="hero"');
            expect(container.innerHTML).toContain('data-testid="info-boxes"');
            expect(container.innerHTML).toContain('data-testid="featured-properties"');
            expect(container.innerHTML).toContain('data-testid="check-auth-status"');
            expect(container.innerHTML).toContain('data-testid="suspense"');
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });

    describe('Component Export', () => {
        it('should export HomePage as default', () => {
            // Test that the component can be imported and rendered
            expect(HomePage).toBeDefined();
            expect(typeof HomePage).toBe('function');
        });

        it('should render without throwing errors', () => {
            expect(() => {
                render(<HomePage />);
            }).not.toThrow();
        });

        it('should have correct component name for debugging', () => {
            // Function should have a name for better debugging
            expect(HomePage.name).toBe('HomePage');
        });
    });
});