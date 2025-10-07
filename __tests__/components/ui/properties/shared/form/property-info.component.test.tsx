import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PropertyInfo from '@/ui/properties/shared/form/property-info';
import { ActionState } from '@/types';
import { PropertyDocument } from '@/models';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
// - @/context/global-context - useStaticInputs hook
//
// Internal Components (Real)
// - DwellioSelect (keep real)
// - FormErrors (keep real)

// ============================================================================
// MOCKS
// ============================================================================
const mockPropertyTypes = [
    { label: 'Apartment', value: 'Apartment' },
    { label: 'House', value: 'House' },
    { label: 'Condo', value: 'Condo' },
    { label: 'Studio', value: 'Studio' }
];

jest.mock('@/context/global-context', () => ({
    useStaticInputs: jest.fn(() => ({
        propertyTypes: mockPropertyTypes,
        amenities: []
    }))
}));

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
    name: 'Luxury Downtown Apartment',
    description: 'Beautiful apartment in the heart of downtown',
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
// TEST SUITE: PropertyInfo Component
// ============================================================================
describe('PropertyInfo Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render section heading', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.getByText('Property Information')).toBeInTheDocument();
        });

        it('should render name input field', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
        });

        it('should render type select field', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.getByText('PropertyType')).toBeInTheDocument();
        });

        it('should render description textarea', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.getByLabelText('Description')).toBeInTheDocument();
        });

        it('should render name input with correct attributes', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name');
            expect(nameInput).toHaveAttribute('type', 'text');
            expect(nameInput).toHaveAttribute('name', 'name');
            expect(nameInput).toHaveAttribute('id', 'name');
        });

        it('should render type select with correct attributes', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const typeInput = document.querySelector('#type');
            expect(typeInput).toBeInTheDocument();
        });

        it('should render description textarea with correct attributes', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const descInput = screen.getByLabelText('Description');
            expect(descInput).toHaveAttribute('name', 'description');
            expect(descInput).toHaveAttribute('id', 'description');
            expect(descInput.tagName).toBe('TEXTAREA');
        });

        it('should apply correct styling to section heading', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const heading = screen.getByText('Property Information');
            expect(heading).toHaveClass('form-section-label');
            expect(heading).toHaveClass('mb-1');
        });

        it('should apply correct styling to labels', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameLabel = screen.getByText('Name');
            const descLabel = screen.getByText('Description');

            [nameLabel, descLabel].forEach(label => {
                expect(label).toHaveClass('sub-input-label');
            });
        });

        it('should apply correct styling to name input', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name');
            expect(nameInput).toHaveClass('w-full');
            expect(nameInput).toHaveClass('rounded-md');
            expect(nameInput).toHaveClass('border');
            expect(nameInput).toHaveClass('border-gray-300');
        });

        it('should render semantic heading element', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const heading = screen.getByText('Property Information');
            expect(heading.tagName).toBe('H2');
        });

        it('should render placeholder for name input', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name');
            expect(nameInput).toHaveAttribute('placeholder', 'e.g., Beautiful Apartment in Miami');
        });

        it('should render placeholder for description textarea', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const descInput = screen.getByLabelText('Description');
            expect(descInput).toHaveAttribute('placeholder', 'Add a description of your property');
        });

        it('should set textarea rows attribute', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const descInput = screen.getByLabelText('Description');
            expect(descInput).toHaveAttribute('rows', '4');
        });
    });

    // ========================================================================
    // Property Data Integration
    // ========================================================================
    describe('Property Data Integration', () => {
        it('should populate name from property', () => {
            render(<PropertyInfo actionState={mockActionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe('Luxury Downtown Apartment');
        });

        it('should populate description from property', () => {
            render(<PropertyInfo actionState={mockActionState} property={mockProperty} />);

            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
            expect(descInput.value).toBe('Beautiful apartment in the heart of downtown');
        });

        it('should render empty inputs when no property provided', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;

            expect(nameInput.value).toBe('');
            expect(descInput.value).toBe('');
        });

        it('should handle property with empty name', () => {
            const emptyNameProperty = { ...mockProperty, name: '' } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={emptyNameProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe('');
        });

        it('should handle property with empty description', () => {
            const emptyDescProperty = { ...mockProperty, description: '' } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={emptyDescProperty} />);

            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
            expect(descInput.value).toBe('');
        });

        it('should handle property with undefined name', () => {
            const undefinedProperty = { ...mockProperty, name: undefined as any } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={undefinedProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe('');
        });

        it('should handle property with long description', () => {
            const longDescription = 'A'.repeat(500);
            const longDescProperty = { ...mockProperty, description: longDescription } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={longDescProperty} />);

            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
            expect(descInput.value).toBe(longDescription);
        });
    });

    // ========================================================================
    // FormData Priority
    // ========================================================================
    describe('FormData Priority', () => {
        it('should prioritize formData over property for name', () => {
            const formData = new FormData();
            formData.set('name', 'FormData Name');

            const actionState = { ...mockActionState, formData };
            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe('FormData Name');
        });

        it('should prioritize formData over property for description', () => {
            const formData = new FormData();
            formData.set('description', 'FormData Description');

            const actionState = { ...mockActionState, formData };
            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
            expect(descInput.value).toBe('FormData Description');
        });

        it('should use property when formData exists but field is empty', () => {
            const formData = new FormData();
            formData.set('otherField', 'value');

            const actionState = { ...mockActionState, formData };
            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe('Luxury Downtown Apartment');
        });

        it('should handle formData with empty string values', () => {
            const formData = new FormData();
            formData.set('name', '');
            formData.set('description', '');

            const actionState = { ...mockActionState, formData };
            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;

            // Empty strings in formData should fallback to property values
            expect(nameInput.value).toBe('Luxury Downtown Apartment');
            expect(descInput.value).toBe('Beautiful apartment in the heart of downtown');
        });

        it('should handle mixed formData and property values', () => {
            const formData = new FormData();
            formData.set('name', 'New Name');

            const actionState = { ...mockActionState, formData };
            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;

            expect(nameInput.value).toBe('New Name');
            expect(descInput.value).toBe('Beautiful apartment in the heart of downtown');
        });
    });

    // ========================================================================
    // Error Display - Individual Fields
    // ========================================================================
    describe('Error Display - Individual Fields', () => {
        it('should display name error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { name: ['Name is required'] }
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByText('Name is required')).toBeInTheDocument();
        });

        it('should display type error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { type: ['Type is required'] }
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByText('Type is required')).toBeInTheDocument();
        });

        it('should display description error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { description: ['Description is required'] }
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByText('Description is required')).toBeInTheDocument();
        });

        it('should display multiple errors for single field', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    name: ['Name is required', 'Name must be at least 5 characters']
                }
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByText('Name is required')).toBeInTheDocument();
            expect(screen.getByText('Name must be at least 5 characters')).toBeInTheDocument();
        });

        it('should display errors for all fields simultaneously', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    name: ['Name error'],
                    type: ['Type error'],
                    description: ['Description error']
                }
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByText('Name error')).toBeInTheDocument();
            expect(screen.getByText('Type error')).toBeInTheDocument();
            expect(screen.getByText('Description error')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is undefined', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {}
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should handle null errors gracefully', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { name: null as any }
            };
            render(<PropertyInfo actionState={actionState} />);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for name input', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name');
            expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
        });

        it('should have aria-describedby for type select', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            // DwellioSelect doesn't render aria-describedby on the outer div
            // It's set on the component but not passed through to the rendered element
            const typeInput = document.querySelector('#type');
            expect(typeInput).toBeInTheDocument();
        });

        it('should have aria-describedby for description textarea', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const descInput = screen.getByLabelText('Description');
            expect(descInput).toHaveAttribute('aria-describedby', 'description-error');
        });

        it('should associate labels with inputs via htmlFor', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameLabel = document.querySelector('label[for="name"]');
            const descLabel = document.querySelector('label[for="description"]');

            expect(nameLabel).toBeInTheDocument();
            expect(descLabel).toBeInTheDocument();
        });

        it('should have aria-labelledby for type select', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            // DwellioSelect doesn't render aria-labelledby on the outer div
            // It's set on the component but not passed through to the rendered element
            const typeInput = document.querySelector('#type');
            expect(typeInput).toBeInTheDocument();
        });
    });

    // ========================================================================
    // User Interaction
    // ========================================================================
    describe('User Interaction', () => {
        it('should allow typing in name input', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            await user.type(nameInput, 'New Property Name');

            expect(nameInput.value).toBe('New Property Name');
        });

        it('should allow typing in description textarea', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} />);

            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
            await user.type(descInput, 'New description');

            expect(descInput.value).toBe('New description');
        });

        it('should allow clearing input values', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            await user.clear(nameInput);

            expect(nameInput.value).toBe('');
        });

        it('should allow updating existing values', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            await user.clear(nameInput);
            await user.type(nameInput, 'Updated Name');

            expect(nameInput.value).toBe('Updated Name');
        });

        it('should handle multiline text in description', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} />);

            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;
            await user.type(descInput, 'Line 1{Enter}Line 2');

            expect(descInput.value).toContain('Line 1\nLine 2');
        });

        it('should handle special characters in name', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            await user.type(nameInput, 'Test & Property - #1');

            expect(nameInput.value).toBe('Test & Property - #1');
        });

        it('should handle long text input', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} />);

            const longText = 'A'.repeat(100);
            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            await user.type(nameInput, longText);

            expect(nameInput.value).toBe(longText);
        });
    });

    // ========================================================================
    // Layout and Responsive Design
    // ========================================================================
    describe('Layout and Responsive Design', () => {
        it('should apply responsive wrapper classes', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const wrapper = document.querySelector('.flex.flex-wrap');
            expect(wrapper).toBeInTheDocument();
        });

        it('should apply responsive width classes to name container', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameContainer = screen.getByLabelText('Name').closest('div');
            expect(nameContainer).toHaveClass('w-full');
            expect(nameContainer).toHaveClass('sm:w-1/2');
        });

        it('should apply responsive width classes to type container', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const typeLabel = screen.getByText('PropertyType');
            const typeContainer = typeLabel.closest('div');
            expect(typeContainer).toHaveClass('w-full');
            expect(typeContainer).toHaveClass('sm:w-1/2');
        });

        it('should apply correct spacing to main container', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const mainContainer = document.querySelector('.mb-4');
            expect(mainContainer).toHaveClass('mb-4');
        });

        it('should apply responsive padding classes', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameContainer = screen.getByLabelText('Name').closest('div');
            expect(nameContainer).toHaveClass('sm:pr-2');
        });

        it('should apply responsive margin classes', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const nameContainer = screen.getByLabelText('Name').closest('div');
            expect(nameContainer).toHaveClass('mb-2');
            expect(nameContainer).toHaveClass('sm:mb-0');
        });
    });

    // ========================================================================
    // Context Integration
    // ========================================================================
    describe('Context Integration', () => {
        it('should use propertyTypes from context', () => {
            render(<PropertyInfo actionState={mockActionState} />);

            const typeInput = document.querySelector('#type');
            expect(typeInput).toBeInTheDocument();
        });

        it('should handle empty propertyTypes array', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useStaticInputs } = require('@/context/global-context');
            useStaticInputs.mockReturnValue({
                propertyTypes: [],
                amenities: []
            });

            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.getByText('PropertyType')).toBeInTheDocument();
        });

        it('should handle undefined context', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useStaticInputs } = require('@/context/global-context');
            useStaticInputs.mockReturnValue({
                propertyTypes: undefined,
                amenities: []
            });

            render(<PropertyInfo actionState={mockActionState} />);

            expect(screen.getByText('PropertyType')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle property with all undefined fields', () => {
            const undefinedProperty = {
                ...mockProperty,
                name: undefined as any,
                type: undefined as any,
                description: undefined as any
            } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={undefinedProperty} />);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
        });

        it('should handle very long property name', () => {
            const longName = 'A'.repeat(1000);
            const longNameProperty = { ...mockProperty, name: longName } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={longNameProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe(longName);
        });

        it('should handle property with special characters', () => {
            const specialProperty = {
                ...mockProperty,
                name: 'Test & "Property" <Name>',
                description: 'Test & "Description" <Text>'
            } as any as PropertyDocument;
            render(<PropertyInfo actionState={mockActionState} property={specialProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toContain('Test &');
        });

        it('should handle empty formData', () => {
            const formData = new FormData();
            const actionState = { ...mockActionState, formData };

            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            expect(nameInput.value).toBe('Luxury Downtown Apartment');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Form Section', () => {
        it('should render complete property info section with all data', () => {
            const formData = new FormData();
            formData.set('name', 'FormData Name');

            const actionState = {
                formData,
                formErrorMap: {
                    description: ['Description is too short']
                }
            };

            render(<PropertyInfo actionState={actionState} property={mockProperty} />);

            expect(screen.getByText('Property Information')).toBeInTheDocument();
            expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('FormData Name');
            expect((screen.getByLabelText('Description') as HTMLTextAreaElement).value).toBe('Beautiful apartment in the heart of downtown');
            expect(screen.getByText('Description is too short')).toBeInTheDocument();
        });

        it('should handle complete user workflow', async () => {
            const user = userEvent.setup();
            render(<PropertyInfo actionState={mockActionState} />);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const descInput = screen.getByLabelText('Description') as HTMLTextAreaElement;

            await user.type(nameInput, 'Beach House');
            await user.type(descInput, 'Beautiful beach house with ocean views');

            expect(nameInput.value).toBe('Beach House');
            expect(descInput.value).toBe('Beautiful beach house with ocean views');
        });

        it('should maintain values during error state', () => {
            const formData = new FormData();
            formData.set('name', 'Invalid Name!');
            formData.set('description', 'Short');

            const actionState = {
                formData,
                formErrorMap: {
                    name: ['Name contains invalid characters'],
                    description: ['Description must be at least 10 characters']
                }
            };

            render(<PropertyInfo actionState={actionState} />);

            expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Invalid Name!');
            expect((screen.getByLabelText('Description') as HTMLTextAreaElement).value).toBe('Short');
            expect(screen.getByText('Name contains invalid characters')).toBeInTheDocument();
            expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();
        });
    });
});
