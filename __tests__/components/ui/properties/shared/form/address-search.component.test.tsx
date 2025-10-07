import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddressSearch from '@/ui/properties/shared/form/address-search';
import { ActionState, AutocompletePrediction } from '@/types';

// ============================================================================
// MOCK ORGANIZATION v2.0
// ============================================================================
// External Dependencies (Mocked)
// - use-debounce - useDebounce hook
// - @heroicons/react/24/solid - MagnifyingGlassIcon
// - @/hooks/use-google-places-autocomplete - usePlacesAutocomplete hook
// - clsx
//
// Internal Components (Real)
// - FormErrors (keep real)

// ============================================================================
// MOCKS
// ============================================================================
const mockSetCity = jest.fn();
const mockSetState = jest.fn();
const mockSetZipcode = jest.fn();

// Mock predictions data
const mockPredictions: AutocompletePrediction[] = [
    {
        placeId: 'place1',
        text: '123 Main St, New York, NY 10001',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
        structuredFormat: {
            mainText: { text: '123 Main St' },
            secondaryText: { text: 'New York, NY 10001' }
        }
    },
    {
        placeId: 'place2',
        text: '456 Oak Ave, Brooklyn, NY 11201',
        street: '456 Oak Ave',
        city: 'Brooklyn',
        state: 'NY',
        zipcode: '11201',
        structuredFormat: {
            mainText: { text: '456 Oak Ave' },
            secondaryText: { text: 'Brooklyn, NY 11201' }
        }
    },
    {
        placeId: 'place3',
        text: '789 Pine Rd, Queens, NY 11354',
        street: '789 Pine Rd',
        city: 'Queens',
        state: 'NY',
        zipcode: '11354',
        structuredFormat: {
            mainText: { text: '789 Pine Rd' },
            secondaryText: { text: 'Queens, NY 11354' }
        }
    }
];

jest.mock('use-debounce', () => ({
    useDebounce: jest.fn((value: any) => [value])
}));

jest.mock('@heroicons/react/24/solid', () => ({
    MagnifyingGlassIcon: () => <div data-testid="magnifying-glass-icon" />
}));

jest.mock('@/hooks/use-google-places-autocomplete');

// Import the mocked module
import { usePlacesAutocomplete } from '@/hooks/use-google-places-autocomplete';
const mockUsePlacesAutocomplete = usePlacesAutocomplete as jest.MockedFunction<typeof usePlacesAutocomplete>;

jest.mock('clsx', () => ({
    __esModule: true,
    default: (...args: any[]) => {
        return args
            .map(arg => {
                if (typeof arg === 'string') return arg;
                if (typeof arg === 'object' && arg !== null) {
                    return Object.keys(arg)
                        .filter(key => arg[key])
                        .join(' ');
                }
                return '';
            })
            .filter(Boolean)
            .join(' ');
    }
}));

// ============================================================================
// TEST DATA
// ============================================================================
const mockActionState: ActionState = {
    formData: undefined,
    formErrorMap: undefined
};

// ============================================================================
// TEST SUITE: AddressSearch Component
// ============================================================================
describe('AddressSearch Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePlacesAutocomplete.mockReturnValue({ predictions: [] });
    });

    // ========================================================================
    // Component Rendering
    // ========================================================================
    describe('Component Rendering', () => {
        it('should render address label', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.getByText('Address')).toBeInTheDocument();
        });

        it('should render search input', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.getByLabelText('Address')).toBeInTheDocument();
        });

        it('should render magnifying glass icon', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.getByTestId('magnifying-glass-icon')).toBeInTheDocument();
        });

        it('should render input with correct attributes', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('name', 'location.street');
            expect(input).toHaveAttribute('id', 'street');
        });

        it('should render input with placeholder', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            expect(input).toHaveAttribute('placeholder', 'Search address');
        });

        it('should apply correct styling to label', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const label = screen.getByText('Address');
            expect(label).toHaveClass('sub-input-label');
        });

        it('should apply correct styling to input', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            expect(input).toHaveClass('w-full');
            expect(input).toHaveClass('rounded-md');
            expect(input).toHaveClass('border');
            expect(input).toHaveClass('border-gray-300');
        });

        it('should apply relative positioning to container', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const container = document.querySelector('.relative.mb-2');
            expect(container).toBeInTheDocument();
        });

        it('should not show predictions list initially', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const list = document.querySelector('ul');
            expect(list).toHaveClass('hidden');
        });
    });

    // ========================================================================
    // Street Prop Integration
    // ========================================================================
    describe('Street Prop Integration', () => {
        it('should populate input with street prop', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    street="123 Main St"
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe('123 Main St');
        });

        it('should handle null street prop', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    street={null}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe('');
        });

        it('should handle undefined street prop', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe('');
        });

        it('should handle empty string street prop', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    street=""
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe('');
        });
    });

    // ========================================================================
    // FormData Priority
    // ========================================================================
    describe('FormData Priority', () => {
        it('should prioritize formData over street prop', () => {
            const formData = new FormData();
            formData.set('location.street', '456 Oak Ave');

            const actionState = { ...mockActionState, formData };
            render(
                <AddressSearch
                    actionState={actionState}
                    street="123 Main St"
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe('456 Oak Ave');
        });

        it('should use street when formData exists but field is empty', () => {
            const formData = new FormData();
            formData.set('otherField', 'value');

            const actionState = { ...mockActionState, formData };
            render(
                <AddressSearch
                    actionState={actionState}
                    street="123 Main St"
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe('123 Main St');
        });

        it('should handle formData with empty string value', () => {
            const formData = new FormData();
            formData.set('location.street', '');

            const actionState = { ...mockActionState, formData };
            render(
                <AddressSearch
                    actionState={actionState}
                    street="123 Main St"
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            // Empty formData falls back to street prop
            expect(input.value).toBe('123 Main St');
        });
    });

    // ========================================================================
    // User Input and Debouncing
    // ========================================================================
    describe('User Input and Debouncing', () => {
        it('should allow typing in input', async () => {
            const user = userEvent.setup();
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, '123 Main');

            expect(input.value).toBe('123 Main');
        });

        it('should debounce input with 500ms delay', async () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useDebounce } = require('use-debounce');
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, 'test');

            expect(useDebounce).toHaveBeenCalledWith(expect.any(String), 500);
        });

        it('should call usePlacesAutocomplete with debounced value', async () => {
            const user = userEvent.setup();
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useDebounce } = require('use-debounce');
            useDebounce.mockImplementation((value: any) => [value]);

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            expect(mockUsePlacesAutocomplete).toHaveBeenCalledWith('123');
        });

        it('should update placeQuery when input is changed', async () => {
            const user = userEvent.setup();
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, 'test address');

            // placeQuery state is updated
            expect(input.value).toBe('test address');
        });

        it('should handle rapid typing', async () => {
            const user = userEvent.setup();
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, 'abcdefghij');

            expect(input.value).toBe('abcdefghij');
        });
    });

    // ========================================================================
    // Predictions Display
    // ========================================================================
    describe('Predictions Display', () => {
        it('should display predictions when available', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            expect(screen.getByText('123 Main St')).toBeInTheDocument();
            expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
            expect(screen.getByText('789 Pine Rd')).toBeInTheDocument();
        });

        it('should display secondary text for predictions', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            expect(screen.getByText('New York, NY 10001')).toBeInTheDocument();
        });

        it('should not display predictions when list is empty', () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [] });

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const list = document.querySelector('ul');
            expect(list).toHaveClass('hidden');
        });

        it('should hide predictions when place is selected', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            const list = document.querySelector('ul');
            expect(list).toHaveClass('hidden');
        });

        it('should display predictions list with correct styling', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const list = document.querySelector('ul');
            expect(list).toHaveClass('list-none');
            expect(list).toHaveClass('p-3');
            expect(list).toHaveClass('border');
            expect(list).toHaveClass('rounded');
        });

        it('should render all prediction items as list items', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const listItems = document.querySelectorAll('li');
            expect(listItems.length).toBe(mockPredictions.length);
        });
    });

    // ========================================================================
    // Prediction Selection
    // ========================================================================
    describe('Prediction Selection', () => {
        it('should update input value when prediction is clicked', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            expect(input.value).toBe('123 Main St');
        });

        it('should call setCity with correct value', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            expect(mockSetCity).toHaveBeenCalledWith('New York');
        });

        it('should call setState with correct value', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            expect(mockSetState).toHaveBeenCalledWith('NY');
        });

        it('should call setZipcode with correct value', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            expect(mockSetZipcode).toHaveBeenCalledWith('10001');
        });

        it('should handle prediction with missing city', async () => {
            const incompletePrediction: AutocompletePrediction = {
                placeId: 'place4',
                text: '100 Test St',
                street: '100 Test St',
                city: null,
                state: 'CA',
                zipcode: '90001',
                structuredFormat: {
                    mainText: { text: '100 Test St' },
                    secondaryText: { text: 'CA 90001' }
                }
            };

            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [incompletePrediction] });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '100');

            const prediction = screen.getByText('100 Test St');
            await user.click(prediction);

            expect(mockSetCity).toHaveBeenCalledWith('');
        });

        it('should handle prediction with missing state', async () => {
            const incompletePrediction: AutocompletePrediction = {
                placeId: 'place5',
                text: '200 Test St',
                street: '200 Test St',
                city: 'TestCity',
                state: null,
                zipcode: '90002',
                structuredFormat: {
                    mainText: { text: '200 Test St' }
                }
            };

            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [incompletePrediction] });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '200');

            const prediction = screen.getByText('200 Test St');
            await user.click(prediction);

            expect(mockSetState).toHaveBeenCalledWith('');
        });

        it('should handle prediction with missing zipcode', async () => {
            const incompletePrediction: AutocompletePrediction = {
                placeId: 'place6',
                text: '300 Test St',
                street: '300 Test St',
                city: 'TestCity',
                state: 'CA',
                zipcode: null,
                structuredFormat: {
                    mainText: { text: '300 Test St' }
                }
            };

            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [incompletePrediction] });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '300');

            const prediction = screen.getByText('300 Test St');
            await user.click(prediction);

            expect(mockSetZipcode).toHaveBeenCalledWith('');
        });

        it('should use text when street is missing', async () => {
            const predictionWithoutStreet: AutocompletePrediction = {
                placeId: 'place7',
                text: 'General Location',
                street: null,
                city: 'TestCity',
                state: 'CA',
                zipcode: '90003',
                structuredFormat: {
                    mainText: { text: 'General Location' }
                }
            };

            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [predictionWithoutStreet] });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, 'General');

            const prediction = screen.getByText('General Location');
            await user.click(prediction);

            expect(input.value).toBe('General Location');
        });
    });

    // ========================================================================
    // Input Click Behavior
    // ========================================================================
    describe('Input Click Behavior', () => {
        it('should show predictions when input is clicked', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            // Select a prediction
            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            // Click input again
            await user.click(input);

            // Predictions should be visible again
            const list = document.querySelector('ul');
            expect(list).not.toHaveClass('hidden');
        });

        it('should reset isPlaceSelected when input is clicked', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);

            await user.click(input);

            expect(screen.getByText('123 Main St')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Error Display
    // ========================================================================
    describe('Error Display', () => {
        it('should display street error when present', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: { street: ['Street is required'] }
                }
            };
            render(
                <AddressSearch
                    actionState={actionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.getByText('Street is required')).toBeInTheDocument();
        });

        it('should display multiple errors', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: {
                        street: ['Street is required', 'Street must be valid']
                    }
                }
            };
            render(
                <AddressSearch
                    actionState={actionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.getByText('Street is required')).toBeInTheDocument();
            expect(screen.getByText('Street must be valid')).toBeInTheDocument();
        });

        it('should not display errors when formErrorMap is undefined', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        it('should not display errors when location errors are empty', () => {
            const actionState = {
                ...mockActionState,
                formErrorMap: { location: {} }
            };
            render(
                <AddressSearch
                    actionState={actionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
    });

    // ========================================================================
    // Accessibility
    // ========================================================================
    describe('Accessibility', () => {
        it('should have aria-describedby for input', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            expect(input).toHaveAttribute('aria-describedby', 'street-error');
        });

        it('should associate label with input via htmlFor', () => {
            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const label = document.querySelector('label[for="street"]');
            expect(label).toBeInTheDocument();
        });

        it('should render prediction list with cursor-pointer class', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const list = document.querySelector('ul');
            expect(list).toHaveClass('cursor-pointer');
        });
    });

    // ========================================================================
    // Edge Cases
    // ========================================================================
    describe('Edge Cases', () => {
        it('should handle prediction without structuredFormat', async () => {
            const simplePrediction: AutocompletePrediction = {
                placeId: 'place8',
                text: 'Simple Address',
                street: null,
                city: 'City',
                state: 'ST',
                zipcode: '12345',
                structuredFormat: undefined as any
            };

            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [simplePrediction] });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, 'Simple');

            expect(screen.getByText('Simple Address')).toBeInTheDocument();
        });

        it('should handle very long street addresses', async () => {
            const longStreet = 'A'.repeat(200);

            render(
                <AddressSearch
                    actionState={mockActionState}
                    street={longStreet}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            expect(input.value).toBe(longStreet);
        });

        it('should handle special characters in address', async () => {
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, "123 O'Brien St & Ave");

            expect(input.value).toBe("123 O'Brien St & Ave");
        });

        it('should handle empty predictions array', () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: [] });

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const list = document.querySelector('ul');
            expect(list).toHaveClass('hidden');
        });

        it('should handle rapid prediction clicks', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            const firstPrediction = screen.getByText('123 Main St');
            await user.click(firstPrediction);
            await user.click(input);

            const secondPrediction = screen.getByText('456 Oak Ave');
            await user.click(secondPrediction);

            expect(mockSetCity).toHaveBeenLastCalledWith('Brooklyn');
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================
    describe('Integration - Complete Component', () => {
        it('should handle complete user workflow', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            // Type in search
            const input = screen.getByLabelText('Address') as HTMLInputElement;
            await user.type(input, '123 Main');

            // Verify predictions appear
            expect(screen.getByText('123 Main St')).toBeInTheDocument();

            // Select prediction
            const prediction = screen.getByText('123 Main St');
            await user.click(prediction);

            // Verify all setters were called
            expect(mockSetCity).toHaveBeenCalledWith('New York');
            expect(mockSetState).toHaveBeenCalledWith('NY');
            expect(mockSetZipcode).toHaveBeenCalledWith('10001');

            // Verify input updated
            expect(input.value).toBe('123 Main St');
        });

        it('should handle workflow with errors', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const actionState = {
                ...mockActionState,
                formErrorMap: {
                    location: { street: ['Invalid address format'] }
                }
            };
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={actionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');
            await user.type(input, '123');

            expect(screen.getByText('Invalid address format')).toBeInTheDocument();
            expect(screen.getByText('123 Main St')).toBeInTheDocument();
        });

        it('should maintain functionality after multiple selections', async () => {
            mockUsePlacesAutocomplete.mockReturnValue({ predictions: mockPredictions });
            const user = userEvent.setup();

            render(
                <AddressSearch
                    actionState={mockActionState}
                    setCity={mockSetCity}
                    setState={mockSetState}
                    setZipcode={mockSetZipcode}
                />
            );

            const input = screen.getByLabelText('Address');

            // First selection
            await user.type(input, '123');
            await user.click(screen.getByText('123 Main St'));

            expect(mockSetCity).toHaveBeenCalledWith('New York');

            // Click input to search again
            await user.click(input);

            // Second selection
            await user.click(screen.getByText('456 Oak Ave'));

            expect(mockSetCity).toHaveBeenCalledWith('Brooklyn');
            expect(mockSetCity).toHaveBeenCalledTimes(2);
        });
    });
});
