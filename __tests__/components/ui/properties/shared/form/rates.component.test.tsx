import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Rates from '@/ui/properties/shared/form/rates';
import { ActionState } from '@/types';
import { PropertyDocument } from '@/models';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
// - None (simple component with no external deps)
//
// Internal Components (Real)
// - FormErrors (keep real)

// ============================================================================
// TEST DATA
// ============================================================================
const mockActionState: ActionState = {
    formData: undefined,
    formErrorMap: undefined
};

const mockProperty = {
    _id: 'property123',
    type: 'Apartment',
    name: 'Test Property',
    description: 'Test description',
    location: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipcode: '10001'
    },
    beds: 3,
    baths: 2,
    squareFeet: 1500,
    amenities: ['wifi', 'parking'],
    rates: {
        nightly: 150,
        weekly: 900,
        monthly: 3000
    },
    owner: 'user123',
    imagesData: [],
    isFeatured: false,
    createdAt: new Date()
} as any as PropertyDocument;

// ============================================================================
// TEST SUITE: Rates Component
// ============================================================================
describe('Rates Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render section heading', () => {
            render(<Rates actionState={mockActionState} />);

            expect(screen.getByText('Rates (enter at least one)')).toBeInTheDocument();
        });

        it('should render all three rate inputs', () => {
            render(<Rates actionState={mockActionState} />);

            expect(screen.getByLabelText('Nightly')).toBeInTheDocument();
            expect(screen.getByLabelText('Weekly')).toBeInTheDocument();
            expect(screen.getByLabelText('Monthly')).toBeInTheDocument();
        });

        it('should render inputs with correct types', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly');
            const weeklyInput = screen.getByLabelText('Weekly');
            const monthlyInput = screen.getByLabelText('Monthly');

            expect(nightlyInput).toHaveAttribute('type', 'number');
            expect(weeklyInput).toHaveAttribute('type', 'number');
            expect(monthlyInput).toHaveAttribute('type', 'number');
        });

        it('should render inputs with correct names', () => {
            render(<Rates actionState={mockActionState} />);

            expect(screen.getByLabelText('Nightly')).toHaveAttribute('name', 'rates.nightly');
            expect(screen.getByLabelText('Weekly')).toHaveAttribute('name', 'rates.weekly');
            expect(screen.getByLabelText('Monthly')).toHaveAttribute('name', 'rates.monthly');
        });

        it('should render inputs with correct ids', () => {
            render(<Rates actionState={mockActionState} />);

            expect(screen.getByLabelText('Nightly')).toHaveAttribute('id', 'nightly_rate');
            expect(screen.getByLabelText('Weekly')).toHaveAttribute('id', 'weekly_rate');
            expect(screen.getByLabelText('Monthly')).toHaveAttribute('id', 'monthly_rate');
        });

        it('should apply correct styling to section heading', () => {
            render(<Rates actionState={mockActionState} />);

            const heading = screen.getByText('Rates (enter at least one)');
            expect(heading).toHaveClass('form-section-label');
            expect(heading).toHaveClass('mb-1');
        });

        it('should apply correct styling to labels', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyLabel = screen.getByText('Nightly');
            const weeklyLabel = screen.getByText('Weekly');
            const monthlyLabel = screen.getByText('Monthly');

            [nightlyLabel, weeklyLabel, monthlyLabel].forEach(label => {
                expect(label).toHaveClass('sub-input-label');
            });
        });

        it('should apply correct styling to inputs', () => {
            render(<Rates actionState={mockActionState} />);

            const inputs = [
                screen.getByLabelText('Nightly'),
                screen.getByLabelText('Weekly'),
                screen.getByLabelText('Monthly')
            ];

            inputs.forEach(input => {
                expect(input).toHaveClass('w-full');
                expect(input).toHaveClass('rounded-md');
                expect(input).toHaveClass('border');
                expect(input).toHaveClass('border-gray-300');
                expect(input).toHaveClass('py-2');
                expect(input).toHaveClass('px-3');
                expect(input).toHaveClass('text-sm');
                expect(input).toHaveClass('placeholder:text-gray-500');
            });
        });

        it('should render semantic heading element', () => {
            render(<Rates actionState={mockActionState} />);

            const heading = screen.getByText('Rates (enter at least one)');
            expect(heading.tagName).toBe('H2');
        });
    });

    // ========================================================================
    // Property Data Integration
    // ========================================================================
    describe('Property Data Integration', () => {
        it('should populate nightly rate from property', () => {
            render(<Rates actionState={mockActionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput.value).toBe('150');
        });

        it('should populate weekly rate from property', () => {
            render(<Rates actionState={mockActionState} property={mockProperty} />);

            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            expect(weeklyInput.value).toBe('900');
        });

        it('should populate monthly rate from property', () => {
            render(<Rates actionState={mockActionState} property={mockProperty} />);

            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;
            expect(monthlyInput.value).toBe('3000');
        });

        it('should render empty inputs when no property provided', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            expect(nightlyInput.value).toBe('');
            expect(weeklyInput.value).toBe('');
            expect(monthlyInput.value).toBe('');
        });

        it('should handle property with zero rates', () => {
            const zeroProperty = {
                ...mockProperty,
                rates: { nightly: 0, weekly: 0, monthly: 0 }
            } as any as PropertyDocument;
            render(<Rates actionState={mockActionState} property={zeroProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            expect(nightlyInput.value).toBe('0');
            expect(weeklyInput.value).toBe('0');
            expect(monthlyInput.value).toBe('0');
        });

        it('should handle property with partial rates', () => {
            const partialProperty = {
                ...mockProperty,
                rates: { nightly: 100, weekly: undefined as any, monthly: 2000 }
            } as any as PropertyDocument;
            render(<Rates actionState={mockActionState} property={partialProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            expect(nightlyInput.value).toBe('100');
            expect(weeklyInput.value).toBe('');
            expect(monthlyInput.value).toBe('2000');
        });

        it('should handle property with undefined rates object', () => {
            const undefinedProperty = {
                ...mockProperty,
                rates: { nightly: undefined, weekly: undefined, monthly: undefined } as any
            } as any as PropertyDocument;
            render(<Rates actionState={mockActionState} property={undefinedProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput).toBeInTheDocument();
        });
    });

    // ========================================================================
    // FormData Priority
    // ========================================================================
    describe('FormData Priority', () => {
        it('should prioritize formData over property for nightly', () => {
            const formData = new FormData();
            formData.set('rates.nightly', '200');

            const actionState = { ...mockActionState, formData };
            render(<Rates actionState={actionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput.value).toBe('200');
        });

        it('should prioritize formData over property for weekly', () => {
            const formData = new FormData();
            formData.set('rates.weekly', '1200');

            const actionState = { ...mockActionState, formData };
            render(<Rates actionState={actionState} property={mockProperty} />);

            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            expect(weeklyInput.value).toBe('1200');
        });

        it('should prioritize formData over property for monthly', () => {
            const formData = new FormData();
            formData.set('rates.monthly', '4000');

            const actionState = { ...mockActionState, formData };
            render(<Rates actionState={actionState} property={mockProperty} />);

            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;
            expect(monthlyInput.value).toBe('4000');
        });

        it('should use property when formData exists but field is empty', () => {
            const formData = new FormData();
            formData.set('otherField', 'value');

            const actionState = { ...mockActionState, formData };
            render(<Rates actionState={actionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput.value).toBe('150');
        });

        it('should handle formData with zero values', () => {
            const formData = new FormData();
            formData.set('rates.nightly', '0');
            formData.set('rates.weekly', '0');
            formData.set('rates.monthly', '0');

            const actionState = { ...mockActionState, formData };
            render(<Rates actionState={actionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            expect(nightlyInput.value).toBe('0');
            expect(weeklyInput.value).toBe('0');
            expect(monthlyInput.value).toBe('0');
        });

        it('should handle mixed formData and property values', () => {
            const formData = new FormData();
            formData.set('rates.nightly', '250');

            const actionState = { ...mockActionState, formData };
            render(<Rates actionState={actionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            expect(nightlyInput.value).toBe('250');
            expect(weeklyInput.value).toBe('900');
            expect(monthlyInput.value).toBe('3000');
        });
    });

    // ========================================================================
    // Error Display - Individual Fields
    // ========================================================================
    describe('Error Display - Individual Fields', () => {
        it('should display nightly rate error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: { nightly: ['Nightly rate is required'] }
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('Nightly rate is required')).toBeInTheDocument();
        });

        it('should display weekly rate error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: { weekly: ['Weekly rate is required'] }
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('Weekly rate is required')).toBeInTheDocument();
        });

        it('should display monthly rate error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: { monthly: ['Monthly rate is required'] }
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('Monthly rate is required')).toBeInTheDocument();
        });

        it('should display multiple errors for single rate', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: {
                        nightly: ['Nightly rate is required', 'Must be greater than 0']
                    }
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('Nightly rate is required')).toBeInTheDocument();
            expect(screen.getByText('Must be greater than 0')).toBeInTheDocument();
        });

        it('should display errors for all rates simultaneously', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: {
                        nightly: ['Nightly error'],
                        weekly: ['Weekly error'],
                        monthly: ['Monthly error']
                    }
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('Nightly error')).toBeInTheDocument();
            expect(screen.getByText('Weekly error')).toBeInTheDocument();
            expect(screen.getByText('Monthly error')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Error Display - General Rates Error
    // ========================================================================
    describe('Error Display - General Rates Error', () => {
        it('should display general rates error', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: ['At least one rate is required'] as any
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('At least one rate is required')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is null', () => {
            render(<Rates actionState={mockActionState} />);

            const errorElements = document.querySelectorAll('[id$="-error"]');
            expect(errorElements.length).toBe(0);
        });

        it('should not display errors when formErrorMap is empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {}
            };
            render(<Rates actionState={actionState} />);

            const errorMessages = document.querySelectorAll('.text-red-500');
            expect(errorMessages.length).toBe(0);
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for nightly input', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly');
            expect(nightlyInput).toHaveAttribute('aria-describedby', 'nightly_rate-error');
        });

        it('should have aria-describedby for weekly input', () => {
            render(<Rates actionState={mockActionState} />);

            const weeklyInput = screen.getByLabelText('Weekly');
            expect(weeklyInput).toHaveAttribute('aria-describedby', 'weekly_rate-error');
        });

        it('should have aria-describedby for monthly input', () => {
            render(<Rates actionState={mockActionState} />);

            const monthlyInput = screen.getByLabelText('Monthly');
            expect(monthlyInput).toHaveAttribute('aria-describedby', 'monthly_rate-error');
        });

        it('should have aria-describedby for rates wrapper', () => {
            render(<Rates actionState={mockActionState} />);

            const wrapper = document.querySelector('.flex.flex-wrap');
            expect(wrapper).toHaveAttribute('aria-describedby', 'rates-error');
        });

        it('should associate labels with inputs via htmlFor', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyLabel = document.querySelector('label[for="nightly_rate"]');
            const weeklyLabel = document.querySelector('label[for="weekly_rate"]');
            const monthlyLabel = document.querySelector('label[for="monthly_rate"]');

            expect(nightlyLabel).toBeInTheDocument();
            expect(weeklyLabel).toBeInTheDocument();
            expect(monthlyLabel).toBeInTheDocument();
        });
    });

    // ========================================================================
    // User Interaction
    // ========================================================================
    describe('User Interaction', () => {
        it('should allow typing in nightly input', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            await user.type(nightlyInput, '100');

            expect(nightlyInput.value).toBe('100');
        });

        it('should allow typing in weekly input', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            await user.type(weeklyInput, '600');

            expect(weeklyInput.value).toBe('600');
        });

        it('should allow typing in monthly input', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;
            await user.type(monthlyInput, '2000');

            expect(monthlyInput.value).toBe('2000');
        });

        it('should allow clearing input values', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            await user.clear(nightlyInput);

            expect(nightlyInput.value).toBe('');
        });

        it('should allow updating existing values', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            await user.clear(nightlyInput);
            await user.type(nightlyInput, '250');

            expect(nightlyInput.value).toBe('250');
        });

        it('should handle decimal numbers', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            await user.type(nightlyInput, '99.99');

            expect(nightlyInput.value).toBe('99.99');
        });

        it('should handle large numbers', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;
            await user.type(monthlyInput, '99999');

            expect(monthlyInput.value).toBe('99999');
        });

        it('should allow filling all three rates', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            await user.type(nightlyInput, '100');
            await user.type(weeklyInput, '600');
            await user.type(monthlyInput, '2000');

            expect(nightlyInput.value).toBe('100');
            expect(weeklyInput.value).toBe('600');
            expect(monthlyInput.value).toBe('2000');
        });
    });

    // ========================================================================
    // Layout and Responsive Design
    // ========================================================================
    describe('Layout and Responsive Design', () => {
        it('should have responsive wrapper classes', () => {
            render(<Rates actionState={mockActionState} />);

            const wrapper = document.querySelector('.flex.flex-wrap');
            expect(wrapper).toBeInTheDocument();
        });

        it('should apply responsive width classes to nightly container', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyContainer = screen.getByLabelText('Nightly').closest('div');
            expect(nightlyContainer).toHaveClass('w-full');
            expect(nightlyContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply responsive width classes to weekly container', () => {
            render(<Rates actionState={mockActionState} />);

            const weeklyContainer = screen.getByLabelText('Weekly').closest('div');
            expect(weeklyContainer).toHaveClass('w-full');
            expect(weeklyContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply responsive width classes to monthly container', () => {
            render(<Rates actionState={mockActionState} />);

            const monthlyContainer = screen.getByLabelText('Monthly').closest('div');
            expect(monthlyContainer).toHaveClass('w-full');
            expect(monthlyContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply correct spacing to main container', () => {
            render(<Rates actionState={mockActionState} />);

            const mainContainer = document.querySelector('.mb-4');
            expect(mainContainer).toHaveClass('mb-4');
        });

        it('should apply responsive margin classes', () => {
            render(<Rates actionState={mockActionState} />);

            const nightlyContainer = screen.getByLabelText('Nightly').closest('div');
            expect(nightlyContainer).toHaveClass('mb-2');
            expect(nightlyContainer).toHaveClass('sm:mb-0');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle property with missing rates object', () => {
            const incompleteProperty = {
                ...mockProperty,
                rates: { nightly: undefined, weekly: undefined, monthly: undefined } as any
            } as any as PropertyDocument;
            render(<Rates actionState={mockActionState} property={incompleteProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput).toBeInTheDocument();
        });

        it('should handle very large rates', () => {
            const largeProperty = {
                ...mockProperty,
                rates: { nightly: 999999, weekly: 9999999, monthly: 99999999 }
            } as any as PropertyDocument;
            render(<Rates actionState={mockActionState} property={largeProperty} />);

            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;
            expect(monthlyInput.value).toBe('99999999');
        });

        it('should handle fractional rates', () => {
            const fractionalProperty = {
                ...mockProperty,
                rates: { nightly: 99.99, weekly: 599.99, monthly: 1999.99 }
            } as any as PropertyDocument;
            render(<Rates actionState={mockActionState} property={fractionalProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput.value).toBe('99.99');
        });

        it('should handle empty formData', () => {
            const formData = new FormData();
            const actionState = { ...mockActionState, formData };

            render(<Rates actionState={actionState} property={mockProperty} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            expect(nightlyInput.value).toBe('150');
        });

        it('should handle nested error structure', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    rates: {
                        nightly: ['Error 1']
                    }
                }
            };
            render(<Rates actionState={actionState} />);

            expect(screen.getByText('Error 1')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Form Section', () => {
        it('should render complete rates section with all data', () => {
            const formData = new FormData();
            formData.set('rates.nightly', '200');

            const actionState = {
                formData,
                formErrorMap: {
                    rates: { weekly: ['Weekly rate must be greater than nightly'] }
                }
            };

            render(<Rates actionState={actionState} property={mockProperty} />);

            expect(screen.getByText('Rates (enter at least one)')).toBeInTheDocument();
            expect((screen.getByLabelText('Nightly') as HTMLInputElement).value).toBe('200');
            expect((screen.getByLabelText('Weekly') as HTMLInputElement).value).toBe('900');
            expect((screen.getByLabelText('Monthly') as HTMLInputElement).value).toBe('3000');
            expect(screen.getByText('Weekly rate must be greater than nightly')).toBeInTheDocument();
        });

        it('should handle complete user workflow', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            const weeklyInput = screen.getByLabelText('Weekly') as HTMLInputElement;
            const monthlyInput = screen.getByLabelText('Monthly') as HTMLInputElement;

            await user.type(nightlyInput, '150');
            await user.type(weeklyInput, '900');
            await user.type(monthlyInput, '3000');

            expect(nightlyInput.value).toBe('150');
            expect(weeklyInput.value).toBe('900');
            expect(monthlyInput.value).toBe('3000');
        });

        it('should maintain values during error state', () => {
            const formData = new FormData();
            formData.set('rates.nightly', '500');
            formData.set('rates.weekly', '3000');
            formData.set('rates.monthly', '10000');

            const actionState = {
                formData,
                formErrorMap: {
                    rates: ['Rates are too high'] as any
                }
            };

            render(<Rates actionState={actionState} />);

            expect((screen.getByLabelText('Nightly') as HTMLInputElement).value).toBe('500');
            expect((screen.getByLabelText('Weekly') as HTMLInputElement).value).toBe('3000');
            expect((screen.getByLabelText('Monthly') as HTMLInputElement).value).toBe('10000');
            expect(screen.getByText('Rates are too high')).toBeInTheDocument();
        });

        it('should support partial rate entry', async () => {
            const user = userEvent.setup();
            render(<Rates actionState={mockActionState} />);

            const nightlyInput = screen.getByLabelText('Nightly') as HTMLInputElement;
            await user.type(nightlyInput, '100');

            expect(nightlyInput.value).toBe('100');
            expect((screen.getByLabelText('Weekly') as HTMLInputElement).value).toBe('');
            expect((screen.getByLabelText('Monthly') as HTMLInputElement).value).toBe('');
        });
    });
});
