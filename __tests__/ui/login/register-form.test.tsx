import React from 'react';
import { render, screen, fireEvent, setupCommonMocks } from '@/__tests__/test-utils';
import RegisterForm from '@/ui/login/register-form';

// Mock the Input component
jest.mock('@/ui/shared/input', () => {
    const MockInput = ({ id, name, type, label, placeholder, disabled, onClick, required }: any) => (
        <div data-testid={`input-${id}`}>
            <label htmlFor={id} className="mb-1 block text-sm text-gray-700">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                onClick={onClick}
                required={required}
                data-testid={`input-field-${id}`}
            />
        </div>
    );
    MockInput.displayName = 'MockInput';
    return MockInput;
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

            expect(screen.getByTestId('input-username')).toBeInTheDocument();
            expect(screen.getByTestId('input-email')).toBeInTheDocument();
            expect(screen.getByTestId('input-password')).toBeInTheDocument();

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

            const usernameField = screen.getByTestId('input-field-username');
            const emailField = screen.getByTestId('input-field-email');
            const passwordField = screen.getByTestId('input-field-password');

            fireEvent.click(usernameField);
            fireEvent.click(emailField);
            fireEvent.click(passwordField);

            expect(mockHandleClearInfo).toHaveBeenCalledTimes(3);
        });
    });

    describe('Loading States', () => {
        it('should disable fields and button when isLoading is true', () => {
            render(<RegisterForm {...defaultProps} isLoading={true} />);

            const usernameField = screen.getByTestId('input-field-username');
            const emailField = screen.getByTestId('input-field-email');
            const passwordField = screen.getByTestId('input-field-password');
            const submitButton = screen.getByRole('button');

            expect(usernameField).toBeDisabled();
            expect(emailField).toBeDisabled();
            expect(passwordField).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });

        it('should disable fields and button when isPending is true', () => {
            render(<RegisterForm {...defaultProps} isPending={true} />);

            const usernameField = screen.getByTestId('input-field-username');
            const emailField = screen.getByTestId('input-field-email');
            const passwordField = screen.getByTestId('input-field-password');
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

            const usernameField = screen.getByTestId('input-field-username');
            
            expect(usernameField).toHaveAttribute('type', 'text');
            expect(usernameField).toHaveAttribute('name', 'username');
            expect(usernameField).toHaveAttribute('placeholder', 'Enter a username');
            expect(usernameField).not.toHaveAttribute('required');
        });

        it('should configure email field correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            const emailField = screen.getByTestId('input-field-email');
            
            expect(emailField).toHaveAttribute('type', 'email');
            expect(emailField).toHaveAttribute('name', 'email');
            expect(emailField).toHaveAttribute('placeholder', 'your@email.com');
            expect(emailField).toHaveAttribute('required');
        });

        it('should configure password field correctly', () => {
            render(<RegisterForm {...defaultProps} />);

            const passwordField = screen.getByTestId('input-field-password');
            
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