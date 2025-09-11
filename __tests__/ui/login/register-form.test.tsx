import React from 'react';
import { render, screen, fireEvent, setupCommonMocks } from '@/__tests__/test-utils';
import RegisterForm from '@/ui/login/register-form';

// Mock FormErrors component used by Input
jest.mock('@/ui/shared/form-errors', () => {
    const MockFormErrors = ({ errors, id }: { errors: any; id: string }) => (
        <div data-testid={`form-errors-${id}`} className="text-red-600 text-sm mt-1">
            {errors && errors[id] && (
                <div>{errors[id].join(', ')}</div>
            )}
        </div>
    );
    MockFormErrors.displayName = 'MockFormErrors';
    return MockFormErrors;
});

describe('RegisterForm', () => {
    const mockFormAction = jest.fn();
    const mockHandleClearInfo = jest.fn();
    
    const defaultProps = {
        formAction: mockFormAction,
        isLoading: false,
        isPending: false,
        handleClearInfo: mockHandleClearInfo,
    };

    setupCommonMocks();

    describe('Component Structure', () => {
        it('should render all form fields correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            // Check form inputs by their ids
            expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

            // Check labels
            expect(screen.getByText('Username (optional)')).toBeInTheDocument();
            expect(screen.getByText('Email Address *')).toBeInTheDocument();
            expect(screen.getByText('Password *')).toBeInTheDocument();
        });

        it('should render password requirements', () => {
            render(<RegisterForm {...defaultProps} />);

            expect(screen.getByText('Password requirements:')).toBeInTheDocument();
            expect(screen.getByText('At least 8 characters long')).toBeInTheDocument();
            expect(screen.getByText('Contains uppercase and lowercase letters')).toBeInTheDocument();
            expect(screen.getByText('Contains at least one number')).toBeInTheDocument();
            expect(screen.getByText('Contains at least one special character (@$!%*?&)')).toBeInTheDocument();
        });

        it('should render submit button with correct text', () => {
            render(<RegisterForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /create account/i });
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toHaveClass('btn', 'btn-login-logout', 'h-10', 'w-full');
        });
    });

    describe('Form Behavior', () => {
        it('should call formAction on form submission', () => {
            render(<RegisterForm {...defaultProps} />);

            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            fireEvent.submit(form!);

            expect(mockFormAction).toHaveBeenCalled();
        });

        it('should call handleClearInfo when fields are clicked', () => {
            render(<RegisterForm {...defaultProps} />);

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const emailField = screen.getByRole('textbox', { name: /email/i });
            const passwordField = screen.getByLabelText(/password/i);

            fireEvent.click(usernameField);
            fireEvent.click(emailField);
            fireEvent.click(passwordField);

            expect(mockHandleClearInfo).toHaveBeenCalledTimes(3);
        });
    });

    describe('Input Component Integration', () => {
        it('should render Input components with correct props', () => {
            render(<RegisterForm {...defaultProps} />);

            // Username input (optional)
            const usernameInput = screen.getByRole('textbox', { name: /username/i });
            expect(usernameInput).toHaveAttribute('id', 'username');
            expect(usernameInput).toHaveAttribute('name', 'username');
            expect(usernameInput).toHaveAttribute('type', 'text');
            expect(usernameInput).not.toHaveAttribute('required');

            // Email input (required)
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            expect(emailInput).toHaveAttribute('id', 'email');
            expect(emailInput).toHaveAttribute('name', 'email');
            expect(emailInput).toHaveAttribute('type', 'email');
            expect(emailInput).toHaveAttribute('required');

            // Password input (required)
            const passwordInput = screen.getByLabelText(/password/i);
            expect(passwordInput).toHaveAttribute('id', 'password');
            expect(passwordInput).toHaveAttribute('name', 'password');
            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(passwordInput).toHaveAttribute('required');
        });

        it('should have proper Input component styling', () => {
            render(<RegisterForm {...defaultProps} />);

            const inputs = [
                screen.getByRole('textbox', { name: /username/i }),
                screen.getByRole('textbox', { name: /email/i }),
                screen.getByLabelText(/password/i)
            ];

            inputs.forEach(input => {
                expect(input).toHaveClass(
                    'w-full',
                    'rounded-md',
                    'border',
                    'border-gray-300',
                    'py-2',
                    'px-3',
                    'text-sm',
                    'placeholder:text-gray-500',
                    'bg-white'
                );
            });
        });

        it('should have proper Input component label associations', () => {
            render(<RegisterForm {...defaultProps} />);

            // Check label-input associations via aria-describedby
            const usernameInput = screen.getByRole('textbox', { name: /username/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const passwordInput = screen.getByLabelText(/password/i);

            expect(usernameInput).toHaveAttribute('aria-describedby', 'username-error');
            expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
            expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
        });

        it('should render Input component containers with proper structure', () => {
            render(<RegisterForm {...defaultProps} />);

            // Check that each input is wrapped in Input component container
            const usernameInput = screen.getByRole('textbox', { name: /username/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const passwordInput = screen.getByLabelText(/password/i);

            // Each input should be in a div container with mb-4 class (default Input spacing)
            [usernameInput, emailInput, passwordInput].forEach(input => {
                const container = input.closest('div');
                expect(container).toHaveClass('mb-4');
            });
        });

        it('should render Input components without errors by default', () => {
            render(<RegisterForm {...defaultProps} />);

            // RegisterForm doesn't accept errors prop, so Input components should not have errors
            // Check that no FormErrors components are rendered
            expect(screen.queryByTestId('form-errors-username')).not.toBeInTheDocument();
            expect(screen.queryByTestId('form-errors-email')).not.toBeInTheDocument();
            expect(screen.queryByTestId('form-errors-password')).not.toBeInTheDocument();

            // Verify Input components are rendered in clean state
            const usernameInput = screen.getByRole('textbox', { name: /username/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const passwordInput = screen.getByLabelText(/password/i);

            expect(usernameInput).toBeInTheDocument();
            expect(emailInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
        });

        it('should support Input component accessibility features', () => {
            render(<RegisterForm {...defaultProps} />);

            // Check that inputs are focusable
            const usernameInput = screen.getByRole('textbox', { name: /username/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const passwordInput = screen.getByLabelText(/password/i);

            usernameInput.focus();
            expect(usernameInput).toHaveFocus();

            emailInput.focus();
            expect(emailInput).toHaveFocus();

            passwordInput.focus();
            expect(passwordInput).toHaveFocus();
        });

        it('should handle Input component user input correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            const usernameInput = screen.getByRole('textbox', { name: /username/i });
            const emailInput = screen.getByRole('textbox', { name: /email/i });
            const passwordInput = screen.getByLabelText(/password/i);

            // Test that inputs accept user input
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });

            expect(usernameInput).toHaveValue('testuser');
            expect(emailInput).toHaveValue('test@example.com');
            expect(passwordInput).toHaveValue('SecurePass123!');
        });
    });

    describe('Loading States', () => {
        it('should disable fields and button when isLoading is true', () => {
            render(<RegisterForm {...defaultProps} isLoading={true} />);

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const emailField = screen.getByRole('textbox', { name: /email/i });
            const passwordField = screen.getByLabelText(/password/i);
            const submitButton = screen.getByRole('button');

            expect(usernameField).toBeDisabled();
            expect(emailField).toBeDisabled();
            expect(passwordField).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });

        it('should disable fields and button when isPending is true', () => {
            render(<RegisterForm {...defaultProps} isPending={true} />);

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            const emailField = screen.getByRole('textbox', { name: /email/i });
            const passwordField = screen.getByLabelText(/password/i);
            const submitButton = screen.getByRole('button');

            expect(usernameField).toBeDisabled();
            expect(emailField).toBeDisabled();
            expect(passwordField).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });

        it('should show loading text and spinner when loading', () => {
            render(<RegisterForm {...defaultProps} isLoading={true} />);

            expect(screen.getByText('Please wait...')).toBeInTheDocument();
            expect(screen.getByRole('button')).toContainHTML('svg');
        });

        it('should show loading text and spinner when pending', () => {
            render(<RegisterForm {...defaultProps} isPending={true} />);

            expect(screen.getByText('Please wait...')).toBeInTheDocument();
            expect(screen.getByRole('button')).toContainHTML('svg');
        });
    });

    describe('Field Configuration', () => {
        it('should configure username field correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            const usernameField = screen.getByRole('textbox', { name: /username/i });
            
            expect(usernameField).toHaveAttribute('type', 'text');
            expect(usernameField).toHaveAttribute('name', 'username');
            expect(usernameField).toHaveAttribute('placeholder', 'Enter a username');
            expect(usernameField).not.toHaveAttribute('required');
        });

        it('should configure email field correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            const emailField = screen.getByRole('textbox', { name: /email/i });
            
            expect(emailField).toHaveAttribute('type', 'email');
            expect(emailField).toHaveAttribute('name', 'email');
            expect(emailField).toHaveAttribute('placeholder', 'your@email.com');
            expect(emailField).toHaveAttribute('required');
        });

        it('should configure password field correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            const passwordField = screen.getByLabelText(/password/i);
            
            expect(passwordField).toHaveAttribute('type', 'password');
            expect(passwordField).toHaveAttribute('name', 'password');
            expect(passwordField).toHaveAttribute('placeholder', 'Create a strong password');
            expect(passwordField).toHaveAttribute('required');
        });
    });

    describe('Accessibility', () => {
        it('should have proper form structure', () => {
            render(<RegisterForm {...defaultProps} />);

            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveClass('space-y-4');
        });

        it('should have proper button accessibility', () => {
            render(<RegisterForm {...defaultProps} />);

            const button = screen.getByRole('button', { name: /create account/i });
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should associate labels with form fields', () => {
            render(<RegisterForm {...defaultProps} />);

            const usernameLabel = screen.getByText('Username (optional)');
            const emailLabel = screen.getByText('Email Address *');
            const passwordLabel = screen.getByText('Password *');

            expect(usernameLabel).toHaveAttribute('for', 'username');
            expect(emailLabel).toHaveAttribute('for', 'email');
            expect(passwordLabel).toHaveAttribute('for', 'password');
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot in default state', () => {
            const { container } = render(<RegisterForm {...defaultProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot in loading state', () => {
            const { container } = render(<RegisterForm {...defaultProps} isLoading={true} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot in pending state', () => {
            const { container } = render(<RegisterForm {...defaultProps} isPending={true} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});