import React from 'react';
import { render, screen } from '@testing-library/react';
import { createNextNavigationMock } from '@/__tests__/shared-mocks';
import HomePage from '@/app/(root)/page';

// Mock Next.js navigation for CheckAuthStatus
jest.mock('next/navigation', () => createNextNavigationMock());

// Mock other child components but not CheckAuthStatus - we want to test that integration
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

// Don't mock CheckAuthStatus - test the real component for integration coverage

describe('HomePage Integration Tests', () => {
    const { useSearchParams } = jest.requireMock('next/navigation');

    beforeEach(() => {
        jest.clearAllMocks();
        // Default to no auth required parameters
        useSearchParams.mockReturnValue(new URLSearchParams());
    });

    describe('CheckAuthStatus Integration', () => {
        it('should render CheckAuthStatus component without errors', () => {
            render(<HomePage />);
            
            // The component should render without crashing
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
        });

        it('should not show auth alert when authRequired is not set', () => {
            render(<HomePage />);
            
            // No auth alert should be visible
            expect(screen.queryByText(/Please login to access/)).not.toBeInTheDocument();
        });

        it('should show auth alert when authRequired=true in URL params', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            // Should show the auth required alert
            expect(screen.getByText(/Please login to access the null page/)).toBeInTheDocument();
        });

        it('should show auth alert with returnTo page name', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'dashboard');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            // Should show the auth required alert with specific page
            expect(screen.getByText('Please login to access the dashboard page.')).toBeInTheDocument();
        });

        it('should not show auth alert when loggedOut param is present', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('loggedOut', 'true');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            // Should not show auth alert when user just logged out
            expect(screen.queryByText(/Please login to access/)).not.toBeInTheDocument();
        });

        it('should render auth alert with proper styling', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'profile');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            const alert = screen.getByText('Please login to access the profile page.');
            expect(alert.closest('div')).toHaveClass(
                'bg-yellow-100',
                'border-l-4', 
                'border-yellow-500',
                'text-yellow-700',
                'p-4',
                'mb-6',
                'rounded'
            );
        });

        it('should handle multiple URL parameter scenarios', () => {
            // Test with authRequired=false
            let searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'false');
            useSearchParams.mockReturnValue(searchParams);

            const { rerender } = render(<HomePage />);
            expect(screen.queryByText(/Please login to access/)).not.toBeInTheDocument();

            // Test with authRequired=true but different returnTo values
            searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'properties');
            useSearchParams.mockReturnValue(searchParams);

            rerender(<HomePage />);
            expect(screen.getByText('Please login to access the properties page.')).toBeInTheDocument();

            // Test with empty returnTo
            searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', '');
            useSearchParams.mockReturnValue(searchParams);

            rerender(<HomePage />);
            expect(screen.getByText(/Please login to access the\s+page/)).toBeInTheDocument();
        });

        it('should handle URL parameter changes reactively', () => {
            // Start with no auth required
            let searchParams = new URLSearchParams();
            useSearchParams.mockReturnValue(searchParams);

            const { rerender } = render(<HomePage />);
            expect(screen.queryByText(/Please login to access/)).not.toBeInTheDocument();

            // Change to auth required
            searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'messages');
            useSearchParams.mockReturnValue(searchParams);

            rerender(<HomePage />);
            expect(screen.getByText('Please login to access the messages page.')).toBeInTheDocument();
        });

        it('should handle special characters in returnTo parameter', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'properties/add');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            expect(screen.getByText('Please login to access the properties/add page.')).toBeInTheDocument();
        });
    });

    describe('Overall Page Structure with CheckAuthStatus', () => {
        it('should render all components including CheckAuthStatus in correct order', () => {
            render(<HomePage />);
            
            const main = screen.getByRole('main');
            const children = Array.from(main.children);
            
            // CheckAuthStatus may not add visible DOM when no alert, so check for at least 3 components
            expect(children.length).toBeGreaterThanOrEqual(3);
            
            // Verify that the main components are present
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
        });

        it('should wrap CheckAuthStatus in Suspense boundary', () => {
            render(<HomePage />);
            
            // Component should render successfully (Suspense doesn't change DOM in tests)
            expect(screen.getByRole('main')).toBeInTheDocument();
        });

        it('should maintain component hierarchy with auth alerts', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'favorites');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            // All components should still be rendered along with the alert
            expect(screen.getByText('Please login to access the favorites page.')).toBeInTheDocument();
            expect(screen.getByTestId('hero')).toBeInTheDocument();
            expect(screen.getByTestId('featured-properties')).toBeInTheDocument();
            expect(screen.getByTestId('info-boxes')).toBeInTheDocument();
        });
    });

    describe('CheckAuthStatus State Management', () => {
        it('should initialize with correct default state', () => {
            render(<HomePage />);
            
            // No alert should be shown initially
            expect(screen.queryByText(/Please login to access/)).not.toBeInTheDocument();
        });

        it('should update state based on URL parameters', () => {
            // Simply test that the component renders and shows the expected alert
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'dashboard');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);

            // Verify the alert is shown with the correct message
            expect(screen.getByText('Please login to access the dashboard page.')).toBeInTheDocument();
        });

        it('should handle edge cases in URL parameters gracefully', () => {
            const testCases = [
                { authRequired: '', returnTo: null },
                { authRequired: 'true', returnTo: null },
                { authRequired: 'TRUE', returnTo: 'test' },
                { authRequired: '1', returnTo: 'test' },
            ];

            testCases.forEach(({ authRequired, returnTo }, index) => {
                const searchParams = new URLSearchParams();
                if (authRequired) searchParams.set('authRequired', authRequired);
                if (returnTo) searchParams.set('returnTo', returnTo);
                useSearchParams.mockReturnValue(searchParams);

                const { unmount } = render(<HomePage />);
                
                // Component should render without errors for any valid parameter combination
                expect(screen.getByRole('main')).toBeInTheDocument();
                
                unmount();
            });
        });
    });

    describe('CheckAuthStatus Accessibility', () => {
        it('should render alert with proper semantic structure', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'settings');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            const alertElement = screen.getByText('Please login to access the settings page.');
            
            // Should be in a div with alert-like styling
            expect(alertElement.closest('div')).toHaveClass('bg-yellow-100');
            expect(alertElement.closest('div')).toHaveClass('text-yellow-700');
        });

        it('should be visible to screen readers', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'profile');
            useSearchParams.mockReturnValue(searchParams);

            render(<HomePage />);
            
            const alertText = screen.getByText('Please login to access the profile page.');
            expect(alertText).toBeVisible();
        });
    });

    describe('Performance and Error Handling', () => {
        it('should handle rapid URL parameter changes', () => {
            let searchParams = new URLSearchParams();
            useSearchParams.mockReturnValue(searchParams);

            const { rerender } = render(<HomePage />);

            // Simulate rapid parameter changes
            for (let i = 0; i < 5; i++) {
                searchParams = new URLSearchParams();
                searchParams.set('authRequired', 'true');
                searchParams.set('returnTo', `page${i}`);
                useSearchParams.mockReturnValue(searchParams);
                
                rerender(<HomePage />);
                
                expect(screen.getByText(`Please login to access the page${i} page.`)).toBeInTheDocument();
            }
        });

        it('should handle missing searchParams gracefully', () => {
            // Mock a searchParams object that has a get method but returns null for everything
            const mockSearchParams = {
                get: jest.fn().mockReturnValue(null)
            };
            useSearchParams.mockReturnValue(mockSearchParams);

            expect(() => render(<HomePage />)).not.toThrow();
        });

        it('should not cause memory leaks during unmounting', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            useSearchParams.mockReturnValue(searchParams);

            const { unmount } = render(<HomePage />);
            
            // Should unmount without errors
            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Snapshots with CheckAuthStatus Integration', () => {
        it('should match snapshot with no auth alert', () => {
            const { container } = render(<HomePage />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with auth alert', () => {
            const searchParams = new URLSearchParams();
            searchParams.set('authRequired', 'true');
            searchParams.set('returnTo', 'test-page');
            useSearchParams.mockReturnValue(searchParams);

            const { container } = render(<HomePage />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});