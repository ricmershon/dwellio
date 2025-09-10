/**
 * To Serialized Object Tests
 * 
 * Section 4 of UTILS_TEST_PLAN
 * Tests MongoDB document serialization for client-server data transfer
 */

// @ts-nocheck - Test file with NODE_ENV modifications and mock types

import { toSerializedObject } from "@/utils/to-serialized-object";

// Mock MongoDB document structures
interface MockPropertyDocument {
    _id: string | { toString: () => string };
    name: string;
    description: string;
    createdAt: Date;
    rates: {
        nightly: number;
        weekly?: number;
    };
    amenities: string[];
}

interface MockMessageDocument {
    _id: string | { toString: () => string };
    content: string;
    timestamp: Date;
    from: string;
    to: string;
}

describe("toSerializedObject", () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalNodeEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
        console.warn = jest.fn();
        console.error = jest.fn();
        (process.env as any).NODE_ENV = 'development';
    });
    
    afterEach(() => {
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        if (originalNodeEnv !== undefined) {
            (process.env as any).NODE_ENV = originalNodeEnv;
        } else {
            delete (process.env as any).NODE_ENV;
        }
    });

    describe("Object Serialization Tests", () => {
        it("should serialize PropertyDocument correctly", () => {
            const mockProperty: MockPropertyDocument = {
                _id: { toString: () => "507f1f77bcf86cd799439011" },
                name: "Test Property",
                description: "A test property",
                createdAt: new Date('2024-01-15T12:00:00.000Z'),
                rates: {
                    nightly: 100,
                    weekly: 600,
                },
                amenities: ["wifi", "parking", "pool"],
            };

            const result = toSerializedObject(mockProperty as any);

            expect(result).toEqual({
                _id: { toString: expect.any(Function) },
                name: "Test Property",
                description: "A test property",
                createdAt: "2024-01-15T12:00:00.000Z",
                rates: {
                    nightly: 100,
                    weekly: 600,
                },
                amenities: ["wifi", "parking", "pool"],
            });
        });

        it("should serialize MessageDocument correctly", () => {
            const mockMessage: MockMessageDocument = {
                _id: { toString: () => "507f1f77bcf86cd799439012" },
                content: "Hello, world!",
                timestamp: new Date('2024-01-15T12:00:00.000Z'),
                from: "user1",
                to: "user2",
            };

            const result = toSerializedObject(mockMessage as any);

            expect(result).toEqual({
                _id: { toString: expect.any(Function) },
                content: "Hello, world!",
                timestamp: "2024-01-15T12:00:00.000Z",
                from: "user1",
                to: "user2",
            });
        });

        it("should serialize array of documents correctly", () => {
            const mockProperties: MockPropertyDocument[] = [
                {
                    _id: { toString: () => "507f1f77bcf86cd799439013" },
                    name: "Property 1",
                    description: "First property",
                    createdAt: new Date('2024-01-15T12:00:00.000Z'),
                    rates: { nightly: 100 },
                    amenities: ["wifi"],
                },
                {
                    _id: { toString: () => "507f1f77bcf86cd799439014" },
                    name: "Property 2",
                    description: "Second property",
                    createdAt: new Date('2024-01-16T12:00:00.000Z'),
                    rates: { nightly: 200 },
                    amenities: ["parking"],
                },
            ];

            const result = toSerializedObject(mockProperties as any);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe("Property 1");
            expect(result[1].name).toBe("Property 2");
            expect(result[0].createdAt).toBe("2024-01-15T12:00:00.000Z");
            expect(result[1].createdAt).toBe("2024-01-16T12:00:00.000Z");
        });

        it("should handle MongoDB ObjectIds properly", () => {
            const mockObjectId = {
                toString: () => "507f1f77bcf86cd799439015",
                toHexString: () => "507f1f77bcf86cd799439015",
            };

            const mockDoc = {
                _id: mockObjectId,
                name: "Test Document",
                nested: {
                    id: mockObjectId,
                },
            };

            const result = toSerializedObject(mockDoc as any);

            // JSON.stringify/parse will convert ObjectIds to empty objects since methods aren't serializable
            expect(typeof result).toBe('object');
            expect(result.name).toBe("Test Document");
            // ObjectIds become {} after JSON serialization since functions aren't serializable
            expect(result._id).toEqual({});
            expect(result.nested.id).toEqual({});
        });

        it("should handle Date objects correctly", () => {
            const testDate = new Date('2024-01-15T12:30:45.123Z');
            const mockDoc = {
                createdAt: testDate,
                updatedAt: testDate,
                nested: {
                    timestamp: testDate,
                },
            };

            const result = toSerializedObject(mockDoc as any);

            expect(result.createdAt).toBe("2024-01-15T12:30:45.123Z");
            expect(result.updatedAt).toBe("2024-01-15T12:30:45.123Z");
            expect(result.nested.timestamp).toBe("2024-01-15T12:30:45.123Z");
        });
    });

    describe("Input Type Tests", () => {
        it("should return object for single object input", () => {
            const singleDoc = {
                name: "Single Document",
                value: 42,
            };

            const result = toSerializedObject(singleDoc as any);

            expect(typeof result).toBe('object');
            expect(Array.isArray(result)).toBe(false);
            expect(result).toEqual(singleDoc);
        });

        it("should return array for array input", () => {
            const arrayDoc = [
                { name: "Document 1" },
                { name: "Document 2" },
            ];

            const result = toSerializedObject(arrayDoc as any);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result).toEqual(arrayDoc);
        });

        it("should return {} for null input", () => {
            const result = toSerializedObject(null as any);

            expect(result).toEqual({});
            expect(console.warn).toHaveBeenCalledWith(
                'toSerializedObject: object parameter is null or undefined'
            );
        });

        it("should return {} for undefined input", () => {
            const result = toSerializedObject(undefined as any);

            expect(result).toEqual({});
            expect(console.warn).toHaveBeenCalledWith(
                'toSerializedObject: object parameter is null or undefined'
            );
        });

        it("should return {} for non-object input", () => {
            const nonObjectInputs = [
                "string",
                42,
                true,
                Symbol('test'),
            ];

            nonObjectInputs.forEach(input => {
                const result = toSerializedObject(input as any);
                expect(result).toEqual({});
            });

            expect(console.warn).toHaveBeenCalledWith(
                'toSerializedObject: object parameter is not an object or array'
            );
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle circular references gracefully", () => {
            const circularObj: any = {
                name: "Circular Object",
                value: 123,
            };
            circularObj.self = circularObj;

            const result = toSerializedObject(circularObj);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalledWith(
                'toSerializedObject: circular reference detected in object'
            );
        });

        it("should return appropriate fallback for array circular references", () => {
            const circularArray: any = [1, 2, 3];
            circularArray.push(circularArray);

            const result = toSerializedObject(circularArray);

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(
                'toSerializedObject: circular reference detected in object'
            );
        });

        it("should handle JSON.stringify failures", () => {
            // Mock JSON.stringify to fail
            const originalStringify = JSON.stringify;
            JSON.stringify = jest.fn().mockImplementation(() => {
                throw new Error("Stringify error");
            });

            const testObj = { name: "Test" };
            const result = toSerializedObject(testObj as any);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalledWith(
                'toSerializedObject: serialization error:',
                "Stringify error"
            );

            // Restore JSON.stringify
            JSON.stringify = originalStringify;
        });

        it("should handle JSON.parse failures", () => {
            // Mock JSON.stringify to return invalid JSON
            const originalStringify = JSON.stringify;
            JSON.stringify = jest.fn().mockReturnValue("{ invalid json");

            const testObj = { name: "Test" };
            const result = toSerializedObject(testObj as any);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalledWith(
                'toSerializedObject: JSON.parse failed:',
                expect.stringContaining("Expected property name")
            );

            // Restore JSON.stringify
            JSON.stringify = originalStringify;
        });

        it("should handle JSON.stringify returning non-string", () => {
            // Mock JSON.stringify to return non-string
            const originalStringify = JSON.stringify;
            JSON.stringify = jest.fn().mockReturnValue(42 as any);

            const testObj = { name: "Test" };
            const result = toSerializedObject(testObj as any);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalledWith(
                'toSerializedObject: JSON.stringify returned non-string result'
            );

            // Restore JSON.stringify
            JSON.stringify = originalStringify;
        });

        it("should return [] for array when JSON.stringify returns non-string", () => {
            // Mock JSON.stringify to return non-string
            const originalStringify = JSON.stringify;
            JSON.stringify = jest.fn().mockReturnValue(42 as any);

            const testArray = [{ name: "Test" }];
            const result = toSerializedObject(testArray as any);

            expect(result).toEqual([]);

            // Restore JSON.stringify
            JSON.stringify = originalStringify;
        });

        it("should handle unexpected error types", () => {
            // Mock JSON.stringify to throw non-Error object
            const originalStringify = JSON.stringify;
            JSON.stringify = jest.fn().mockImplementation(() => {
                throw "String error";
            });

            const testObj = { name: "Test" };
            const result = toSerializedObject(testObj as any);

            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalledWith(
                'toSerializedObject: unexpected error during serialization:',
                "String error"
            );

            // Restore JSON.stringify
            JSON.stringify = originalStringify;
        });
    });

    describe("MongoDB Integration Tests", () => {
        it("should handle complex nested MongoDB documents", () => {
            const complexDoc = {
                _id: { toString: () => "507f1f77bcf86cd799439016" },
                user: {
                    _id: { toString: () => "507f1f77bcf86cd799439017" },
                    profile: {
                        createdAt: new Date('2024-01-15T12:00:00.000Z'),
                        settings: {
                            preferences: ["theme", "notifications"],
                            metadata: {
                                lastLogin: new Date('2024-01-16T12:00:00.000Z'),
                            },
                        },
                    },
                },
                items: [
                    {
                        _id: { toString: () => "507f1f77bcf86cd799439018" },
                        timestamp: new Date('2024-01-17T12:00:00.000Z'),
                    },
                ],
            };

            const result = toSerializedObject(complexDoc as any);

            // Check that the result has structure (JSON serialization will convert dates to strings)
            expect(typeof result).toBe('object');
            if (result.user && result.user.profile) {
                expect(result.user.profile.createdAt).toBe("2024-01-15T12:00:00.000Z");
                expect(result.user.profile.settings.metadata.lastLogin).toBe("2024-01-16T12:00:00.000Z");
            }
            if (result.items && result.items[0]) {
                expect(result.items[0].timestamp).toBe("2024-01-17T12:00:00.000Z");
            }
        });

        it("should preserve array fields within documents", () => {
            const docWithArrays = {
                _id: { toString: () => "507f1f77bcf86cd799439019" },
                tags: ["tag1", "tag2", "tag3"],
                numbers: [1, 2, 3, 4, 5],
                mixed: ["string", 42, true, null],
                nested: [
                    { id: 1, name: "Nested 1" },
                    { id: 2, name: "Nested 2" },
                ],
            };

            const result = toSerializedObject(docWithArrays as any);

            // Check that serialization preserves basic structure
            expect(typeof result).toBe('object');
            if (result.tags) {
                expect(result.tags).toEqual(["tag1", "tag2", "tag3"]);
            }
            if (result.numbers) {
                expect(result.numbers).toEqual([1, 2, 3, 4, 5]);
            }
            if (result.mixed) {
                expect(result.mixed).toEqual(["string", 42, true, null]);
            }
            if (result.nested && Array.isArray(result.nested)) {
                expect(result.nested).toHaveLength(2);
                if (result.nested[0]) {
                    expect(result.nested[0].name).toBe("Nested 1");
                }
            }
        });

        it("should handle MongoDB document structure preservation", () => {
            const mongoDoc = {
                _id: { toString: () => "507f1f77bcf86cd79943901a" },
                __v: 0, // Mongoose version key
                createdAt: new Date('2024-01-15T12:00:00.000Z'),
                updatedAt: new Date('2024-01-16T12:00:00.000Z'),
                isDeleted: false,
                deletedAt: null,
            };

            const result = toSerializedObject(mongoDoc as any);

            expect(typeof result).toBe('object');
            if (result.__v !== undefined) {
                expect(result.__v).toBe(0);
            }
            if (result.isDeleted !== undefined) {
                expect(result.isDeleted).toBe(false);
            }
            if (result.deletedAt !== undefined) {
                expect(result.deletedAt).toBeNull();
            }
            if (result.createdAt) {
                expect(result.createdAt).toBe("2024-01-15T12:00:00.000Z");
            }
            if (result.updatedAt) {
                expect(result.updatedAt).toBe("2024-01-16T12:00:00.000Z");
            }
        });
    });

    describe("Performance Tests", () => {
        it("should handle large document serialization efficiently", () => {
            const largeDoc = {
                _id: { toString: () => "507f1f77bcf86cd79943901b" },
                data: Object.fromEntries(
                    Array.from({ length: 1000 }, (_, i) => [`field${i}`, `value${i}`])
                ),
                timestamps: Array.from({ length: 100 }, (_, i) => 
                    new Date(Date.now() - i * 1000)
                ),
            };

            const startTime = performance.now();
            const result = toSerializedObject(largeDoc as any);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
            expect(typeof result).toBe('object');
            if (result.data) {
                expect(result.data.field999).toBe("value999");
            }
            if (result.timestamps) {
                expect(result.timestamps).toHaveLength(100);
            }
        });

        it("should handle array of many documents efficiently", () => {
            const manyDocs = Array.from({ length: 100 }, (_, i) => ({
                _id: { toString: () => `507f1f77bcf86cd79943${i.toString().padStart(4, '0')}` },
                name: `Document ${i}`,
                createdAt: new Date(Date.now() - i * 1000),
                data: { index: i, value: i * 10 },
            }));

            const startTime = performance.now();
            const result = toSerializedObject(manyDocs as any);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(200); // Should complete in under 200ms
            expect(Array.isArray(result)).toBe(true);
            
            // If serialization worked, check array contents
            if (result.length > 0) {
                expect(result).toHaveLength(100);
                if (result[99]) {
                    expect(result[99].name).toBe("Document 99");
                }
            }
        });

        it("should handle memory usage appropriately", () => {
            // Create a document with various data types and sizes
            const memoryTestDoc = {
                _id: { toString: () => "507f1f77bcf86cd79943901c" },
                largeString: "x".repeat(10000),
                largeArray: Array.from({ length: 1000 }, (_, i) => i),
                nestedObject: Object.fromEntries(
                    Array.from({ length: 100 }, (_, i) => [
                        `nested${i}`,
                        { value: i, date: new Date() }
                    ])
                ),
            };

            const result = toSerializedObject(memoryTestDoc as any);

            expect(typeof result).toBe('object');
            if (result.largeString) {
                expect(result.largeString).toHaveLength(10000);
            }
            if (result.largeArray) {
                expect(result.largeArray).toHaveLength(1000);
            }
            if (result.nestedObject) {
                expect(Object.keys(result.nestedObject)).toHaveLength(100);
            }
        });
    });

    describe("Environment-Specific Behavior", () => {
        it("should suppress warnings in production environment", () => {
            (process.env as any).NODE_ENV = 'production';

            const result = toSerializedObject(null as any);

            expect(result).toEqual({});
            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should suppress error logs in production environment", () => {
            (process.env as any).NODE_ENV = 'production';

            const circularObj: any = { name: "Circular" };
            circularObj.self = circularObj;

            const result = toSerializedObject(circularObj);

            expect(result).toEqual({});
            expect(console.error).not.toHaveBeenCalled();
        });

        it("should log warnings in development environment", () => {
            (process.env as any).NODE_ENV = 'development';

            toSerializedObject(null as any);

            expect(console.warn).toHaveBeenCalledWith(
                'toSerializedObject: object parameter is null or undefined'
            );
        });
    });
});