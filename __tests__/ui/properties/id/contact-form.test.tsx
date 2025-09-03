import React from 'react';
import { render, screen, fireEvent, createReactToastifyMock } from '@/__tests__/test-utils';
import PropertyContactForm from '@/ui/properties/id/contact-form';
import { PropertyDocument } from '@/models';
import { ActionState, ActionStatus } from '@/types';

// Mock React hooks
const mockUseActionState = jest.fn();
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useActionState: (...args: any[]) => mockUseActionState(...args),
    useEffect: jest.fn((fn) => {
        // Call the effect immediately for testing
        fn();
    }),
}));

// Mock server action
jest.mock('@/lib/actions/message-actions', () => ({
    createMessage: jest.fn(),
}));

// Use unified react-toastify mock
jest.mock('react-toastify', () => createReactToastifyMock());

// Mock icons
jest.mock('react-icons/fa', () => ({
    FaPaperPlane: (props: any) => <span data-testid="paper-plane-icon" {...props} />,
}));

jest.mock('react-icons/lu', () => ({
    LuRefreshCw: (props: any) => <span data-testid="refresh-icon" {...props} />,
}));

// Mock child components
jest.mock('@/ui/shared/input', () => ({
    __esModule: true,
    default: ({ id, name, type, label, placeholder, defaultValue, errors, inputType, labelSize }: any) => (
        <div data-testid={`input-${id}`}>
            <label htmlFor={id} data-label-size={labelSize}>{label}</label>
            {inputType === 'textarea' ? (
                <textarea
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    data-has-errors={!!errors}
                />
            ) : (
                <input
                    id={id}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    data-has-errors={!!errors}
                />
            )}
        </div>
    ),
}));

jest.mock('@/ui/shared/input-errors', () => ({
    __esModule: true,
    default: () => <div data-testid="input-errors">Form has errors</div>,
}));

// Helper to create mock property data
const createMockProperty = (overrides: Partial<PropertyDocument> = {}): PropertyDocument => ({
    _id: 'property-123',
    name: 'Test Property',
    type: 'Apartment',
    beds: 2,
    baths: 1,
    square_feet: 1000,
    location: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
    },
    rates: {
        nightly: 100,
        weekly: 600,
        monthly: 2000,
    },
    imagesData: [{
        secureUrl: 'https://test.com/image.jpg',
        publicId: 'test-image',
        width: 800,
        height: 600,
    }],
    owner: 'owner-456',
    createdAt: new Date(),
    updatedAt: new Date(),
    amenities: ['WiFi', 'Kitchen'],
    ...overrides,
} as PropertyDocument);

// Helper to create mock action state
const createMockActionState = (overrides: Partial<ActionState> = {}): ActionState => ({
    message: null,
    status: null,
    formData: undefined,
    formErrorMap: undefined,
    ...overrides,
});

describe('PropertyContactForm', () => {
    const mockCreateMessage = jest.mocked(jest.requireMock('@/lib/actions/message-actions').createMessage);
    const mockToast = jest.mocked(jest.requireMock('react-toastify').toast);
    const mockFormAction = jest.fn();
    const defaultProps = {
        property: createMockProperty(),
        userName: 'John Doe',
        userEmail: 'john@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup default useActionState return
        mockUseActionState.mockReturnValue([
            createMockActionState(),
            mockFormAction,
            false // isPending = false
        ]);
    });

    describe('Component Structure', () => {
        it('should render contact form with correct structure', () => {
            render(<PropertyContactForm {...defaultProps} />);

            expect(screen.getByText('Contact Property Manager')).toBeInTheDocument();
            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
        });

        it('should render all required form fields', () => {
            render(<PropertyContactForm {...defaultProps} />);

            expect(screen.getByTestId('input-name')).toBeInTheDocument();
            expect(screen.getByTestId('input-email')).toBeInTheDocument();
            expect(screen.getByTestId('input-phone')).toBeInTheDocument();
            expect(screen.getByTestId('input-body')).toBeInTheDocument();
        });

        it('should render hidden fields for property and recipient', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const propertyInput = screen.getByDisplayValue('property-123');
            const recipientInput = screen.getByDisplayValue('owner-456');

            expect(propertyInput).toHaveAttribute('type', 'hidden');
            expect(propertyInput).toHaveAttribute('name', 'property');
            expect(recipientInput).toHaveAttribute('type', 'hidden');
            expect(recipientInput).toHaveAttribute('name', 'recipient');
        });

        it('should have correct CSS classes and styling', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const container = screen.getByText('Contact Property Manager').closest('div');
            expect(container).toHaveClass('bg-white', 'p-4', 'rounded-md', 'shadow-xl');
        });
    });

    describe('useActionState Integration', () => {
        it('should call useActionState with createMessage action', () => {
            render(<PropertyContactForm {...defaultProps} />);

            expect(mockUseActionState).toHaveBeenCalledWith(
                mockCreateMessage,
                expect.any(Object)
            );
        });

        it('should use server action for form submission', () => {
            render(<PropertyContactForm {...defaultProps} />);

            // The form should exist and be ready for server action submission
            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
        });

        it('should handle different action states correctly', () => {
            const actionState = createMockActionState({
                message: 'Test message',
                status: ActionStatus.SUCCESS,
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            // Form should still render normally
            expect(screen.getByText('Contact Property Manager')).toBeInTheDocument();
        });
    });

    describe('Pre-filled User Data', () => {
        it('should pre-fill name field with userName prop', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const nameInput = screen.getByTestId('input-name').querySelector('input');
            expect(nameInput).toHaveValue('John Doe');
        });

        it('should pre-fill email field with userEmail prop', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const emailInput = screen.getByTestId('input-email').querySelector('input');
            expect(emailInput).toHaveValue('john@example.com');
        });

        it('should handle null userName gracefully', () => {
            render(<PropertyContactForm {...defaultProps} userName={null} />);

            const nameInput = screen.getByTestId('input-name').querySelector('input');
            expect(nameInput).toHaveValue('');
        });

        it('should handle undefined userEmail gracefully', () => {
            render(<PropertyContactForm {...defaultProps} userEmail={undefined} />);

            const emailInput = screen.getByTestId('input-email').querySelector('input');
            expect(emailInput).toHaveValue('');
        });

        it('should prioritize user props over form data when both available', () => {
            const mockFormData = new FormData();
            mockFormData.set('name', 'Form Name');
            mockFormData.set('email', 'form@example.com');

            const actionState = createMockActionState({
                formData: mockFormData,
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            const nameInput = screen.getByTestId('input-name').querySelector('input');
            const emailInput = screen.getByTestId('input-email').querySelector('input');
            
            // Component prioritizes user props over form data
            expect(nameInput).toHaveValue('John Doe'); // userName prop
            expect(emailInput).toHaveValue('john@example.com'); // userEmail prop
        });

        it('should fall back to form data when user props are null/undefined', () => {
            const mockFormData = new FormData();
            mockFormData.set('name', 'Fallback Name');
            mockFormData.set('email', 'fallback@example.com');

            const actionState = createMockActionState({
                formData: mockFormData,
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} userName={null} userEmail={undefined} />);

            const nameInput = screen.getByTestId('input-name').querySelector('input');
            const emailInput = screen.getByTestId('input-email').querySelector('input');
            
            // Should use form data when user props are null/undefined
            expect(nameInput).toHaveValue('Fallback Name');
            expect(emailInput).toHaveValue('fallback@example.com');
        });
    });

    describe('Form Validation and Errors', () => {
        it('should display form errors when present in action state', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    name: ['Name is required'],
                    email: ['Invalid email format'],
                },
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(screen.getByTestId('input-errors')).toBeInTheDocument();
        });

        it('should not display InputErrors when no form errors', () => {
            render(<PropertyContactForm {...defaultProps} />);

            expect(screen.queryByTestId('input-errors')).not.toBeInTheDocument();
        });

        it('should pass errors to individual Input components', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    name: ['Name is required'],
                    email: ['Invalid email'],
                },
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            const nameInput = screen.getByTestId('input-name').querySelector('input');
            const emailInput = screen.getByTestId('input-email').querySelector('input');
            
            expect(nameInput).toHaveAttribute('data-has-errors', 'true');
            expect(emailInput).toHaveAttribute('data-has-errors', 'true');
        });

        it('should handle empty form error map', () => {
            const actionState = createMockActionState({
                formErrorMap: {},
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(screen.queryByTestId('input-errors')).not.toBeInTheDocument();
        });
    });

    describe('Loading States and Submit Button', () => {
        it('should show normal submit button when not pending', () => {
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                false // isPending = false
            ]);

            render(<PropertyContactForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send message/i });
            
            expect(submitButton).not.toBeDisabled();
            expect(screen.getByTestId('paper-plane-icon')).toBeInTheDocument();
            expect(screen.queryByTestId('refresh-icon')).not.toBeInTheDocument();
        });

        it('should show loading state when pending', () => {
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                true // isPending = true
            ]);

            render(<PropertyContactForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send message/i });
            
            expect(submitButton).toBeDisabled();
            expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
            expect(screen.queryByTestId('paper-plane-icon')).not.toBeInTheDocument();
        });

        it('should apply correct CSS classes when pending', () => {
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                true // isPending = true
            ]);

            render(<PropertyContactForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send message/i });
            expect(submitButton).toHaveClass('hover:cursor-not-allowed');
        });

        it('should apply correct CSS classes when not pending', () => {
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                false // isPending = false
            ]);

            render(<PropertyContactForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send message/i });
            expect(submitButton).toHaveClass('hover:cursor-pointer');
        });
    });

    describe('Toast Notifications', () => {
        it('should call success toast on successful action', () => {
            const actionState = createMockActionState({
                status: ActionStatus.SUCCESS,
                message: 'Message sent successfully!',
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(mockToast.success).toHaveBeenCalledWith('Message sent successfully!');
        });

        it('should call error toast on error action', () => {
            const actionState = createMockActionState({
                status: ActionStatus.ERROR,
                message: 'Failed to send message',
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(mockToast.error).toHaveBeenCalledWith('Failed to send message');
        });

        it('should call info toast on info status', () => {
            const actionState = createMockActionState({
                status: ActionStatus.INFO,
                message: 'Processing your request',
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(mockToast.info).toHaveBeenCalledWith('Processing your request');
        });

        it('should call warning toast on warning status', () => {
            const actionState = createMockActionState({
                status: ActionStatus.WARNING,
                message: 'Please check your input',
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(mockToast.warning).toHaveBeenCalledWith('Please check your input');
        });

        it('should not call toast when status is null', () => {
            const actionState = createMockActionState({
                status: null,
                message: 'This should not show',
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(mockToast.success).not.toHaveBeenCalled();
            expect(mockToast.error).not.toHaveBeenCalled();
            expect(mockToast.info).not.toHaveBeenCalled();
            expect(mockToast.warning).not.toHaveBeenCalled();
        });
    });

    describe('Form Field Configuration', () => {
        it('should configure name field correctly', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const nameInput = screen.getByTestId('input-name');
            const input = nameInput.querySelector('input');
            const label = nameInput.querySelector('label');

            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('placeholder', 'Enter your name');
            expect(label).toHaveTextContent('Name');
            expect(label).toHaveAttribute('data-label-size', 'text-sm');
        });

        it('should configure email field correctly', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const emailInput = screen.getByTestId('input-email');
            const input = emailInput.querySelector('input');
            const label = emailInput.querySelector('label');

            expect(input).toHaveAttribute('type', 'tel');
            expect(input).toHaveAttribute('placeholder', 'Enter your email');
            expect(label).toHaveTextContent('Email');
        });

        it('should configure phone field correctly', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const phoneInput = screen.getByTestId('input-phone');
            const input = phoneInput.querySelector('input');
            const label = phoneInput.querySelector('label');

            expect(input).toHaveAttribute('type', 'tel');
            expect(input).toHaveAttribute('placeholder', 'Enter your phone number');
            expect(label).toHaveTextContent('Phone');
        });

        it('should configure message field as textarea', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const bodyInput = screen.getByTestId('input-body');
            const textarea = bodyInput.querySelector('textarea');
            const label = bodyInput.querySelector('label');

            expect(textarea).toBeInTheDocument();
            expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
            expect(label).toHaveTextContent('Message');
        });
    });

    describe('Property Data Integration', () => {
        it('should use property _id for hidden property field', () => {
            const customProperty = createMockProperty({ _id: 'custom-property-789' });
            render(<PropertyContactForm {...defaultProps} property={customProperty} />);

            const propertyInput = screen.getByDisplayValue('custom-property-789');
            expect(propertyInput).toHaveAttribute('name', 'property');
        });

        it('should use property owner for hidden recipient field', () => {
            const customProperty = createMockProperty({ owner: 'custom-owner-123' as any });
            render(<PropertyContactForm {...defaultProps} property={customProperty} />);

            const recipientInput = screen.getByDisplayValue('custom-owner-123');
            expect(recipientInput).toHaveAttribute('name', 'recipient');
        });

        it('should handle complex property _id types', () => {
            const customProperty = createMockProperty({ 
                _id: { toString: () => 'complex-id' } as any 
            });
            render(<PropertyContactForm {...defaultProps} property={customProperty} />);

            const propertyInput = screen.getByDisplayValue('complex-id');
            expect(propertyInput).toBeInTheDocument();
        });

        it('should handle complex owner types', () => {
            const customProperty = createMockProperty({ 
                owner: { toString: () => 'complex-owner' } as any 
            });
            render(<PropertyContactForm {...defaultProps} property={customProperty} />);

            const recipientInput = screen.getByDisplayValue('complex-owner');
            expect(recipientInput).toBeInTheDocument();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle missing form data gracefully', () => {
            const actionState = createMockActionState({
                formData: undefined,
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            expect(() => {
                render(<PropertyContactForm {...defaultProps} />);
            }).not.toThrow();
        });

        it('should handle undefined formErrorMap', () => {
            const actionState = createMockActionState({
                formErrorMap: undefined,
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            render(<PropertyContactForm {...defaultProps} />);

            expect(screen.queryByTestId('input-errors')).not.toBeInTheDocument();
        });

        it('should handle form submission without breaking', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const form = document.querySelector('form');
            
            expect(() => {
                if (form) fireEvent.submit(form);
            }).not.toThrow();
        });

        it('should handle rapid state changes', () => {
            const { rerender } = render(<PropertyContactForm {...defaultProps} />);

            // Change to pending state
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                true
            ]);
            
            expect(() => {
                rerender(<PropertyContactForm {...defaultProps} />);
            }).not.toThrow();

            const submitButton = screen.getByRole('button', { name: /send message/i });
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Accessibility', () => {
        it('should have proper form structure for screen readers', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
            
            const submitButton = screen.getByRole('button', { name: /send message/i });
            expect(submitButton).toHaveAttribute('type', 'submit');
        });

        it('should have proper heading structure', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toHaveTextContent('Contact Property Manager');
        });

        it('should associate labels with form fields', () => {
            render(<PropertyContactForm {...defaultProps} />);

            const nameLabel = screen.getByLabelText('Name');
            const emailLabel = screen.getByLabelText('Email');
            const phoneLabel = screen.getByLabelText('Phone');
            const messageLabel = screen.getByLabelText('Message');

            expect(nameLabel).toBeInTheDocument();
            expect(emailLabel).toBeInTheDocument();
            expect(phoneLabel).toBeInTheDocument();
            expect(messageLabel).toBeInTheDocument();
        });

        it('should provide visual feedback for disabled state', () => {
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                true // isPending = true
            ]);

            render(<PropertyContactForm {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /send message/i });
            expect(submitButton).toHaveClass('hover:cursor-not-allowed');
        });
    });

    describe('Performance and Optimization', () => {
        it('should not cause unnecessary re-renders', () => {
            const { rerender } = render(<PropertyContactForm {...defaultProps} />);
            
            // Re-render with same props should not break
            rerender(<PropertyContactForm {...defaultProps} />);
            
            expect(screen.getByText('Contact Property Manager')).toBeInTheDocument();
        });

        it('should handle large form data efficiently', () => {
            const largeFormData = new FormData();
            for (let i = 0; i < 100; i++) {
                largeFormData.set(`field${i}`, `value${i}`);
            }
            largeFormData.set('name', 'Test Name');
            
            const actionState = createMockActionState({
                formData: largeFormData,
            });
            
            mockUseActionState.mockReturnValue([actionState, mockFormAction, false]);

            expect(() => {
                render(<PropertyContactForm {...defaultProps} />);
            }).not.toThrow();
        });
    });

    describe('Integration with Parent Components', () => {
        it('should work with minimal required props', () => {
            const minimalProps = {
                property: createMockProperty(),
                userName: null,
                userEmail: null,
            };

            expect(() => {
                render(<PropertyContactForm {...minimalProps} />);
            }).not.toThrow();
        });

        it('should handle dynamic property updates', () => {
            const { rerender } = render(<PropertyContactForm {...defaultProps} />);
            
            const newProperty = createMockProperty({ 
                _id: 'new-property-456' as any,
                owner: 'new-owner-789' as any
            });
            
            rerender(<PropertyContactForm {...defaultProps} property={newProperty} />);
            
            expect(screen.getByDisplayValue('new-property-456')).toBeInTheDocument();
            expect(screen.getByDisplayValue('new-owner-789')).toBeInTheDocument();
        });
    });

    describe('Snapshots', () => {
        it('should match snapshot with default props', () => {
            const { container } = render(<PropertyContactForm {...defaultProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with minimal user data', () => {
            const propsWithoutUser = {
                ...defaultProps,
                userName: null,
                userEmail: null,
            };
            const { container } = render(<PropertyContactForm {...propsWithoutUser} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with form errors', () => {
            // Mock useActionState to return errors
            mockUseActionState.mockReturnValue([
                createMockActionState({
                    formErrorMap: {
                        name: ['Name is required'],
                        email: ['Invalid email format'],
                        message: ['Message too short'],
                    },
                }),
                mockFormAction,
                false,
            ]);

            const { container } = render(<PropertyContactForm {...defaultProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot in loading state', () => {
            // Mock useActionState to return pending state
            mockUseActionState.mockReturnValue([
                createMockActionState(),
                mockFormAction,
                true, // pending state
            ]);

            const { container } = render(<PropertyContactForm {...defaultProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });

        it('should match snapshot with different property data', () => {
            const customProperty = createMockProperty({
                _id: 'custom-property-123' as any,
                name: 'Custom Property Name',
                owner: 'custom-owner-456' as any,
            });

            const customProps = {
                ...defaultProps,
                property: customProperty,
                userName: 'Jane Smith',
                userEmail: 'jane@example.com',
            };

            const { container } = render(<PropertyContactForm {...customProps} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
});