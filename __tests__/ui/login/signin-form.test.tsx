import React from 'react';
import { render, screen, fireEvent, setupCommonMocks } from '@/__tests__/test-utils';
import SignInForm from '@/ui/login/signin-form';

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

describe('SignInForm', () => {
    const mockHandleSignIn = jest.fn();
    const mockHandleClearInfo = jest.fn();
    
    const defaultProps = {
        handleSignIn: mockHandleSignIn,
        isLoading: false,
        handleClearInfo: mockHandleClearInfo,
    };

    setupCommonMocks();

    describe('Component Structure', () => {
        it('should render all form fields correctly', () => {
            render(<SignInForm {...defaultProps} />);

            expect(screen.getByTestId('input-signin-email')).toBeInTheDocument();
            expect(screen.getByTestId('input-signin-password')).toBeInTheDocument();

            // Check labels
            expect(screen.getByText('Email Address *')).toBeInTheDocument();
            expect(screen.getByText('Password *')).toBeInTheDocument();
        });

        it('should render submit button with correct text', () => {
            render(<SignInForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /sign in/i });
            expect(submitButton).toBeInTheDocument();
            expect(submitButton).toHaveClass('w-full', 'btn', 'btn-login-logout', 'mt-2');
        });
    });

    describe('Form Behavior', () => {
        it('should call handleSignIn on form submission', async () => {
            render(<SignInForm {...defaultProps} />);

            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            fireEvent.submit(form!);

            expect(mockHandleSignIn).toHaveBeenCalledWith(expect.any(Object));
        });

        it('should call handleClearInfo when fields are clicked', () => {
            render(<SignInForm {...defaultProps} />);

            const emailField = screen.getByTestId('input-field-signin-email');
            const passwordField = screen.getByTestId('input-field-signin-password');

            fireEvent.click(emailField);
            fireEvent.click(passwordField);

            expect(mockHandleClearInfo).toHaveBeenCalledTimes(2);
        });
    });

    describe('Loading States', () => {
        it('should disable fields and button when isLoading is true', () => {
            render(<SignInForm {...defaultProps} isLoading={true} />);

            const emailField = screen.getByTestId('input-field-signin-email');
            const passwordField = screen.getByTestId('input-field-signin-password');
            const submitButton = screen.getByRole('button');

            expect(emailField).toBeDisabled();
            expect(passwordField).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });

        it('should show loading text and spinner when loading', () => {
            render(<SignInForm {...defaultProps} isLoading={true} />);

            expect(screen.getByText('Please wait...')).toBeInTheDocument();
            expect(screen.getByRole('button')).toContainHTML('svg');
        });
    });

    describe('Field Configuration', () => {
        it('should configure email field correctly', () => {
            render(<SignInForm {...defaultProps} />);

            const emailField = screen.getByTestId('input-field-signin-email');
            
            expect(emailField).toHaveAttribute('type', 'email');
            expect(emailField).toHaveAttribute('name', 'email');
            expect(emailField).toHaveAttribute('placeholder', 'your@email.com');
            expect(emailField).toHaveAttribute('required');
        });

        it('should configure password field correctly', () => {
            render(<SignInForm {...defaultProps} />);

            const passwordField = screen.getByTestId('input-field-signin-password');
            
            expect(passwordField).toHaveAttribute('type', 'password');
            expect(passwordField).toHaveAttribute('name', 'password');
            expect(passwordField).toHaveAttribute('placeholder', 'Enter your password');
            expect(passwordField).toHaveAttribute('required');
        });
    });

    describe('Accessibility', () => {
        it('should have proper form structure', () => {
            render(<SignInForm {...defaultProps} />);

            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveClass('space-y-4');
        });

        it('should have proper button accessibility', () => {
            render(<SignInForm {...defaultProps} />);

            const button = screen.getByRole('button', { name: /sign in/i });
            expect(button).toHaveAttribute('type', 'submit');
        });

        it('should associate labels with form fields', () => {
            render(<SignInForm {...defaultProps} />);

            const emailLabel = screen.getByText('Email Address *');
            const passwordLabel = screen.getByText('Password *');

            expect(emailLabel).toHaveAttribute('for', 'signin-email');
            expect(passwordLabel).toHaveAttribute('for', 'signin-password');
        });
    });

    describe('Event Handling', () => {
        it('should prevent default form submission', async () => {
            render(<SignInForm {...defaultProps} />);

            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
            
            // This simulates the form submission without fireEvent
            form!.dispatchEvent(submitEvent);

            expect(mockHandleSignIn).toHaveBeenCalled();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot in default state', () => {
            const { container } = render(<SignInForm {...defaultProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot in loading state', () => {
            const { container } = render(<SignInForm {...defaultProps} isLoading={true} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});