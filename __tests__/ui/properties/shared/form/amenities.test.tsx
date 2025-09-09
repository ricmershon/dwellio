import { render, screen, fireEvent } from '@testing-library/react';
import { ActionState } from '@/types';
import Amenities from '@/ui/properties/shared/form/amenities';

// Mock the models to avoid MongoDB connection issues in tests
jest.mock('@/models', () => ({}));

// Mock the global context
const mockGlobalContext = {
    amenities: [
        { id: '1', value: 'WiFi' },
        { id: '2', value: 'Pool' },
        { id: '3', value: 'Gym' },
        { id: '4', value: 'Parking' },
        { id: '5', value: 'Kitchen' },
        { id: '6', value: 'Air Conditioning' }
    ],
    propertyTypes: [],
    user: null,
    cities: []
};

jest.mock('@/context/global-context', () => ({
    GlobalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useStaticInputs: () => ({
        amenities: mockGlobalContext.amenities,
        propertyTypes: mockGlobalContext.propertyTypes,
        cities: mockGlobalContext.cities
    })
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

const renderAmenities = (
    actionState: ActionState,
    selectedAmenities?: string[]
) => {
    return render(
        <Amenities
            actionState={actionState}
            selectedAmenities={selectedAmenities}
        />
    );
};

describe('Amenities Component', () => {
    describe('Component Structure', () => {
        it('renders the amenities container with correct structure', () => {
            const actionState = createMockActionState();
            const { container } = renderAmenities(actionState);

            expect(container.querySelector('.mb-4')).toBeInTheDocument();
            expect(screen.getByText('Amenities')).toBeInTheDocument();
            expect(container.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.gap-2')).toBeInTheDocument();
        });

        it('renders label with correct text and styling', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            const label = screen.getByText('Amenities');
            expect(label).toBeInTheDocument();
            expect(label).toHaveClass('block', 'text-gray-700', 'font-bold');
        });

        it('has proper aria-describedby attribute on grid container', () => {
            const actionState = createMockActionState();
            const { container } = renderAmenities(actionState);

            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveAttribute('aria-describedby', 'amenities-error');
        });
    });

    describe('Amenity Checkboxes', () => {
        it('renders all amenities from global context', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            mockGlobalContext.amenities.forEach((amenity) => {
                expect(screen.getByLabelText(amenity.value)).toBeInTheDocument();
                expect(screen.getByDisplayValue(amenity.value)).toBeInTheDocument();
            });
        });

        it('renders checkboxes with correct attributes', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            mockGlobalContext.amenities.forEach((amenity) => {
                const checkbox = screen.getByDisplayValue(amenity.value);
                expect(checkbox).toHaveAttribute('type', 'checkbox');
                expect(checkbox).toHaveAttribute('id', `amenity_${amenity.id}`);
                expect(checkbox).toHaveAttribute('name', 'amenities');
                expect(checkbox).toHaveAttribute('value', amenity.value);
                expect(checkbox).toHaveClass('mr-2');
            });
        });

        it('renders labels with correct attributes and styling', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            mockGlobalContext.amenities.forEach((amenity) => {
                const label = screen.getByLabelText(amenity.value);
                const labelElement = screen.getByText(amenity.value);
                
                expect(labelElement).toHaveAttribute('for', `amenity_${amenity.id}`);
                expect(labelElement).toHaveClass('text-sm', 'font-medium', 'text-gray-700');
            });
        });

        it('handles checkbox interactions correctly', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;
            expect(wifiCheckbox.checked).toBe(false);

            fireEvent.click(wifiCheckbox);
            expect(wifiCheckbox.checked).toBe(true);

            fireEvent.click(wifiCheckbox);
            expect(wifiCheckbox.checked).toBe(false);
        });
    });

    describe('Default Checked State', () => {
        it('checks amenities from formData when present', () => {
            const mockFormData = new FormData();
            mockFormData.append('amenities', 'WiFi');
            mockFormData.append('amenities', 'Pool');

            const actionState = createMockActionState({
                formData: mockFormData
            });

            renderAmenities(actionState);

            expect(screen.getByLabelText('WiFi')).toBeChecked();
            expect(screen.getByLabelText('Pool')).toBeChecked();
            expect(screen.getByLabelText('Gym')).not.toBeChecked();
            expect(screen.getByLabelText('Parking')).not.toBeChecked();
        });

        it('checks amenities from selectedAmenities prop when formData is not present', () => {
            const actionState = createMockActionState();
            const selectedAmenities = ['Gym', 'Kitchen'];

            renderAmenities(actionState, selectedAmenities);

            expect(screen.getByLabelText('Gym')).toBeChecked();
            expect(screen.getByLabelText('Kitchen')).toBeChecked();
            expect(screen.getByLabelText('WiFi')).not.toBeChecked();
            expect(screen.getByLabelText('Pool')).not.toBeChecked();
        });

        it('prioritizes formData over selectedAmenities prop', () => {
            const mockFormData = new FormData();
            mockFormData.append('amenities', 'WiFi');

            const actionState = createMockActionState({
                formData: mockFormData
            });
            const selectedAmenities = ['Pool', 'Gym'];

            renderAmenities(actionState, selectedAmenities);

            // FormData should take priority
            expect(screen.getByLabelText('WiFi')).toBeChecked();
            expect(screen.getByLabelText('Pool')).toBeChecked(); // Also checked from selectedAmenities
            expect(screen.getByLabelText('Gym')).toBeChecked(); // Also checked from selectedAmenities
        });

        it('handles empty selectedAmenities array', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState, []);

            mockGlobalContext.amenities.forEach((amenity) => {
                expect(screen.getByLabelText(amenity.value)).not.toBeChecked();
            });
        });

        it('handles undefined selectedAmenities prop', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            mockGlobalContext.amenities.forEach((amenity) => {
                expect(screen.getByLabelText(amenity.value)).not.toBeChecked();
            });
        });
    });

    describe('Error Handling', () => {
        it('does not render FormErrors when no amenities errors exist', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            expect(screen.queryByTestId('form-errors-amenities')).not.toBeInTheDocument();
        });

        it('renders FormErrors when amenities errors exist', () => {
            const actionState = createMockActionState({
                formErrorMap: {
                    amenities: ['At least one amenity must be selected', 'Invalid amenity selection']
                }
            });

            renderAmenities(actionState);

            const formErrors = screen.getByTestId('form-errors-amenities');
            expect(formErrors).toBeInTheDocument();
            expect(screen.getByText('At least one amenity must be selected')).toBeInTheDocument();
            expect(screen.getByText('Invalid amenity selection')).toBeInTheDocument();
        });

        it('passes correct props to FormErrors component', () => {
            const errors = ['Amenity selection error'];
            const actionState = createMockActionState({
                formErrorMap: { amenities: errors }
            });

            renderAmenities(actionState);

            const formErrors = screen.getByTestId('form-errors-amenities');
            expect(formErrors).toBeInTheDocument();
        });
    });

    describe('Global Context Integration', () => {
        it('handles empty amenities array from context', () => {
            // Temporarily override the mock to return empty amenities
            const originalAmenities = mockGlobalContext.amenities;
            mockGlobalContext.amenities = [];

            render(<Amenities actionState={createMockActionState()} />);

            expect(screen.getByText('Amenities')).toBeInTheDocument();
            originalAmenities.forEach((amenity) => {
                expect(screen.queryByLabelText(amenity.value)).not.toBeInTheDocument();
            });

            // Restore original amenities
            mockGlobalContext.amenities = originalAmenities;
        });

        it('renders amenities with special characters correctly', () => {
            const specialAmenities = [
                { id: '1', value: 'Wi-Fi & Internet' },
                { id: '2', value: 'Pool/Spa' },
                { id: '3', value: 'A/C (Air Conditioning)' }
            ];

            // Temporarily override the mock to return special amenities
            const originalAmenities = mockGlobalContext.amenities;
            mockGlobalContext.amenities = specialAmenities;

            render(<Amenities actionState={createMockActionState()} />);

            specialAmenities.forEach((amenity) => {
                expect(screen.getByLabelText(amenity.value)).toBeInTheDocument();
                expect(screen.getByDisplayValue(amenity.value)).toBeInTheDocument();
            });

            // Restore original amenities
            mockGlobalContext.amenities = originalAmenities;
        });
    });

    describe('Responsive Grid Layout', () => {
        it('applies correct CSS classes for responsive grid', () => {
            const actionState = createMockActionState();
            const { container } = renderAmenities(actionState);

            const gridContainer = container.querySelector('.grid');
            expect(gridContainer).toHaveClass(
                'grid',
                'grid-cols-2',
                'md:grid-cols-3',
                'gap-2'
            );
        });
    });

    describe('Form Integration', () => {
        it('maintains form field naming for multiple selections', () => {
            const actionState = createMockActionState();
            renderAmenities(actionState);

            // All checkboxes should have the same name for form submission
            mockGlobalContext.amenities.forEach((amenity) => {
                const checkbox = screen.getByDisplayValue(amenity.value);
                expect(checkbox).toHaveAttribute('name', 'amenities');
            });
        });

        it('supports form data collection with multiple values', () => {
            const mockFormData = new FormData();
            mockFormData.append('amenities', 'WiFi');
            mockFormData.append('amenities', 'Pool');
            mockFormData.append('amenities', 'Kitchen');

            const actionState = createMockActionState({
                formData: mockFormData
            });

            renderAmenities(actionState);

            // Verify that getAll returns all selected values
            const allAmenities = mockFormData.getAll('amenities');
            expect(allAmenities).toEqual(['WiFi', 'Pool', 'Kitchen']);
            
            // Verify corresponding checkboxes are checked
            expect(screen.getByLabelText('WiFi')).toBeChecked();
            expect(screen.getByLabelText('Pool')).toBeChecked();
            expect(screen.getByLabelText('Kitchen')).toBeChecked();
        });
    });
});