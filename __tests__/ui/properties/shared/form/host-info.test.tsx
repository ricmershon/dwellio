import { render, screen, fireEvent } from '@testing-library/react';
import { Session } from 'next-auth';
import { PropertyDocument } from '@/models';
import { ActionState } from '@/types';
import HostInfo from '@/ui/properties/shared/form/host-info';

// Mock useSession to return test session data
const mockSession: { data: Session | null } = { data: null };
jest.mock('next-auth/react', () => ({
    useSession: () => mockSession
}));

// Mock the withAuth HOC
jest.mock('@/hocs/with-auth', () => ({
    withAuth: (Component: any) => {
        return (props: any) => {
            const { data: session } = require('next-auth/react').useSession();
            return <Component {...props} session={session} />;
        };
    }
}));

// Mock FormErrors component
jest.mock('@/ui/shared/form-errors', () => {
    return function MockFormErrors({ errors, id }: { errors: string[] | string, id: string }) {
        const errorArray = Array.isArray(errors) ? errors : [errors];
        return (
            <div data-testid={`form-errors-${id}`}>
                {errorArray.map((error, index) => (
                    <div key={index} className="text-red-500">{error}</div>
                ))}
            </div>
        );
    };
});

const createMockActionState = (overrides: Partial<ActionState> = {}): ActionState => ({
    ...overrides
});

const createMockSession = (overrides: Partial<Session> = {}): Session => ({
    user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        ...overrides.user
    },
    expires: '2024-12-31',
    ...overrides
});

const createMockProperty = (overrides: Partial<PropertyDocument> = {}): PropertyDocument => ({
    _id: 'property-123',
    name: 'Test Property',
    type: 'Apartment',
    description: 'Test description',
    location: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipcode: '12345'
    },
    beds: 2,
    baths: 2,
    squareFeet: 1000,
    amenities: ['WiFi', 'Pool'],
    rates: {
        nightly: 100,
        weekly: 600,
        monthly: 2400
    },
    owner: 'owner-123',
    images: [],
    host: {
        name: 'Property Host',
        email: 'host@example.com',
        phone: '987-654-3210'
    },
    sellerInfo: {
        name: 'Property Seller',
        email: 'seller@example.com',
        phone: '555-123-4567'
    },
    is_featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
} as unknown as PropertyDocument);

describe('HostInfo Component', () => {
    describe('Component Structure', () => {
        it('renders the host info container with correct structure', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            const { container } = render(<HostInfo actionState={actionState} />);

            expect(container.querySelector('.mb-4')).toBeInTheDocument();
            expect(screen.getByText('Host Information')).toBeInTheDocument();
        });

        it('renders heading with correct text and styling', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveTextContent('Host Information');
            expect(heading).toHaveClass('block', 'text-gray-700', 'font-bold', 'mb-1');
        });

        it('has proper responsive flex layout for email and phone', () => {
            const actionState = createMockActionState();
            const session = createMockSession();
            const { container } = render(<HostInfo actionState={actionState} />);

            const flexContainer = container.querySelector('.flex.flex-wrap');
            expect(flexContainer).toBeInTheDocument();
            expect(flexContainer).toHaveClass('flex', 'flex-wrap');
        });
    });

    describe('Name Field', () => {
        it('renders name input with correct attributes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Name');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('id', 'seller_name');
            expect(input).toHaveAttribute('name', 'sellerInfo.name');
            expect(input).toHaveAttribute('placeholder', 'Name');
            expect(input).toHaveAttribute('aria-describedby', 'seller_name-error');
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

        it('renders name label with correct attributes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const label = screen.getByLabelText('Name').closest('div')?.querySelector('label');
            expect(label).toHaveAttribute('for', 'seller_name');
            expect(label).toHaveClass('block', 'text-sm', 'text-gray-500', 'medium');
        });

        it('handles name input changes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Name') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'New Name' } });
            expect(input.value).toBe('New Name');
        });

        it('displays name from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('sellerInfo.name', 'Form Data Name');

            const actionState = createMockActionState({
                formData: mockFormData
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Name') as HTMLInputElement;
            expect(input.defaultValue).toBe('Form Data Name');
        });

        it('displays name from property when formData is not available', () => {
            const property = createMockProperty({
                sellerInfo: {
                    name: 'Property Seller Name',
                    email: 'seller@example.com',
                    phone: '555-123-4567'
                }
            });
            const actionState = createMockActionState();
            mockSession.data = createMockSession();

            render(<HostInfo actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Name') as HTMLInputElement;
            expect(input.defaultValue).toBe('Property Seller Name');
        });

        it('displays name from session when formData and property are not available', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession({
                user: { id: 'user-123', name: 'Session User Name', email: 'session@example.com', image: null }
            });

            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Name') as HTMLInputElement;
            expect(input.defaultValue).toBe('Session User Name');
        });

        it('prioritizes formData over property and session for name', () => {
            const mockFormData = new FormData();
            mockFormData.set('sellerInfo.name', 'Form Data Priority');

            const property = createMockProperty({
                sellerInfo: { name: 'Property Name', email: 'seller@example.com', phone: '555-123-4567' }
            });
            const actionState = createMockActionState({
                formData: mockFormData
            });
            const session = createMockSession({
                user: { id: 'user-123', name: 'Session Name', email: 'session@example.com', image: null }
            });

            render(<HostInfo actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Name') as HTMLInputElement;
            expect(input.defaultValue).toBe('Form Data Priority');
        });

        it('renders name field errors when present', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    sellerInfo: {
                        name: ['Name is required', 'Name must be at least 2 characters']
                    }
                }
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-seller_name');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('Name is required')).toBeInTheDocument();
            expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
        });
    });

    describe('Email Field', () => {
        it('renders email input with correct attributes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Email');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'email');
            expect(input).toHaveAttribute('id', 'seller_email');
            expect(input).toHaveAttribute('name', 'sellerInfo.email');
            expect(input).toHaveAttribute('placeholder', 'Email');
            expect(input).toHaveAttribute('aria-describedby', 'seller_email-error');
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

        it('has proper responsive layout styling', () => {
            const actionState = createMockActionState();
            const session = createMockSession();
            const { container } = render(<HostInfo actionState={actionState} />);

            const emailContainer = screen.getByLabelText('Email').closest('div');
            expect(emailContainer).toHaveClass('w-full', 'sm:w-1/2', 'mb-2', 'sm:mb-0', 'sm:pr-2');
        });

        it('handles email input changes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Email') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'newemail@example.com' } });
            expect(input.value).toBe('newemail@example.com');
        });

        it('displays email from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('sellerInfo.email', 'form@example.com');

            const actionState = createMockActionState({
                formData: mockFormData
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Email') as HTMLInputElement;
            expect(input.defaultValue).toBe('form@example.com');
        });

        it('displays email from property when formData is not available', () => {
            const property = createMockProperty({
                sellerInfo: {
                    name: 'Property Seller',
                    email: 'property@example.com',
                    phone: '555-123-4567'
                }
            });
            const actionState = createMockActionState();
            mockSession.data = createMockSession();

            render(<HostInfo actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Email') as HTMLInputElement;
            expect(input.defaultValue).toBe('property@example.com');
        });

        it('displays email from session when formData and property are not available', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession({
                user: { id: 'user-123', name: 'Session User', email: 'session@example.com', image: null }
            });

            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Email') as HTMLInputElement;
            expect(input.defaultValue).toBe('session@example.com');
        });

        it('renders email field errors when present', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    sellerInfo: {
                        email: ['Invalid email format', 'Email is required']
                    }
                }
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-seller_email');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('Invalid email format')).toBeInTheDocument();
            expect(screen.getByText('Email is required')).toBeInTheDocument();
        });
    });

    describe('Phone Field', () => {
        it('renders phone input with correct attributes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Phone');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'tel');
            expect(input).toHaveAttribute('id', 'seller_phone');
            expect(input).toHaveAttribute('name', 'sellerInfo.phone');
            expect(input).toHaveAttribute('aria-describedby', 'seller_phone-error');
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

        it('has proper responsive layout styling', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const phoneContainer = screen.getByLabelText('Phone').closest('div');
            expect(phoneContainer).toHaveClass('w-full', 'sm:w-1/2', 'sm:pl-2');
        });

        it('handles phone input changes', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Phone') as HTMLInputElement;
            fireEvent.change(input, { target: { value: '999-888-7777' } });
            expect(input.value).toBe('999-888-7777');
        });

        it('displays phone from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('sellerInfo.phone', '111-222-3333');

            const actionState = createMockActionState({
                formData: mockFormData
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Phone') as HTMLInputElement;
            expect(input.defaultValue).toBe('111-222-3333');
        });

        it('displays phone from property when formData is not available', () => {
            const property = createMockProperty({
                sellerInfo: {
                    name: 'Property Seller',
                    email: 'seller@example.com',
                    phone: '444-555-6666'
                }
            });
            const actionState = createMockActionState();
            mockSession.data = createMockSession();

            render(<HostInfo actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Phone') as HTMLInputElement;
            expect(input.defaultValue).toBe('444-555-6666');
        });

        it('displays empty string when no phone data is available', () => {
            const actionState = createMockActionState();
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const input = screen.getByLabelText('Phone') as HTMLInputElement;
            expect(input.defaultValue).toBe('');
        });

        it('renders phone field errors when present', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    sellerInfo: {
                        phone: ['Invalid phone format', 'Phone number must be 10 digits']
                    }
                }
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-seller_phone');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('Invalid phone format')).toBeInTheDocument();
            expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('does not render FormErrors when no sellerInfo errors exist', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            expect(screen.queryByTestId('form-errors-seller_name')).not.toBeInTheDocument();
            expect(screen.queryByTestId('form-errors-seller_email')).not.toBeInTheDocument();
            expect(screen.queryByTestId('form-errors-seller_phone')).not.toBeInTheDocument();
        });

        it('renders multiple field errors independently', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    sellerInfo: {
                        name: ['Name error'],
                        email: ['Email error'],
                        phone: ['Phone error']
                    }
                }
            });
            const session = createMockSession();

            render(<HostInfo actionState={actionState} />);

            expect(screen.getByTestId('form-errors-seller_name')).toBeInTheDocument();
            expect(screen.getByTestId('form-errors-seller_email')).toBeInTheDocument();
            expect(screen.getByTestId('form-errors-seller_phone')).toBeInTheDocument();
        });
    });

    describe('Session Integration', () => {
        it('handles null session gracefully', () => {
            const actionState = createMockActionState();
            mockSession.data = null;

            render(<HostInfo actionState={actionState} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

            expect(nameInput.defaultValue).toBe('');
            expect(emailInput.defaultValue).toBe('');
        });

        it('handles session with null user data', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession({
                user: { id: 'user-123', name: null, email: null, image: null }
            });

            render(<HostInfo actionState={actionState} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

            expect(nameInput.defaultValue).toBe('');
            expect(emailInput.defaultValue).toBe('');
        });
    });

    describe('Accessibility', () => {
        it('has proper heading structure', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Host Information');
        });

        it('associates labels with their inputs correctly', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByLabelText('Phone')).toBeInTheDocument();
        });

        it('has proper aria-describedby attributes for error association', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            expect(screen.getByLabelText('Name')).toHaveAttribute('aria-describedby', 'seller_name-error');
            expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'seller_email-error');
            expect(screen.getByLabelText('Phone')).toHaveAttribute('aria-describedby', 'seller_phone-error');
        });

        it('uses appropriate input types for validation', () => {
            const actionState = createMockActionState();
            mockSession.data = createMockSession();
            render(<HostInfo actionState={actionState} />);

            expect(screen.getByLabelText('Name')).toHaveAttribute('type', 'text');
            expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
            expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'tel');
        });
    });
});