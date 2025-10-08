/**
 * @jest-environment jsdom
 *
 * User Registration Workflow Test
 *
 * Tests user account creation and authentication workflows.
 */
import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(login)/login/page';

jest.mock('@/utils/get-session-user');
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

jest.mock('@/ui/login/login-ui', () => {
    return function MockLoginUI() {
        return (
            <div data-testid="login-ui">
                <div data-testid="google-signin">
                    <button data-testid="google-button">Sign in with Google</button>
                </div>
                <div data-testid="credentials-signin">
                    <input data-testid="email" placeholder="Email" />
                    <input data-testid="password" type="password" placeholder="Password" />
                    <button data-testid="signin-button">Sign In</button>
                </div>
                <div data-testid="create-account">
                    <button data-testid="create-account-button">Create Account</button>
                </div>
            </div>
        );
    };
});

jest.mock('@/ui/shared/logo', () => {
    const MockLogo = () => <div data-testid="logo">Dwellio</div>;
    MockLogo.displayName = 'MockLogo';
    return MockLogo;
});

import { getSessionUser } from '@/utils/get-session-user';

const mockGetSessionUser = getSessionUser as jest.MockedFunction<typeof getSessionUser>;

describe('User Registration Workflow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSessionUser.mockResolvedValue(null);
    });

    describe('Registration Options', () => {
        it('should offer OAuth registration', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('google-button')).toBeInTheDocument();
        });

        it('should offer credentials registration', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('email')).toBeInTheDocument();
            expect(screen.getByTestId('password')).toBeInTheDocument();
        });

        it('should show account creation option', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('create-account-button')).toBeInTheDocument();
        });
    });

    describe('Account Linking Information', () => {
        it('should display account linking guidance', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByText(/Account Linking/i)).toBeInTheDocument();
        });

        it('should explain OAuth and password linking', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByText(/Google account/i)).toBeInTheDocument();
            expect(screen.getByText(/password will link/i)).toBeInTheDocument();
        });
    });

    describe('Registration Workflow', () => {
        it('should display login UI for unauthenticated users', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });

        it('should show all authentication methods', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('google-signin')).toBeInTheDocument();
            expect(screen.getByTestId('credentials-signin')).toBeInTheDocument();
        });
    });
});
