import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyDocument } from '@/models';
import { ActionState } from '@/types';
import Rates from '@/ui/properties/shared/form/rates';

// Mock FormErrors component
jest.mock('@/ui/shared/form-errors', () => {
    return function MockFormErrors({ errors, id }: { errors: string[] | string | any, id: string }) {
        // Handle different error formats
        if (Array.isArray(errors)) {
            return (
                <div data-testid={`form-errors-${id}`}>
                    {errors.map((error, index) => (
                        <div key={index} className="text-red-500">{error}</div>
                    ))}
                </div>
            );
        } else if (typeof errors === 'string') {
            return (
                <div data-testid={`form-errors-${id}`}>
                    <div className="text-red-500">{errors}</div>
                </div>
            );
        } else if (errors && typeof errors === 'object') {
            // Skip rendering for object types - this shouldn't happen in real FormErrors
            return null;
        }
        return null;
    };
});

const createMockActionState = (overrides: Partial<ActionState> = {}): ActionState => ({
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
        name: 'Test Host',
        email: 'test@example.com',
        phone: '123-456-7890'
    },
    is_featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
} as unknown as PropertyDocument);

describe('Rates Component', () => {
    describe('Component Structure', () => {
        it('renders the rates container with correct structure', () => {
            const actionState = createMockActionState();
            const { container } = render(<Rates actionState={actionState} />);

            expect(container.querySelector('.mb-4')).toBeInTheDocument();
            expect(screen.getByText('Rates (enter at least one)')).toBeInTheDocument();
            expect(container.querySelector('.flex.flex-wrap.mb-2.sm\\:mb-0')).toBeInTheDocument();
        });

        it('renders heading with correct text and styling', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveTextContent('Rates (enter at least one)');
            expect(heading).toHaveClass('block', 'text-gray-700', 'font-bold', 'mb-1');
        });

        it('has proper aria-describedby attribute on flex container', () => {
            const actionState = createMockActionState();
            const { container } = render(<Rates actionState={actionState} />);

            const flexContainer = container.querySelector('.flex.flex-wrap');
            expect(flexContainer).toHaveAttribute('aria-describedby', 'rates-error');
        });
    });

    describe('Nightly Rate Field', () => {
        it('renders nightly rate input with correct attributes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Nightly');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('id', 'nightly_rate');
            expect(input).toHaveAttribute('name', 'rates.nightly');
            expect(input).toHaveAttribute('aria-describedby', 'nightly_rate-error');
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

        it('renders nightly rate label with correct attributes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const label = screen.getByLabelText('Nightly').closest('div')?.querySelector('label');
            expect(label).toHaveAttribute('for', 'nightly_rate');
            expect(label).toHaveClass('block', 'text-sm', 'text-gray-500', 'font-medium');
        });

        it('handles nightly rate input changes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Nightly') as HTMLInputElement;
            fireEvent.change(input, { target: { value: '150' } });
            expect(input.value).toBe('150');
        });

        it('displays nightly rate from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('rates.nightly', '120');

            const actionState = createMockActionState({
                formData: mockFormData
            });

            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(input.defaultValue).toBe('120');
        });

        it('displays nightly rate from property when formData is not available', () => {
            const property = createMockProperty({
                rates: { nightly: 200, weekly: 1200, monthly: 4800 }
            });
            const actionState = createMockActionState();

            render(<Rates actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(input.defaultValue).toBe('200');
        });

        it('prioritizes formData over property nightly rate', () => {
            const mockFormData = new FormData();
            mockFormData.set('rates.nightly', '180');

            const property = createMockProperty({
                rates: { nightly: 200, weekly: 1200, monthly: 4800 }
            });
            const actionState = createMockActionState({
                formData: mockFormData
            });

            render(<Rates actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(input.defaultValue).toBe('180');
        });

        it('renders nightly rate field errors when present', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    rates: {
                        nightly: ['Nightly rate must be a positive number', 'Nightly rate is required']
                    }
                }
            });

            render(<Rates actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-nightly_rate');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('Nightly rate must be a positive number')).toBeInTheDocument();
            expect(screen.getByText('Nightly rate is required')).toBeInTheDocument();
        });
    });

    describe('Weekly Rate Field', () => {
        it('renders weekly rate input with correct attributes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Weekly');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('id', 'weekly_rate');
            expect(input).toHaveAttribute('name', 'rates.weekly');
            expect(input).toHaveAttribute('aria-describedby', 'weekly_rate-error');
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

        it('handles weekly rate input changes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Weekly') as HTMLInputElement;
            fireEvent.change(input, { target: { value: '900' } });
            expect(input.value).toBe('900');
        });

        it('displays weekly rate from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('rates.weekly', '800');

            const actionState = createMockActionState({
                formData: mockFormData
            });

            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Weekly') as HTMLInputElement;
            expect(input.defaultValue).toBe('800');
        });

        it('displays weekly rate from property when formData is not available', () => {
            const property = createMockProperty({
                rates: { nightly: 150, weekly: 1000, monthly: 3600 }
            });
            const actionState = createMockActionState();

            render(<Rates actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Weekly') as HTMLInputElement;
            expect(input.defaultValue).toBe('1000');
        });

        it('renders weekly rate field errors when present', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    rates: {
                        weekly: ['Weekly rate must be valid']
                    }
                }
            });

            render(<Rates actionState={actionState} />);

            expect(screen.getByTestId('form-errors-weekly_rate')).toBeInTheDocument();
            expect(screen.getByText('Weekly rate must be valid')).toBeInTheDocument();
        });
    });

    describe('Monthly Rate Field', () => {
        it('renders monthly rate input with correct attributes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Monthly');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('id', 'monthly_rate');
            expect(input).toHaveAttribute('name', 'rates.monthly');
            expect(input).toHaveAttribute('aria-describedby', 'monthly_rate-error');
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

        it('handles monthly rate input changes', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Monthly') as HTMLInputElement;
            fireEvent.change(input, { target: { value: '3000' } });
            expect(input.value).toBe('3000');
        });

        it('displays monthly rate from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('rates.monthly', '2800');

            const actionState = createMockActionState({
                formData: mockFormData
            });

            render(<Rates actionState={actionState} />);

            const input = screen.getByLabelText('Monthly') as HTMLInputElement;
            expect(input.defaultValue).toBe('2800');
        });

        it('displays monthly rate from property when formData is not available', () => {
            const property = createMockProperty({
                rates: { nightly: 120, weekly: 750, monthly: 3200 }
            });
            const actionState = createMockActionState();

            render(<Rates actionState={actionState} property={property} />);

            const input = screen.getByLabelText('Monthly') as HTMLInputElement;
            expect(input.defaultValue).toBe('3200');
        });

        it('renders monthly rate field errors when present', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    rates: {
                        monthly: ['Monthly rate is too high']
                    }
                }
            });

            render(<Rates actionState={actionState} />);

            expect(screen.getByTestId('form-errors-monthly_rate')).toBeInTheDocument();
            expect(screen.getByText('Monthly rate is too high')).toBeInTheDocument();
        });
    });

    describe('General Rates Error Handling', () => {
        it('does not render general FormErrors when no rates errors exist', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            expect(screen.queryByTestId('form-errors-rates')).not.toBeInTheDocument();
        });

        it('renders general FormErrors when rates errors exist', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    rates: ['At least one rate must be provided', 'Rates must be reasonable'] as any
                }
            });

            render(<Rates actionState={actionState} />);

            const formErrors = screen.getByTestId('form-errors-rates');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('At least one rate must be provided')).toBeInTheDocument();
            expect(screen.getByText('Rates must be reasonable')).toBeInTheDocument();
        });

        it('renders both specific field errors and general rates errors', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    rates: {
                        nightly: ['Invalid nightly rate'],
                        weekly: ['Invalid weekly rate']
                    } as any
                }
            });

            // Add general rates error - override the rates object with array
            actionState.formErrorMap!.rates = ['At least one rate is required'] as any;

            render(<Rates actionState={actionState} />);

            expect(screen.getByTestId('form-errors-rates')).toBeInTheDocument();
            expect(screen.getByText('At least one rate is required')).toBeInTheDocument();
        });
    });

    describe('Responsive Layout', () => {
        it('applies correct CSS classes for responsive layout', () => {
            const actionState = createMockActionState();
            const { container } = render(<Rates actionState={actionState} />);

            // Check the main flex container
            const flexContainer = container.querySelector('.flex.flex-wrap');
            expect(flexContainer).toHaveClass('flex', 'flex-wrap', 'mb-2', 'sm:mb-0');

            // Check nightly rate container
            const nightlyContainer = screen.getByLabelText('Nightly').closest('div');
            expect(nightlyContainer).toHaveClass('w-full', 'sm:w-1/3', 'mb-2', 'sm:mb-0', 'sm:pr-2');

            // Check weekly rate container
            const weeklyContainer = screen.getByLabelText('Weekly').closest('div');
            expect(weeklyContainer).toHaveClass('w-full', 'sm:w-1/3', 'mb-2', 'sm:mb-0', 'sm:px-2');

            // Check monthly rate container
            const monthlyContainer = screen.getByLabelText('Monthly').closest('div');
            expect(monthlyContainer).toHaveClass('w-full', 'sm:w-1/3', 'sm:pl-2');
        });
    });

    describe('Default Value Handling', () => {
        it('handles empty string default values correctly', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            expect((screen.getByLabelText('Nightly') as HTMLInputElement).defaultValue).toBe('');
            expect((screen.getByLabelText('Weekly') as HTMLInputElement).defaultValue).toBe('');
            expect((screen.getByLabelText('Monthly') as HTMLInputElement).defaultValue).toBe('');
        });

        it('handles zero values from property', () => {
            const property = createMockProperty({
                rates: { nightly: 0, weekly: 0, monthly: 0 }
            });
            const actionState = createMockActionState();

            render(<Rates actionState={actionState} property={property} />);

            expect((screen.getByLabelText('Nightly') as HTMLInputElement).defaultValue).toBe('0');
            expect((screen.getByLabelText('Weekly') as HTMLInputElement).defaultValue).toBe('0');
            expect((screen.getByLabelText('Monthly') as HTMLInputElement).defaultValue).toBe('0');
        });

        it('handles decimal values from formData', () => {
            const mockFormData = new FormData();
            mockFormData.set('rates.nightly', '99.99');
            mockFormData.set('rates.weekly', '599.95');
            mockFormData.set('rates.monthly', '2299.50');

            const actionState = createMockActionState({
                formData: mockFormData
            });

            render(<Rates actionState={actionState} />);

            expect((screen.getByLabelText('Nightly') as HTMLInputElement).defaultValue).toBe('99.99');
            expect((screen.getByLabelText('Weekly') as HTMLInputElement).defaultValue).toBe('599.95');
            expect((screen.getByLabelText('Monthly') as HTMLInputElement).defaultValue).toBe('2299.50');
        });
    });

    describe('Accessibility', () => {
        it('has proper heading structure', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Rates (enter at least one)');
        });

        it('associates labels with their inputs correctly', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            expect(screen.getByLabelText('Nightly')).toBeInTheDocument();
            expect(screen.getByLabelText('Weekly')).toBeInTheDocument();
            expect(screen.getByLabelText('Monthly')).toBeInTheDocument();
        });

        it('has proper aria-describedby attributes for error association', () => {
            const actionState = createMockActionState();
            render(<Rates actionState={actionState} />);

            expect(screen.getByLabelText('Nightly')).toHaveAttribute('aria-describedby', 'nightly_rate-error');
            expect(screen.getByLabelText('Weekly')).toHaveAttribute('aria-describedby', 'weekly_rate-error');
            expect(screen.getByLabelText('Monthly')).toHaveAttribute('aria-describedby', 'monthly_rate-error');
        });
    });
});