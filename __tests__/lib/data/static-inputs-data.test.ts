// Mock mongoose before any imports
jest.mock("mongoose", () => ({
    connection: {
        listeners: jest.fn().mockReturnValue([]),
        on: jest.fn()
    }
}));

// Mock database connection and models before importing
jest.mock("@/lib/db-connect", () => jest.fn().mockResolvedValue(undefined));
jest.mock("@/models", () => ({
    StaticInputs: {
        findOne: jest.fn(),
    }
}));

// Import after mocking
import { fetchStaticInputs } from "@/lib/data/static-inputs-data";
import { StaticInputs, StaticInputsDocument } from "@/models";
import dbConnect from "@/lib/db-connect";

// Get mock instances
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

const mockStaticInputs = StaticInputs as jest.Mocked<typeof StaticInputs>;

describe('Static Inputs Data Layer Tests', () => {
    const mockAmenities = [
        { id: '1', value: 'WiFi' },
        { id: '2', value: 'Pool' },
        { id: '3', value: 'Gym' },
        { id: '4', value: 'Parking' }
    ];

    const mockPropertyTypes = [
        { value: 'Apartment', label: 'Apartment' },
        { value: 'House', label: 'House' },
        { value: 'Condo', label: 'Condo' },
        { value: 'Studio', label: 'Studio' }
    ];

    const mockStaticInputsDoc: StaticInputsDocument = {
        amenities: mockAmenities,
        property_types: mockPropertyTypes
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockConsoleError.mockClear();
        mockDbConnect.mockResolvedValue(undefined as any);
    });

    describe('fetchStaticInputs Function', () => {
        describe('Successful Static Inputs Retrieval', () => {
            it('should fetch static inputs successfully', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockStaticInputs.findOne).toHaveBeenCalledTimes(1);
                expect(mockQuery.select).toHaveBeenCalledWith({ amenities: 1, property_types: 1, _id: 0 });
                expect(mockQuery.lean).toHaveBeenCalledTimes(1);
                expect(result).toEqual(mockStaticInputsDoc);
            });

            it('should call dbConnect before querying', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                expect(mockDbConnect).toHaveBeenCalled();
                expect(mockStaticInputs.findOne).toHaveBeenCalled();
            });

            it('should use correct query selector fields', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                expect(mockQuery.select).toHaveBeenCalledWith({ amenities: 1, property_types: 1, _id: 0 });
            });

            it('should use lean query for performance', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                expect(mockQuery.lean).toHaveBeenCalledTimes(1);
            });

            it('should return actual static inputs document', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result).toBe(mockStaticInputsDoc);
                expect(result.amenities).toEqual(mockAmenities);
                expect(result.property_types).toEqual(mockPropertyTypes);
            });
        });

        describe('Empty/Null Document Handling', () => {
            it('should return default empty structure when document is null', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(null)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result).toEqual({
                    amenities: [],
                    property_types: []
                });
            });

            it('should return default empty structure when document is undefined', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(undefined)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result).toEqual({
                    amenities: [],
                    property_types: []
                });
            });

            it('should handle empty arrays in document', async () => {
                const emptyDoc: StaticInputsDocument = {
                    amenities: [],
                    property_types: []
                };
                
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(emptyDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result).toEqual(emptyDoc);
                expect(result.amenities).toHaveLength(0);
                expect(result.property_types).toHaveLength(0);
            });

            it('should handle partial document with missing fields', async () => {
                const partialDoc = {
                    amenities: mockAmenities,
                    // property_types is missing
                } as StaticInputsDocument;
                
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(partialDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result).toBe(partialDoc);
                expect(result.amenities).toEqual(mockAmenities);
            });
        });

        describe('Data Validation and Structure', () => {
            it('should handle amenities with correct structure', async () => {
                const customAmenities = [
                    { id: 'a1', value: 'Free WiFi' },
                    { id: 'a2', value: 'Swimming Pool' },
                    { id: 'a3', value: 'Fitness Center' }
                ];
                
                const customDoc: StaticInputsDocument = {
                    amenities: customAmenities,
                    property_types: mockPropertyTypes
                };
                
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(customDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result.amenities).toHaveLength(3);
                result.amenities.forEach((amenity, index) => {
                    expect(amenity).toHaveProperty('id');
                    expect(amenity).toHaveProperty('value');
                    expect(amenity.id).toBe(customAmenities[index].id);
                    expect(amenity.value).toBe(customAmenities[index].value);
                });
            });

            it('should handle property types with correct structure', async () => {
                const customPropertyTypes = [
                    { value: 'Villa', label: 'Villa' },
                    { value: 'Townhouse', label: 'Townhouse' },
                    { value: 'Loft', label: 'Loft' }
                ];
                
                const customDoc: StaticInputsDocument = {
                    amenities: mockAmenities,
                    property_types: customPropertyTypes
                };
                
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(customDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result.property_types).toHaveLength(3);
                result.property_types.forEach((propertyType, index) => {
                    expect(propertyType).toHaveProperty('value');
                    expect(propertyType).toHaveProperty('label');
                    expect(propertyType.value).toBe(customPropertyTypes[index].value);
                    expect(propertyType.label).toBe(customPropertyTypes[index].label);
                });
            });

            it('should handle large datasets efficiently', async () => {
                const largeAmenities = Array.from({ length: 100 }, (_, i) => ({
                    id: `amenity_${i}`,
                    value: `Amenity ${i + 1}`
                }));
                
                const largePropertyTypes = Array.from({ length: 50 }, (_, i) => ({
                    value: `Type${i}`,
                    label: `Property Type ${i + 1}`
                }));
                
                const largeDoc: StaticInputsDocument = {
                    amenities: largeAmenities,
                    property_types: largePropertyTypes
                };
                
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(largeDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result.amenities).toHaveLength(100);
                expect(result.property_types).toHaveLength(50);
            });
        });

        describe('Database Errors', () => {
            it('should handle database connection failures', async () => {
                const dbError = new Error('Database connection failed');
                mockDbConnect.mockRejectedValue(dbError);

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Error: Database connection failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: Error: Database connection failed');
            });

            it('should handle findOne query errors', async () => {
                const queryError = new Error('Query execution failed');
                mockStaticInputs.findOne.mockImplementation(() => {
                    throw queryError;
                });

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Error: Query execution failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: Error: Query execution failed');
            });

            it('should handle select method errors', async () => {
                const selectError = new Error('Select operation failed');
                const mockQuery = {
                    select: jest.fn().mockImplementation(() => {
                        throw selectError;
                    })
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Error: Select operation failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: Error: Select operation failed');
            });

            it('should handle lean method errors', async () => {
                const leanError = new Error('Lean operation failed');
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockRejectedValue(leanError)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Error: Lean operation failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: Error: Lean operation failed');
            });

            it('should throw descriptive error messages', async () => {
                const specificError = new Error('Specific database error');
                mockStaticInputs.findOne.mockImplementation(() => {
                    throw specificError;
                });

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Error: Specific database error');
            });

            it('should handle network timeout errors', async () => {
                const timeoutError = new Error('Network timeout');
                mockDbConnect.mockRejectedValue(timeoutError);

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Error: Network timeout');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: Error: Network timeout');
            });

            it('should handle string errors', async () => {
                const stringError = 'Connection string error';
                mockDbConnect.mockRejectedValue(stringError);

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: Connection string error');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: Connection string error');
            });

            it('should handle null/undefined errors', async () => {
                mockDbConnect.mockRejectedValue(null);

                await expect(fetchStaticInputs()).rejects.toThrow('Failed to fetch static inputs: null');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching static inputs: null');
            });
        });

        describe('Query Chain Execution', () => {
            it('should execute query methods in correct order', async () => {
                const executionOrder: string[] = [];
                
                const mockQuery = {
                    select: jest.fn().mockImplementation(function(this: any) {
                        executionOrder.push('select');
                        return this;
                    }),
                    lean: jest.fn().mockImplementation(() => {
                        executionOrder.push('lean');
                        return Promise.resolve(mockStaticInputsDoc);
                    })
                };
                
                mockStaticInputs.findOne.mockImplementation(() => {
                    executionOrder.push('findOne');
                    return mockQuery as any;
                });

                await fetchStaticInputs();

                expect(executionOrder).toEqual(['findOne', 'select', 'lean']);
            });

            it('should pass correct parameters through query chain', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                expect(mockStaticInputs.findOne).toHaveBeenCalledWith();
                expect(mockQuery.select).toHaveBeenCalledWith({ amenities: 1, property_types: 1, _id: 0 });
                expect(mockQuery.lean).toHaveBeenCalledTimes(1);
            });

            it('should maintain query chain context', async () => {
                let queryInstance: any;
                
                const mockQuery = {
                    select: jest.fn().mockImplementation(function(this: any) {
                        queryInstance = this;
                        return this;
                    }),
                    lean: jest.fn().mockImplementation(function(this: any) {
                        expect(this).toBe(queryInstance);
                        return Promise.resolve(mockStaticInputsDoc);
                    })
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                expect(mockQuery.select).toHaveBeenCalledTimes(1);
                expect(mockQuery.lean).toHaveBeenCalledTimes(1);
            });
        });

        describe('Edge Cases and Performance', () => {
            it('should handle concurrent calls efficiently', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const promises = Array.from({ length: 5 }, () => fetchStaticInputs());
                const results = await Promise.all(promises);

                results.forEach(result => {
                    expect(result).toEqual(mockStaticInputsDoc);
                });
                expect(mockDbConnect).toHaveBeenCalledTimes(5);
                expect(mockStaticInputs.findOne).toHaveBeenCalledTimes(5);
            });

            it('should handle memory-efficient lean queries', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                // Verify lean was called for memory efficiency
                expect(mockQuery.lean).toHaveBeenCalledTimes(1);
            });

            it('should exclude _id field for cleaner response', async () => {
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(mockStaticInputsDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                await fetchStaticInputs();

                expect(mockQuery.select).toHaveBeenCalledWith(
                    expect.objectContaining({ _id: 0 })
                );
            });

            it('should handle malformed document gracefully', async () => {
                const malformedDoc = {
                    amenities: 'not_an_array',
                    property_types: null
                } as unknown as StaticInputsDocument;
                
                const mockQuery = {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue(malformedDoc)
                };
                
                mockStaticInputs.findOne.mockReturnValue(mockQuery as any);

                const result = await fetchStaticInputs();

                expect(result).toBe(malformedDoc);
            });
        });
    });
});