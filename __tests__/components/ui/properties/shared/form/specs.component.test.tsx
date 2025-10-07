import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Specs from '@/ui/properties/shared/form/specs';
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

const mockProperty: PropertyDocument = {
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
        nightly: 100,
        weekly: 600,
        monthly: 2000
    },
    owner: 'user123',
    imagesData: [],
    isFeatured: false,
    createdAt: new Date()
} as any as PropertyDocument;

// ============================================================================
// TEST SUITE: Specs Component
// ============================================================================
describe('Specs Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render section heading', () => {
            render(<Specs actionState={mockActionState} />);

            expect(screen.getByText('Specs')).toBeInTheDocument();
        });

        it('should render all three input fields', () => {
            render(<Specs actionState={mockActionState} />);

            expect(screen.getByLabelText('Beds')).toBeInTheDocument();
            expect(screen.getByLabelText('Baths')).toBeInTheDocument();
            expect(screen.getByLabelText('Square Feet')).toBeInTheDocument();
        });

        it('should render inputs with correct types', () => {
            render(<Specs actionState={mockActionState} />);

            const bedsInput = screen.getByLabelText('Beds');
            const bathsInput = screen.getByLabelText('Baths');
            const sqftInput = screen.getByLabelText('Square Feet');

            expect(bedsInput).toHaveAttribute('type', 'number');
            expect(bathsInput).toHaveAttribute('type', 'number');
            expect(sqftInput).toHaveAttribute('type', 'number');
        });

        it('should render inputs with correct names', () => {
            render(<Specs actionState={mockActionState} />);

            expect(screen.getByLabelText('Beds')).toHaveAttribute('name', 'beds');
            expect(screen.getByLabelText('Baths')).toHaveAttribute('name', 'baths');
            expect(screen.getByLabelText('Square Feet')).toHaveAttribute('name', 'squareFeet');
        });

        it('should render inputs with correct ids', () => {
            render(<Specs actionState={mockActionState} />);

            expect(screen.getByLabelText('Beds')).toHaveAttribute('id', 'beds');
            expect(screen.getByLabelText('Baths')).toHaveAttribute('id', 'baths');
            expect(screen.getByLabelText('Square Feet')).toHaveAttribute('id', 'squareFeet');
        });

        it('should apply correct styling to section heading', () => {
            render(<Specs actionState={mockActionState} />);

            const heading = screen.getByText('Specs');
            expect(heading).toHaveClass('form-section-label');
            expect(heading).toHaveClass('mb-1');
        });

        it('should apply correct styling to labels', () => {
            render(<Specs actionState={mockActionState} />);

            const bedsLabel = screen.getByText('Beds');
            const bathsLabel = screen.getByText('Baths');
            const sqftLabel = screen.getByText('Square Feet');

            [bedsLabel, bathsLabel, sqftLabel].forEach(label => {
                expect(label).toHaveClass('sub-input-label');
            });
        });

        it('should apply correct styling to inputs', () => {
            render(<Specs actionState={mockActionState} />);

            const inputs = [
                screen.getByLabelText('Beds'),
                screen.getByLabelText('Baths'),
                screen.getByLabelText('Square Feet')
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
    });

    // ========================================================================
    // Property Data Integration
    // ========================================================================
    describe('Property Data Integration', () => {
        it('should populate beds from property', () => {
            render(<Specs actionState={mockActionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            expect(bedsInput.value).toBe('3');
        });

        it('should populate baths from property', () => {
            render(<Specs actionState={mockActionState} property={mockProperty} />);

            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            expect(bathsInput.value).toBe('2');
        });

        it('should populate squareFeet from property', () => {
            render(<Specs actionState={mockActionState} property={mockProperty} />);

            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;
            expect(sqftInput.value).toBe('1500');
        });

        it('should render empty inputs when no property provided', () => {
            render(<Specs actionState={mockActionState} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;

            expect(bedsInput.value).toBe('');
            expect(bathsInput.value).toBe('');
            expect(sqftInput.value).toBe('');
        });

        it('should handle property with zero values', () => {
            const zeroProperty = { ...mockProperty, beds: 0, baths: 0, squareFeet: 0 } as any as PropertyDocument;
            render(<Specs actionState={mockActionState} property={zeroProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;

            expect(bedsInput.value).toBe('0');
            expect(bathsInput.value).toBe('0');
            expect(sqftInput.value).toBe('0');
        });

        it('should handle property with undefined values', () => {
            const undefinedProperty = {
                ...mockProperty,
                beds: undefined as any,
                baths: undefined as any,
                squareFeet: undefined as any
            } as any as PropertyDocument;
            render(<Specs actionState={mockActionState} property={undefinedProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;

            expect(bedsInput.value).toBe('');
            expect(bathsInput.value).toBe('');
            expect(sqftInput.value).toBe('');
        });
    });

    // ========================================================================
    // FormData Priority
    // ========================================================================
    describe('FormData Priority', () => {
        it('should prioritize formData over property for beds', () => {
            const formData = new FormData();
            formData.set('beds', '5');

            const actionState = { ...mockActionState, formData };
            render(<Specs actionState={actionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            expect(bedsInput.value).toBe('5');
        });

        it('should prioritize formData over property for baths', () => {
            const formData = new FormData();
            formData.set('baths', '3');

            const actionState = { ...mockActionState, formData };
            render(<Specs actionState={actionState} property={mockProperty} />);

            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            expect(bathsInput.value).toBe('3');
        });

        it('should prioritize formData over property for squareFeet', () => {
            const formData = new FormData();
            formData.set('squareFeet', '2500');

            const actionState = { ...mockActionState, formData };
            render(<Specs actionState={actionState} property={mockProperty} />);

            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;
            expect(sqftInput.value).toBe('2500');
        });

        it('should use property when formData exists but field is empty', () => {
            const formData = new FormData();
            formData.set('otherField', 'value');

            const actionState = { ...mockActionState, formData };
            render(<Specs actionState={actionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            expect(bedsInput.value).toBe('3');
        });

        it('should handle formData with zero values', () => {
            const formData = new FormData();
            formData.set('beds', '0');
            formData.set('baths', '0');
            formData.set('squareFeet', '0');

            const actionState = { ...mockActionState, formData };
            render(<Specs actionState={actionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;

            expect(bedsInput.value).toBe('0');
            expect(bathsInput.value).toBe('0');
            expect(sqftInput.value).toBe('0');
        });
    });

    // ========================================================================
    // Error Display
    // ========================================================================
    describe('Error Display', () => {
        it('should display beds error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { beds: ['Beds is required'] }
            };
            render(<Specs actionState={actionState} />);

            expect(screen.getByText('Beds is required')).toBeInTheDocument();
        });

        it('should display baths error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { baths: ['Baths is required'] }
            };
            render(<Specs actionState={actionState} />);

            expect(screen.getByText('Baths is required')).toBeInTheDocument();
        });

        it('should display squareFeet error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { squareFeet: ['Square feet is required'] }
            };
            render(<Specs actionState={actionState} />);

            expect(screen.getByText('Square feet is required')).toBeInTheDocument();
        });

        it('should display multiple errors for single field', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    beds: ['Beds is required', 'Beds must be a positive number']
                }
            };
            render(<Specs actionState={actionState} />);

            expect(screen.getByText('Beds is required')).toBeInTheDocument();
            expect(screen.getByText('Beds must be a positive number')).toBeInTheDocument();
        });

        it('should display errors for all fields simultaneously', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    beds: ['Beds error'],
                    baths: ['Baths error'],
                    squareFeet: ['Square feet error']
                }
            };
            render(<Specs actionState={actionState} />);

            expect(screen.getByText('Beds error')).toBeInTheDocument();
            expect(screen.getByText('Baths error')).toBeInTheDocument();
            expect(screen.getByText('Square feet error')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is null', () => {
            render(<Specs actionState={mockActionState} />);

            const errorElements = document.querySelectorAll('[id$="-error"]');
            expect(errorElements.length).toBe(0);
        });

        it('should not display errors when formErrorMap is empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {}
            };
            render(<Specs actionState={actionState} />);

            const errorMessages = document.querySelectorAll('.text-red-500');
            expect(errorMessages.length).toBe(0);
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for beds input', () => {
            render(<Specs actionState={mockActionState} />);

            const bedsInput = screen.getByLabelText('Beds');
            expect(bedsInput).toHaveAttribute('aria-describedby', 'beds-error');
        });

        it('should have aria-describedby for baths input', () => {
            render(<Specs actionState={mockActionState} />);

            const bathsInput = screen.getByLabelText('Baths');
            expect(bathsInput).toHaveAttribute('aria-describedby', 'bath-error');
        });

        it('should have aria-describedby for squareFeet input', () => {
            render(<Specs actionState={mockActionState} />);

            const sqftInput = screen.getByLabelText('Square Feet');
            expect(sqftInput).toHaveAttribute('aria-describedby', 'squareFeet-error');
        });

        it('should associate labels with inputs via htmlFor', () => {
            render(<Specs actionState={mockActionState} />);

            const bedsLabel = document.querySelector('label[for="beds"]');
            const bathsLabel = document.querySelector('label[for="baths"]');
            const sqftLabel = document.querySelector('label[for="squareFeet"]');

            expect(bedsLabel).toBeInTheDocument();
            expect(bathsLabel).toBeInTheDocument();
            expect(sqftLabel).toBeInTheDocument();
        });

        it('should have semantic heading element', () => {
            render(<Specs actionState={mockActionState} />);

            const heading = screen.getByText('Specs');
            expect(heading.tagName).toBe('H2');
        });
    });

    // ========================================================================
    // User Interaction
    // ========================================================================
    describe('User Interaction', () => {
        it('should allow typing in beds input', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            await user.type(bedsInput, '4');

            expect(bedsInput.value).toBe('4');
        });

        it('should allow typing in baths input', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            await user.type(bathsInput, '2');

            expect(bathsInput.value).toBe('2');
        });

        it('should allow typing in squareFeet input', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;
            await user.type(sqftInput, '1200');

            expect(sqftInput.value).toBe('1200');
        });

        it('should allow clearing input values', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            await user.clear(bedsInput);

            expect(bedsInput.value).toBe('');
        });

        it('should allow updating existing values', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            await user.clear(bedsInput);
            await user.type(bedsInput, '5');

            expect(bedsInput.value).toBe('5');
        });

        it('should handle negative numbers', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            await user.type(bedsInput, '-5');

            expect(bedsInput.value).toBe('-5');
        });

        it('should handle decimal numbers', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            await user.type(bathsInput, '2.5');

            expect(bathsInput.value).toBe('2.5');
        });

        it('should handle large numbers', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;
            await user.type(sqftInput, '999999');

            expect(sqftInput.value).toBe('999999');
        });
    });

    // ========================================================================
    // Layout and Responsive Design
    // ========================================================================
    describe('Layout and Responsive Design', () => {
        it('should have responsive wrapper classes', () => {
            render(<Specs actionState={mockActionState} />);

            const wrapper = document.querySelector('.flex.flex-wrap');
            expect(wrapper).toBeInTheDocument();
        });

        it('should apply responsive width classes to beds container', () => {
            render(<Specs actionState={mockActionState} />);

            const bedsContainer = screen.getByLabelText('Beds').closest('div');
            expect(bedsContainer).toHaveClass('w-full');
            expect(bedsContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply responsive width classes to baths container', () => {
            render(<Specs actionState={mockActionState} />);

            const bathsContainer = screen.getByLabelText('Baths').closest('div');
            expect(bathsContainer).toHaveClass('w-full');
            expect(bathsContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply responsive width classes to squareFeet container', () => {
            render(<Specs actionState={mockActionState} />);

            const sqftContainer = screen.getByLabelText('Square Feet').closest('div');
            expect(sqftContainer).toHaveClass('w-full');
            expect(sqftContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply correct spacing to main container', () => {
            render(<Specs actionState={mockActionState} />);

            const mainContainer = document.querySelector('.mb-4');
            expect(mainContainer).toHaveClass('mb-4');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle empty actionState gracefully', () => {
            const emptyActionState: ActionState = {
                formData: undefined,
                formErrorMap: undefined
            };
            render(<Specs actionState={emptyActionState} />);

            expect(screen.getByLabelText('Beds')).toBeInTheDocument();
            expect(screen.getByLabelText('Baths')).toBeInTheDocument();
            expect(screen.getByLabelText('Square Feet')).toBeInTheDocument();
        });

        it('should handle property with missing numeric fields', () => {
            const incompleteProperty = { ...mockProperty, beds: null as any } as any as PropertyDocument;
            render(<Specs actionState={mockActionState} property={incompleteProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            expect(bedsInput).toBeInTheDocument();
        });

        it('should handle very large numbers in property', () => {
            const largeProperty = { ...mockProperty, squareFeet: 9999999 } as any as PropertyDocument;
            render(<Specs actionState={mockActionState} property={largeProperty} />);

            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;
            expect(sqftInput.value).toBe('9999999');
        });

        it('should handle fractional values from property', () => {
            const fractionalProperty = { ...mockProperty, baths: 1.5 } as any as PropertyDocument;
            render(<Specs actionState={mockActionState} property={fractionalProperty} />);

            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            expect(bathsInput.value).toBe('1.5');
        });

        it('should handle empty formData', () => {
            const formData = new FormData();
            const actionState = { ...mockActionState, formData };

            render(<Specs actionState={actionState} property={mockProperty} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            expect(bedsInput.value).toBe('3');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Form Section', () => {
        it('should render complete specs section with all data', () => {
            const formData = new FormData();
            formData.set('beds', '4');

            const actionState = {
                formData,
                formErrorMap: {
                    baths: ['Baths must be at least 1']
                }
            };

            render(<Specs actionState={actionState} property={mockProperty} />);

            expect(screen.getByText('Specs')).toBeInTheDocument();
            expect((screen.getByLabelText('Beds') as HTMLInputElement).value).toBe('4');
            expect((screen.getByLabelText('Baths') as HTMLInputElement).value).toBe('2');
            expect((screen.getByLabelText('Square Feet') as HTMLInputElement).value).toBe('1500');
            expect(screen.getByText('Baths must be at least 1')).toBeInTheDocument();
        });

        it('should handle complete user workflow', async () => {
            const user = userEvent.setup();
            render(<Specs actionState={mockActionState} />);

            const bedsInput = screen.getByLabelText('Beds') as HTMLInputElement;
            const bathsInput = screen.getByLabelText('Baths') as HTMLInputElement;
            const sqftInput = screen.getByLabelText('Square Feet') as HTMLInputElement;

            await user.type(bedsInput, '3');
            await user.type(bathsInput, '2');
            await user.type(sqftInput, '1200');

            expect(bedsInput.value).toBe('3');
            expect(bathsInput.value).toBe('2');
            expect(sqftInput.value).toBe('1200');
        });

        it('should maintain values during error state', () => {
            const formData = new FormData();
            formData.set('beds', '10');
            formData.set('baths', '5');
            formData.set('squareFeet', '3000');

            const actionState = {
                formData,
                formErrorMap: {
                    beds: ['Too many beds'],
                    baths: ['Too many baths'],
                    squareFeet: ['Square feet too large']
                }
            };

            render(<Specs actionState={actionState} />);

            expect((screen.getByLabelText('Beds') as HTMLInputElement).value).toBe('10');
            expect((screen.getByLabelText('Baths') as HTMLInputElement).value).toBe('5');
            expect((screen.getByLabelText('Square Feet') as HTMLInputElement).value).toBe('3000');
            expect(screen.getByText('Too many beds')).toBeInTheDocument();
            expect(screen.getByText('Too many baths')).toBeInTheDocument();
            expect(screen.getByText('Square feet too large')).toBeInTheDocument();
        });
    });
});
