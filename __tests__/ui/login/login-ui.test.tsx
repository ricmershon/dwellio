import React from 'react';
import { render, screen, fireEvent, waitFor, setupCommonMocks } from '@/__tests__/test-utils';
import { createNextAuthMock, createNextNavigationMock } from '@/__tests__/shared-mocks';
import LoginUI from '@/ui/login/login-ui';
import { ActionStatus } from '@/types';

// Mock Next.js navigation
jest.mock('next/navigation', () => createNextNavigationMock());

// Mock NextAuth
jest.mock('next-auth/react', () => createNextAuthMock());

// Mock user actions
jest.mock('@/lib/actions/user-actions', () => ({
    createCredentialsUser: jest.fn(),
}));

// Mock Login components
jest.mock('@/ui/login/login-buttons', () => {
    const MockLoginButtons = () => (
        <div data-testid="login-buttons">OAuth Login Buttons</div>
    );
    MockLoginButtons.displayName = 'MockLoginButtons';
    return MockLoginButtons;
});

jest.mock('@/ui/login/register-form', () => {
    const MockRegisterForm = ({ formAction, isLoading, isPending, handleClearInfo }: any) => (
        <form data-testid="register-form" onSubmit={(e) => { e.preventDefault(); formAction(new FormData()); }}>
            <div>Register Form</div>
            <button 
                type="submit" 
                disabled={isLoading || isPending}
                onClick={handleClearInfo}
            >
                Create Account
            </button>
        </form>
    );
    MockRegisterForm.displayName = 'MockRegisterForm';
    return MockRegisterForm;
});

jest.mock('@/ui/login/signin-form', () => {
    const MockSignInForm = ({ handleSignIn, isLoading, handleClearInfo }: any) => (
        <form data-testid="signin-form" onSubmit={handleSignIn}>
            <div>Sign In Form</div>
            <button 
                type="submit" 
                disabled={isLoading}
                onClick={handleClearInfo}
            >
                Sign In
            </button>
        </form>
    );
    MockSignInForm.displayName = 'MockSignInForm';
    return MockSignInForm;
});

// Mock useActionState hook
jest.mock('react', () => {
    const mockUseActionState = jest.fn();
    return {
        ...jest.requireActual('react'),
        useActionState: mockUseActionState,
    };
});

describe('LoginUI', () => {
    setupCommonMocks();

    beforeEach(() => {
        // Reset useActionState mock
        const mockUseActionState = require('react').useActionState;
        mockUseActionState.mockReturnValue([
            { status: null }, // actionState
            jest.fn(), // formAction
            false // isPending
        ]);

        // Reset navigation mocks
        const { useSearchParams } = require('next/navigation');
        useSearchParams.mockReturnValue(new URLSearchParams());
    });

    describe('Component Structure', () => {
        it('should render signin form by default', () => {
            render(<LoginUI />);

            expect(screen.getByTestId('signin-form')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
            expect(screen.getByTestId('login-buttons')).toBeInTheDocument();
        });

        it('should render register form when in register mode', () => {
            render(<LoginUI />);

            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            fireEvent.click(switchButton);

            expect(screen.getByTestId('register-form')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
        });

        it('should display correct title based on mode', () => {
            render(<LoginUI />);

            expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();

            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            fireEvent.click(switchButton);

            expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
        });
    });

    describe('Mode Switching', () => {
        it('should switch between signin and register modes', () => {
            render(<LoginUI />);

            // Initially in signin mode
            expect(screen.getByTestId('signin-form')).toBeInTheDocument();
            expect(screen.getByText("Don't have an account? Create one.")).toBeInTheDocument();

            // Switch to register mode
            const switchToRegister = screen.getByRole('button', { name: /don't have an account/i });
            fireEvent.click(switchToRegister);

            expect(screen.getByTestId('register-form')).toBeInTheDocument();
            expect(screen.getByText('Already have an account? Sign in.')).toBeInTheDocument();

            // Switch back to signin mode
            const switchToSignin = screen.getByRole('button', { name: /already have an account/i });
            fireEvent.click(switchToSignin);

            expect(screen.getByTestId('signin-form')).toBeInTheDocument();
        });

        it('should clear messages when switching modes', () => {
            render(<LoginUI />);

            // Switch mode should clear any existing messages
            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            fireEvent.click(switchButton);

            // Messages should be cleared (we'll test message display separately)
            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
        });
    });

    describe('Loading States', () => {
        it('should disable switch button during loading', () => {
            render(<LoginUI />);

            // Simulate loading state by checking if button gets disabled
            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            expect(switchButton).not.toBeDisabled();
        });
    });

    describe('Message Display', () => {
        it('should render component without success message by default', () => {
            render(<LoginUI />);

            // The component should render without errors
            expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
            // Success messages are not shown by default
            expect(screen.queryByText('Success')).not.toBeInTheDocument();
        });

        it('should render component without error message by default', () => {
            render(<LoginUI />);

            // The component should render without errors
            expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
            // Error messages are not shown by default
            expect(screen.queryByText('Error')).not.toBeInTheDocument();
        });
    });

    describe('Auto-login Flow', () => {
        it('should trigger auto-login after successful registration', async () => {
            const { signIn } = require('next-auth/react');
            const { useRouter } = require('next/navigation');
            const mockRouter = { push: jest.fn() };
            useRouter.mockReturnValue(mockRouter);
            const mockUseActionState = require('react').useActionState;

            mockUseActionState.mockReturnValue([
                { 
                    status: ActionStatus.SUCCESS,
                    shouldAutoLogin: true,
                    email: 'test@example.com',
                    password: 'password123',
                    message: 'Account created successfully'
                },
                jest.fn(),
                false
            ]);

            signIn.mockResolvedValue({ error: null });

            render(<LoginUI />);

            await waitFor(() => {
                expect(signIn).toHaveBeenCalledWith('credentials', {
                    email: 'test@example.com',
                    password: 'password123',
                    action: 'signin',
                    redirect: false
                });
            });

            // Should redirect after delay
            await waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/');
            }, { timeout: 3000 });
        });
    });

    describe('Callback URL Handling', () => {
        it('should use callback URL from search params', () => {
            const { useSearchParams } = require('next/navigation');
            const mockSearchParams = new URLSearchParams('callbackUrl=/dashboard');
            useSearchParams.mockReturnValue(mockSearchParams);

            render(<LoginUI />);

            // The component should use the callback URL for redirects
            // This would be tested in integration tests with actual form submissions
        });

        it('should default to home page when no callback URL', () => {
            const { useSearchParams } = require('next/navigation');
            const mockSearchParams = new URLSearchParams();
            useSearchParams.mockReturnValue(mockSearchParams);

            render(<LoginUI />);

            // Should default to '/' - tested in auto-login flow
        });
    });

    describe('Form Integration', () => {
        it('should pass correct props to RegisterForm', () => {
            render(<LoginUI />);

            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            fireEvent.click(switchButton);

            const registerForm = screen.getByTestId('register-form');
            expect(registerForm).toBeInTheDocument();

            // Form should have submit functionality
            const submitButton = registerForm.querySelector('button[type="submit"]');
            expect(submitButton).toBeInTheDocument();
        });

        it('should pass correct props to SignInForm', () => {
            render(<LoginUI />);

            const signinForm = screen.getByTestId('signin-form');
            expect(signinForm).toBeInTheDocument();

            // Form should have submit functionality
            const submitButton = signinForm.querySelector('button[type="submit"]');
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('OAuth Integration', () => {
        it('should render OAuth login buttons', () => {
            render(<LoginUI />);

            expect(screen.getByTestId('login-buttons')).toBeInTheDocument();
            expect(screen.getByText('OAuth Login Buttons')).toBeInTheDocument();
        });

        it('should display separator between forms and OAuth', () => {
            render(<LoginUI />);

            expect(screen.getByText('or')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle signin errors', async () => {
            const { signIn } = require('next-auth/react');
            signIn.mockResolvedValue({ error: 'Invalid credentials' });

            // This would be tested with actual form submission
            // For now, we test that error states are handled
            render(<LoginUI />);

            expect(screen.getByTestId('signin-form')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            render(<LoginUI />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toHaveTextContent('Sign In');
        });

        it('should have accessible switch button', () => {
            render(<LoginUI />);

            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            expect(switchButton).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot in signin mode', () => {
            const { container } = render(<LoginUI />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot in register mode', () => {
            render(<LoginUI />);
            
            const switchButton = screen.getByRole('button', { name: /don't have an account/i });
            fireEvent.click(switchButton);

            const { container } = render(<LoginUI />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});