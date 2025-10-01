import { jest } from "@jest/globals";

// Mock external dependencies before importing
jest.mock("@/lib/db-connect");
jest.mock("@/models");

import { fetchStaticInputs } from "@/lib/data/static-inputs-data";
import dbConnect from "@/lib/db-connect";
import { StaticInputs } from "@/models";

// Mock implementations
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockStaticInputs = StaticInputs as any;

// Test data
const mockStaticInputsDocument = {
    amenities: [
        "wifi",
        "parking",
        "pool",
        "gym",
        "air_conditioning",
        "heating",
        "kitchen",
        "laundry",
        "balcony",
        "pet_friendly"
    ],
    property_types: [
        "Apartment",
        "House",
        "Condo",
        "Townhouse",
        "Studio",
        "Loft",
        "Villa"
    ]
};

describe("static-inputs-data", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined as any);
    });

    describe("fetchStaticInputs", () => {
        it("should fetch static inputs successfully", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockStaticInputs.findOne).toHaveBeenCalledWith();
            expect(mockQuery.select).toHaveBeenCalledWith({ amenities: 1, property_types: 1, _id: 0 });
            expect(mockQuery.lean).toHaveBeenCalled();
            expect(result).toEqual(mockStaticInputsDocument);
        });

        it("should return amenities array", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toBeDefined();
            expect(Array.isArray(result.amenities)).toBe(true);
            expect(result.amenities.length).toBeGreaterThan(0);
        });

        it("should return property_types array", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.property_types).toBeDefined();
            expect(Array.isArray(result.property_types)).toBe(true);
            expect(result.property_types.length).toBeGreaterThan(0);
        });

        it("should handle empty document and return defaults", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(null)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result).toEqual({ amenities: [], property_types: [] });
        });

        it("should handle undefined document and return defaults", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(undefined)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result).toEqual({ amenities: [], property_types: [] });
        });

        it("should exclude _id field from result", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(mockQuery.select).toHaveBeenCalledWith({ amenities: 1, property_types: 1, _id: 0 });
            expect(result).not.toHaveProperty("_id");
        });

        it("should use lean query for performance", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            await fetchStaticInputs();

            expect(mockQuery.lean).toHaveBeenCalled();
        });

        it("should handle database connection error", async () => {
            mockDbConnect.mockRejectedValue(new Error("Connection failed"));

            await expect(fetchStaticInputs()).rejects.toThrow("Connection failed");

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it("should handle database query error", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockRejectedValue(new Error("Query error"))
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            await expect(fetchStaticInputs()).rejects.toThrow("Failed to fetch static inputs");
        });

        it("should handle empty amenities array", async () => {
            const emptyAmenities = {
                amenities: [],
                property_types: mockStaticInputsDocument.property_types
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(emptyAmenities)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toEqual([]);
            expect(result.property_types.length).toBeGreaterThan(0);
        });

        it("should handle empty property_types array", async () => {
            const emptyTypes = {
                amenities: mockStaticInputsDocument.amenities,
                property_types: []
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(emptyTypes)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities.length).toBeGreaterThan(0);
            expect(result.property_types).toEqual([]);
        });

        it("should handle both arrays empty", async () => {
            const emptyBoth = {
                amenities: [],
                property_types: []
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(emptyBoth)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toEqual([]);
            expect(result.property_types).toEqual([]);
        });

        it("should return specific amenities from database", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toContain("wifi");
            expect(result.amenities).toContain("parking");
            expect(result.amenities).toContain("pool");
        });

        it("should return specific property types from database", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.property_types).toContain("Apartment");
            expect(result.property_types).toContain("House");
            expect(result.property_types).toContain("Condo");
        });

        it("should handle large amenities array", async () => {
            const largeAmenities = {
                amenities: new Array(100).fill(0).map((_, i) => `amenity_${i}`),
                property_types: mockStaticInputsDocument.property_types
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(largeAmenities)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities.length).toBe(100);
            expect(result.amenities[0]).toBe("amenity_0");
            expect(result.amenities[99]).toBe("amenity_99");
        });

        it("should handle large property_types array", async () => {
            const largeTypes = {
                amenities: mockStaticInputsDocument.amenities,
                property_types: new Array(50).fill(0).map((_, i) => `PropertyType${i}`)
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(largeTypes)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.property_types.length).toBe(50);
            expect(result.property_types[0]).toBe("PropertyType0");
            expect(result.property_types[49]).toBe("PropertyType49");
        });

        it("should handle amenities with special characters", async () => {
            const specialAmenities = {
                amenities: ["air_conditioning", "pet-friendly", "24/7_security", "en-suite"],
                property_types: mockStaticInputsDocument.property_types
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(specialAmenities)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toContain("air_conditioning");
            expect(result.amenities).toContain("pet-friendly");
            expect(result.amenities).toContain("24/7_security");
        });

        it("should handle property types with spaces", async () => {
            const typesWithSpaces = {
                amenities: mockStaticInputsDocument.amenities,
                property_types: ["Single Family Home", "Multi Family Home", "Mobile Home"]
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(typesWithSpaces)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.property_types).toContain("Single Family Home");
            expect(result.property_types).toContain("Multi Family Home");
        });

        it("should preserve order of amenities from database", async () => {
            const orderedAmenities = {
                amenities: ["wifi", "parking", "pool", "gym"],
                property_types: mockStaticInputsDocument.property_types
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(orderedAmenities)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities[0]).toBe("wifi");
            expect(result.amenities[1]).toBe("parking");
            expect(result.amenities[2]).toBe("pool");
            expect(result.amenities[3]).toBe("gym");
        });

        it("should preserve order of property types from database", async () => {
            const orderedTypes = {
                amenities: mockStaticInputsDocument.amenities,
                property_types: ["Apartment", "House", "Condo", "Townhouse"]
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(orderedTypes)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.property_types[0]).toBe("Apartment");
            expect(result.property_types[1]).toBe("House");
            expect(result.property_types[2]).toBe("Condo");
            expect(result.property_types[3]).toBe("Townhouse");
        });

        it("should handle missing amenities field", async () => {
            const missingAmenities = {
                property_types: mockStaticInputsDocument.property_types
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(missingAmenities)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toBeUndefined();
            expect(result.property_types).toBeDefined();
        });

        it("should handle missing property_types field", async () => {
            const missingTypes = {
                amenities: mockStaticInputsDocument.amenities
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(missingTypes)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toBeDefined();
            expect(result.property_types).toBeUndefined();
        });

        it("should call findOne without parameters", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(mockStaticInputsDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            await fetchStaticInputs();

            expect(mockStaticInputs.findOne).toHaveBeenCalledWith();
        });

        it("should throw descriptive error on database failure", async () => {
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockRejectedValue(new Error("Network timeout"))
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            await expect(fetchStaticInputs()).rejects.toThrow("Failed to fetch static inputs: Error: Network timeout");
        });

        it("should handle document with additional unexpected fields", async () => {
            const extendedDocument = {
                ...mockStaticInputsDocument,
                extraField: "should be excluded",
                anotherField: 123
            };
            const mockQuery = {
                select: (jest.fn() as any).mockReturnThis(),
                lean: (jest.fn() as any).mockResolvedValue(extendedDocument)
            } as any;
            mockStaticInputs.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchStaticInputs();

            expect(result.amenities).toBeDefined();
            expect(result.property_types).toBeDefined();
            expect((result as any).extraField).toBe("should be excluded");
        });
    });
});
