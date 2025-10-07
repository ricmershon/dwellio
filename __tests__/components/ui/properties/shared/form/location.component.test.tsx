import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Location from '@/ui/properties/shared/form/location';
import { ActionState } from '@/types';
import { PropertyDocument } from '@/models';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
// - None
//
// Internal Components (Real)
// - AddressSearch (keep real)
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
// TEST SUITE: Location Component
// ============================================================================
describe('Location Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render section heading', () => {
            render(<Location actionState={mockActionState} />);

            expect(screen.getByText('Location')).toBeInTheDocument();
        });

        it('should render city input field', () => {
            render(<Location actionState={mockActionState} />);

            expect(screen.getByLabelText('City')).toBeInTheDocument();
        });

        it('should render state input field', () => {
            render(<Location actionState={mockActionState} />);

            expect(screen.getByLabelText('State')).toBeInTheDocument();
        });

        it('should render zipcode input field', () => {
            render(<Location actionState={mockActionState} />);

            expect(screen.getByLabelText('Zip Code')).toBeInTheDocument();
        });

        it('should render AddressSearch component', () => {
            render(<Location actionState={mockActionState} />);

            expect(screen.getByLabelText('Address')).toBeInTheDocument();
        });

        it('should render city input with correct attributes', () => {
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City');
            expect(cityInput).toHaveAttribute('type', 'text');
            expect(cityInput).toHaveAttribute('name', 'location.city');
            expect(cityInput).toHaveAttribute('id', 'city');
        });

        it('should render state input with correct attributes', () => {
            render(<Location actionState={mockActionState} />);

            const stateInput = screen.getByLabelText('State');
            expect(stateInput).toHaveAttribute('type', 'text');
            expect(stateInput).toHaveAttribute('name', 'location.state');
            expect(stateInput).toHaveAttribute('id', 'state');
        });

        it('should render zipcode input with correct attributes', () => {
            render(<Location actionState={mockActionState} />);

            const zipcodeInput = screen.getByLabelText('Zip Code');
            expect(zipcodeInput).toHaveAttribute('type', 'text');
            expect(zipcodeInput).toHaveAttribute('name', 'location.zipcode');
            expect(zipcodeInput).toHaveAttribute('id', 'zipcode');
        });

        it('should apply correct styling to section heading', () => {
            render(<Location actionState={mockActionState} />);

            const heading = screen.getByText('Location');
            expect(heading).toHaveClass('form-section-label');
            expect(heading).toHaveClass('mb-1');
        });

        it('should apply correct styling to labels', () => {
            render(<Location actionState={mockActionState} />);

            const cityLabel = screen.getByText('City');
            const stateLabel = screen.getByText('State');
            const zipcodeLabel = screen.getByText('Zip Code');

            [cityLabel, stateLabel, zipcodeLabel].forEach(label => {
                expect(label).toHaveClass('sub-input-label');
            });
        });

        it('should apply correct styling to inputs', () => {
            render(<Location actionState={mockActionState} />);

            const inputs = [
                screen.getByLabelText('City'),
                screen.getByLabelText('State'),
                screen.getByLabelText('Zip Code')
            ];

            inputs.forEach(input => {
                expect(input).toHaveClass('w-full');
                expect(input).toHaveClass('rounded-md');
                expect(input).toHaveClass('border');
                expect(input).toHaveClass('border-gray-300');
            });
        });

        it('should render semantic heading element', () => {
            render(<Location actionState={mockActionState} />);

            const heading = screen.getByText('Location');
            expect(heading.tagName).toBe('H2');
        });
    });

    // ========================================================================
    // Property Data Integration
    // ========================================================================
    describe('Property Data Integration', () => {
        it('should populate city from property', () => {
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            expect(cityInput.value).toBe('New York');
        });

        it('should populate state from property', () => {
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            expect(stateInput.value).toBe('NY');
        });

        it('should populate zipcode from property', () => {
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;
            expect(zipcodeInput.value).toBe('10001');
        });

        it('should render empty inputs when no property provided', () => {
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;

            expect(cityInput.value).toBe('');
            expect(stateInput.value).toBe('');
            expect(zipcodeInput.value).toBe('');
        });

        it('should handle property with empty location fields', () => {
            const emptyLocationProperty = {
                ...mockProperty,
                location: { street: '', city: '', state: '', zipcode: '' }
            } as any as PropertyDocument;
            render(<Location actionState={mockActionState} property={emptyLocationProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            expect(cityInput.value).toBe('');
        });

        it('should handle property with partial location data', () => {
            const partialProperty = {
                ...mockProperty,
                location: { street: '123 Main St', city: 'Boston', state: '', zipcode: '' }
            } as any as PropertyDocument;
            render(<Location actionState={mockActionState} property={partialProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;

            expect(cityInput.value).toBe('Boston');
            expect(stateInput.value).toBe('');
        });

        it('should pass street to AddressSearch component', () => {
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const streetInput = screen.getByLabelText('Address') as HTMLInputElement;
            expect(streetInput.value).toBe('123 Main St');
        });
    });

    // ========================================================================
    // FormData Priority
    // ========================================================================
    describe('FormData Priority', () => {
        it('should prioritize formData over property for city', () => {
            const formData = new FormData();
            formData.set('location.city', 'Boston');

            const actionState = { ...mockActionState, formData };
            render(<Location actionState={actionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            expect(cityInput.value).toBe('Boston');
        });

        it('should prioritize formData over property for state', () => {
            const formData = new FormData();
            formData.set('location.state', 'MA');

            const actionState = { ...mockActionState, formData };
            render(<Location actionState={actionState} property={mockProperty} />);

            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            expect(stateInput.value).toBe('MA');
        });

        it('should prioritize formData over property for zipcode', () => {
            const formData = new FormData();
            formData.set('location.zipcode', '02101');

            const actionState = { ...mockActionState, formData };
            render(<Location actionState={actionState} property={mockProperty} />);

            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;
            expect(zipcodeInput.value).toBe('02101');
        });

        it('should use property when formData exists but field is empty', () => {
            const formData = new FormData();
            formData.set('otherField', 'value');

            const actionState = { ...mockActionState, formData };
            render(<Location actionState={actionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            expect(cityInput.value).toBe('New York');
        });

        it('should handle formData with empty string values', () => {
            const formData = new FormData();
            formData.set('location.city', '');
            formData.set('location.state', '');
            formData.set('location.zipcode', '');

            const actionState = { ...mockActionState, formData };
            render(<Location actionState={actionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;

            // Empty strings in formData should fallback to state values initialized from property
            expect(cityInput.value).toBe('New York');
            expect(stateInput.value).toBe('NY');
            expect(zipcodeInput.value).toBe('10001');
        });

        it('should handle mixed formData and property values', () => {
            const formData = new FormData();
            formData.set('location.city', 'Boston');

            const actionState = { ...mockActionState, formData };
            render(<Location actionState={actionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;

            expect(cityInput.value).toBe('Boston');
            expect(stateInput.value).toBe('NY');
        });
    });

    // ========================================================================
    // Error Display - Individual Fields
    // ========================================================================
    describe('Error Display - Individual Fields', () => {
        it('should display city error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: { city: ['City is required'] }
                }
            };
            render(<Location actionState={actionState} />);

            expect(screen.getByText('City is required')).toBeInTheDocument();
        });

        it('should display state error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: { state: ['State is required'] }
                }
            };
            render(<Location actionState={actionState} />);

            expect(screen.getByText('State is required')).toBeInTheDocument();
        });

        it('should display zipcode error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: { zipcode: ['Zipcode is required'] }
                }
            };
            render(<Location actionState={actionState} />);

            expect(screen.getByText('Zipcode is required')).toBeInTheDocument();
        });

        it('should display street error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: { street: ['Street is required'] }
                }
            };
            render(<Location actionState={actionState} />);

            expect(screen.getByText('Street is required')).toBeInTheDocument();
        });

        it('should display multiple errors for single field', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: {
                        city: ['City is required', 'City must be valid']
                    }
                }
            };
            render(<Location actionState={actionState} />);

            expect(screen.getByText('City is required')).toBeInTheDocument();
            expect(screen.getByText('City must be valid')).toBeInTheDocument();
        });

        it('should display errors for all fields simultaneously', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: {
                        street: ['Street error'],
                        city: ['City error'],
                        state: ['State error'],
                        zipcode: ['Zipcode error']
                    }
                }
            };
            render(<Location actionState={actionState} />);

            expect(screen.getByText('Street error')).toBeInTheDocument();
            expect(screen.getByText('City error')).toBeInTheDocument();
            expect(screen.getByText('State error')).toBeInTheDocument();
            expect(screen.getByText('Zipcode error')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is undefined', () => {
            render(<Location actionState={mockActionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should not display errors when location errors are empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { location: {} }
            };
            render(<Location actionState={actionState} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for city input', () => {
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City');
            expect(cityInput).toHaveAttribute('aria-describedby', 'city-error');
        });

        it('should have aria-describedby for state input', () => {
            render(<Location actionState={mockActionState} />);

            const stateInput = screen.getByLabelText('State');
            expect(stateInput).toHaveAttribute('aria-describedby', 'state-error');
        });

        it('should have aria-describedby for zipcode input', () => {
            render(<Location actionState={mockActionState} />);

            const zipcodeInput = screen.getByLabelText('Zip Code');
            expect(zipcodeInput).toHaveAttribute('aria-describedby', 'zipcode-error');
        });

        it('should associate labels with inputs via htmlFor', () => {
            render(<Location actionState={mockActionState} />);

            const cityLabel = document.querySelector('label[for="city"]');
            const stateLabel = document.querySelector('label[for="state"]');
            const zipcodeLabel = document.querySelector('label[for="zipcode"]');

            expect(cityLabel).toBeInTheDocument();
            expect(stateLabel).toBeInTheDocument();
            expect(zipcodeLabel).toBeInTheDocument();
        });
    });

    // ========================================================================
    // User Interaction
    // ========================================================================
    describe('User Interaction', () => {
        it('should allow typing in city input', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.type(cityInput, 'Boston');

            expect(cityInput.value).toBe('Boston');
        });

        it('should allow typing in state input', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            await user.type(stateInput, 'MA');

            expect(stateInput.value).toBe('MA');
        });

        it('should allow typing in zipcode input', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;
            await user.type(zipcodeInput, '02101');

            expect(zipcodeInput.value).toBe('02101');
        });

        it('should allow clearing input values', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.clear(cityInput);

            expect(cityInput.value).toBe('');
        });

        it('should allow updating existing values', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.clear(cityInput);
            await user.type(cityInput, 'Los Angeles');

            expect(cityInput.value).toBe('Los Angeles');
        });

        it('should update all fields independently', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;

            await user.type(cityInput, 'Boston');
            await user.type(stateInput, 'MA');
            await user.type(zipcodeInput, '02101');

            expect(cityInput.value).toBe('Boston');
            expect(stateInput.value).toBe('MA');
            expect(zipcodeInput.value).toBe('02101');
        });

        it('should handle special characters in city name', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.type(cityInput, "St. Paul's");

            expect(cityInput.value).toBe("St. Paul's");
        });

        it('should handle long city names', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const longCityName = 'A'.repeat(50);
            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.type(cityInput, longCityName);

            expect(cityInput.value).toBe(longCityName);
        });
    });

    // ========================================================================
    // Layout and Responsive Design
    // ========================================================================
    describe('Layout and Responsive Design', () => {
        it('should have responsive wrapper classes', () => {
            render(<Location actionState={mockActionState} />);

            const wrapper = document.querySelector('.flex.flex-wrap');
            expect(wrapper).toBeInTheDocument();
        });

        it('should apply responsive width classes to city container', () => {
            render(<Location actionState={mockActionState} />);

            const cityContainer = screen.getByLabelText('City').closest('div');
            expect(cityContainer).toHaveClass('w-full');
            expect(cityContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply responsive width classes to state container', () => {
            render(<Location actionState={mockActionState} />);

            const stateContainer = screen.getByLabelText('State').closest('div');
            expect(stateContainer).toHaveClass('w-full');
            expect(stateContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply responsive width classes to zipcode container', () => {
            render(<Location actionState={mockActionState} />);

            const zipcodeContainer = screen.getByLabelText('Zip Code').closest('div');
            expect(zipcodeContainer).toHaveClass('w-full');
            expect(zipcodeContainer).toHaveClass('sm:w-1/3');
        });

        it('should apply correct spacing to main container', () => {
            render(<Location actionState={mockActionState} />);

            const mainContainer = document.querySelector('.mb-4');
            expect(mainContainer).toHaveClass('mb-4');
        });

        it('should apply responsive padding classes', () => {
            render(<Location actionState={mockActionState} />);

            const cityContainer = screen.getByLabelText('City').closest('div');
            expect(cityContainer).toHaveClass('sm:pr-2');
        });

        it('should apply responsive margin classes to city container', () => {
            render(<Location actionState={mockActionState} />);

            const cityContainer = screen.getByLabelText('City').closest('div');
            expect(cityContainer).toHaveClass('mb-2');
            expect(cityContainer).toHaveClass('sm:mb-0');
        });
    });

    // ========================================================================
    // State Management
    // ========================================================================
    describe('State Management', () => {
        it('should initialize state from property on mount', () => {
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;

            expect(cityInput.value).toBe('New York');
            expect(stateInput.value).toBe('NY');
            expect(zipcodeInput.value).toBe('10001');
        });

        it('should update state when user types', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.type(cityInput, 'New City');

            expect(cityInput.value).toBe('New City');
        });

        it('should maintain controlled input behavior', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            expect(cityInput.value).toBe('New York');

            await user.clear(cityInput);
            await user.type(cityInput, 'Boston');

            expect(cityInput.value).toBe('Boston');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle property with missing location object', () => {
            const noLocationProperty = {
                ...mockProperty,
                location: undefined as any
            } as any as PropertyDocument;

            // This should throw an error since location is required
            expect(() => {
                render(<Location actionState={mockActionState} property={noLocationProperty} />);
            }).toThrow();
        });

        it('should handle empty formData', () => {
            const formData = new FormData();
            const actionState = { ...mockActionState, formData };

            render(<Location actionState={actionState} property={mockProperty} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            expect(cityInput.value).toBe('New York');
        });

        it('should handle very long input values', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const longValue = 'A'.repeat(200);
            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            await user.type(cityInput, longValue);

            expect(cityInput.value).toBe(longValue);
        });

        it('should handle special characters in all fields', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;

            await user.type(cityInput, 'São Paulo');
            await user.type(stateInput, 'SP');

            expect(cityInput.value).toBe('São Paulo');
            expect(stateInput.value).toBe('SP');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Form Section', () => {
        it('should render complete location section with all data', () => {
            const formData = new FormData();
            formData.set('location.city', 'Boston');

            const actionState = {
                formData,
                formErrorMap: {
                    location: {
                        zipcode: ['Invalid zipcode format']
                    }
                }
            };

            render(<Location actionState={actionState} property={mockProperty} />);

            expect(screen.getByText('Location')).toBeInTheDocument();
            expect((screen.getByLabelText('City') as HTMLInputElement).value).toBe('Boston');
            expect((screen.getByLabelText('State') as HTMLInputElement).value).toBe('NY');
            expect((screen.getByLabelText('Zip Code') as HTMLInputElement).value).toBe('10001');
            expect(screen.getByText('Invalid zipcode format')).toBeInTheDocument();
        });

        it('should handle complete user workflow', async () => {
            const user = userEvent.setup();
            render(<Location actionState={mockActionState} />);

            const cityInput = screen.getByLabelText('City') as HTMLInputElement;
            const stateInput = screen.getByLabelText('State') as HTMLInputElement;
            const zipcodeInput = screen.getByLabelText('Zip Code') as HTMLInputElement;

            await user.type(cityInput, 'Miami');
            await user.type(stateInput, 'FL');
            await user.type(zipcodeInput, '33101');

            expect(cityInput.value).toBe('Miami');
            expect(stateInput.value).toBe('FL');
            expect(zipcodeInput.value).toBe('33101');
        });

        it('should maintain values during error state', () => {
            const formData = new FormData();
            formData.set('location.city', 'Invalid City!');
            formData.set('location.state', 'XX');
            formData.set('location.zipcode', '00000');

            const actionState = {
                formData,
                formErrorMap: {
                    location: {
                        city: ['City name contains invalid characters'],
                        state: ['State code not recognized'],
                        zipcode: ['Zipcode must be valid']
                    }
                }
            };

            render(<Location actionState={actionState} />);

            expect((screen.getByLabelText('City') as HTMLInputElement).value).toBe('Invalid City!');
            expect((screen.getByLabelText('State') as HTMLInputElement).value).toBe('XX');
            expect((screen.getByLabelText('Zip Code') as HTMLInputElement).value).toBe('00000');
            expect(screen.getByText('City name contains invalid characters')).toBeInTheDocument();
            expect(screen.getByText('State code not recognized')).toBeInTheDocument();
            expect(screen.getByText('Zipcode must be valid')).toBeInTheDocument();
        });

        it('should integrate with AddressSearch component', () => {
            render(<Location actionState={mockActionState} property={mockProperty} />);

            expect(screen.getByLabelText('Address')).toBeInTheDocument();
            expect(screen.getByLabelText('City')).toBeInTheDocument();
            expect(screen.getByLabelText('State')).toBeInTheDocument();
            expect(screen.getByLabelText('Zip Code')).toBeInTheDocument();
        });
    });
});
