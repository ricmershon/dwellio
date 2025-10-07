import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Amenities from '@/ui/properties/shared/form/amenities';
import { ActionState } from '@/types';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
// - @/context/global-context - useStaticInputs hook
//
// Internal Components (Real)
// - FormErrors (keep real)

// ============================================================================
// MOCKS
// ============================================================================
const mockAmenities = [
    { id: 1, value: 'WiFi' },
    { id: 2, value: 'Parking' },
    { id: 3, value: 'Pool' },
    { id: 4, value: 'Gym' },
    { id: 5, value: 'Air Conditioning' },
    { id: 6, value: 'Heating' }
];

jest.mock('@/context/global-context', () => ({
    useStaticInputs: jest.fn(() => ({
        propertyTypes: [],
        amenities: mockAmenities
    }))
}));

// ============================================================================
// TEST DATA
// ============================================================================
const mockActionState: ActionState = {
    formData: undefined,
    formErrorMap: undefined
};

// ============================================================================
// TEST SUITE: Amenities Component
// ============================================================================
describe('Amenities Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock to default amenities
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useStaticInputs } = require('@/context/global-context');
        useStaticInputs.mockReturnValue({
            propertyTypes: [],
            amenities: mockAmenities
        });
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render section label', () => {
            render(<Amenities actionState={mockActionState} />);

            expect(screen.getByText('Amenities')).toBeInTheDocument();
        });

        it('should render all amenities from context', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                expect(screen.getByText(amenity.value)).toBeInTheDocument();
            });
        });

        it('should render checkboxes for all amenities', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`);
                expect(checkbox).toBeInTheDocument();
            });
        });

        it('should render checkboxes with correct type', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`);
                expect(checkbox).toHaveAttribute('type', 'checkbox');
            });
        });

        it('should render checkboxes with correct name attribute', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`);
                expect(checkbox).toHaveAttribute('name', 'amenities');
            });
        });

        it('should render checkboxes with correct value attribute', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`);
                expect(checkbox).toHaveAttribute('value', amenity.value);
            });
        });

        it('should render checkboxes with correct id', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`);
                expect(checkbox).toHaveAttribute('id', `amenity_${amenity.id}`);
            });
        });

        it('should apply correct styling to section label', () => {
            render(<Amenities actionState={mockActionState} />);

            const label = screen.getByText('Amenities');
            expect(label).toHaveClass('form-section-label');
        });

        it('should apply grid layout classes', () => {
            render(<Amenities actionState={mockActionState} />);

            const grid = document.querySelector('.grid');
            expect(grid).toHaveClass('grid-cols-2');
            expect(grid).toHaveClass('md:grid-cols-3');
            expect(grid).toHaveClass('gap-2');
        });

        it('should apply spacing to checkboxes', () => {
            render(<Amenities actionState={mockActionState} />);

            const firstCheckbox = document.querySelector('#amenity_1');
            expect(firstCheckbox).toHaveClass('mr-2');
        });

        it('should associate labels with checkboxes via htmlFor', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const label = document.querySelector(`label[for="amenity_${amenity.id}"]`);
                expect(label).toBeInTheDocument();
            });
        });

        it('should apply correct styling to labels', () => {
            render(<Amenities actionState={mockActionState} />);

            const labels = document.querySelectorAll('label[for^="amenity_"]');
            labels.forEach(label => {
                expect(label).toHaveClass('text-sm');
                expect(label).toHaveClass('font-medium');
            });
        });

        it('should render semantic label element', () => {
            render(<Amenities actionState={mockActionState} />);

            const label = screen.getByText('Amenities');
            expect(label.tagName).toBe('LABEL');
        });
    });

    // ========================================================================
    // Selected Amenities Integration
    // ========================================================================
    describe('Selected Amenities Integration', () => {
        it('should check amenities from selectedAmenities prop', () => {
            const selectedAmenities = ['WiFi', 'Parking'];
            render(<Amenities actionState={mockActionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            const parkingCheckbox = document.querySelector('#amenity_2') as HTMLInputElement;
            const poolCheckbox = document.querySelector('#amenity_3') as HTMLInputElement;

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(poolCheckbox.checked).toBe(false);
        });

        it('should handle empty selectedAmenities array', () => {
            render(<Amenities actionState={mockActionState} selectedAmenities={[]} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`) as HTMLInputElement;
                expect(checkbox.checked).toBe(false);
            });
        });

        it('should handle undefined selectedAmenities', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`) as HTMLInputElement;
                expect(checkbox.checked).toBe(false);
            });
        });

        it('should check all amenities when all are selected', () => {
            const allAmenities = mockAmenities.map(a => a.value);
            render(<Amenities actionState={mockActionState} selectedAmenities={allAmenities} />);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`) as HTMLInputElement;
                expect(checkbox.checked).toBe(true);
            });
        });

        it('should handle case-sensitive matching', () => {
            const selectedAmenities = ['wifi']; // lowercase
            render(<Amenities actionState={mockActionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            expect(wifiCheckbox.checked).toBe(false); // Should not match due to case difference
        });

        it('should handle partial selection', () => {
            const selectedAmenities = ['Pool', 'Gym', 'Heating'];
            render(<Amenities actionState={mockActionState} selectedAmenities={selectedAmenities} />);

            const poolCheckbox = document.querySelector('#amenity_3') as HTMLInputElement;
            const gymCheckbox = document.querySelector('#amenity_4') as HTMLInputElement;
            const heatingCheckbox = document.querySelector('#amenity_6') as HTMLInputElement;
            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;

            expect(poolCheckbox.checked).toBe(true);
            expect(gymCheckbox.checked).toBe(true);
            expect(heatingCheckbox.checked).toBe(true);
            expect(wifiCheckbox.checked).toBe(false);
        });
    });

    // ========================================================================
    // FormData Integration
    // ========================================================================
    describe('FormData Integration', () => {
        it('should check amenities from both formData and selectedAmenities', () => {
            const formData = new FormData();
            formData.append('amenities', 'Pool');
            formData.append('amenities', 'Gym');

            const actionState = { ...mockActionState, formData };
            const selectedAmenities = ['WiFi', 'Parking'];

            render(<Amenities actionState={actionState} selectedAmenities={selectedAmenities} />);

            const poolCheckbox = document.querySelector('#amenity_3') as HTMLInputElement;
            const gymCheckbox = document.querySelector('#amenity_4') as HTMLInputElement;
            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            const parkingCheckbox = document.querySelector('#amenity_2') as HTMLInputElement;

            // Both formData and selectedAmenities should be checked (OR logic)
            expect(poolCheckbox.checked).toBe(true);
            expect(gymCheckbox.checked).toBe(true);
            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
        });

        it('should use selectedAmenities when formData exists but amenities field is empty', () => {
            const formData = new FormData();
            formData.set('otherField', 'value');

            const actionState = { ...mockActionState, formData };
            const selectedAmenities = ['WiFi'];

            render(<Amenities actionState={actionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            expect(wifiCheckbox.checked).toBe(true);
        });

        it('should handle formData with multiple values', () => {
            const formData = new FormData();
            formData.append('amenities', 'WiFi');
            formData.append('amenities', 'Parking');
            formData.append('amenities', 'Pool');

            const actionState = { ...mockActionState, formData };
            render(<Amenities actionState={actionState} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            const parkingCheckbox = document.querySelector('#amenity_2') as HTMLInputElement;
            const poolCheckbox = document.querySelector('#amenity_3') as HTMLInputElement;

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(poolCheckbox.checked).toBe(true);
        });

        it('should handle empty formData array', () => {
            const formData = new FormData();
            const actionState = { ...mockActionState, formData };
            const selectedAmenities = ['WiFi'];

            render(<Amenities actionState={actionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            expect(wifiCheckbox.checked).toBe(true);
        });
    });

    // ========================================================================
    // Error Display
    // ========================================================================
    describe('Error Display', () => {
        it('should display amenities error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { amenities: ['At least one amenity is required'] }
            };
            render(<Amenities actionState={actionState} />);

            expect(screen.getByText('At least one amenity is required')).toBeInTheDocument();
        });

        it('should display multiple errors for amenities', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    amenities: ['Error 1', 'Error 2']
                }
            };
            render(<Amenities actionState={actionState} />);

            expect(screen.getByText('Error 1')).toBeInTheDocument();
            expect(screen.getByText('Error 2')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is undefined', () => {
            render(<Amenities actionState={mockActionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {}
            };
            render(<Amenities actionState={actionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should handle null errors gracefully', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { amenities: null as any }
            };
            render(<Amenities actionState={actionState} />);

            expect(screen.getByText('Amenities')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for grid container', () => {
            render(<Amenities actionState={mockActionState} />);

            const grid = document.querySelector('.grid');
            expect(grid).toHaveAttribute('aria-describedby', 'amenities-error');
        });

        it('should associate labels with checkboxes', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                const checkbox = screen.getByLabelText(amenity.value);
                expect(checkbox).toBeInTheDocument();
            });
        });

        it('should render accessible label element', () => {
            render(<Amenities actionState={mockActionState} />);

            const label = screen.getByText('Amenities');
            expect(label.tagName).toBe('LABEL');
        });
    });

    // ========================================================================
    // User Interaction
    // ========================================================================
    describe('User Interaction', () => {
        it('should allow checking a checkbox', async () => {
            const user = userEvent.setup();
            render(<Amenities actionState={mockActionState} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            await user.click(wifiCheckbox);

            expect(wifiCheckbox.checked).toBe(true);
        });

        it('should allow unchecking a checkbox', async () => {
            const user = userEvent.setup();
            const selectedAmenities = ['WiFi'];
            render(<Amenities actionState={mockActionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            expect(wifiCheckbox.checked).toBe(true);

            await user.click(wifiCheckbox);
            expect(wifiCheckbox.checked).toBe(false);
        });

        it('should allow checking multiple checkboxes', async () => {
            const user = userEvent.setup();
            render(<Amenities actionState={mockActionState} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            const parkingCheckbox = document.querySelector('#amenity_2') as HTMLInputElement;
            const poolCheckbox = document.querySelector('#amenity_3') as HTMLInputElement;

            await user.click(wifiCheckbox);
            await user.click(parkingCheckbox);
            await user.click(poolCheckbox);

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(poolCheckbox.checked).toBe(true);
        });

        it('should allow toggling checkboxes multiple times', async () => {
            const user = userEvent.setup();
            render(<Amenities actionState={mockActionState} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;

            await user.click(wifiCheckbox);
            expect(wifiCheckbox.checked).toBe(true);

            await user.click(wifiCheckbox);
            expect(wifiCheckbox.checked).toBe(false);

            await user.click(wifiCheckbox);
            expect(wifiCheckbox.checked).toBe(true);
        });

        it('should allow clicking label to toggle checkbox', async () => {
            const user = userEvent.setup();
            render(<Amenities actionState={mockActionState} />);

            const wifiLabel = screen.getByText('WiFi');
            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;

            await user.click(wifiLabel);
            expect(wifiCheckbox.checked).toBe(true);
        });

        it('should maintain independent state for each checkbox', async () => {
            const user = userEvent.setup();
            render(<Amenities actionState={mockActionState} selectedAmenities={['WiFi', 'Pool']} />);

            const parkingCheckbox = document.querySelector('#amenity_2') as HTMLInputElement;
            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            const poolCheckbox = document.querySelector('#amenity_3') as HTMLInputElement;

            await user.click(parkingCheckbox);

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(poolCheckbox.checked).toBe(true);
        });
    });

    // ========================================================================
    // Context Integration
    // ========================================================================
    describe('Context Integration', () => {
        it('should use amenities from context', () => {
            render(<Amenities actionState={mockActionState} />);

            mockAmenities.forEach(amenity => {
                expect(screen.getByText(amenity.value)).toBeInTheDocument();
            });
        });

        it('should handle empty amenities array from context', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useStaticInputs } = require('@/context/global-context');
            useStaticInputs.mockReturnValue({
                propertyTypes: [],
                amenities: []
            });

            render(<Amenities actionState={mockActionState} />);

            expect(screen.getByText('Amenities')).toBeInTheDocument();
            expect(document.querySelectorAll('input[type="checkbox"]').length).toBe(0);
        });

        it('should handle single amenity from context', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useStaticInputs } = require('@/context/global-context');
            useStaticInputs.mockReturnValue({
                propertyTypes: [],
                amenities: [{ id: 1, value: 'WiFi' }]
            });

            render(<Amenities actionState={mockActionState} />);

            expect(screen.getByText('WiFi')).toBeInTheDocument();
            expect(document.querySelectorAll('input[type="checkbox"]').length).toBe(1);
        });

        it('should handle amenities with special characters', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useStaticInputs } = require('@/context/global-context');
            useStaticInputs.mockReturnValue({
                propertyTypes: [],
                amenities: [
                    { id: 1, value: 'WiFi & Internet' },
                    { id: 2, value: '24/7 Access' }
                ]
            });

            render(<Amenities actionState={mockActionState} />);

            expect(screen.getByText('WiFi & Internet')).toBeInTheDocument();
            expect(screen.getByText('24/7 Access')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should check WiFi but ignore non-existent amenities', () => {
            const selectedAmenities = ['NonExistent', 'WiFi'];
            render(<Amenities actionState={mockActionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            // WiFi should be checked because it's in selectedAmenities
            expect(wifiCheckbox).toBeInTheDocument();
            expect(wifiCheckbox.checked).toBe(true);
        });

        it('should check WiFi from formData ignoring non-existent values', () => {
            const formData = new FormData();
            formData.append('amenities', 'NonExistent');
            formData.append('amenities', 'WiFi');

            const actionState = { ...mockActionState, formData };
            render(<Amenities actionState={actionState} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            expect(wifiCheckbox).toBeInTheDocument();
            expect(wifiCheckbox.checked).toBe(true);
        });

        it('should handle duplicate values in selectedAmenities', () => {
            const selectedAmenities = ['WiFi', 'WiFi', 'Parking'];
            render(<Amenities actionState={mockActionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = document.querySelector('#amenity_1') as HTMLInputElement;
            const parkingCheckbox = document.querySelector('#amenity_2') as HTMLInputElement;

            expect(wifiCheckbox).toBeInTheDocument();
            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
        });

        it('should handle very long amenity names', () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useStaticInputs } = require('@/context/global-context');
            useStaticInputs.mockReturnValue({
                propertyTypes: [],
                amenities: [{ id: 1, value: 'A'.repeat(100) }]
            });

            render(<Amenities actionState={mockActionState} />);

            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle amenities with unique ids', () => {
            render(<Amenities actionState={mockActionState} />);

            // Each amenity should have a unique checkbox ID
            const checkboxes = document.querySelectorAll('[id^="amenity_"]');
            expect(checkboxes.length).toBe(mockAmenities.length);

            mockAmenities.forEach(amenity => {
                const checkbox = document.querySelector(`#amenity_${amenity.id}`);
                expect(checkbox).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Form Section', () => {
        it('should render complete amenities section with all data', () => {
            const formData = new FormData();
            formData.append('amenities', 'WiFi');
            formData.append('amenities', 'Parking');

            const actionState = {
                formData,
                formErrorMap: {
                    amenities: ['Please select at least 3 amenities']
                }
            };

            render(<Amenities actionState={actionState} />);

            expect(screen.getByText('Amenities')).toBeInTheDocument();

            const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;
            const parkingCheckbox = screen.getByLabelText('Parking') as HTMLInputElement;

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(screen.getByText('Please select at least 3 amenities')).toBeInTheDocument();
        });

        it('should handle complete user workflow', async () => {
            const user = userEvent.setup();
            render(<Amenities actionState={mockActionState} />);

            const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;
            const parkingCheckbox = screen.getByLabelText('Parking') as HTMLInputElement;
            const poolCheckbox = screen.getByLabelText('Pool') as HTMLInputElement;

            await user.click(wifiCheckbox);
            await user.click(parkingCheckbox);
            await user.click(poolCheckbox);

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(poolCheckbox.checked).toBe(true);
        });

        it('should maintain selection during error state', () => {
            const selectedAmenities = ['WiFi', 'Parking'];

            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    amenities: ['Invalid amenities selected']
                }
            };

            render(<Amenities actionState={actionState} selectedAmenities={selectedAmenities} />);

            const wifiCheckbox = screen.getByLabelText('WiFi') as HTMLInputElement;
            const parkingCheckbox = screen.getByLabelText('Parking') as HTMLInputElement;

            expect(wifiCheckbox.checked).toBe(true);
            expect(parkingCheckbox.checked).toBe(true);
            expect(screen.getByText('Invalid amenities selected')).toBeInTheDocument();
        });
    });
});
