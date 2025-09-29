import { ZodError } from "zod";
import { buildFormErrorMap, StructuredFormErrorMap } from "@/utils/build-form-error-map";

describe("buildFormErrorMap", () => {
    // Mock console methods to test warning/error logging
    const consoleSpy = {
        warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
        error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };

    beforeEach(() => {
        consoleSpy.warn.mockClear();
        consoleSpy.error.mockClear();
    });

    afterAll(() => {
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe("Zod validation error mapping", () => {
        it("should map simple Zod validation errors correctly", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["name"],
                    message: "Name is required",
                },
                {
                    code: "too_small",
                    path: ["description"],
                    message: "Description must be at least 1 characters",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                name: ["Name is required"],
                description: ["Description must be at least 1 characters"],
            });
        });

        it("should map nested field errors to structured format", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["location", "street"],
                    message: "Street is required",
                },
                {
                    code: "invalid_type",
                    path: ["location", "city"],
                    message: "City is required",
                },
                {
                    code: "invalid_type",
                    path: ["rates", "nightly"],
                    message: "Nightly rate is required",
                },
                {
                    code: "invalid_type",
                    path: ["sellerInfo", "email"],
                    message: "Email is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                location: {
                    street: ["Street is required"],
                    city: ["City is required"],
                },
                rates: {
                    nightly: ["Nightly rate is required"],
                },
                sellerInfo: {
                    email: ["Email is required"],
                },
            });
        });

        it("should handle multiple errors for the same field", () => {
            const issues = [
                {
                    code: "too_small",
                    path: ["password"],
                    message: "Password must be at least 8 characters",
                },
                {
                    code: "custom",
                    path: ["password"],
                    message: "Password must contain at least one uppercase letter",
                },
                {
                    code: "custom",
                    path: ["password"],
                    message: "Password must contain at least one number",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                password: [
                    "Password must be at least 8 characters",
                    "Password must contain at least one uppercase letter",
                    "Password must contain at least one number",
                ],
            });
        });

        it("should handle deeply nested field paths", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["property", "location", "coordinates", "lat"],
                    message: "Latitude is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                "property.location.coordinates.lat": ["Latitude is required"],
            });
        });

        it("should handle array index paths", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["amenities", 0, "name"],
                    message: "Amenity name is required",
                },
                {
                    code: "invalid_type",
                    path: ["amenities", 1, "name"],
                    message: "Amenity name is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                "amenities.0.name": ["Amenity name is required"],
                "amenities.1.name": ["Amenity name is required"],
            });
        });
    });

    describe("Input validation and error handling", () => {
        it("should handle null issues parameter", () => {
            const result = buildFormErrorMap(null as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: issues parameter is null or undefined"
            );
        });

        it("should handle undefined issues parameter", () => {
            const result = buildFormErrorMap(undefined as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: issues parameter is null or undefined"
            );
        });

        it("should handle non-array issues parameter", () => {
            const result = buildFormErrorMap("not-an-array" as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: issues parameter is not an array"
            );
        });

        it("should handle invalid issue objects", () => {
            const issues = [
                null,
                undefined,
                "invalid-issue",
                { path: ["valid"], message: "Valid message" },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                valid: ["Valid message"],
            });
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: skipping invalid issue object"
            );
        });

        it("should handle issues with missing or invalid path", () => {
            const issues = [
                { message: "Error without path" },
                { path: null, message: "Error with null path" },
                { path: "string-path", message: "Error with string path" },
                { path: ["valid"], message: "Valid error" },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                valid: ["Valid error"],
            });
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: issue missing valid path array"
            );
        });

        it("should handle issues with missing or invalid message", () => {
            const issues = [
                { path: ["test1"] },
                { path: ["test2"], message: null },
                { path: ["test3"], message: 123 },
                { path: ["test4"], message: "" },
                { path: ["valid"], message: "Valid message" },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                valid: ["Valid message"],
            });
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: issue missing valid message string"
            );
        });

        it("should handle path join errors gracefully", () => {
            // Create an array that throws when join() is called
            const mockPath: any[] = [];
            mockPath.join = jest.fn().mockImplementation(() => {
                throw new Error("Path join error");
            });

            const issues = [
                { path: mockPath, message: "Test message" },
                { path: ["valid"], message: "Valid message" },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                valid: ["Valid message"],
            });
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "buildFormErrorMap: error processing issue path:",
                expect.any(Error)
            );
        });

        it("should handle general processing errors", () => {
            // Create a proxy that throws during iteration
            const issues = new Proxy([], {
                get(target, prop) {
                    if (prop === Symbol.iterator) {
                        return function* () {
                            throw new Error("Iterator error");
                        };
                    }
                    return target[prop as keyof typeof target];
                },
            }) as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "buildFormErrorMap: error processing issues:",
                expect.any(Error)
            );
        });
    });

    describe("Empty and edge cases", () => {
        it("should handle empty issues array", () => {
            const result = buildFormErrorMap([]);

            expect(result).toEqual({});
        });

        it("should handle issues with empty path arrays", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: [],
                    message: "Root level error",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            // Empty path arrays result in empty string keys, which are filtered out by structureErrors
            expect(result).toEqual({});
        });

        it("should handle issues with single path element", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["singleField"],
                    message: "Single field error",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                singleField: ["Single field error"],
            });
        });
    });

    describe("structureErrors function integration", () => {
        it("should properly structure location errors", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["location", "street"],
                    message: "Street is required",
                },
                {
                    code: "invalid_type",
                    path: ["location", "city"],
                    message: "City is required",
                },
                {
                    code: "invalid_type",
                    path: ["location", "state"],
                    message: "State is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result.location).toEqual({
                street: ["Street is required"],
                city: ["City is required"],
                state: ["State is required"],
            });
        });

        it("should properly structure rates errors", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["rates", "nightly"],
                    message: "Nightly rate is required",
                },
                {
                    code: "too_small",
                    path: ["rates", "weekly"],
                    message: "Weekly rate must be positive",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result.rates).toEqual({
                nightly: ["Nightly rate is required"],
                weekly: ["Weekly rate must be positive"],
            });
        });

        it("should properly structure sellerInfo errors", () => {
            const issues = [
                {
                    code: "invalid_string",
                    path: ["sellerInfo", "email"],
                    message: "Invalid email format",
                },
                {
                    code: "invalid_type",
                    path: ["sellerInfo", "phone"],
                    message: "Phone is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result.sellerInfo).toEqual({
                email: ["Invalid email format"],
                phone: ["Phone is required"],
            });
        });

        it("should handle mixed structured and flat errors", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["name"],
                    message: "Name is required",
                },
                {
                    code: "invalid_type",
                    path: ["location", "street"],
                    message: "Street is required",
                },
                {
                    code: "invalid_type",
                    path: ["rates", "nightly"],
                    message: "Nightly rate is required",
                },
                {
                    code: "invalid_type",
                    path: ["description"],
                    message: "Description is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                name: ["Name is required"],
                description: ["Description is required"],
                location: {
                    street: ["Street is required"],
                },
                rates: {
                    nightly: ["Nightly rate is required"],
                },
            });
        });

        it("should handle location fields without proper nesting", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["location"],
                    message: "Location object is required",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                location: ["Location object is required"],
            });
        });
    });

    describe("Type safety and return value", () => {
        it("should return StructuredFormErrorMap type", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["test"],
                    message: "Test error",
                },
            ] as any;

            const result: StructuredFormErrorMap = buildFormErrorMap(issues);

            expect(typeof result).toBe("object");
            expect(result).toBeDefined();
        });

        it("should handle real ZodError issues from validation", () => {
            // Simulate actual Zod validation error structure
            const zodError = {
                issues: [
                    {
                        code: "invalid_type",
                        path: ["email"],
                        message: "Email is required",
                    },
                    {
                        code: "invalid_string",
                        path: ["email"],
                        message: "Invalid email format",
                    },
                ] as ZodError["issues"],
            };

            const result = buildFormErrorMap(zodError.issues);

            expect(result).toEqual({
                email: ["Email is required", "Invalid email format"],
            });
        });
    });

    describe("Performance and edge cases", () => {
        it("should handle large numbers of errors efficiently", () => {
            const issues = Array.from({ length: 1000 }, (_, i) => ({
                code: "invalid_type",
                path: [`field${i}`],
                message: `Field ${i} is required`,
            })) as ZodError["issues"];

            const start = performance.now();
            const result = buildFormErrorMap(issues);
            const end = performance.now();

            expect(Object.keys(result)).toHaveLength(1000);
            expect(end - start).toBeLessThan(100); // Should complete within 100ms
        });

        it("should handle special characters in field names", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["field-with-dashes"],
                    message: "Dashed field error",
                },
                {
                    code: "invalid_type",
                    path: ["field_with_underscores"],
                    message: "Underscore field error",
                },
                {
                    code: "invalid_type",
                    path: ["field.with.dots"],
                    message: "Dotted field error",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result).toEqual({
                "field-with-dashes": ["Dashed field error"],
                "field_with_underscores": ["Underscore field error"],
                "field.with.dots": ["Dotted field error"],
            });
        });

        it("should handle structureErrors function edge cases", () => {
            // Test fields with empty second parts (which get filtered out)
            const issues = [
                {
                    code: "invalid_type",
                    path: ["location", ""],
                    message: "Empty field name",
                },
                {
                    code: "invalid_type",
                    path: ["rates", ""],
                    message: "Another empty field",
                },
            ] as any;

            const result = buildFormErrorMap(issues);

            // Empty field names (second part after split) get filtered out because field is falsy
            // But location and rates objects still get created (just empty)
            expect(result.location).toEqual({});
            expect(result.rates).toEqual({});
        });
    });
});