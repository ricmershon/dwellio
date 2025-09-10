import { fetchPlacesAutocomplete } from '@/lib/places/places-autocomplete';
import type { 
    AutocompleteFetchOptions, 
    AutocompletePrediction, 
    AutocompleteResponse,
    AutocompleteSuggestion 
} from '@/types';

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;

describe('lib/places/places-autocomplete', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { 
            ...originalEnv, 
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'test-api-key' 
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('fetchPlacesAutocomplete', () => {
        const mockBasicResponse: AutocompleteResponse = {
            suggestions: [
                {
                    placePrediction: {
                        placeId: 'place1',
                        text: { text: '123 Main St, New York, NY, USA' },
                        structuredFormat: {
                            mainText: { text: '123 Main St' },
                            secondaryText: { text: 'New York, NY, USA' }
                        }
                    }
                },
                {
                    placePrediction: {
                        placeId: 'place2',
                        text: { text: '456 Oak Ave, Los Angeles, CA, USA' },
                        structuredFormat: {
                            mainText: { text: '456 Oak Ave' },
                            secondaryText: { text: 'Los Angeles, CA, USA' }
                        }
                    }
                }
            ]
        };

        const mockPlaceDetailsResponse = {
            addressComponents: [
                { types: ['street_number'], longText: '123' },
                { types: ['route'], longText: 'Main St' },
                { types: ['locality'], longText: 'New York' },
                { types: ['administrative_area_level_1'], shortText: 'NY' },
                { types: ['postal_code'], longText: '10001' }
            ]
        };

        describe('Basic Functionality', () => {
            it('should fetch autocomplete predictions successfully', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                const result = await fetchPlacesAutocomplete('123 Main');

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://places.googleapis.com/v1/places:autocomplete',
                    {
                        method: 'POST',
                        signal: undefined,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-Api-Key': 'test-api-key',
                            'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
                        },
                        body: JSON.stringify({
                            input: '123 Main',
                            includedPrimaryTypes: ['street_address'],
                            regionCode: 'US',
                        }),
                    }
                );

                expect(result).toHaveLength(2);
                expect(result[0]).toEqual({
                    placeId: 'place1',
                    text: '123 Main St, New York, NY, USA',
                    structuredFormat: {
                        mainText: { text: '123 Main St' },
                        secondaryText: { text: 'New York, NY, USA' }
                    },
                    street: undefined,
                    city: undefined,
                    state: undefined,
                    zipcode: undefined,
                });
            });

            it('should handle empty query', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ suggestions: [] }),
                });

                const result = await fetchPlacesAutocomplete('');

                expect(result).toEqual([]);
            });

            it('should handle null or undefined text in suggestions', async () => {
                const responseWithNullText: AutocompleteResponse = {
                    suggestions: [
                        {
                            placePrediction: {
                                placeId: 'place1',
                                text: undefined,
                                structuredFormat: {
                                    mainText: { text: '123 Main St' },
                                    secondaryText: { text: 'New York, NY, USA' }
                                }
                            }
                        }
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => responseWithNullText,
                });

                const result = await fetchPlacesAutocomplete('test');

                expect(result[0].text).toBe('');
            });
        });

        describe('Options Handling', () => {
            it('should use custom options when provided', async () => {
                const options: AutocompleteFetchOptions = {
                    regionCode: 'CA',
                    includedPrimaryTypes: ['establishment'],
                    includeDetails: false,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                await fetchPlacesAutocomplete('test query', options);

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://places.googleapis.com/v1/places:autocomplete',
                    expect.objectContaining({
                        body: JSON.stringify({
                            input: 'test query',
                            includedPrimaryTypes: ['establishment'],
                            regionCode: 'CA',
                        }),
                    })
                );
            });

            it('should pass abort signal when provided', async () => {
                const abortController = new AbortController();
                const options: AutocompleteFetchOptions = {
                    signal: abortController.signal,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                await fetchPlacesAutocomplete('test', options);

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://places.googleapis.com/v1/places:autocomplete',
                    expect.objectContaining({
                        signal: abortController.signal,
                    })
                );
            });

            it('should use default options when none provided', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                await fetchPlacesAutocomplete('test');

                expect(mockFetch).toHaveBeenCalledWith(
                    'https://places.googleapis.com/v1/places:autocomplete',
                    expect.objectContaining({
                        body: JSON.stringify({
                            input: 'test',
                            includedPrimaryTypes: ['street_address'],
                            regionCode: 'US',
                        }),
                    })
                );
            });
        });

        describe('Place Details Integration', () => {
            it('should fetch place details when includeDetails is true', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                    maxDetails: 1,
                };

                // Mock autocomplete response
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                // Mock place details response
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlaceDetailsResponse,
                });

                const result = await fetchPlacesAutocomplete('123 Main', options);

                // Should call autocomplete API
                expect(mockFetch).toHaveBeenNthCalledWith(1,
                    'https://places.googleapis.com/v1/places:autocomplete',
                    expect.any(Object)
                );

                // Should call place details API
                expect(mockFetch).toHaveBeenNthCalledWith(2,
                    'https://places.googleapis.com/v1/places/place1',
                    {
                        method: 'GET',
                        signal: undefined,
                        headers: {
                            'X-Goog-Api-Key': 'test-api-key',
                            'X-Goog-FieldMask': 'addressComponents',
                        },
                    }
                );

                expect(result[0].street).toBe('123 Main St');
                expect(result[0].city).toBe('New York');
                expect(result[0].state).toBe('NY');
                expect(result[0].zipcode).toBe('10001');
            });

            it('should limit details fetching to maxDetails', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                    maxDetails: 1,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlaceDetailsResponse,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                // Should only call place details once (maxDetails = 1)
                expect(mockFetch).toHaveBeenCalledTimes(2);
                expect(result[0].street).toBe('123 Main St');
                expect(result[1].street).toBeUndefined(); // Second item should not have details
            });

            it('should handle place details API errors gracefully', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                // Mock place details API error
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBeNull();
                expect(result[0].city).toBeNull();
                expect(result[0].state).toBeNull();
                expect(result[0].zipcode).toBeNull();
            });

            it('should not fetch details when includeDetails is false', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: false,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(result[0].street).toBeUndefined();
            });

            it('should not fetch details when no predictions returned', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ suggestions: [] }),
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(result).toEqual([]);
            });
        });

        describe('Error Handling', () => {
            it('should throw error when API key is missing', async () => {
                delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

                await expect(fetchPlacesAutocomplete('test')).rejects.toThrow(
                    'Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
                );
            });

            it('should throw error when autocomplete API returns error', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 403,
                    text: async () => 'API key not valid',
                });

                await expect(fetchPlacesAutocomplete('test')).rejects.toThrow(
                    'Autocomplete 403: API key not valid'
                );
            });

            it('should handle error when response text fails', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    text: jest.fn().mockRejectedValue(new Error('Text parsing failed')),
                });

                await expect(fetchPlacesAutocomplete('test')).rejects.toThrow(
                    'Autocomplete 500: 500'
                );
            });

            it('should handle network errors', async () => {
                mockFetch.mockRejectedValueOnce(new Error('Network error'));

                await expect(fetchPlacesAutocomplete('test')).rejects.toThrow(
                    'Network error'
                );
            });

            it('should handle abort signal', async () => {
                const abortController = new AbortController();
                const options: AutocompleteFetchOptions = {
                    signal: abortController.signal,
                };

                mockFetch.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

                await expect(fetchPlacesAutocomplete('test', options)).rejects.toThrow('Aborted');
            });
        });

        describe('Response Format Handling', () => {
            it('should handle response without suggestions', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({}),
                });

                const result = await fetchPlacesAutocomplete('test');

                expect(result).toEqual([]);
            });

            it('should handle malformed suggestions', async () => {
                const malformedResponse = {
                    suggestions: [
                        {
                            placePrediction: {
                                placeId: 'place1',
                                // Missing text and structuredFormat
                            }
                        }
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => malformedResponse,
                });

                const result = await fetchPlacesAutocomplete('test');

                expect(result).toHaveLength(1);
                expect(result[0]).toEqual({
                    placeId: 'place1',
                    text: '',
                    structuredFormat: undefined,
                    street: undefined,
                    city: undefined,
                    state: undefined,
                    zipcode: undefined,
                });
            });

            it('should handle JSON parsing errors', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
                });

                await expect(fetchPlacesAutocomplete('test')).rejects.toThrow('Invalid JSON');
            });
        });

        describe('Address Component Extraction', () => {
            it('should correctly extract address components with all fields', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const fullAddressComponents = {
                    addressComponents: [
                        { types: ['street_number'], longText: '123' },
                        { types: ['route'], longText: 'Main Street' },
                        { types: ['locality'], longText: 'New York' },
                        { types: ['administrative_area_level_1'], shortText: 'NY' },
                        { types: ['postal_code'], longText: '10001' }
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => fullAddressComponents,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBe('123 Main Street');
                expect(result[0].city).toBe('New York');
                expect(result[0].state).toBe('NY');
                expect(result[0].zipcode).toBe('10001');
            });

            it('should handle alternative city types', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const addressWithPostalTown = {
                    addressComponents: [
                        { types: ['postal_town'], longText: 'Brooklyn' },
                        { types: ['administrative_area_level_1'], shortText: 'NY' },
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => addressWithPostalTown,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].city).toBe('Brooklyn');
            });

            it('should handle sublocality for city', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const addressWithSublocality = {
                    addressComponents: [
                        { types: ['sublocality'], longText: 'Queens' },
                        { types: ['administrative_area_level_1'], shortText: 'NY' },
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => addressWithSublocality,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].city).toBe('Queens');
            });

            it('should handle long text for state when short text unavailable', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const addressWithLongState = {
                    addressComponents: [
                        { types: ['administrative_area_level_1'], longText: 'California' },
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => addressWithLongState,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].state).toBe('California');
            });

            it('should handle missing address components', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const incompleteAddress = {
                    addressComponents: [
                        { types: ['route'], longText: 'Main Street' },
                        // Missing street number, city, state, zipcode
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => incompleteAddress,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBe('Main Street');
                expect(result[0].city).toBeNull();
                expect(result[0].state).toBeNull();
                expect(result[0].zipcode).toBeNull();
            });

            it('should handle empty address components', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const emptyAddress = {
                    addressComponents: []
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => emptyAddress,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBeNull();
                expect(result[0].city).toBeNull();
                expect(result[0].state).toBeNull();
                expect(result[0].zipcode).toBeNull();
            });

            it('should handle street number without route', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const streetNumberOnly = {
                    addressComponents: [
                        { types: ['street_number'], longText: '123' },
                        // Missing route
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => streetNumberOnly,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBe('123');
            });

            it('should handle route without street number', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const routeOnly = {
                    addressComponents: [
                        { types: ['route'], longText: 'Main Street' },
                        // Missing street number
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => routeOnly,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBe('Main Street');
            });
        });

        describe('Performance and Concurrency', () => {
            it('should handle multiple concurrent requests', async () => {
                mockFetch.mockResolvedValue({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                const promises = [
                    fetchPlacesAutocomplete('query1'),
                    fetchPlacesAutocomplete('query2'),
                    fetchPlacesAutocomplete('query3'),
                ];

                const results = await Promise.all(promises);

                expect(results).toHaveLength(3);
                expect(mockFetch).toHaveBeenCalledTimes(3);
            });

            it('should handle Promise.allSettled failures in place details', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [
                            {
                                placePrediction: {
                                    placeId: 'place1',
                                    text: { text: 'Address 1' },
                                }
                            },
                            {
                                placePrediction: {
                                    placeId: 'place2',
                                    text: { text: 'Address 2' },
                                }
                            }
                        ]
                    }),
                });

                // First place details succeeds
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlaceDetailsResponse,
                });

                // Second place details fails
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 404,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result).toHaveLength(2);
                expect(result[0].street).toBe('123 Main St');
                expect(result[1].street).toBeNull();
            });
        });

        describe('Edge Cases', () => {
            it('should handle whitespace-only text fields', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        suggestions: [{
                            placePrediction: {
                                placeId: 'place1',
                                text: { text: 'Test Address' },
                            }
                        }]
                    }),
                });

                const whitespaceComponents = {
                    addressComponents: [
                        { types: ['street_number'], longText: '   ' },
                        { types: ['route'], longText: '\t\n' },
                        { types: ['locality'], longText: '  ' },
                        { types: ['administrative_area_level_1'], shortText: ' ' },
                        { types: ['postal_code'], longText: '   ' }
                    ]
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => whitespaceComponents,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                expect(result[0].street).toBeNull();
                expect(result[0].city).toBeNull();
                expect(result[0].state).toBeNull();
                expect(result[0].zipcode).toBeNull();
            });

            it('should handle maxDetails edge cases', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                    maxDetails: 0,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                // Should not call place details API when maxDetails is 0
                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(result[0].street).toBeUndefined();
            });

            it('should handle maxDetails larger than results', async () => {
                const options: AutocompleteFetchOptions = {
                    includeDetails: true,
                    maxDetails: 10,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockBasicResponse,
                });

                mockFetch.mockResolvedValue({
                    ok: true,
                    json: async () => mockPlaceDetailsResponse,
                });

                const result = await fetchPlacesAutocomplete('test', options);

                // Should call place details for all available results (2)
                expect(mockFetch).toHaveBeenCalledTimes(3); // 1 autocomplete + 2 details
                expect(result).toHaveLength(2);
            });
        });
    });
});