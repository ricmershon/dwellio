// Mock Next.js navigation
jest.mock('next/navigation', () => {
	const mockPush = jest.fn();
	const mockReplace = jest.fn();
	const mockBack = jest.fn();
	const mockForward = jest.fn();
	const mockRefresh = jest.fn();
	const mockPrefetch = jest.fn();
	const mockSearchParams = new URLSearchParams();

	return {
		usePathname: jest.fn(() => '/'),
		useSearchParams: jest.fn(() => mockSearchParams),
		useRouter: jest.fn(() => ({
			push: mockPush,
			replace: mockReplace,
			back: mockBack,
			forward: mockForward,
			refresh: mockRefresh,
			prefetch: mockPrefetch,
		})),
		useParams: jest.fn(() => ({})),
		// Export mocks for testing
		mockPush,
		mockReplace,
		mockBack,
		mockForward,
		mockRefresh,
		mockPrefetch,
		mockSearchParams,
	};
});

// Mock NextAuth
jest.mock('next-auth/react', () => ({
	signIn: jest.fn(),
}));

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { signIn, ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers/index';
import { useSearchParams } from 'next/navigation';

import LoginButtons from '@/ui/login/login-buttons';
import { useAuthProviders } from '@/hooks/use-auth-providers';
import { render, createMockSearchParams } from '@/__tests__/test-utils';

// Mock custom hook
jest.mock('@/hooks/use-auth-providers', () => ({
	useAuthProviders: jest.fn(),
}));

describe('LoginButtons', () => {
	const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
	const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
	const mockUseAuthProviders = useAuthProviders as jest.MockedFunction<typeof useAuthProviders>;

	const mockSearchParams = createMockSearchParams();

	const mockProviders: Partial<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>> = {
		google: {
			id: 'google',
			name: 'Google',
			type: 'oauth',
			signinUrl: 'http://localhost:3000/api/auth/signin/google',
			callbackUrl: 'http://localhost:3000/api/auth/callback/google',
		} as ClientSafeProvider,
		github: {
			id: 'github',
			name: 'GitHub',
			type: 'oauth',
			signinUrl: 'http://localhost:3000/api/auth/signin/github',
			callbackUrl: 'http://localhost:3000/api/auth/callback/github',
		} as ClientSafeProvider,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseSearchParams.mockReturnValue(mockSearchParams);
		(mockSearchParams.get as jest.Mock).mockReturnValue(null); // Default: no returnTo param
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockUseAuthProviders.mockReturnValue(mockProviders as any);
	});

	describe('Rendering', () => {
		it('should render login buttons for all available providers', () => {
			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			expect(buttons).toHaveLength(2);
			expect(screen.getAllByText('Login')).toHaveLength(2);
		});

		it('should render nothing when providers are not loaded', () => {
			mockUseAuthProviders.mockReturnValue(null);
			
			const { container } = render(<LoginButtons />);
			expect(container.firstChild).toBeNull();
		});

		it('should render custom text when provided', () => {
			render(<LoginButtons text="Sign In" />);

			expect(screen.getAllByText('Sign In')).toHaveLength(2);
		});

		it('should apply custom className when provided', () => {
			render(<LoginButtons buttonClassName="custom-btn" />);

			const buttons = screen.getAllByRole('button');
			buttons.forEach(button => {
				expect(button).toHaveClass('custom-btn');
			});
		});

		it('should render custom icon when provided', () => {
			const customIcon = <span data-testid="custom-icon">🔐</span>;
			render(<LoginButtons icon={customIcon} />);

			expect(screen.getAllByTestId('custom-icon')).toHaveLength(2);
		});
	});

	describe('User Interactions', () => {
		it('should call signIn with Google provider when Google button is clicked', () => {
			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[0]); // First button (Google)

			expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
		});

		it('should call signIn with GitHub provider when GitHub button is clicked', () => {
			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[1]); // Second button (GitHub)

			expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/' });
		});

		it('should use returnTo parameter from URL when present', () => {
			(mockSearchParams.get as jest.Mock).mockReturnValue('/profile');
			
			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[0]);

			expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/profile' });
		});

		it('should default to "/" when no returnTo parameter', () => {
			(mockSearchParams.get as jest.Mock).mockReturnValue(null);
			
			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[0]);

			expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
		});
	});

	describe('URL Parameters', () => {
		it('should check for returnTo search parameter', () => {
			render(<LoginButtons />);

			expect(mockSearchParams.get).toHaveBeenCalledWith('returnTo');
		});

		it('should handle empty returnTo parameter', () => {
			(mockSearchParams.get as jest.Mock).mockReturnValue('');
			
			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[0]);

			expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
		});
	});

	describe('Provider Variations', () => {
		it('should handle single provider', () => {
			const singleProvider = {
				google: mockProviders.google,
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockUseAuthProviders.mockReturnValue(singleProvider as any);

			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			expect(buttons).toHaveLength(1);
		});

		it('should handle multiple providers', () => {
			const extendedProviders = {
				...mockProviders,
				discord: {
					id: 'discord',
					name: 'Discord',
					type: 'oauth',
					signinUrl: 'http://localhost:3000/api/auth/signin/discord',
					callbackUrl: 'http://localhost:3000/api/auth/callback/discord',
				} as ClientSafeProvider,
			};
			
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockUseAuthProviders.mockReturnValue(extendedProviders as any);

			render(<LoginButtons />);

			const buttons = screen.getAllByRole('button');
			expect(buttons).toHaveLength(3);
		});
	});

	describe('Snapshots', () => {
		it('should match snapshot in different states', () => {
			// Default state
			const { container } = render(<LoginButtons />);
			expect(container.firstChild).toMatchSnapshot('default state');
			
			// Null providers state
			mockUseAuthProviders.mockReturnValue(null);
			const { container: nullContainer } = render(<LoginButtons />);
			expect(nullContainer.firstChild).toMatchSnapshot('null providers');
		});
	});

});