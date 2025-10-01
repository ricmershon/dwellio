import { jest } from "@jest/globals";

// Mock external dependencies before importing
jest.mock("@/lib/db-connect");
jest.mock("@/models");

import {
    fetchProperty,
    fetchPropertiesByUserId,
    fetchFeaturedProperties,
    fetchFavoritedProperties,
    searchProperties,
    fetchNumPropertiesPages,
    fetchPaginatedProperties
} from "@/lib/data/property-data";
import dbConnect from "@/lib/db-connect";
import { Property, User } from "@/models";
import { PropertiesQuery } from "@/types";

// Mock implementations
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockProperty = Property as any;
const mockUser = User as any;

// Test data
const mockPropertyDocument = {
    _id: "property123",
    type: "Apartment",
    name: "Beautiful Downtown Apartment",
    description: "Modern apartment in the heart of downtown",
    location: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipcode: "10001"
    },
    beds: 2,
    baths: 1,
    squareFeet: 1200,
    amenities: ["wifi", "parking", "air_conditioning"],
    rates: {
        nightly: 250,
        weekly: 1500,
        monthly: 5000
    },
    owner: "user123",
    imagesData: [],
    isFeatured: false,
    createdAt: new Date("2024-01-01")
};

const mockFeaturedProperty = {
    ...mockPropertyDocument,
    _id: "featured1",
    name: "Featured Property",
    isFeatured: true
};

const mockUserWithFavorites = {
    _id: "user123",
    email: "test@example.com",
    username: "testuser",
    favorites: [
        mockPropertyDocument,
        { ...mockPropertyDocument, _id: "property456", name: "Another Favorite" }
    ]
};

describe("property-data", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined as any);
    });

    describe("fetchProperty", () => {
        it("should fetch a single property successfully", async () => {
            mockProperty.findById = (jest.fn() as any).mockResolvedValue(mockPropertyDocument as any);

            const result = await fetchProperty("property123");

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockProperty.findById).toHaveBeenCalledWith("property123");
            expect(result).toEqual(mockPropertyDocument);
        });

        it("should throw error when property not found", async () => {
            mockProperty.findById = (jest.fn() as any).mockResolvedValue(null as any);

            await expect(fetchProperty("nonexistent")).rejects.toThrow("Failed to fetch property data.");

            expect(mockProperty.findById).toHaveBeenCalledWith("nonexistent");
        });

        it("should handle database connection error", async () => {
            mockDbConnect.mockRejectedValue(new Error("Connection failed"));

            await expect(fetchProperty("property123")).rejects.toThrow("Connection failed");

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it("should handle database query error", async () => {
            mockProperty.findById = (jest.fn() as any).mockRejectedValue(new Error("Query error"));

            await expect(fetchProperty("property123")).rejects.toThrow("Failed to fetch property data");

            expect(mockProperty.findById).toHaveBeenCalledWith("property123");
        });

        it("should handle empty string property id", async () => {
            mockProperty.findById = (jest.fn() as any).mockResolvedValue(null);

            await expect(fetchProperty("")).rejects.toThrow("Failed to fetch property data");

            expect(mockProperty.findById).toHaveBeenCalledWith("");
        });

        it("should handle invalid property id format", async () => {
            mockProperty.findById = (jest.fn() as any).mockRejectedValue(new Error("Invalid ObjectId"));

            await expect(fetchProperty("invalid-id")).rejects.toThrow("Failed to fetch property data");
        });
    });

    describe("fetchPropertiesByUserId", () => {
        it("should fetch all properties for a user successfully", async () => {
            const mockProperties = [
                mockPropertyDocument,
                { ...mockPropertyDocument, _id: "property456", name: "Second Property" }
            ];
            mockProperty.find = (jest.fn() as any).mockResolvedValue(mockProperties);

            const result = await fetchPropertiesByUserId("user123");

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockProperty.find).toHaveBeenCalledWith({ owner: "user123" });
            expect(result).toEqual(mockProperties);
            expect(result).toHaveLength(2);
        });

        it("should return empty array when user has no properties", async () => {
            mockProperty.find = (jest.fn() as any).mockResolvedValue([]);

            const result = await fetchPropertiesByUserId("user123");

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should handle database error", async () => {
            mockProperty.find = (jest.fn() as any).mockRejectedValue(new Error("Database error"));

            await expect(fetchPropertiesByUserId("user123")).rejects.toThrow("Failed to fetch properties data");

            expect(mockProperty.find).toHaveBeenCalledWith({ owner: "user123" });
        });

        it("should handle null response from database", async () => {
            mockProperty.find = (jest.fn() as any).mockResolvedValue(null);

            const result = await fetchPropertiesByUserId("user123");

            expect(result).toBeNull();
        });

        it("should handle empty string user id", async () => {
            mockProperty.find = (jest.fn() as any).mockResolvedValue([]);

            const result = await fetchPropertiesByUserId("");

            expect(mockProperty.find).toHaveBeenCalledWith({ owner: "" });
            expect(result).toEqual([]);
        });

        it("should handle invalid user id format", async () => {
            mockProperty.find = (jest.fn() as any).mockRejectedValue(new Error("Invalid ObjectId"));

            await expect(fetchPropertiesByUserId("invalid-id")).rejects.toThrow("Failed to fetch properties data");
        });
    });

    describe("fetchFeaturedProperties", () => {
        const mockFeaturedProperties = [
            mockFeaturedProperty,
            { ...mockFeaturedProperty, _id: "featured2", name: "Featured Property 2" },
            { ...mockFeaturedProperty, _id: "featured3", name: "Featured Property 3" }
        ];

        beforeEach(() => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);
        });

        it("should fetch featured properties for small viewport (< 640px)", async () => {
            const result = await fetchFeaturedProperties(500);

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockProperty.find).toHaveBeenCalledWith({ isFeatured: true });
            expect(result).toEqual(mockFeaturedProperties);
        });

        it("should apply correct limit for viewport < 640px (8 items)", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(500);

            expect(mockQuery.limit).toHaveBeenCalledWith(8);
        });

        it("should apply correct limit for viewport 640-768px (10 items)", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(700);

            expect(mockQuery.limit).toHaveBeenCalledWith(10);
        });

        it("should apply correct limit for viewport 768-1024px (12 items)", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(900);

            expect(mockQuery.limit).toHaveBeenCalledWith(12);
        });

        it("should apply correct limit for viewport 1024-1280px (15 items)", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(1100);

            expect(mockQuery.limit).toHaveBeenCalledWith(15);
        });

        it("should apply correct limit for viewport >= 1280px (18 items)", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(1920);

            expect(mockQuery.limit).toHaveBeenCalledWith(18);
        });

        it("should sort by createdAt in descending order", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(1000);

            expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });

        it("should return empty array when no featured properties exist", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            const result = await fetchFeaturedProperties(1000);

            expect(result).toEqual([]);
        });

        it("should handle database error", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockRejectedValue(new Error("Database error"))
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await expect(fetchFeaturedProperties(1000)).rejects.toThrow("Failed to fetch featured properties data");
        });

        it("should handle viewport width of 0", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(0);

            expect(mockQuery.limit).toHaveBeenCalledWith(8);
        });

        it("should handle negative viewport width", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(-100);

            expect(mockQuery.limit).toHaveBeenCalledWith(8);
        });

        it("should handle extremely large viewport width", async () => {
            const mockQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockFeaturedProperties)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);

            await fetchFeaturedProperties(4000);

            expect(mockQuery.limit).toHaveBeenCalledWith(18);
        });
    });

    describe("fetchFavoritedProperties", () => {
        it("should fetch favorited properties successfully", async () => {
            const mockPopulate = (jest.fn() as any).mockResolvedValue(mockUserWithFavorites);
            mockUser.findById = jest.fn().mockReturnValue({
                populate: mockPopulate
            });

            const result = await fetchFavoritedProperties("user123");

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockUser.findById).toHaveBeenCalledWith("user123");
            expect(mockPopulate).toHaveBeenCalledWith("favorites");
            expect(result).toEqual(mockUserWithFavorites.favorites);
            expect(result).toHaveLength(2);
        });

        it("should return empty array when user has no favorites", async () => {
            const mockUserNoFavorites = { ...mockUserWithFavorites, favorites: [] };
            const mockPopulate = (jest.fn() as any).mockResolvedValue(mockUserNoFavorites);
            mockUser.findById = jest.fn().mockReturnValue({
                populate: mockPopulate
            });

            const result = await fetchFavoritedProperties("user123");

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should handle database error", async () => {
            const mockPopulate = (jest.fn() as any).mockRejectedValue(new Error("Database error"));
            mockUser.findById = jest.fn().mockReturnValue({
                populate: mockPopulate
            });

            await expect(fetchFavoritedProperties("user123")).rejects.toThrow("Failed to fetch favorite properties data");
        });

        it("should handle user not found", async () => {
            const mockPopulate = (jest.fn() as any).mockResolvedValue(null);
            mockUser.findById = jest.fn().mockReturnValue({
                populate: mockPopulate
            });

            await expect(fetchFavoritedProperties("user123")).rejects.toThrow();
        });

        it("should handle empty string user id", async () => {
            const mockPopulate = (jest.fn() as any).mockResolvedValue(mockUserWithFavorites);
            mockUser.findById = jest.fn().mockReturnValue({
                populate: mockPopulate
            });

            await fetchFavoritedProperties("");

            expect(mockUser.findById).toHaveBeenCalledWith("");
        });

        it("should handle invalid user id format", async () => {
            const mockPopulate = (jest.fn() as any).mockRejectedValue(new Error("Invalid ObjectId"));
            mockUser.findById = jest.fn().mockReturnValue({
                populate: mockPopulate
            });

            await expect(fetchFavoritedProperties("invalid-id")).rejects.toThrow("Failed to fetch favorite properties data");
        });
    });

    describe("searchProperties", () => {
        const mockQuery: PropertiesQuery = {
            $or: [
                { name: /beach/i },
                { description: /beach/i },
                { amenities: /beach/i },
                { type: /beach/i },
                { "location.street": /beach/i },
                { "location.city": /beach/i },
                { "location.state": /beach/i },
                { "location.zip": /beach/i }
            ]
        };

        it("should search properties successfully with query", async () => {
            const mockResults = [
                mockPropertyDocument,
                { ...mockPropertyDocument, _id: "property456", name: "Beach House" }
            ];
            mockProperty.find = (jest.fn() as any).mockResolvedValue(mockResults);

            const result = await searchProperties(mockQuery);

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockProperty.find).toHaveBeenCalledWith(mockQuery);
            expect(result).toEqual(mockResults);
            expect(result).toHaveLength(2);
        });

        it("should return empty array when no matches found", async () => {
            mockProperty.find = (jest.fn() as any).mockResolvedValue([]);

            const result = await searchProperties(mockQuery);

            expect(result).toEqual([]);
        });

        it("should handle database error", async () => {
            mockProperty.find = (jest.fn() as any).mockRejectedValue(new Error("Database error"));

            await expect(searchProperties(mockQuery)).rejects.toThrow("Failed to fetch query data");

            expect(mockProperty.find).toHaveBeenCalledWith(mockQuery);
        });

        it("should handle empty query object", async () => {
            const emptyQuery: PropertiesQuery = {
                $or: [
                    { name: /(?:)/i },
                    { description: /(?:)/i },
                    { amenities: /(?:)/i },
                    { type: /(?:)/i },
                    { "location.street": /(?:)/i },
                    { "location.city": /(?:)/i },
                    { "location.state": /(?:)/i },
                    { "location.zip": /(?:)/i }
                ]
            };
            mockProperty.find = (jest.fn() as any).mockResolvedValue([mockPropertyDocument]);

            const result = await searchProperties(emptyQuery);

            expect(mockProperty.find).toHaveBeenCalledWith(emptyQuery);
            expect(result).toEqual([mockPropertyDocument]);
        });

        it("should handle null response from database", async () => {
            mockProperty.find = (jest.fn() as any).mockResolvedValue(null);

            const result = await searchProperties(mockQuery);

            expect(result).toBeNull();
        });
    });

    describe("fetchNumPropertiesPages", () => {
        const mockQuery: PropertiesQuery = {
            $or: [
                { name: /test/i },
                { description: /test/i },
                { amenities: /test/i },
                { type: /test/i },
                { "location.street": /test/i },
                { "location.city": /test/i },
                { "location.state": /test/i },
                { "location.zip": /test/i }
            ]
        };

        it("should calculate pages correctly for viewport < 640px (8 items per page)", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(25);

            const result = await fetchNumPropertiesPages(mockQuery, 500);

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockProperty.countDocuments).toHaveBeenCalledWith(mockQuery);
            expect(result).toBe(4); // 25 / 8 = 3.125, rounded up to 4
        });

        it("should calculate pages correctly for viewport 640-768px (10 items per page)", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(25);

            const result = await fetchNumPropertiesPages(mockQuery, 700);

            expect(result).toBe(3); // 25 / 10 = 2.5, rounded up to 3
        });

        it("should calculate pages correctly for viewport 768-1024px (12 items per page)", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(25);

            const result = await fetchNumPropertiesPages(mockQuery, 900);

            expect(result).toBe(3); // 25 / 12 = 2.08, rounded up to 3
        });

        it("should calculate pages correctly for viewport >= 1024px (15 items per page)", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(30);

            const result = await fetchNumPropertiesPages(mockQuery, 1200);

            expect(result).toBe(2); // 30 / 15 = 2
        });

        it("should calculate pages correctly for viewport 768-1024px (12 items per page) with 1000px", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(25);

            const result = await fetchNumPropertiesPages(mockQuery, 1000);

            expect(result).toBe(3); // 25 / 12 = 2.08, rounded up to 3
        });

        it("should return 1 page when properties count is less than items per page", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(5);

            const result = await fetchNumPropertiesPages(mockQuery, 1200);

            expect(result).toBe(1); // 5 / 15 = 0.33, rounded up to 1
        });

        it("should return 0 pages when no properties exist", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(0);

            const result = await fetchNumPropertiesPages(mockQuery, 1200);

            expect(result).toBe(0);
        });

        it("should count all documents when query is not provided", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(50);

            await fetchNumPropertiesPages({} as PropertiesQuery, 1200);

            expect(mockProperty.countDocuments).toHaveBeenCalledWith({});
        });

        it("should handle database error", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockRejectedValue(new Error("Database error"));

            await expect(fetchNumPropertiesPages(mockQuery, 1200)).rejects.toThrow("Failed to fetch document count data");
        });

        it("should handle viewport width of 0", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(25);

            const result = await fetchNumPropertiesPages(mockQuery, 0);

            expect(result).toBe(4); // Uses 8 items per page for width < 640
        });

        it("should handle negative viewport width", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(25);

            const result = await fetchNumPropertiesPages(mockQuery, -100);

            expect(result).toBe(4); // Uses 8 items per page
        });

        it("should calculate pages correctly for exact multiple", async () => {
            mockProperty.countDocuments = (jest.fn() as any).mockResolvedValue(30);

            const result = await fetchNumPropertiesPages(mockQuery, 1200);

            expect(result).toBe(2); // 30 / 15 = 2 exactly
        });
    });

    describe("fetchPaginatedProperties", () => {
        const mockQuery: PropertiesQuery = {
            $or: [
                { name: /test/i },
                { description: /test/i },
                { amenities: /test/i },
                { type: /test/i },
                { "location.street": /test/i },
                { "location.city": /test/i },
                { "location.state": /test/i },
                { "location.zip": /test/i }
            ]
        };

        beforeEach(() => {
            const mockQuery = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockQuery);
        });

        it("should fetch paginated properties for first page", async () => {
            const mockResults = [mockPropertyDocument];
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(mockResults)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            const result = await fetchPaginatedProperties(1, 1200, mockQuery);

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockProperty.find).toHaveBeenCalledWith(mockQuery);
            expect(mockChain.skip).toHaveBeenCalledWith(0);
            expect(mockChain.limit).toHaveBeenCalledWith(15);
            expect(result).toEqual(mockResults);
        });

        it("should calculate correct offset for page 2", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(2, 1200, mockQuery);

            expect(mockChain.skip).toHaveBeenCalledWith(15); // (2-1) * 15
        });

        it("should calculate correct offset for page 3", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(3, 1200, mockQuery);

            expect(mockChain.skip).toHaveBeenCalledWith(30); // (3-1) * 15
        });

        it("should use correct items per page for viewport < 640px (8 items)", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 500, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(8);
        });

        it("should use correct items per page for viewport 640-768px (10 items)", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 700, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(10);
        });

        it("should use correct items per page for viewport 768-1024px (12 items)", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 900, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(12);
        });

        it("should use correct items per page for viewport 1024-1280px (15 items)", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 1100, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(15);
        });

        it("should use correct items per page for viewport >= 1280px (18 items)", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 1920, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(18);
        });

        it("should fetch all properties when query is not provided", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 1200);

            expect(mockProperty.find).toHaveBeenCalledWith();
        });

        it("should return empty array when no properties on page", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            const result = await fetchPaginatedProperties(10, 1200, mockQuery);

            expect(result).toEqual([]);
        });

        it("should handle database error", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockRejectedValue(new Error("Database error"))
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await expect(fetchPaginatedProperties(1, 1200, mockQuery)).rejects.toThrow("Failed to fetch properties data");
        });

        it("should handle page 0 (edge case)", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(0, 1200, mockQuery);

            expect(mockChain.skip).toHaveBeenCalledWith(-15); // (0-1) * 15 = -15
        });

        it("should handle negative page number", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(-1, 1200, mockQuery);

            expect(mockChain.skip).toHaveBeenCalledWith(-30); // (-1-1) * 15 = -30
        });

        it("should handle viewport width of 0", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, 0, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(8);
        });

        it("should handle negative viewport width", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue([mockPropertyDocument])
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            await fetchPaginatedProperties(1, -100, mockQuery);

            expect(mockChain.limit).toHaveBeenCalledWith(8);
        });

        it("should handle null response from database", async () => {
            const mockChain = {
                skip: (jest.fn() as any).mockReturnThis(),
                limit: (jest.fn() as any).mockResolvedValue(null)
            } as any;
            mockProperty.find = jest.fn().mockReturnValue(mockChain);

            const result = await fetchPaginatedProperties(1, 1200, mockQuery);

            expect(result).toBeNull();
        });
    });
});
