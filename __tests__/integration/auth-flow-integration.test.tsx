import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthProviders } from '@/hooks/use-auth-providers';

import OAuthLoginButtons from '@/ui/login/oauth-login-buttons';
import CheckAuthStatus from '@/ui/auth/check-auth-status';
import { createMockSession, createMockUser } from '@/__tests__/test-utils';

jest.mock('next-auth/react')
jest.mock('next/navigation')
jest.mock('@/hooks/use-auth-providers')

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>

describe('Authentication Flow Integration', () => {
    const mockPush = jest.fn()
    const mockCallbackUrl = '/dashboard'

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseRouter.mockReturnValue({
            push: mockPush,
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn()
        } as any)
    })

    describe('OAuth Login Flow', () => {
        beforeEach(() => {
            (useAuthProviders as jest.Mock).mockReturnValue({
                google: {
                    id: 'google',
                    name: 'Google',
                    type: 'oauth'
                },
                credentials: {
                    id: 'credentials',
                    name: 'Credentials',
                    type: 'credentials'
                }
            })
        })

        it('should render OAuth login buttons and handle Google sign-in', async () => {
            const user = userEvent.setup()

            render(<OAuthLoginButtons callbackUrl={mockCallbackUrl} />)

            const googleButton = screen.getByRole('button', { name: /continue with google/i })
            expect(googleButton).toBeInTheDocument()

            await user.click(googleButton)

            expect(mockSignIn).toHaveBeenCalledWith('google', {
                callbackUrl: mockCallbackUrl
            })
        })

        it('should not render login buttons when providers are not available', () => {
            (useAuthProviders as jest.Mock).mockReturnValue(null)

            render(<OAuthLoginButtons callbackUrl={mockCallbackUrl} />)

            expect(screen.queryByRole('button')).toBeFalsy()
        })
    })

    describe('Authentication Status Check', () => {
        it('should show auth required alert when authRequired param is true', () => {
            const mockSearchParams = new URLSearchParams('authRequired=true&returnTo=profile')
            mockUseSearchParams.mockReturnValue(mockSearchParams as any)

            render(<CheckAuthStatus />)

            expect(screen.getByText(/please login to access the profile page/i)).toBeInTheDocument()
        })

        it('should not show alert when user is logged out', () => {
            const mockSearchParams = new URLSearchParams('authRequired=true&loggedOut=true')
            mockUseSearchParams.mockReturnValue(mockSearchParams as any)

            render(<CheckAuthStatus />)

            expect(screen.queryByText(/please login/i)).toBeFalsy()
        })

        it('should not show alert when authRequired is false', () => {
            const mockSearchParams = new URLSearchParams('authRequired=false')
            mockUseSearchParams.mockReturnValue(mockSearchParams as any)

            render(<CheckAuthStatus />)

            expect(screen.queryByText(/please login/i)).toBeFalsy()
        })

        it('should handle missing returnTo parameter gracefully', () => {
            const mockSearchParams = new URLSearchParams('authRequired=true')
            mockUseSearchParams.mockReturnValue(mockSearchParams as any)

            render(<CheckAuthStatus />)

            expect(screen.getByText(/please login to access the null page/i)).toBeInTheDocument()
        })
    })

    describe('Full Authentication Journey', () => {
        it('should guide user through complete auth flow from protected page access', async () => {
            const user = userEvent.setup()

            // Step 1: User tries to access protected page and sees auth prompt
            const authRequiredParams = new URLSearchParams('authRequired=true&returnTo=messages')
            mockUseSearchParams.mockReturnValue(authRequiredParams as any)

            const { rerender } = render(<CheckAuthStatus />)
            const loginMessage = screen.getByText(/please login to access the messages page/i);
            expect(loginMessage).toBeInTheDocument();

            // Step 2: User sees OAuth login options
            (useAuthProviders as jest.Mock).mockReturnValue({
                google: { id: 'google', name: 'Google', type: 'oauth' }
            })

            rerender(<OAuthLoginButtons callbackUrl="/messages" />)

            const googleButton = screen.getByRole('button', { name: /continue with google/i })
            expect(googleButton).toBeInTheDocument()

            // Step 3: User clicks Google sign-in
            await user.click(googleButton)
            expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/messages' })

            // Step 4: After successful auth, verify the auth prompt is no longer shown
            const noAuthParams = new URLSearchParams('')
            mockUseSearchParams.mockReturnValue(noAuthParams as any)

            rerender(<CheckAuthStatus />)
            expect(screen.queryByText(/please login/i)).toBeFalsy()
        })
    })

    describe('Test Utilities Validation', () => {
        it('should create mock session correctly', () => {
            const mockSession = createMockSession({ email: 'test@example.com' })

            expect(mockSession).toHaveProperty('user')
            expect(mockSession).toHaveProperty('expires')
            expect(mockSession.user.email).toBe('test@example.com')
        })

        it('should create mock user correctly', () => {
            const mockUser = createMockUser({ name: 'Test User' })

            expect(mockUser).toHaveProperty('id')
            expect(mockUser).toHaveProperty('email')
            expect(mockUser.name).toBe('Test User')
        })
    })
})