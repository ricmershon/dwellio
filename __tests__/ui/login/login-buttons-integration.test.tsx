import React from 'react';
import { render, screen, fireEvent, setupCommonMocks } from '@/__tests__/test-utils';
import { createNextAuthMock, createNextNavigationMock } from '@/__tests__/shared-mocks';
import LoginButtons from '@/ui/login/login-buttons';

// Mock Next.js navigation
jest.mock('next/navigation', () => createNextNavigationMock());

// Mock NextAuth
jest.mock('next-auth/react', () => createNextAuthMock());

// Mock auth providers hook
jest.mock('@/hooks/use-auth-providers', () => ({
    useAuthProviders: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, className, width, height, ...props }: any) => (
        <img src={src} alt={alt} className={className} width={width} height={height} {...props} />
    ),
}));

// Mock Google logo image for testing
jest.mock('@/assets/images/Google__G__logo.svg', () => '/test-google-logo.svg');

describe('LoginButtons Integration Tests', () => {
    setupCommonMocks();

    const mockUseAuthProviders = jest.requireMock('@/hooks/use-auth-providers').useAuthProviders;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset navigation mocks
        const { useSearchParams } = jest.requireMock('next/navigation');
        useSearchParams.mockReturnValue(new URLSearchParams());

        // Default auth providers mock
        mockUseAuthProviders.mockReturnValue({
            google: {
                id: 'google',
                name: 'Google',
                type: 'oauth',
            },
            credentials: {
                id: 'credentials',
                name: 'Credentials',
                type: 'credentials',
            }
        });

        // Suppress React warnings
        jest.spyOn(console, 'error').mockImplementation((message) => {
            if (
                typeof message === 'string' && 
                (message.includes('unique "key" prop') || 
                 message.includes('Image is missing required "src" property'))
            ) {
                return; // Suppress these warnings
            }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render Google login button when providers are available', () => {
            render(<LoginButtons />);

            // Should show the Google login button
            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            expect(googleButton).toBeInTheDocument();
        });

        it('should render Google logo in login button', () => {
            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            const logo = googleButton.querySelector('img');
            
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('alt', 'Google logo');
            expect(logo).toHaveAttribute('width', '20');
            expect(logo).toHaveAttribute('height', '20');
        });

        it('should not render buttons when no providers available', () => {
            mockUseAuthProviders.mockReturnValue(null);

            render(<LoginButtons />);

            // Should not show any OAuth buttons
            expect(screen.queryByRole('button', { name: /continue with/i })).not.toBeInTheDocument();
        });

        it('should exclude credentials provider from OAuth buttons', () => {
            render(<LoginButtons />);

            // Should only show Google, not credentials
            expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
            expect(screen.queryByText('Continue with Credentials')).not.toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('should call signIn when Google button is clicked', () => {
            const { signIn } = jest.requireMock('next-auth/react');
            
            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            fireEvent.click(googleButton);

            expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
        });

        it('should use returnTo parameter from URL as callbackUrl', () => {
            const { signIn } = jest.requireMock('next-auth/react');
            const { useSearchParams } = jest.requireMock('next/navigation');
            
            const mockSearchParams = new URLSearchParams();
            mockSearchParams.set('returnTo', '/dashboard');
            useSearchParams.mockReturnValue(mockSearchParams);

            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            fireEvent.click(googleButton);

            expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
        });

        it('should be keyboard accessible', () => {
            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            
            // Should be focusable
            googleButton.focus();
            expect(googleButton).toHaveFocus();
        });
    });

    describe('Provider Configuration', () => {
        it('should handle only credentials provider', () => {
            mockUseAuthProviders.mockReturnValue({
                credentials: {
                    id: 'credentials',
                    name: 'Credentials',
                    type: 'credentials',
                }
            });

            render(<LoginButtons />);

            // Should not show OAuth buttons when only credentials provider
            expect(screen.queryByRole('button', { name: /continue with/i })).not.toBeInTheDocument();
        });

        it('should handle provider loading state', () => {
            mockUseAuthProviders.mockReturnValue(undefined);

            render(<LoginButtons />);

            // Component should render without errors
            const container = document.body;
            expect(container).toBeInTheDocument();
        });
    });

    describe('URL Parameter Handling', () => {
        it('should default to home page when no returnTo parameter', () => {
            const { signIn } = jest.requireMock('next-auth/react');
            const { useSearchParams } = jest.requireMock('next/navigation');
            
            const mockSearchParams = new URLSearchParams();
            useSearchParams.mockReturnValue(mockSearchParams);

            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            fireEvent.click(googleButton);

            expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
        });

        it('should handle empty returnTo parameter', () => {
            const { signIn } = jest.requireMock('next-auth/react');
            const { useSearchParams } = jest.requireMock('next/navigation');
            
            const mockSearchParams = new URLSearchParams();
            mockSearchParams.set('returnTo', '');
            useSearchParams.mockReturnValue(mockSearchParams);

            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            fireEvent.click(googleButton);

            // Empty returnTo should default to '/'
            expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
        });
    });

    describe('Button Styling', () => {
        it('should apply correct CSS classes', () => {
            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            
            expect(googleButton).toHaveClass(
                'relative',
                'btn',
                'btn-login-logout',
                'flex',
                'items-center',
                'w-full',
                'content'
            );
        });

        it('should position logo correctly', () => {
            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            const logo = googleButton.querySelector('img');
            
            expect(logo).toHaveClass('absolute', 'left-[12px]');
        });

        it('should center button text', () => {
            render(<LoginButtons />);

            const googleButton = screen.getByRole('button', { name: /continue with google/i });
            const textDiv = googleButton.querySelector('div');
            
            expect(textDiv).toHaveClass('mx-auto');
            expect(textDiv).toHaveTextContent('Continue with Google');
        });
    });

    describe('useAuthProviders Hook Integration', () => {
        it('should handle providers loading sequence', async () => {
            // Start with null providers (loading state)
            mockUseAuthProviders.mockReturnValue(null);
            const { rerender } = render(<LoginButtons />);

            // Should not show buttons during loading
            expect(screen.queryByRole('button', { name: /continue with/i })).not.toBeInTheDocument();

            // Simulate providers loading
            mockUseAuthProviders.mockReturnValue({
                google: {
                    id: 'google',
                    name: 'Google',
                    type: 'oauth',
                },
            });

            rerender(<LoginButtons />);

            // Should show button after loading
            expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
        });

        it('should handle provider fetch errors gracefully', () => {
            // Simulate getProviders() failing
            mockUseAuthProviders.mockReturnValue(null);

            render(<LoginButtons />);

            // Should not crash and should handle null gracefully
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });

        it('should handle multiple OAuth providers', () => {
            mockUseAuthProviders.mockReturnValue({
                google: {
                    id: 'google',
                    name: 'Google',
                    type: 'oauth',
                },
                github: {
                    id: 'github', 
                    name: 'GitHub',
                    type: 'oauth',
                },
                credentials: {
                    id: 'credentials',
                    name: 'Credentials',
                    type: 'credentials',
                }
            });

            render(<LoginButtons />);

            // Should show OAuth buttons but not credentials
            expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
            // GitHub provider might not have a logo configured, so just check for multiple buttons
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(2); // Google + GitHub
            expect(screen.queryByRole('button', { name: /continue with credentials/i })).not.toBeInTheDocument();
        });

        it('should handle provider state changes during component lifecycle', () => {
            // Start with empty providers
            mockUseAuthProviders.mockReturnValue({});
            const { rerender } = render(<LoginButtons />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();

            // Add a provider
            mockUseAuthProviders.mockReturnValue({
                google: {
                    id: 'google',
                    name: 'Google',
                    type: 'oauth',
                }
            });

            rerender(<LoginButtons />);
            expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();

            // Remove provider
            mockUseAuthProviders.mockReturnValue({});
            rerender(<LoginButtons />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });

        it('should filter out non-OAuth provider types', () => {
            mockUseAuthProviders.mockReturnValue({
                google: {
                    id: 'google',
                    name: 'Google',
                    type: 'oauth',
                },
                email: {
                    id: 'email',
                    name: 'Email',
                    type: 'email',
                },
                credentials: {
                    id: 'credentials',
                    name: 'Credentials', 
                    type: 'credentials',
                }
            });

            render(<LoginButtons />);

            // Should only show OAuth providers
            expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /continue with email/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /continue with credentials/i })).not.toBeInTheDocument();
        });
    });
});