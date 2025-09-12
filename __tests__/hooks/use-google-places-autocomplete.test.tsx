import { renderHook, waitFor } from '@testing-library/react';
import { usePlacesAutocomplete } from '@/hooks/use-google-places-autocomplete';
import { fetchPlacesAutocomplete } from '@/lib/places/places-autocomplete';

jest.mock('@/lib/places/places-autocomplete', () => ({
    fetchPlacesAutocomplete: jest.fn(),
}));

const mockFetchPlacesAutocomplete = fetchPlacesAutocomplete as jest.MockedFunction<typeof fetchPlacesAutocomplete>;

describe('usePlacesAutocomplete Hook', () => {
    const mockPredictions = [
        {
            placeId: 'place1',
            text: '123 Main St, Miami, FL 33101, USA',
            street: '123 Main St',
            city: 'Miami',
            state: 'FL',
            zipcode: '33101',
            structuredFormat: {
                mainText: { text: '123 Main St' },
                secondaryText: { text: 'Miami, FL 33101, USA' },
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with empty predictions', () => {
        const { result } = renderHook(() => usePlacesAutocomplete(''));
        expect(result.current.predictions).toEqual([]);
    });

    it('should not fetch predictions for empty query', () => {
        renderHook(() => usePlacesAutocomplete(''));
        expect(mockFetchPlacesAutocomplete).not.toHaveBeenCalled();
    });

    it('should fetch predictions for non-empty query', async () => {
        mockFetchPlacesAutocomplete.mockResolvedValue(mockPredictions);

        const { result } = renderHook(() => usePlacesAutocomplete('123 Main'));

        await waitFor(() => {
            expect(result.current.predictions).toEqual(mockPredictions);
        });

        expect(mockFetchPlacesAutocomplete).toHaveBeenCalledTimes(1);
        expect(mockFetchPlacesAutocomplete).toHaveBeenCalledWith('123 Main', expect.any(Object));
    });

    it('should clear predictions when query becomes empty', async () => {
        mockFetchPlacesAutocomplete.mockResolvedValue(mockPredictions);

        const { result, rerender } = renderHook(
            ({ query }) => usePlacesAutocomplete(query),
            { initialProps: { query: '123 Main' } }
        );

        await waitFor(() => {
            expect(result.current.predictions).toEqual(mockPredictions);
        });

        rerender({ query: '' });
        expect(result.current.predictions).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockFetchPlacesAutocomplete.mockRejectedValue(new Error('API Error'));

        const { result } = renderHook(() => usePlacesAutocomplete('123 Main'));

        await waitFor(() => {
            expect(result.current.predictions).toEqual([]);
        });

        consoleErrorSpy.mockRestore();
    });

    it('should update predictions when query changes', async () => {
        const firstPredictions = [mockPredictions[0]];
        const secondPredictions = [{ ...mockPredictions[0], placeId: 'place2', text: '456 Oak Ave' }];

        mockFetchPlacesAutocomplete
            .mockResolvedValueOnce(firstPredictions)
            .mockResolvedValueOnce(secondPredictions);

        const { result, rerender } = renderHook(
            ({ query }) => usePlacesAutocomplete(query),
            { initialProps: { query: '123 Main' } }
        );

        await waitFor(() => {
            expect(result.current.predictions).toEqual(firstPredictions);
        });

        rerender({ query: '456 Oak' });

        await waitFor(() => {
            expect(result.current.predictions).toEqual(secondPredictions);
        });

        expect(mockFetchPlacesAutocomplete).toHaveBeenCalledTimes(2);
    });

    it('should handle empty predictions response', async () => {
        mockFetchPlacesAutocomplete.mockResolvedValue([]);

        const { result } = renderHook(() => usePlacesAutocomplete('nonexistent address'));

        await waitFor(() => {
            expect(result.current.predictions).toEqual([]);
        });

        expect(mockFetchPlacesAutocomplete).toHaveBeenCalledWith('nonexistent address', expect.any(Object));
    });
});