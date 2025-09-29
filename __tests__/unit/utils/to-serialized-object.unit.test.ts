import { toSerializedObject } from "@/utils/to-serialized-object";

describe("toSerializedObject", () => {
    // Mock console methods to test warning/error logging
    const consoleSpy = {
        warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        consoleSpy.warn.mockClear();
        consoleSpy.error.mockClear();
        // Set development mode to enable logging
        (process.env as any).NODE_ENV = "development";
    });

    afterAll(() => {
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe("Valid serialization scenarios", () => {
        it("should serialize simple object with primitive values", () => {
            const input = {
                name: "Test Property",
                price: 1000,
                isAvailable: true,
                description: null,
                tags: undefined,
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "Test Property",
                price: 1000,
                isAvailable: true,
                description: null,
                tags: undefined,
            });
        });

        it("should serialize nested objects", () => {
            const input = {
                property: {
                    name: "Test Property",
                    location: {
                        street: "123 Main St",
                        city: "Test City",
                        coordinates: {
                            lat: 40.7128,
                            lng: -74.0060,
                        },
                    },
                },
                metadata: {
                    created: "2024-01-15",
                    updated: "2024-01-16",
                },
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual(input);
        });

        it("should serialize arrays with various types", () => {
            const input = {
                amenities: ["wifi", "parking", "pool"],
                ratings: [4.5, 3.8, 5.0],
                features: [
                    { name: "wifi", available: true },
                    { name: "parking", available: false },
                ],
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual(input);
        });

        it("should handle MongoDB ObjectId-like objects", () => {
            const mockObjectId = {
                _id: "507f1f77bcf86cd799439011",
                toString: () => "507f1f77bcf86cd799439011",
                toHexString: () => "507f1f77bcf86cd799439011",
            };

            const input = {
                _id: mockObjectId,
                name: "Test Property",
            };

            const result = toSerializedObject(input as any);

            expect(result._id).toEqual({
                _id: "507f1f77bcf86cd799439011"
            });
            expect(result.name).toBe("Test Property");
        });

        it("should handle Date objects", () => {
            const testDate = new Date("2024-01-15T12:00:00.000Z");
            const input = {
                createdAt: testDate,
                updatedAt: new Date("2024-01-16T12:00:00.000Z"),
                name: "Test Property",
            };

            const result = toSerializedObject(input as any);

            expect(result.createdAt).toBe("2024-01-15T12:00:00.000Z");
            expect(result.updatedAt).toBe("2024-01-16T12:00:00.000Z");
            expect(result.name).toBe("Test Property");
        });

        it("should preserve empty objects and arrays", () => {
            const input = {
                emptyObject: {},
                emptyArray: [],
                nestedEmpty: {
                    level1: {
                        level2: {},
                    },
                },
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual(input);
            expect(result.emptyObject).toEqual({});
            expect(result.emptyArray).toEqual([]);
            expect(result.nestedEmpty.level1.level2).toEqual({});
        });
    });

    describe("Invalid input handling", () => {
        it("should return empty object for null input", () => {
            const result = toSerializedObject(null as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toSerializedObject: object parameter is null or undefined"
            );
        });

        it("should return empty object for undefined input", () => {
            const result = toSerializedObject(undefined as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toSerializedObject: object parameter is null or undefined"
            );
        });

        it("should return empty object for non-object primitives", () => {
            const primitives = ["string", 123, true, Symbol("test")];

            primitives.forEach(primitive => {
                const result = toSerializedObject(primitive as any);

                expect(result).toEqual({});
                expect(consoleSpy.warn).toHaveBeenCalledWith(
                    "toSerializedObject: object parameter is not an object or array"
                );
            });
        });

        it("should handle arrays as input", () => {
            const input = [1, 2, 3, { name: "test" }];

            const result = toSerializedObject(input as any);

            expect(result).toEqual([1, 2, 3, { name: "test" }]);
        });

        it("should return empty object for functions", () => {
            const func = () => "test";

            const result = toSerializedObject(func as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toSerializedObject: object parameter is not an object or array"
            );
        });
    });

    describe("Circular reference handling", () => {
        it("should handle simple circular references", () => {
            const input: any = { name: "test" };
            input.self = input;

            const result = toSerializedObject(input as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: circular reference detected in object"
            );
        });

        it("should handle nested circular references", () => {
            const input: any = {
                name: "parent",
                child: {
                    name: "child",
                    parent: null,
                },
            };
            input.child.parent = input;

            const result = toSerializedObject(input as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: circular reference detected in object"
            );
        });

        it("should handle multiple circular references", () => {
            const input: any = { name: "test" };
            input.ref1 = input;
            input.ref2 = input;
            input.nested = { ref: input };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: circular reference detected in object"
            );
        });

        it("should handle circular references in arrays", () => {
            const input: any = { name: "test", items: [] };
            input.items.push(input);

            const result = toSerializedObject(input as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: circular reference detected in object"
            );
        });
    });

    describe("Non-serializable value handling", () => {
        it("should remove function properties", () => {
            const input = {
                name: "test",
                method: () => "function",
                arrow: () => "arrow function",
                asyncFunc: async () => "async",
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({ name: "test" });
            expect(result).not.toHaveProperty("method");
            expect(result).not.toHaveProperty("arrow");
            expect(result).not.toHaveProperty("asyncFunc");
        });

        it("should remove symbol properties", () => {
            const sym1 = Symbol("test1");
            const sym2 = Symbol("test2");
            const input = {
                name: "test",
                [sym1]: "symbol value 1",
                [sym2]: "symbol value 2",
                regular: "regular value",
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "test",
                regular: "regular value",
            });
            expect(result[sym1 as any]).toBeUndefined();
            expect(result[sym2 as any]).toBeUndefined();
        });

        it("should handle undefined values appropriately", () => {
            const input = {
                name: "test",
                undefinedValue: undefined,
                nullValue: null,
                emptyString: "",
                zero: 0,
                false: false,
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "test",
                undefinedValue: undefined,
                nullValue: null,
                emptyString: "",
                zero: 0,
                false: false,
            });
        });

        it("should handle BigInt values", () => {
            const input = {
                name: "test",
                bigNumber: BigInt(123456789012345678901234567890),
                regular: 123,
            };

            const result = toSerializedObject(input as any);

            // BigInt causes JSON.stringify to fail, so we get empty object
            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: serialization error:",
                expect.any(String)
            );
        });
    });

    describe("Special object handling", () => {
        it("should handle RegExp objects", () => {
            const input = {
                name: "test",
                pattern: /test\d+/gi,
                simple: /abc/,
            };

            const result = toSerializedObject(input as any);

            expect(result.pattern).toEqual({});
            expect(result.simple).toEqual({});
            expect(result.name).toBe("test");
        });

        it("should handle Error objects", () => {
            const error = new Error("Test error message");
            const input = {
                name: "test",
                error: error,
                customError: new TypeError("Type error"),
            };

            const result = toSerializedObject(input as any);

            expect(result.error).toEqual({});
            expect(result.customError).toEqual({});
            expect(result.name).toBe("test");
        });

        it("should handle class instances", () => {
            class TestClass {
                constructor(public name: string, public value: number) {}

                method() {
                    return "test";
                }
            }

            const instance = new TestClass("test", 123);
            const input = {
                instance: instance,
                regular: "value",
            };

            const result = toSerializedObject(input as any);

            expect(result.instance).toEqual({
                name: "test",
                value: 123,
            });
            expect(result.instance).not.toHaveProperty("method");
            expect(result.regular).toBe("value");
        });

        it("should handle Map and Set objects", () => {
            const map = new Map();
            map.set("key1", "value1");
            map.set("key2", "value2");

            const set = new Set([1, 2, 3]);

            const input = {
                name: "test",
                mapObj: map,
                setObj: set,
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "test",
                mapObj: {},
                setObj: {},
            });
        });
    });

    describe("Error handling during serialization", () => {
        it("should handle JSON.stringify errors gracefully", () => {
            const problematicObject = {
                name: "test",
                get problematic() {
                    throw new Error("Getter error");
                },
            };

            const result = toSerializedObject(problematicObject as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: serialization error:",
                expect.any(String)
            );
        });

        it("should handle objects with problematic toString methods", () => {
            const problematicObject = {
                name: "test",
                toString: () => {
                    throw new Error("toString error");
                },
            };

            const result = toSerializedObject(problematicObject as any);

            expect(result).toEqual({ name: "test" });
        });

        it("should handle nested serialization errors", () => {
            const input = {
                name: "test",
                nested: {
                    good: "value",
                    get bad() {
                        throw new Error("Nested getter error");
                    },
                },
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toSerializedObject: serialization error:",
                expect.any(String)
            );
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle very deep nesting", () => {
            const deepObject: any = { level: 0 };
            let current = deepObject;

            for (let i = 1; i <= 50; i++) {
                current.next = { level: i };
                current = current.next;
            }

            const result = toSerializedObject(deepObject);

            expect(result).toBeDefined();
            expect(result.level).toBe(0);
            expect(result.next.level).toBe(1);
        });

        it("should handle very large objects", () => {
            const largeObject: any = { name: "test" };

            for (let i = 0; i < 1000; i++) {
                largeObject[`prop${i}`] = `value${i}`;
            }

            const start = performance.now();
            const result = toSerializedObject(largeObject);
            const end = performance.now();

            expect(result).toBeDefined();
            expect(result.name).toBe("test");
            expect(result.prop0).toBe("value0");
            expect(result.prop999).toBe("value999");
            expect(end - start).toBeLessThan(500); // Should complete within 500ms
        });

        it("should handle objects with null prototype", () => {
            const input = Object.create(null);
            input.name = "test";
            input.value = 123;

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "test",
                value: 123,
            });
        });

        it("should handle frozen objects", () => {
            const input = Object.freeze({
                name: "test",
                value: 123,
            });

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "test",
                value: 123,
            });
        });

        it("should handle sealed objects", () => {
            const input = Object.seal({
                name: "test",
                value: 123,
            });

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                name: "test",
                value: 123,
            });
        });
    });

    describe("Real-world usage scenarios", () => {
        it("should handle MongoDB document-like objects", () => {
            const input = {
                _id: {
                    toString: () => "507f1f77bcf86cd799439011",
                },
                name: "Test Property",
                location: {
                    street: "123 Main St",
                    city: "Test City",
                    state: "TS",
                    zipcode: "12345",
                },
                rates: {
                    nightly: 100,
                    weekly: 600,
                    monthly: 2000,
                },
                amenities: ["wifi", "parking", "pool"],
                isActive: true,
                createdAt: new Date("2024-01-15T12:00:00.000Z"),
                updatedAt: new Date("2024-01-16T12:00:00.000Z"),
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                _id: {},
                name: "Test Property",
                location: {
                    street: "123 Main St",
                    city: "Test City",
                    state: "TS",
                    zipcode: "12345",
                },
                rates: {
                    nightly: 100,
                    weekly: 600,
                    monthly: 2000,
                },
                amenities: ["wifi", "parking", "pool"],
                isActive: true,
                createdAt: "2024-01-15T12:00:00.000Z",
                updatedAt: "2024-01-16T12:00:00.000Z",
            });
        });

        it("should handle API response objects", () => {
            const input = {
                data: {
                    properties: [
                        { id: 1, name: "Property 1" },
                        { id: 2, name: "Property 2" },
                    ],
                },
                meta: {
                    total: 2,
                    page: 1,
                    limit: 10,
                },
                links: {
                    self: "/api/properties?page=1",
                    next: "/api/properties?page=2",
                },
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual(input);
        });

        it("should handle user session objects", () => {
            const input = {
                user: {
                    id: "user123",
                    email: "test@example.com",
                    name: "Test User",
                    role: "user",
                },
                session: {
                    id: "session456",
                    expires: new Date("2024-12-31T23:59:59.000Z"),
                    token: "jwt-token-here",
                },
                preferences: {
                    theme: "dark",
                    language: "en",
                    notifications: true,
                },
            };

            const result = toSerializedObject(input as any);

            expect(result).toEqual({
                user: {
                    id: "user123",
                    email: "test@example.com",
                    name: "Test User",
                    role: "user",
                },
                session: {
                    id: "session456",
                    expires: "2024-12-31T23:59:59.000Z",
                    token: "jwt-token-here",
                },
                preferences: {
                    theme: "dark",
                    language: "en",
                    notifications: true,
                },
            });
        });
    });

    describe("Performance considerations", () => {
        it("should complete quickly for normal objects", () => {
            const input = {
                name: "test",
                nested: {
                    value: 123,
                    array: [1, 2, 3],
                },
            };

            const start = performance.now();
            const result = toSerializedObject(input as any);
            const end = performance.now();

            expect(result).toBeDefined();
            expect(end - start).toBeLessThan(10); // Should complete within 10ms
        });

        it("should handle multiple concurrent calls", () => {
            const input = {
                name: "test",
                value: 123,
            };

            const promises = Array.from({ length: 100 }, () => toSerializedObject(input as any));
            const results = promises;

            results.forEach(result => {
                expect(result).toEqual(input);
            });
        });
    });

    describe("Return type and structure", () => {
        it("should return same structure for valid input", () => {
            const input = {
                name: "test",
                nested: {
                    value: 123,
                },
            };

            const result = toSerializedObject(input as any);

            expect(typeof result).toBe("object");
            expect(result).not.toBe(input); // Should be a new object
            expect(result).toEqual(input);
        });

        it("should return empty object for invalid input", () => {
            const result = toSerializedObject("invalid" as any);

            expect(result).toEqual({});
        });

        it("should maintain property types for serializable values", () => {
            const input = {
                str: "string",
                num: 123,
                bool: true,
                nullVal: null,
                undefinedVal: undefined,
                arr: [1, 2, 3],
                obj: { nested: "value" },
            };

            const result = toSerializedObject(input as any);

            expect(typeof result?.str).toBe("string");
            expect(typeof result?.num).toBe("number");
            expect(typeof result?.bool).toBe("boolean");
            expect(result?.nullVal).toBeNull();
            expect(result?.undefinedVal).toBeUndefined();
            expect(Array.isArray(result?.arr)).toBe(true);
            expect(typeof result?.obj).toBe("object");
        });
    });
});