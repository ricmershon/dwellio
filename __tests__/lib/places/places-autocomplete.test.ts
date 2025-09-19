import { fetchPlacesAutocomplete } from '@/lib/places/places-autocomplete'

// Mock the global fetch function
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Places Autocomplete', () => {
    const mockApiKey = 'mock-google-api-key'

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = mockApiKey
    })

    afterEach(() => {
        delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    })

    describe('fetchPlacesAutocomplete', () => {
        const mockAutocompleteResponse = {
            suggestions: [
                {
                    placePrediction: {
                        placeId: 'place-1',
                        text: { text: '123 Main St, New York, NY, USA' },
                        structuredFormat: {
                            mainText: { text: '123 Main St' },
                            secondaryText: { text: 'New York, NY, USA' }
                        }
                    }
                },
                {
                    placePrediction: {
                        placeId: 'place-2',
                        text: { text: '456 Oak Ave, Los Angeles, CA, USA' },
                        structuredFormat: {
                            mainText: { text: '456 Oak Ave' },
                            secondaryText: { text: 'Los Angeles, CA, USA' }
                        }
                    }
                }
            ]
        }

        it('should fetch autocomplete predictions successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAutocompleteResponse
            } as Response)

            const result = await fetchPlacesAutocomplete('123 Main')

            expect(mockFetch).toHaveBeenCalledWith(
                'https://places.googleapis.com/v1/places:autocomplete',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': mockApiKey
                    }),
                    body: JSON.stringify({
                        input: '123 Main',
                        includedPrimaryTypes: ['street_address'],
                        regionCode: 'US'
                    })
                })
            )

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                placeId: 'place-1',
                text: '123 Main St, New York, NY, USA',
                structuredFormat: expect.any(Object),
                street: undefined,
                city: undefined,
                state: undefined,
                zipcode: undefined
            })
        })

        it('should handle empty suggestions gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ suggestions: [] })
            } as Response)

            const result = await fetchPlacesAutocomplete('nonexistent')

            expect(result).toEqual([])
        })

        it('should handle missing suggestions property', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            } as Response)

            const result = await fetchPlacesAutocomplete('test')

            expect(result).toEqual([])
        })

        it('should throw error when API key is missing', async () => {
            delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

            await expect(fetchPlacesAutocomplete('test')).rejects.toThrow(
                'Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
            )
        })

        it('should handle API errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => 'Bad Request'
            } as Response)

            await expect(fetchPlacesAutocomplete('test')).rejects.toThrow(
                'Autocomplete 400: Bad Request'
            )
        })

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            await expect(fetchPlacesAutocomplete('test')).rejects.toThrow('Network error')
        })

        it('should respect custom options', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAutocompleteResponse
            } as Response)

            const customOptions = {
                regionCode: 'CA',
                includedPrimaryTypes: ['establishment'],
                includeDetails: false
            }

            await fetchPlacesAutocomplete('test', customOptions)

            expect(mockFetch).toHaveBeenCalledWith(
                'https://places.googleapis.com/v1/places:autocomplete',
                expect.objectContaining({
                    body: JSON.stringify({
                        input: 'test',
                        includedPrimaryTypes: ['establishment'],
                        regionCode: 'CA'
                    })
                })
            )
        })

        it('should handle abort signal', async () => {
            const abortController = new AbortController()

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAutocompleteResponse
            } as Response)

            await fetchPlacesAutocomplete('test', { signal: abortController.signal })

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: abortController.signal
                })
            )
        })

        describe('with place details', () => {
            const mockPlaceDetailsResponse = {
                addressComponents: [
                    { types: ['street_number'], longText: '123' },
                    { types: ['route'], longText: 'Main St' },
                    { types: ['locality'], longText: 'New York' },
                    { types: ['administrative_area_level_1'], shortText: 'NY' },
                    { types: ['postal_code'], longText: '10001' }
                ]
            }

            it('should fetch place details when includeDetails is true', async () => {
                // Mock autocomplete response
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAutocompleteResponse
                } as Response)

                // Mock place details response
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlaceDetailsResponse
                } as Response)

                const result = await fetchPlacesAutocomplete('123 Main', {
                    includeDetails: true,
                    maxDetails: 1
                })

                expect(mockFetch).toHaveBeenCalledTimes(2)
                expect(result[0]).toEqual(expect.objectContaining({
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zipcode: '10001'
                }))
            })

            it('should handle place details API failure gracefully', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAutocompleteResponse
                } as Response)

                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 404
                } as Response)

                const result = await fetchPlacesAutocomplete('123 Main', {
                    includeDetails: true,
                    maxDetails: 1
                })

                expect(result[0]).toEqual(expect.objectContaining({
                    street: null,
                    city: null,
                    state: null,
                    zipcode: null
                }))
            })

            it('should limit details fetching based on maxDetails', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAutocompleteResponse
                } as Response)

                // Only one details call should be made
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockPlaceDetailsResponse
                } as Response)

                await fetchPlacesAutocomplete('123 Main', {
                    includeDetails: true,
                    maxDetails: 1
                })

                expect(mockFetch).toHaveBeenCalledTimes(2) // 1 autocomplete + 1 details
            })
        })
    })

    describe('Address parsing edge cases', () => {
        it('should handle missing address components', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    suggestions: [
                        {
                            placePrediction: {
                                placeId: 'place-1',
                                text: { text: 'Incomplete Address' },
                                structuredFormat: {}
                            }
                        }
                    ]
                })
            } as Response)

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ addressComponents: [] })
            } as Response)

            const result = await fetchPlacesAutocomplete('test', { includeDetails: true })

            expect(result[0]).toEqual(expect.objectContaining({
                street: null,
                city: null,
                state: null,
                zipcode: null
            }))
        })

        it('should handle partial address components', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    suggestions: [
                        {
                            placePrediction: {
                                placeId: 'place-1',
                                text: { text: 'Partial Address' },
                                structuredFormat: {}
                            }
                        }
                    ]
                })
            } as Response)

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    addressComponents: [
                        { types: ['locality'], longText: 'New York' },
                        { types: ['administrative_area_level_1'], shortText: 'NY' }
                    ]
                })
            } as Response)

            const result = await fetchPlacesAutocomplete('test', { includeDetails: true })

            expect(result[0]).toEqual(expect.objectContaining({
                street: null,
                city: 'New York',
                state: 'NY',
                zipcode: null
            }))
        })

        it('should prefer locality over sublocality for city', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    suggestions: [
                        {
                            placePrediction: {
                                placeId: 'place-1',
                                text: { text: 'Test Address' },
                                structuredFormat: {}
                            }
                        }
                    ]
                })
            } as Response)

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    addressComponents: [
                        { types: ['locality'], longText: 'Manhattan' },
                        { types: ['sublocality'], longText: 'Brooklyn' }
                    ]
                })
            } as Response)

            const result = await fetchPlacesAutocomplete('test', { includeDetails: true })

            expect(result[0].city).toBe('Manhattan')
        })
    })
})