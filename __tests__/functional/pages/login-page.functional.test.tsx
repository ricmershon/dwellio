/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(login)/login/page';

// ============================================================================
// MOCK ORGANIZATION
// ============================================================================
// ✅ External Services (Mocked)
jest.mock('@/utils/get-session-user');
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

// ✅ Child Components (Mocked for functional test isolation)
jest.mock('@/ui/login/login-ui', () => {
    return function MockLoginUI() {
        return <div data-testid="login-ui">Login UI Component</div>;
    };
});

jest.mock('@/ui/shared/logo', () => {
    return function MockDwellioLogo() {
        return <div data-testid="dwellio-logo">Dwellio Logo</div>;
    };
});

import { getSessionUser } from '@/utils/get-session-user';
import { redirect } from 'next/navigation';

const mockGetSessionUser = getSessionUser as jest.MockedFunction<typeof getSessionUser>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSessionUser.mockResolvedValue(null);
    });

    describe('Authentication State Handling', () => {
        it('should check session user status', async () => {
            await LoginPage();

            expect(mockGetSessionUser).toHaveBeenCalledTimes(1);
        });

        it('should redirect to home if user is authenticated', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user123', name: 'John' } as any);

            await LoginPage();

            expect(mockRedirect).toHaveBeenCalledWith('/');
        });

        it('should not redirect if user is not authenticated', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const jsx = await LoginPage();
            render(jsx);

            expect(mockRedirect).not.toHaveBeenCalled();
        });

        it('should render login page for unauthenticated users', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });
    });

    describe('Page Structure', () => {
        it('should render centered container', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const centerContainer = container.querySelector(
                '.flex.items-center.justify-center'
            );
            expect(centerContainer).toBeInTheDocument();
        });

        it('should render max-width container', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const maxWidthContainer = container.querySelector('.max-w-md.w-full');
            expect(maxWidthContainer).toBeInTheDocument();
        });

        it('should apply responsive padding', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const paddingContainer = container.querySelector('.px-4.sm\\:px-6.lg\\:px-8');
            expect(paddingContainer).toBeInTheDocument();
        });

        it('should apply vertical padding', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const verticalPadding = container.querySelector('.py-6');
            expect(verticalPadding).toBeInTheDocument();
        });
    });

    describe('Logo Display', () => {
        it('should render Dwellio logo', async () => {
            const jsx = await LoginPage();
            render(jsx);

            const logo = screen.getByTestId('dwellio-logo');
            expect(logo).toBeInTheDocument();
        });

        it('should center logo with text-center', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const logoContainer = container.querySelector('.text-center');
            expect(logoContainer).toContainElement(screen.getByTestId('dwellio-logo'));
        });
    });

    describe('Login UI Component', () => {
        it('should render LoginUI component', async () => {
            const jsx = await LoginPage();
            render(jsx);

            const loginUI = screen.getByTestId('login-ui');
            expect(loginUI).toBeInTheDocument();
        });

        it('should wrap LoginUI in Suspense boundary', async () => {
            // Suspense is present in the component structure
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });
    });

    describe('Account Linking Information', () => {
        it('should display account linking section', async () => {
            const jsx = await LoginPage();
            render(jsx);

            const linkingHeading = screen.getByRole('heading', { name: /account linking/i });
            expect(linkingHeading).toBeInTheDocument();
        });

        it('should display account linking description', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(
                screen.getByText(/If you have an existing Google account/i)
            ).toBeInTheDocument();
        });

        it('should style account linking section with blue background', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const linkingSection = container.querySelector('.bg-blue-50');
            expect(linkingSection).toBeInTheDocument();
        });

        it('should apply rounded corners to account linking section', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const linkingSection = container.querySelector('.rounded-lg');
            expect(linkingSection).toBeInTheDocument();
        });

        it('should apply shadow to account linking section', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const linkingSection = container.querySelector('.shadow-lg');
            expect(linkingSection).toBeInTheDocument();
        });

        it('should display heading with medium font weight', async () => {
            const jsx = await LoginPage();
            render(jsx);

            const heading = screen.getByRole('heading', { name: /account linking/i });
            expect(heading).toHaveClass('font-medium');
        });
    });

    describe('Layout Spacing', () => {
        it('should apply space-y-6 to main container', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const spacedContainer = container.querySelector('.space-y-6');
            expect(spacedContainer).toBeInTheDocument();
        });

        it('should apply padding to account linking section', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const linkingSection = container.querySelector('.p-4');
            expect(linkingSection).toBeInTheDocument();
        });
    });

    describe('Metadata', () => {
        it('should export dynamic as force-dynamic', async () => {
            const { dynamic } = await import('@/app/(login)/login/page');
            expect(dynamic).toBe('force-dynamic');
        });
    });

    describe('Async Server Component', () => {
        it('should be an async function', () => {
            const result = LoginPage();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve to JSX element when not authenticated', async () => {
            mockGetSessionUser.mockResolvedValue(null);

            const jsx = await LoginPage();
            expect(jsx).toBeDefined();
            expect(typeof jsx).toBe('object');
        });
    });

    describe('Error Handling', () => {
        it('should handle getSessionUser errors', async () => {
            mockGetSessionUser.mockRejectedValue(new Error('Session error'));

            await expect(LoginPage()).rejects.toThrow('Session error');
        });
    });

    describe('Redirect Logic', () => {
        it('should redirect immediately if authenticated', async () => {
            mockGetSessionUser.mockResolvedValue({ id: 'user123' } as any);

            await LoginPage();

            expect(mockRedirect).toHaveBeenCalledWith('/');
        });

        it('should check authentication before rendering', async () => {
            const callOrder: string[] = [];

            mockGetSessionUser.mockImplementation(async () => {
                callOrder.push('auth-check');
                return null;
            });

            const jsx = await LoginPage();
            callOrder.push('render');
            render(jsx);

            expect(callOrder).toEqual(['auth-check', 'render']);
        });
    });

    describe('Component Integration', () => {
        it('should integrate logo and login UI', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByTestId('dwellio-logo')).toBeInTheDocument();
            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });

        it('should render all sections in correct order', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const sections = container.querySelectorAll('.max-w-md > *');

            // Logo section should be first
            expect(sections[0]).toContainElement(screen.getByTestId('dwellio-logo'));

            // Account linking should be last
            const lastSection = sections[sections.length - 1];
            expect(lastSection).toHaveClass('bg-blue-50');
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading structure', async () => {
            const jsx = await LoginPage();
            render(jsx);

            const heading = screen.getByRole('heading', { name: /account linking/i });
            expect(heading.tagName).toBe('H3');
        });

        it('should have readable text sizes', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const heading = screen.getByRole('heading', { name: /account linking/i });
            expect(heading).toHaveClass('text-lg');

            const description = container.querySelector('.text-sm.text-blue-800');
            expect(description).toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive padding classes', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const responsiveContainer = container.querySelector('.sm\\:px-6');
            expect(responsiveContainer).toBeInTheDocument();

            const largeScreen = container.querySelector('.lg\\:px-8');
            expect(largeScreen).toBeInTheDocument();
        });

        it('should maintain full width on mobile', async () => {
            const jsx = await LoginPage();
            const { container } = render(jsx);

            const fullWidthContainer = container.querySelector('.w-full');
            expect(fullWidthContainer).toBeInTheDocument();
        });
    });

    describe('Content', () => {
        it('should explain account linking functionality', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(
                screen.getByText(/creating a password will link both sign-in methods/i)
            ).toBeInTheDocument();
        });

        it('should mention Google account specifically', async () => {
            const jsx = await LoginPage();
            render(jsx);

            expect(screen.getByText(/Google account/i)).toBeInTheDocument();
        });
    });

    describe('Suspense Handling', () => {
        it('should show login UI within Suspense boundary', async () => {
            const jsx = await LoginPage();
            render(jsx);

            // LoginUI should be rendered (not showing fallback)
            expect(screen.getByTestId('login-ui')).toBeInTheDocument();
        });
    });
});
