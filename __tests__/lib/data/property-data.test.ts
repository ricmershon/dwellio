import { PropertiesQuery } from "@/types/types";
import type { HydratedDocument } from "mongoose";

// Mock mongoose before any imports that use it
jest.mock("mongoose", () => ({
    HydratedDocument: jest.fn(),
    connection: {
        listeners: jest.fn().mockReturnValue([]),
        on: jest.fn()
    }
}));

// Mock database connection
jest.mock("@/lib/db-connect", () => jest.fn().mockResolvedValue(undefined));

// Mock Property and User models
jest.mock("@/models", () => ({
    Property: {
        findById: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn()
    },
    User: {
        findById: jest.fn()
    }
}));

// Import after mocking
import {
    fetchProperty,
    fetchPropertiesByUserId,
    fetchFeaturedProperties,
    fetchFavoritedProperties,
    searchProperties,
    fetchNumPropertiesPages,
    fetchPaginatedProperties
} from "@/lib/data/property-data";
import { Property, PropertyDocument, User } from "@/models";
import dbConnect from "@/lib/db-connect";

// Get mock instances
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

const mockProperty = Property as jest.Mocked<typeof Property>;
const mockUser = User as jest.Mocked<typeof User>;

describe('Property Data Layer Tests', () => {
    const mockPropertyData: Partial<PropertyDocument> = {
        _id: 'property123',
        name: 'Test Property',
        type: 'House',
        description: 'A beautiful test property',
        location: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TX',
            zipcode: '12345'
        },
        beds: 3,
        baths: 2,
        squareFeet: 1500,
        owner: 'user123' as unknown as import('mongoose').Types.ObjectId,
        isFeatured: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    };

    const mockUser1 = {
        _id: 'user123',
        favorites: [
            { _id: 'prop1', name: 'Favorite 1' },
            { _id: 'prop2', name: 'Favorite 2' }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined as any);
    });

    describe('fetchProperty', () => {
        describe('Successful Property Retrieval', () => {
            it('should fetch single property by ID successfully', async () => {
                const mockHydratedProperty = mockPropertyData as any;
                mockProperty.findById.mockResolvedValue(mockHydratedProperty);

                const result = await fetchProperty('property123');

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockProperty.findById).toHaveBeenCalledWith('property123');
                expect(result).toEqual(mockHydratedProperty);
            });

            it('should call dbConnect before querying', async () => {
                mockProperty.findById.mockResolvedValue(mockPropertyData as HydratedDocument<PropertyDocument>);

                await fetchProperty('property123');

                expect(mockDbConnect).toHaveBeenCalled();
            });

            it('should pass correct property ID to findById', async () => {
                mockProperty.findById.mockResolvedValue(mockPropertyData as HydratedDocument<PropertyDocument>);
                const testId = 'test-property-456';

                await fetchProperty(testId);

                expect(mockProperty.findById).toHaveBeenCalledWith(testId);
            });
        });

        describe('Property Not Found', () => {
            it('should throw error when property is not found', async () => {
                mockProperty.findById.mockResolvedValue(null);

                await expect(fetchProperty('nonexistent')).rejects.toThrow('Failed to fetch property data.');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Property not found.');
            });

            it('should log error message when property not found', async () => {
                mockProperty.findById.mockResolvedValue(null);

                try {
                    await fetchProperty('nonexistent');
                } catch {
                    // Expected to throw
                }

                expect(mockConsoleError).toHaveBeenCalledWith('>>> Property not found.');
            });
        });

        describe('Database Errors', () => {
            it('should handle database connection failures', async () => {
                const dbError = new Error('Database connection failed');
                mockDbConnect.mockRejectedValue(dbError);

                await expect(fetchProperty('property123')).rejects.toThrow('Failed to fetch property data: Error: Database connection failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching property: Error: Database connection failed');
            });

            it('should handle query execution errors', async () => {
                const queryError = new Error('Query execution failed');
                mockProperty.findById.mockRejectedValue(queryError);

                await expect(fetchProperty('property123')).rejects.toThrow('Failed to fetch property data: Error: Query execution failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching property: Error: Query execution failed');
            });

            it('should throw descriptive error messages', async () => {
                const error = new Error('Specific database error');
                mockProperty.findById.mockRejectedValue(error);

                await expect(fetchProperty('property123')).rejects.toThrow('Failed to fetch property data: Error: Specific database error');
            });
        });
    });

    describe('fetchPropertiesByUserId', () => {
        describe('Successful Properties Retrieval', () => {
            it('should fetch properties by user ID successfully', async () => {
                const mockProperties = [mockPropertyData, { ...mockPropertyData, _id: 'property456' }] as PropertyDocument[];
                mockProperty.find.mockResolvedValue(mockProperties);

                const result = await fetchPropertiesByUserId('user123');

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: 'user123' });
                expect(result).toEqual(mockProperties);
            });

            it('should return empty array when user has no properties', async () => {
                mockProperty.find.mockResolvedValue([]);

                const result = await fetchPropertiesByUserId('user456');

                expect(result).toEqual([]);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: 'user456' });
            });

            it('should filter properties by correct owner field', async () => {
                mockProperty.find.mockResolvedValue([]);
                const testUserId = 'test-user-789';

                await fetchPropertiesByUserId(testUserId);

                expect(mockProperty.find).toHaveBeenCalledWith({ owner: testUserId });
            });
        });

        describe('Database Errors', () => {
            it('should handle database connection failures', async () => {
                const dbError = new Error('Connection timeout');
                mockDbConnect.mockRejectedValue(dbError);

                await expect(fetchPropertiesByUserId('user123')).rejects.toThrow('Failed to fetch properties data: Error: Connection timeout');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching properties: Error: Connection timeout');
            });

            it('should handle find query errors', async () => {
                const findError = new Error('Find operation failed');
                mockProperty.find.mockRejectedValue(findError);

                await expect(fetchPropertiesByUserId('user123')).rejects.toThrow('Failed to fetch properties data: Error: Find operation failed');
            });
        });
    });

    describe('fetchFeaturedProperties', () => {
        describe('Responsive Property Limits', () => {
            it('should fetch 4 properties for mobile viewport (<768px)', async () => {
                const mockProperties = new Array(4).fill(mockPropertyData) as PropertyDocument[];
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue(mockProperties)
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                const result = await fetchFeaturedProperties(640);

                expect(mockProperty.find).toHaveBeenCalledWith({ isFeatured: true });
                expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
                expect(mockQuery.limit).toHaveBeenCalledWith(4);
                expect(result).toEqual(mockProperties);
            });

            it('should fetch 8 properties for tablet viewport (768px-1023px)', async () => {
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                await fetchFeaturedProperties(800);

                expect(mockQuery.limit).toHaveBeenCalledWith(8);
            });

            it('should fetch 10 properties for small desktop (1024px-1279px)', async () => {
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                await fetchFeaturedProperties(1100);

                expect(mockQuery.limit).toHaveBeenCalledWith(10);
            });

            it('should fetch 12 properties for large desktop (≥1280px)', async () => {
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                await fetchFeaturedProperties(1920);

                expect(mockQuery.limit).toHaveBeenCalledWith(12);
            });
        });

        describe('Query Logic', () => {
            it('should filter by isFeatured: true', async () => {
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                await fetchFeaturedProperties(1024);

                expect(mockProperty.find).toHaveBeenCalledWith({ isFeatured: true });
            });

            it('should sort by createdAt descending (newest first)', async () => {
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                await fetchFeaturedProperties(1024);

                expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
            });

            it('should apply limit after sort', async () => {
                const mockQuery = {
                    sort: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                };
                mockProperty.find.mockReturnValue(mockQuery as any);

                await fetchFeaturedProperties(1024);

                expect(mockQuery.sort).toHaveBeenCalled();
                expect(mockQuery.limit).toHaveBeenCalled();
            });
        });

        describe('Database Errors', () => {
            it('should handle database errors', async () => {
                const dbError = new Error('Database query failed');
                mockProperty.find.mockImplementation(() => {
                    throw dbError;
                });

                await expect(fetchFeaturedProperties(1024)).rejects.toThrow('Failed to fetch featured properties data: Error: Database query failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching featured properties: Error: Database query failed');
            });
        });
    });

    describe('fetchFavoritedProperties', () => {
        describe('Successful Favorites Retrieval', () => {
            it('should fetch user favorites with population', async () => {
                mockUser.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockUser1) } as any);

                const result = await fetchFavoritedProperties('user123');

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockUser.findById).toHaveBeenCalledWith('user123');
                expect(result).toEqual(mockUser1.favorites);
            });

            it('should populate favorites field', async () => {
                const mockPopulate = jest.fn().mockResolvedValue(mockUser1);
                mockUser.findById.mockReturnValue({ populate: mockPopulate } as any);

                await fetchFavoritedProperties('user123');

                expect(mockPopulate).toHaveBeenCalledWith('favorites');
            });

            it('should return user favorites array', async () => {
                mockUser.findById.mockReturnValue({ 
                    populate: jest.fn().mockResolvedValue(mockUser1) 
                } as any);

                const result = await fetchFavoritedProperties('user123');

                expect(result).toEqual(mockUser1.favorites);
            });
        });

        describe('Database Errors', () => {
            it('should handle user not found errors', async () => {
                const userError = new Error('User not found');
                mockUser.findById.mockImplementation(() => {
                    throw userError;
                });

                await expect(fetchFavoritedProperties('nonexistent')).rejects.toThrow('Failed to fetch favorite properties data: Error: User not found');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching favorite properties: Error: User not found');
            });

            it('should handle populate errors', async () => {
                const populateError = new Error('Population failed');
                mockUser.findById.mockReturnValue({ 
                    populate: jest.fn().mockRejectedValue(populateError) 
                } as any);

                await expect(fetchFavoritedProperties('user123')).rejects.toThrow('Failed to fetch favorite properties data: Error: Population failed');
            });
        });
    });

    describe('searchProperties', () => {
        describe('Query Execution', () => {
            it('should execute query and return properties', async () => {
                const testQuery: PropertiesQuery = {
                    $or: [
                        { name: /house/i },
                        { description: /house/i },
                        { amenities: /house/i },
                        { type: /house/i },
                        { "location.street": /house/i },
                        { "location.city": /house/i },
                        { "location.state": /house/i },
                        { "location.zip": /house/i }
                    ]
                };
                const mockProperties = [mockPropertyData] as PropertyDocument[];
                mockProperty.find.mockResolvedValue(mockProperties);

                const result = await searchProperties(testQuery);

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockProperty.find).toHaveBeenCalledWith(testQuery);
                expect(result).toEqual(mockProperties);
            });

            it('should handle empty query results', async () => {
                const testQuery: PropertiesQuery = {
                    $or: [
                        { name: /nonexistent/i },
                        { description: /nonexistent/i },
                        { amenities: /nonexistent/i },
                        { type: /nonexistent/i },
                        { "location.street": /nonexistent/i },
                        { "location.city": /nonexistent/i },
                        { "location.state": /nonexistent/i },
                        { "location.zip": /nonexistent/i }
                    ]
                };
                mockProperty.find.mockResolvedValue([]);

                const result = await searchProperties(testQuery);

                expect(result).toEqual([]);
                expect(mockProperty.find).toHaveBeenCalledWith(testQuery);
            });

            it('should pass exact query object to find', async () => {
                const complexQuery: PropertiesQuery = {
                    $or: [
                        { name: /apartment/i },
                        { description: /apartment/i },
                        { amenities: /apartment/i },
                        { type: /apartment/i },
                        { "location.street": /apartment/i },
                        { "location.city": /apartment/i },
                        { "location.state": /apartment/i },
                        { "location.zip": /apartment/i }
                    ]
                };
                mockProperty.find.mockResolvedValue([]);

                await searchProperties(complexQuery);

                expect(mockProperty.find).toHaveBeenCalledWith(complexQuery);
            });
        });

        describe('Database Errors', () => {
            it('should handle query execution errors', async () => {
                const queryError = new Error('Invalid query');
                mockProperty.find.mockRejectedValue(queryError);

                const emptyQuery: PropertiesQuery = {
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
                await expect(searchProperties(emptyQuery)).rejects.toThrow('Failed to fetch query data: Error: Invalid query');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error querying properties: Error: Invalid query');
            });
        });
    });

    describe('fetchNumPropertiesPages', () => {
        describe('Responsive Page Calculations', () => {
            it('should calculate pages with 8 items per page for mobile (<640px)', async () => {
                mockProperty.countDocuments.mockResolvedValue(24);

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
                const result = await fetchNumPropertiesPages(mockQuery, 480);

                expect(result).toBe(3); // 24 / 8 = 3 pages
            });

            it('should calculate pages with 10 items per page for small tablet (640px-767px)', async () => {
                mockProperty.countDocuments.mockResolvedValue(25);

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
                const result = await fetchNumPropertiesPages(mockQuery, 720);

                expect(result).toBe(3); // Math.ceil(25 / 10) = 3 pages
            });

            it('should calculate pages with 12 items per page for tablet (768px-1023px)', async () => {
                mockProperty.countDocuments.mockResolvedValue(30);

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
                const result = await fetchNumPropertiesPages(mockQuery, 800);

                expect(result).toBe(3); // Math.ceil(30 / 12) = 3 pages
            });

            it('should calculate pages with 15 items per page for desktop (≥1024px)', async () => {
                mockProperty.countDocuments.mockResolvedValue(45);

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
                const result = await fetchNumPropertiesPages(mockQuery, 1200);

                expect(result).toBe(3); // 45 / 15 = 3 pages
            });

            it('should handle partial pages correctly', async () => {
                mockProperty.countDocuments.mockResolvedValue(13);

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
                const result = await fetchNumPropertiesPages(mockQuery, 1024);

                expect(result).toBe(1); // Math.ceil(13 / 15) = 1 page
            });
        });

        describe('Query Handling', () => {
            it('should count documents with query when provided', async () => {
                const testQuery: PropertiesQuery = {
                    $or: [
                        { name: /house/i },
                        { description: /house/i },
                        { amenities: /house/i },
                        { type: /house/i },
                        { "location.street": /house/i },
                        { "location.city": /house/i },
                        { "location.state": /house/i },
                        { "location.zip": /house/i }
                    ]
                };
                mockProperty.countDocuments.mockResolvedValue(10);

                await fetchNumPropertiesPages(testQuery, 1024);

                expect(mockProperty.countDocuments).toHaveBeenCalledWith(testQuery);
            });

            it('should count all documents when no query provided', async () => {
                mockProperty.countDocuments.mockResolvedValue(100);

                await fetchNumPropertiesPages(null as any, 1024);

                expect(mockProperty.countDocuments).toHaveBeenCalledWith();
            });
        });

        describe('Database Errors', () => {
            it('should handle count operation errors', async () => {
                const countError = new Error('Count operation failed');
                mockProperty.countDocuments.mockRejectedValue(countError);

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
                await expect(fetchNumPropertiesPages(mockQuery, 1024)).rejects.toThrow('Failed to fetch document count data: Error: Count operation failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching document count: Error: Count operation failed');
            });
        });
    });

    describe('fetchPaginatedProperties', () => {
        describe('Pagination Logic', () => {
            it('should calculate correct offset for pagination', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(3, 1024); // Page 3, desktop

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.skip).toHaveBeenCalledWith(30); // (3 - 1) * 15 = 30
                expect(mockQuery.limit).toHaveBeenCalledWith(15);
            });

            it('should handle first page correctly (offset = 0)', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 1024);

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.skip).toHaveBeenCalledWith(0); // (1 - 1) * 15 = 0
            });
        });

        describe('Responsive Items Per Page', () => {
            it('should use 8 items per page for mobile (<640px)', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 480);

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.limit).toHaveBeenCalledWith(8);
            });

            it('should use 10 items per page for small tablet (640px-767px)', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 720);

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.limit).toHaveBeenCalledWith(10);
            });

            it('should use 12 items per page for tablet (768px-1023px)', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 800);

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.limit).toHaveBeenCalledWith(12);
            });

            it('should use 15 items per page for desktop (1024px-1279px)', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 1200);

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.limit).toHaveBeenCalledWith(15);
            });

            it('should use 18 items per page for large desktop (≥1280px)', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 1400);

                const mockQuery = mockProperty.find.mock.results[0].value;
                expect(mockQuery.limit).toHaveBeenCalledWith(18);
            });
        });

        describe('Query Integration', () => {
            it('should apply query when provided', async () => {
                const testQuery: PropertiesQuery = {
                    $or: [
                        { name: /condo/i },
                        { description: /condo/i },
                        { amenities: /condo/i },
                        { type: /condo/i },
                        { "location.street": /condo/i },
                        { "location.city": /condo/i },
                        { "location.state": /condo/i },
                        { "location.zip": /condo/i }
                    ]
                };
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 1024, testQuery);

                expect(mockProperty.find).toHaveBeenCalledWith(testQuery);
            });

            it('should use empty query when not provided', async () => {
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue([])
                } as any);

                await fetchPaginatedProperties(1, 1024);

                expect(mockProperty.find).toHaveBeenCalledWith();
            });

            it('should return paginated results', async () => {
                const mockProperties = [mockPropertyData] as PropertyDocument[];
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue(mockProperties)
                } as any);

                const result = await fetchPaginatedProperties(1, 1024);

                expect(result).toEqual(mockProperties);
            });
        });

        describe('Database Errors', () => {
            it('should handle pagination query errors', async () => {
                const paginationError = new Error('Pagination failed');
                mockProperty.find.mockImplementation(() => {
                    throw paginationError;
                });

                await expect(fetchPaginatedProperties(1, 1024)).rejects.toThrow('Failed to fetch properties data: Error: Pagination failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching properties: Error: Pagination failed');
            });

            it('should handle skip/limit chain errors', async () => {
                const chainError = new Error('Skip/limit chain failed');
                mockProperty.find.mockReturnValue({
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockRejectedValue(chainError)
                } as any);

                await expect(fetchPaginatedProperties(1, 1024)).rejects.toThrow('Failed to fetch properties data: Error: Skip/limit chain failed');
            });
        });
    });

    describe('fetchPropertiesByUserId', () => {
        describe('Query Logic', () => {
            it('should filter properties by owner field matching userId', async () => {
                const testUserId = 'user123';
                const mockProperties = [mockPropertyData] as PropertyDocument[];
                mockProperty.find.mockResolvedValue(mockProperties);

                const result = await fetchPropertiesByUserId(testUserId);

                expect(mockDbConnect).toHaveBeenCalledTimes(1);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: testUserId });
                expect(result).toEqual(mockProperties);
            });

            it('should return all properties owned by the user', async () => {
                const testUserId = 'user456';
                const mockUserProperties = [
                    mockPropertyData,
                    { ...mockPropertyData, _id: 'property2', name: 'Second Property' },
                    { ...mockPropertyData, _id: 'property3', name: 'Third Property' }
                ] as PropertyDocument[];
                mockProperty.find.mockResolvedValue(mockUserProperties);

                const result = await fetchPropertiesByUserId(testUserId);

                expect(result).toHaveLength(3);
                expect(result).toEqual(mockUserProperties);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: testUserId });
            });

            it('should handle valid ObjectId strings', async () => {
                const objectIdString = '507f1f77bcf86cd799439011';
                mockProperty.find.mockResolvedValue([]);

                await fetchPropertiesByUserId(objectIdString);

                expect(mockProperty.find).toHaveBeenCalledWith({ owner: objectIdString });
            });

            it('should handle different userId formats', async () => {
                const userIds = ['user123', 'abc-def-ghi', '12345', 'user@example.com'];
                mockProperty.find.mockResolvedValue([]);

                for (const userId of userIds) {
                    await fetchPropertiesByUserId(userId);
                    expect(mockProperty.find).toHaveBeenCalledWith({ owner: userId });
                }

                expect(mockProperty.find).toHaveBeenCalledTimes(userIds.length);
            });
        });

        describe('Database Integration', () => {
            it('should call dbConnect before query execution', async () => {
                mockProperty.find.mockResolvedValue([]);

                await fetchPropertiesByUserId('user123');

                expect(mockDbConnect).toHaveBeenCalled();
            });

            it('should handle database connection failures', async () => {
                const connectionError = new Error('Database connection failed');
                mockDbConnect.mockRejectedValue(connectionError);

                await expect(fetchPropertiesByUserId('user123')).rejects.toThrow('Failed to fetch properties data: Error: Database connection failed');
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching properties: Error: Database connection failed');
            });

            it('should execute Property.find with correct parameters', async () => {
                const testUserId = 'test-user-id';
                mockProperty.find.mockResolvedValue([]);

                await fetchPropertiesByUserId(testUserId);

                expect(mockProperty.find).toHaveBeenCalledWith({ owner: testUserId });
                expect(mockProperty.find).toHaveBeenCalledTimes(1);
            });

            it('should return PropertyDocument array from database', async () => {
                const mockResults = [mockPropertyData, { ...mockPropertyData, _id: 'property2' }] as PropertyDocument[];
                mockProperty.find.mockResolvedValue(mockResults);

                const result = await fetchPropertiesByUserId('user123');

                expect(result).toBe(mockResults); // Should return exact same array reference
                expect(Array.isArray(result)).toBe(true);
            });
        });

        describe('Data Handling', () => {
            it('should preserve all property fields and structure', async () => {
                const fullPropertyData = {
                    ...mockPropertyData,
                    amenities: ['WiFi', 'Pool', 'Gym'],
                    rates: { nightly: 200, weekly: 1200, monthly: 4000 },
                    imagesData: [{ secureUrl: 'test.jpg', publicId: 'test', width: 800, height: 600 }]
                } as PropertyDocument;
                mockProperty.find.mockResolvedValue([fullPropertyData]);

                const result = await fetchPropertiesByUserId('user123');

                expect(result[0]).toEqual(fullPropertyData);
                expect(result[0].amenities).toEqual(['WiFi', 'Pool', 'Gym']);
                expect(result[0].rates).toEqual({ nightly: 200, weekly: 1200, monthly: 4000 });
                expect(result[0].imagesData).toBeDefined();
            });

            it('should handle empty result sets (no properties)', async () => {
                mockProperty.find.mockResolvedValue([]);

                const result = await fetchPropertiesByUserId('user-no-properties');

                expect(result).toEqual([]);
                expect(Array.isArray(result)).toBe(true);
                expect(result).toHaveLength(0);
            });

            it('should maintain document integrity', async () => {
                const propertyWithComplexData = {
                    ...mockPropertyData,
                    location: {
                        street: '123 Complex Street Name',
                        city: 'City-With-Hyphens',
                        state: 'CA',
                        zipcode: '90210-1234'
                    },
                    description: 'A property with "quotes" and special chars: !@#$%^&*()'
                } as PropertyDocument;
                mockProperty.find.mockResolvedValue([propertyWithComplexData]);

                const result = await fetchPropertiesByUserId('user123');

                expect(result[0].location).toEqual(propertyWithComplexData.location);
                expect(result[0].description).toBe(propertyWithComplexData.description);
            });

            it('should handle null or undefined fields gracefully', async () => {
                const propertyWithNullFields = {
                    ...mockPropertyData,
                    description: null,
                    amenities: undefined,
                    rates: { nightly: undefined, weekly: 1000, monthly: null }
                } as unknown as PropertyDocument;
                mockProperty.find.mockResolvedValue([propertyWithNullFields]);

                const result = await fetchPropertiesByUserId('user123');

                expect(result[0]).toEqual(propertyWithNullFields);
                expect(result[0].description).toBeNull();
                expect(result[0].amenities).toBeUndefined();
            });
        });

        describe('Error Handling', () => {
            it('should throw descriptive errors on failure', async () => {
                const dbError = new Error('Database query failed');
                mockProperty.find.mockRejectedValue(dbError);

                await expect(fetchPropertiesByUserId('user123')).rejects.toThrow('Failed to fetch properties data: Error: Database query failed');
            });

            it('should log database errors to console with prefix', async () => {
                const specificError = new Error('Specific database error');
                mockProperty.find.mockRejectedValue(specificError);

                try {
                    await fetchPropertiesByUserId('user123');
                } catch {
                    // Expected to throw
                }

                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching properties: Error: Specific database error');
            });

            it('should propagate errors to calling code', async () => {
                const originalError = new Error('Original database error');
                mockProperty.find.mockRejectedValue(originalError);

                let caughtError;
                try {
                    await fetchPropertiesByUserId('user123');
                } catch (error) {
                    caughtError = error;
                }

                expect(caughtError).toBeInstanceOf(Error);
                expect((caughtError as Error).message).toContain('Failed to fetch properties data');
                expect((caughtError as Error).message).toContain('Original database error');
            });

            it('should handle malformed userId parameters', async () => {
                const malformedUserIds = ['', null, undefined, 123, {}, []];
                mockProperty.find.mockResolvedValue([]);

                for (const userId of malformedUserIds) {
                    try {
                        await fetchPropertiesByUserId(userId as any);
                        expect(mockProperty.find).toHaveBeenCalledWith({ owner: userId });
                    } catch (error) {
                        // Some malformed IDs might cause errors, which is acceptable
                        expect(error).toBeInstanceOf(Error);
                    }
                }
            });
        });

        describe('Edge Cases', () => {
            it('should handle non-existent userId gracefully', async () => {
                const nonExistentUserId = 'non-existent-user-999';
                mockProperty.find.mockResolvedValue([]);

                const result = await fetchPropertiesByUserId(nonExistentUserId);

                expect(result).toEqual([]);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: nonExistentUserId });
            });

            it('should return empty array for users with no properties', async () => {
                const userWithNoProperties = 'user-no-properties';
                mockProperty.find.mockResolvedValue([]);

                const result = await fetchPropertiesByUserId(userWithNoProperties);

                expect(result).toEqual([]);
                expect(Array.isArray(result)).toBe(true);
            });

            it('should handle database query failures', async () => {
                const queryError = new Error('Query execution failed');
                mockProperty.find.mockRejectedValue(queryError);

                await expect(fetchPropertiesByUserId('user123')).rejects.toThrow('Failed to fetch properties data: Error: Query execution failed');
            });

            it('should manage memory efficiently for large datasets', async () => {
                // Create a large array of properties
                const largePropertySet = Array.from({ length: 1000 }, (_, index) => ({
                    ...mockPropertyData,
                    _id: `property${index}`,
                    name: `Property ${index}`
                })) as PropertyDocument[];
                
                mockProperty.find.mockResolvedValue(largePropertySet);

                const result = await fetchPropertiesByUserId('user-with-many-properties');

                expect(result).toHaveLength(1000);
                expect(result[0]._id).toBe('property0');
                expect(result[999]._id).toBe('property999');
            });

            it('should handle concurrent calls to same user', async () => {
                const userId = 'concurrent-user';
                const mockProperties = [mockPropertyData] as PropertyDocument[];
                mockProperty.find.mockResolvedValue(mockProperties);

                // Make multiple concurrent calls
                const promises = Array.from({ length: 5 }, () => fetchPropertiesByUserId(userId));
                const results = await Promise.all(promises);

                // All calls should succeed
                results.forEach(result => {
                    expect(result).toEqual(mockProperties);
                });

                expect(mockProperty.find).toHaveBeenCalledTimes(5);
            });
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should handle zero properties in database', async () => {
            mockProperty.countDocuments.mockResolvedValue(0);

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
            const result = await fetchNumPropertiesPages(mockQuery, 1024);

            expect(result).toBe(0); // Math.ceil(0 / 15) = 0 pages
        });

        it('should handle large property counts', async () => {
            mockProperty.countDocuments.mockResolvedValue(1000000);

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
            const result = await fetchNumPropertiesPages(mockQuery, 1024);

            expect(result).toBe(66667); // Math.ceil(1000000 / 15) = 66667 pages
        });

        it('should handle extreme viewport widths', async () => {
            mockProperty.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([])
            } as any);

            await fetchFeaturedProperties(0);
            await fetchFeaturedProperties(10000);

            // Should handle gracefully without errors
            expect(mockProperty.find).toHaveBeenCalledTimes(2);
        });
    });

    describe('Authentication Integration', () => {
        describe('Property Ownership Validation', () => {
            it('should filter properties by exact user ID match', async () => {
                const testUserId = 'authenticated-user-123';
                const userProperties = [mockPropertyData, mockPropertyData];
                mockProperty.find.mockResolvedValue(userProperties);

                await fetchPropertiesByUserId(testUserId);

                expect(mockProperty.find).toHaveBeenCalledWith({ owner: testUserId });
            });

            it('should return empty array for users with no properties', async () => {
                const testUserId = 'new-user-456';
                mockProperty.find.mockResolvedValue([]);

                const result = await fetchPropertiesByUserId(testUserId);

                expect(result).toEqual([]);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: testUserId });
            });

            it('should handle invalid user IDs gracefully', async () => {
                const invalidUserId = 'invalid-user-id';
                mockProperty.find.mockRejectedValue(new Error('Invalid user ID'));

                await expect(fetchPropertiesByUserId(invalidUserId)).rejects.toThrow();
                expect(mockDbConnect).toHaveBeenCalled();
            });

            it('should prevent cross-user property access', async () => {
                const user1Id = 'user-1';
                const user2Id = 'user-2';
                const user1Properties = [{ ...mockPropertyData, owner: user1Id }];
                
                mockProperty.find
                    .mockResolvedValueOnce(user1Properties)
                    .mockResolvedValueOnce([]);

                const user1Result = await fetchPropertiesByUserId(user1Id);
                const user2Result = await fetchPropertiesByUserId(user2Id);

                expect(user1Result).toHaveLength(1);
                expect(user2Result).toHaveLength(0);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: user1Id });
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: user2Id });
            });
        });

        describe('Session Data Integration', () => {
            it('should handle session-based user identification', async () => {
                const sessionUserId = 'session-user-789';
                const sessionUserProperties = [mockPropertyData];
                mockProperty.find.mockResolvedValue(sessionUserProperties);

                const result = await fetchPropertiesByUserId(sessionUserId);

                expect(result).toEqual(sessionUserProperties);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: sessionUserId });
            });

            it('should maintain data privacy across different sessions', async () => {
                const session1UserId = 'session1-user';
                const session2UserId = 'session2-user';
                
                // Simulate different session calls
                await fetchPropertiesByUserId(session1UserId);
                await fetchPropertiesByUserId(session2UserId);

                expect(mockProperty.find).toHaveBeenNthCalledWith(1, { owner: session1UserId });
                expect(mockProperty.find).toHaveBeenNthCalledWith(2, { owner: session2UserId });
            });
        });

        describe('Security and Authorization', () => {
            it('should not leak properties between users', async () => {
                const user1 = 'user1';
                const user2 = 'user2';
                
                const user1Properties = [{ ...mockPropertyData, _id: 'prop1', owner: user1 }];
                const user2Properties = [{ ...mockPropertyData, _id: 'prop2', owner: user2 }];
                
                // First call for user1
                mockProperty.find.mockResolvedValueOnce(user1Properties);
                const result1 = await fetchPropertiesByUserId(user1);
                
                // Second call for user2
                mockProperty.find.mockResolvedValueOnce(user2Properties);
                const result2 = await fetchPropertiesByUserId(user2);

                expect(result1[0]._id).toBe('prop1');
                expect(result2[0]._id).toBe('prop2');
                expect(result1).not.toEqual(result2);
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: user1 });
                expect(mockProperty.find).toHaveBeenCalledWith({ owner: user2 });
            });

            it('should validate user ownership consistently', async () => {
                const ownerId = 'property-owner-123';
                const properties = [
                    { ...mockPropertyData, owner: ownerId },
                    { ...mockPropertyData, owner: ownerId }
                ];
                mockProperty.find.mockResolvedValue(properties);

                const result = await fetchPropertiesByUserId(ownerId);

                expect(result).toHaveLength(2);
                result.forEach(property => {
                    expect(property.owner).toBe(ownerId);
                });
            });

            it('should handle unauthorized access attempts', async () => {
                const unauthorizedUserId = 'unauthorized-user';
                mockProperty.find.mockRejectedValue(new Error('Access denied'));

                await expect(fetchPropertiesByUserId(unauthorizedUserId))
                    .rejects.toThrow('Access denied');
            });
        });
    });

    // FAVORITES-SPECIFIC DATA LAYER TESTS - Phase 2 Enhancement
    describe('Advanced Favorites System Tests', () => {
        const createMockFavoritedProperty = (overrides: Partial<PropertyDocument> = {}) => ({
            _id: `fav-prop-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Favorited Property',
            type: 'House',
            description: 'A beautiful favorited property',
            location: {
                street: '456 Favorite St',
                city: 'Favorite City',
                state: 'FC',
                zipcode: '54321'
            },
            beds: 3,
            baths: 2,
            squareFeet: 1800,
            owner: 'property-owner-123' as unknown as import('mongoose').Types.ObjectId,
            isFeatured: true,
            amenities: ['Pool', 'WiFi', 'Gym'],
            rates: { nightly: 200, weekly: 1200, monthly: 4000 },
            imagesData: [
                { secureUrl: 'https://test.com/fav1.jpg', publicId: 'fav1', width: 800, height: 600 }
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            ...overrides,
        } as Partial<PropertyDocument>);

        const createMockUserWithFavorites = (userId: string, favoriteProperties: any[] = []) => ({
            _id: userId,
            email: `user-${userId}@test.com`,
            name: `Test User ${userId}`,
            favorites: favoriteProperties,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        describe('Favorites Data Retrieval', () => {
            it('should fetch user favorites with complete property data', async () => {
                const userId = 'favorites-user-123';
                const favoriteProperties = [
                    createMockFavoritedProperty({ name: 'Favorite Beach House' }),
                    createMockFavoritedProperty({ name: 'Favorite Mountain Cabin' }),
                ];
                const userWithFavorites = createMockUserWithFavorites(userId, favoriteProperties);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(mockDbConnect).toHaveBeenCalled();
                expect(mockUser.findById).toHaveBeenCalledWith(userId);
                expect(result).toEqual(favoriteProperties);
                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Favorite Beach House');
                expect(result[1].name).toBe('Favorite Mountain Cabin');
            });

            it('should handle empty favorites list correctly', async () => {
                const userId = 'user-no-favorites';
                const userWithNoFavorites = createMockUserWithFavorites(userId, []);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithNoFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result).toEqual([]);
                expect(result).toHaveLength(0);
            });

            it('should populate favorites with all necessary property fields', async () => {
                const userId = 'detailed-user';
                const detailedFavorite = createMockFavoritedProperty({
                    name: 'Detailed Favorite Property',
                    beds: 4,
                    baths: 3,
                    squareFeet: 2500,
                    amenities: ['Pool', 'Spa', 'Gym', 'WiFi'],
                    rates: { nightly: 350, weekly: 2100, monthly: 7000 }
                });
                const userWithDetailedFavorites = createMockUserWithFavorites(userId, [detailedFavorite]);

                const mockPopulate = jest.fn().mockResolvedValue(userWithDetailedFavorites);
                mockUser.findById.mockReturnValue({ populate: mockPopulate } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(mockPopulate).toHaveBeenCalledWith('favorites');
                expect(result[0]).toEqual(detailedFavorite);
                expect(result[0].amenities).toHaveLength(4);
                expect(result[0].rates.nightly).toBe(350);
            });

            it('should handle large favorites lists efficiently', async () => {
                const userId = 'power-user';
                const largeFavoritesList = Array.from({ length: 50 }, (_, i) => 
                    createMockFavoritedProperty({ 
                        name: `Favorite Property ${i + 1}`,
                        _id: `large-fav-${i}`
                    })
                );
                const userWithManyFavorites = createMockUserWithFavorites(userId, largeFavoritesList);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithManyFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result).toHaveLength(50);
                expect(result[0].name).toBe('Favorite Property 1');
                expect(result[49].name).toBe('Favorite Property 50');
            });
        });

        describe('Favorites Data Integrity', () => {
            it('should maintain referential integrity for favorited properties', async () => {
                const userId = 'integrity-user';
                const favoriteWithOwner = createMockFavoritedProperty({
                    name: 'Owner Integrity Test',
                    owner: 'property-owner-456' as unknown as import('mongoose').Types.ObjectId
                });
                const userWithFavorites = createMockUserWithFavorites(userId, [favoriteWithOwner]);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result[0].owner).toBe('property-owner-456');
                expect(result[0]._id).toBeTruthy();
            });

            it('should handle favorites with mixed property types', async () => {
                const userId = 'mixed-types-user';
                const mixedFavorites = [
                    createMockFavoritedProperty({ name: 'House Favorite', type: 'House' }),
                    createMockFavoritedProperty({ name: 'Apartment Favorite', type: 'Apartment' }),
                    createMockFavoritedProperty({ name: 'Condo Favorite', type: 'Condo' }),
                ];
                const userWithMixedFavorites = createMockUserWithFavorites(userId, mixedFavorites);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithMixedFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result).toHaveLength(3);
                expect(result.map(p => p.type)).toEqual(['House', 'Apartment', 'Condo']);
            });

            it('should preserve favorite property metadata', async () => {
                const userId = 'metadata-user';
                const metadataFavorite = createMockFavoritedProperty({
                    name: 'Metadata Rich Property',
                    createdAt: new Date('2023-06-15'),
                    updatedAt: new Date('2024-01-10'),
                    isFeatured: true,
                    amenities: ['Premium WiFi', 'Concierge', 'Valet']
                });
                const userWithMetadataFavorites = createMockUserWithFavorites(userId, [metadataFavorite]);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithMetadataFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result[0].isFeatured).toBe(true);
                expect(result[0].createdAt).toEqual(new Date('2023-06-15'));
                expect(result[0].updatedAt).toEqual(new Date('2024-01-10'));
                expect(result[0].amenities).toContain('Premium WiFi');
            });
        });

        describe('Favorites Performance & Optimization', () => {
            it('should efficiently handle database population queries', async () => {
                const userId = 'performance-user';
                const performanceFavorites = Array.from({ length: 25 }, (_, i) => 
                    createMockFavoritedProperty({ name: `Performance Test ${i}` })
                );
                const performanceUser = createMockUserWithFavorites(userId, performanceFavorites);

                const mockPopulate = jest.fn().mockResolvedValue(performanceUser);
                mockUser.findById.mockReturnValue({ populate: mockPopulate } as any);

                const startTime = performance.now();
                const result = await fetchFavoritedProperties(userId);
                const endTime = performance.now();

                expect(result).toHaveLength(25);
                expect(endTime - startTime).toBeLessThan(50); // Should be fast
                expect(mockPopulate).toHaveBeenCalledTimes(1);
            });

            it('should minimize database calls for favorites retrieval', async () => {
                const userId = 'optimization-user';
                const favorites = [createMockFavoritedProperty()];
                const user = createMockUserWithFavorites(userId, favorites);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(user)
                } as any);

                await fetchFavoritedProperties(userId);

                // Should only call findById once and populate once
                expect(mockUser.findById).toHaveBeenCalledTimes(1);
                expect(mockDbConnect).toHaveBeenCalledTimes(1);
            });

            it('should handle concurrent favorites requests', async () => {
                const user1 = 'concurrent-user-1';
                const user2 = 'concurrent-user-2';
                const favorites1 = [createMockFavoritedProperty({ name: 'User 1 Favorite' })];
                const favorites2 = [createMockFavoritedProperty({ name: 'User 2 Favorite' })];

                mockUser.findById
                    .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue(createMockUserWithFavorites(user1, favorites1)) } as any)
                    .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue(createMockUserWithFavorites(user2, favorites2)) } as any);

                const [result1, result2] = await Promise.all([
                    fetchFavoritedProperties(user1),
                    fetchFavoritedProperties(user2)
                ]);

                expect(result1[0].name).toBe('User 1 Favorite');
                expect(result2[0].name).toBe('User 2 Favorite');
                expect(mockUser.findById).toHaveBeenCalledTimes(2);
            });
        });

        describe('Favorites Error Handling', () => {
            it('should handle user not found errors gracefully', async () => {
                const nonexistentUserId = 'nonexistent-user';
                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null)
                } as any);

                // The current implementation throws an error when user is null
                await expect(fetchFavoritedProperties(nonexistentUserId))
                    .rejects.toThrow('Failed to fetch favorite properties data');
            });

            it('should handle database connection errors during favorites fetch', async () => {
                const userId = 'db-error-user';
                const dbError = new Error('Database connection timeout');
                mockDbConnect.mockRejectedValue(dbError);

                await expect(fetchFavoritedProperties(userId))
                    .rejects.toThrow('Failed to fetch favorite properties data: Error: Database connection timeout');
                
                expect(mockConsoleError).toHaveBeenCalledWith('>>> Database error fetching favorite properties: Error: Database connection timeout');
            });

            it('should handle population errors during favorites fetch', async () => {
                const userId = 'populate-error-user';
                const populateError = new Error('Population reference error');
                
                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockRejectedValue(populateError)
                } as any);

                await expect(fetchFavoritedProperties(userId))
                    .rejects.toThrow('Failed to fetch favorite properties data: Error: Population reference error');
            });

            it('should handle corrupted favorite data gracefully', async () => {
                const userId = 'corrupted-data-user';
                const corruptedUser = {
                    _id: userId,
                    favorites: [
                        null, // Corrupted favorite
                        createMockFavoritedProperty({ name: 'Valid Favorite' }),
                        undefined, // Another corrupted entry
                    ]
                };

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(corruptedUser)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                // Should still return the array, even with null/undefined entries
                expect(result).toHaveLength(3);
                expect(result[1].name).toBe('Valid Favorite');
            });
        });

        describe('Favorites User Experience', () => {
            it('should maintain favorite order from user preferences', async () => {
                const userId = 'ordered-user';
                const orderedFavorites = [
                    createMockFavoritedProperty({ name: 'First Favorite', _id: 'first-fav' }),
                    createMockFavoritedProperty({ name: 'Second Favorite', _id: 'second-fav' }),
                    createMockFavoritedProperty({ name: 'Third Favorite', _id: 'third-fav' }),
                ];
                const userWithOrderedFavorites = createMockUserWithFavorites(userId, orderedFavorites);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithOrderedFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result[0].name).toBe('First Favorite');
                expect(result[1].name).toBe('Second Favorite');
                expect(result[2].name).toBe('Third Favorite');
            });

            it('should support different user favorite patterns', async () => {
                const userPatterns = [
                    { id: 'heavy-user', count: 100 },
                    { id: 'light-user', count: 3 },
                    { id: 'medium-user', count: 15 },
                    { id: 'new-user', count: 0 }
                ];

                for (const pattern of userPatterns) {
                    const favorites = Array.from({ length: pattern.count }, (_, i) => 
                        createMockFavoritedProperty({ name: `${pattern.id} Favorite ${i}` })
                    );
                    const user = createMockUserWithFavorites(pattern.id, favorites);

                    mockUser.findById.mockReturnValue({
                        populate: jest.fn().mockResolvedValue(user)
                    } as any);

                    const result = await fetchFavoritedProperties(pattern.id);
                    expect(result).toHaveLength(pattern.count);
                }

                expect(mockUser.findById).toHaveBeenCalledTimes(4);
            });

            it('should handle favorites with different property statuses', async () => {
                const userId = 'status-user';
                const statusFavorites = [
                    createMockFavoritedProperty({ name: 'Featured Favorite', isFeatured: true }),
                    createMockFavoritedProperty({ name: 'Regular Favorite', isFeatured: false }),
                    createMockFavoritedProperty({ name: 'Recent Favorite', createdAt: new Date() }),
                ];
                const userWithStatusFavorites = createMockUserWithFavorites(userId, statusFavorites);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithStatusFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result[0].isFeatured).toBe(true);
                expect(result[1].isFeatured).toBe(false);
                expect(result[2].createdAt).toBeInstanceOf(Date);
            });
        });

        describe('Favorites Data Validation', () => {
            it('should validate favorite property completeness', async () => {
                const userId = 'validation-user';
                const completeFavorite = createMockFavoritedProperty({
                    name: 'Complete Property',
                    location: {
                        street: '789 Complete St',
                        city: 'Complete City',
                        state: 'FL',
                        zipcode: '99999'
                    },
                    rates: { nightly: 150, weekly: 900, monthly: 3000 }
                });
                const userWithCompleteFavorite = createMockUserWithFavorites(userId, [completeFavorite]);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithCompleteFavorite)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result[0]).toHaveProperty('name');
                expect(result[0]).toHaveProperty('location');
                expect(result[0]).toHaveProperty('rates');
                expect(result[0].location).toHaveProperty('street');
                expect(result[0].rates).toHaveProperty('nightly');
            });

            it('should handle favorites with missing optional fields', async () => {
                const userId = 'optional-fields-user';
                const minimalFavorite = {
                    _id: 'minimal-fav',
                    name: 'Minimal Favorite',
                    type: 'House',
                    // Missing many optional fields
                    owner: 'owner-123' as unknown as import('mongoose').Types.ObjectId
                } as unknown as Partial<PropertyDocument>;
                const userWithMinimalFavorite = createMockUserWithFavorites(userId, [minimalFavorite]);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithMinimalFavorite)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result[0].name).toBe('Minimal Favorite');
                expect(result[0]._id).toBe('minimal-fav');
            });
        });

        describe('Favorites Integration with Other Systems', () => {
            it('should integrate with featured properties system', async () => {
                const userId = 'featured-integration-user';
                const featuredFavorites = [
                    createMockFavoritedProperty({ name: 'Featured Favorite 1', isFeatured: true }),
                    createMockFavoritedProperty({ name: 'Featured Favorite 2', isFeatured: true }),
                    createMockFavoritedProperty({ name: 'Regular Favorite', isFeatured: false }),
                ];
                const userWithFeaturedFavorites = createMockUserWithFavorites(userId, featuredFavorites);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithFeaturedFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                const featuredCount = result.filter(p => p.isFeatured).length;
                expect(featuredCount).toBe(2);
            });

            it('should work with property search and filtering', async () => {
                const userId = 'search-integration-user';
                const searchableFavorites = [
                    createMockFavoritedProperty({ 
                        name: 'Luxury Beach House', 
                        type: 'House',
                        location: { 
                            street: '123 Beach Blvd',
                            city: 'Miami',
                            state: 'FL',
                            zipcode: '33101'
                        }
                    }),
                    createMockFavoritedProperty({ 
                        name: 'Downtown Apartment', 
                        type: 'Apartment',
                        location: { 
                            street: '456 Broadway',
                            city: 'New York',
                            state: 'NY',
                            zipcode: '10001'
                        }
                    }),
                ];
                const userWithSearchableFavorites = createMockUserWithFavorites(userId, searchableFavorites);

                mockUser.findById.mockReturnValue({
                    populate: jest.fn().mockResolvedValue(userWithSearchableFavorites)
                } as any);

                const result = await fetchFavoritedProperties(userId);

                expect(result.find(p => p.name.includes('Beach'))).toBeTruthy();
                expect(result.find(p => p.type === 'Apartment')).toBeTruthy();
            });
        });
    });
});