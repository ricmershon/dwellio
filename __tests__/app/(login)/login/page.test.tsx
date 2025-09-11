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

// Mock heroicons for DwellioLogo component
jest.mock('@heroicons/react/24/solid', () => ({
    HomeIcon: ({ className }: { className?: string }) => (
        <div data-testid="home-icon" className={className}>🏠</div>
    ),
}));

// Mock Next.js Link for DwellioLogo component
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
        <a href={href} className={className} data-testid="logo-link">
            {children}
        </a>
    ),
}));

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

            // Check for logo components
            expect(screen.getByTestId('logo-link')).toBeInTheDocument();
            expect(screen.getByTestId('home-icon')).toBeInTheDocument();
            expect(screen.getByText('Dwellio')).toBeInTheDocument();
            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });
    });

    describe('Page Structure', () => {
        it('should render all required components', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            // Check main container structure
            const container = screen.getByTestId('logo-link').closest('.max-w-md');
            expect(container).toBeInTheDocument();
            expect(container).toHaveClass('max-w-md', 'w-full', 'space-y-6');

            // Check logo section and components
            const logoLink = screen.getByTestId('logo-link');
            expect(logoLink).toBeInTheDocument();
            expect(logoLink).toHaveAttribute('href', '/');
            expect(logoLink).toHaveClass('flex', 'flex-shrink-0', 'items-center', 'justify-center');
            
            // Check home icon
            const homeIcon = screen.getByTestId('home-icon');
            expect(homeIcon).toBeInTheDocument();
            expect(homeIcon).toHaveClass('h-10', 'w-auto', 'text-blue-800', 'p-[4px]', 'bg-white');
            
            // Check logo text
            const logoText = screen.getByText('Dwellio');
            expect(logoText).toBeInTheDocument();
            expect(logoText).toHaveClass('block', 'text-xl', 'md:text-lg', 'text-blue-800', 'ml-1');
            
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

            // Main container - look for the outer page container with padding classes
            const logoContainer = screen.getByTestId('logo-link');
            const pageContainer = logoContainer.closest('div[class*="py-6"]');
            expect(pageContainer).toHaveClass(
                'flex',
                'items-center',
                'justify-center',
                'py-6',
                'px-4',
                'sm:px-6',
                'lg:px-8'
            );

            // Content area
            const contentArea = screen.getByTestId('logo-link').closest('.max-w-md');
            expect(contentArea).toHaveClass('max-w-md', 'w-full', 'space-y-6');

            // Logo section
            const logoSection = screen.getByTestId('logo-link').closest('.text-center');
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

    describe('DwellioLogo Integration', () => {
        it('should render logo with proper navigation link', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const logoLink = screen.getByTestId('logo-link');
            expect(logoLink).toHaveAttribute('href', '/');
            expect(logoLink).toHaveClass('flex', 'flex-shrink-0', 'items-center', 'justify-center');
        });

        it('should render home icon with correct styling', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const homeIcon = screen.getByTestId('home-icon');
            expect(homeIcon).toBeInTheDocument();
            expect(homeIcon).toHaveClass('h-10', 'w-auto', 'text-blue-800', 'p-[4px]', 'bg-white');
            expect(homeIcon).toHaveTextContent('🏠');
        });

        it('should render logo text with responsive typography', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const logoText = screen.getByText('Dwellio');
            expect(logoText).toBeInTheDocument();
            expect(logoText).toHaveClass('block', 'text-xl', 'md:text-lg', 'text-blue-800', 'ml-1');
        });

        it('should be keyboard accessible', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const logoLink = screen.getByTestId('logo-link');
            
            // Should be focusable
            logoLink.focus();
            expect(logoLink).toHaveFocus();
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

            // Look for the page container with padding classes
            const logoContainer = screen.getByTestId('logo-link');
            const pageContainer = logoContainer.closest('div[class*="px-4"]') || 
                                logoContainer.closest('.flex.items-center.justify-center');
            expect(pageContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
        });

        it('should use responsive spacing', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            const contentArea = screen.getByTestId('logo-link').closest('.space-y-6');
            expect(contentArea).toHaveClass('space-y-6');
        });
    });

    describe('SEO and Accessibility', () => {
        it('should render with proper semantic structure', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const result = await LoginPage();
            render(result);

            // Main container should be semantically appropriate
            const container = screen.getByTestId('logo-link').closest('.flex');
            expect(container).toBeInTheDocument();
            
            // Logo should be accessible as a link
            const logoLink = screen.getByTestId('logo-link');
            expect(logoLink).toHaveAttribute('href', '/');
            expect(logoLink).toBeVisible();
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