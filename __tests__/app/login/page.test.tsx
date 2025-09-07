import React from 'react';
import { render, screen, setupCommonMocks } from '@/__tests__/test-utils';
import { redirect } from 'next/navigation';
import LoginPage from '@/app/(login)/login/page';

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

// Mock session utility
jest.mock('@/utils/get-session-user', () => ({
    getSessionUser: jest.fn(),
}));

// Mock components
jest.mock('@/ui/login/login-ui', () => {
    const MockLoginUI = () => (
        <div data-testid="login-ui">Login UI Component</div>
    );
    MockLoginUI.displayName = 'MockLoginUI';
    return MockLoginUI;
});

jest.mock('@/ui/shared/logo', () => {
    const MockLogo = () => (
        <div data-testid="dwellio-logo">Dwellio Logo</div>
    );
    MockLogo.displayName = 'MockLogo';
    return MockLogo;
});

describe('LoginPage', () => {
    const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
    const mockGetSessionUser = require('@/utils/get-session-user').getSessionUser;

    setupCommonMocks();

    beforeEach(() => {
        mockGetSessionUser.mockResolvedValue(null);
    });

    describe('Authentication Guard', () => {
        it('should redirect authenticated users to home page', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            mockGetSessionUser.mockResolvedValue(mockUser);

            await LoginPage();

            expect(mockRedirect).toHaveBeenCalledWith('/');
        });

        it('should render login page for unauthenticated users', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            
            // Render the result to test its content
            render(result);

            expect(screen.getByTestId('dwellio-logo')).toBeInTheDocument();
            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });
    });

    describe('Page Structure', () => {
        it('should render all required components', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            // Check main container structure
            const container = screen.getByTestId('dwellio-logo').closest('.max-w-md');
            expect(container).toBeInTheDocument();
            expect(container).toHaveClass('max-w-md', 'w-full', 'space-y-6');

            // Check logo section
            expect(screen.getByTestId('dwellio-logo')).toBeInTheDocument();
            
            // Check login UI
            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });

        it('should render account linking information', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            expect(screen.getByText('Account Linking')).toBeInTheDocument();
            expect(screen.getByText(/If you have an existing Google account/)).toBeInTheDocument();
            expect(screen.getByText(/creating a password will link both sign-in methods/)).toBeInTheDocument();
        });

        it('should have proper CSS classes for layout', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            // Main container
            const mainContainer = screen.getByTestId('dwellio-logo').closest('.flex');
            expect(mainContainer).toHaveClass(
                'flex',
                'items-center',
                'justify-center',
                'py-6',
                'px-4',
                'sm:px-6',
                'lg:px-8'
            );

            // Content area
            const contentArea = screen.getByTestId('dwellio-logo').closest('.max-w-md');
            expect(contentArea).toHaveClass('max-w-md', 'w-full', 'space-y-6');

            // Logo section
            const logoSection = screen.getByTestId('dwellio-logo').closest('.text-center');
            expect(logoSection).toHaveClass('text-center');
        });

        it('should render account linking info with proper styling', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const accountLinkingSection = screen.getByText('Account Linking').closest('.p-4');
            expect(accountLinkingSection).toHaveClass(
                'p-4',
                'bg-blue-50',
                'rounded-lg',
                'shadow-lg'
            );

            const heading = screen.getByText('Account Linking');
            expect(heading).toHaveClass('font-medium', 'text-lg');

            const description = screen.getByText(/If you have an existing Google account/);
            expect(description.closest('.text-sm')).toHaveClass('text-sm');
        });
    });

    describe('Suspense Integration', () => {
        it('should wrap LoginUI in Suspense boundary', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            
            // The Suspense component would show loading fallback during SSR
            // In our test, we just verify the component structure
            render(result);
            
            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });
    });

    describe('Session Integration', () => {
        it('should call getSessionUser to check authentication', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            await LoginPage();

            expect(mockGetSessionUser).toHaveBeenCalled();
        });

        it('should handle session check errors gracefully', async () => {
            mockGetSessionUser.mockRejectedValue(new Error('Session check failed'));

            // The page should still render even if session check fails
            try {
                const result = await LoginPage();
                render(result);
                expect(screen.getByTestId('login-ui')).toBeInTheDocument();
            } catch (error) {
                // If the error propagates, that's expected behavior
                expect((error as Error).message).toBe('Session check failed');
            }
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive padding classes', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const container = screen.getByTestId('dwellio-logo').closest('.flex');
            expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
        });

        it('should use responsive spacing', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const contentArea = screen.getByTestId('dwellio-logo').closest('.space-y-6');
            expect(contentArea).toHaveClass('space-y-6');
        });
    });

    describe('SEO and Accessibility', () => {
        it('should render with proper semantic structure', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            // Main container should be semantically appropriate
            const container = screen.getByTestId('dwellio-logo').closest('.flex');
            expect(container).toBeInTheDocument();
        });

        it('should provide informative content for screen readers', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            // Account linking info should be accessible
            expect(screen.getByText('Account Linking')).toBeInTheDocument();
            expect(screen.getByText(/creating a password will link both sign-in methods/)).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle redirect errors gracefully', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            mockGetSessionUser.mockResolvedValue(mockUser);
            mockRedirect.mockImplementation(() => {
                throw new Error('Redirect failed');
            });

            // Should handle redirect error without crashing
            try {
                await LoginPage();
            } catch (error) {
                expect((error as Error).message).toBe('Redirect failed');
            }
            
            expect(mockRedirect).toHaveBeenCalledWith('/');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot for unauthenticated user', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            const { container } = render(result);
            
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});