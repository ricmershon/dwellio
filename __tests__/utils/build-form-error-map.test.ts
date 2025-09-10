/**
 * Build Form Error Map Tests
 * 
 * Section 5 of UTILS_TEST_PLAN
 * Tests Zod error transformation into structured form error maps
 */

// @ts-nocheck - Test file with mock Zod issues that don't match exact interface

import { buildFormErrorMap } from "@/utils/build-form-error-map";
import { ZodIssue } from "zod";

describe("buildFormErrorMap", () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        console.warn = jest.fn();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
    });

    describe("Zod Error Processing Tests", () => {
        it("should map single field error correctly", () => {
            const issues = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["name"],
                    message: "Name is required",
                }
            ] as ZodIssue[];

            const result = buildFormErrorMap(issues);

            expect(result.name).toEqual(["Name is required"]);
        });

        it("should map multiple field errors correctly", () => {
            const issues = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["name"],
                    message: "Name is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["email"],
                    message: "Email is required",
                },
                {
                    code: "too_small",
                    minimum: 8,
                    type: "string",
                    inclusive: true,
                    path: ["password"],
                    message: "Password must be at least 8 characters",
                }
            ] as ZodIssue[];

            const result = buildFormErrorMap(issues);

            expect(result.name).toEqual(["Name is required"]);
            expect(result.email).toEqual(["Email is required"]);
            expect(result.password).toEqual(["Password must be at least 8 characters"]);
        });

        it("should group nested field errors properly", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "city"],
                    message: "City is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "state"],
                    message: "State is required",
                },
                {
                    code: "invalid_type",
                    expected: "number",
                    received: "undefined",
                    path: ["rates", "nightly"],
                    message: "Nightly rate is required",
                }
            ];

            const result = buildFormErrorMap(issues);

            expect(result.location).toBeDefined();
            expect(result.location?.city).toEqual(["City is required"]);
            expect(result.location?.state).toEqual(["State is required"]);
            expect(result.rates).toBeDefined();
            expect(result.rates?.nightly).toEqual(["Nightly rate is required"]);
        });

        it("should handle mixed error types correctly", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["name"],
                    message: "Name is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "zipcode"],
                    message: "Zipcode is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["sellerInfo", "email"],
                    message: "Seller email is required",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.name).toEqual(["Name is required"]);
            expect(result.location?.zipcode).toEqual(["Zipcode is required"]);
            expect(result.sellerInfo?.email).toEqual(["Seller email is required"]);
        });
    });

    describe("Field Grouping Tests", () => {
        it("should group location errors under structured.location", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "street"],
                    message: "Street address is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "city"],
                    message: "City is required",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.location).toBeDefined();
            expect(result.location?.street).toEqual(["Street address is required"]);
            expect(result.location?.city).toEqual(["City is required"]);
        });

        it("should group rates errors under structured.rates", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "number",
                    received: "undefined",
                    path: ["rates", "nightly"],
                    message: "Nightly rate is required",
                },
                {
                    code: "too_small",
                    minimum: 0,
                    type: "number",
                    inclusive: false,
                    path: ["rates", "weekly"],
                    message: "Weekly rate must be positive",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.rates).toBeDefined();
            expect(result.rates?.nightly).toEqual(["Nightly rate is required"]);
            expect(result.rates?.weekly).toEqual(["Weekly rate must be positive"]);
        });

        it("should group sellerInfo errors under structured.sellerInfo", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["sellerInfo", "name"],
                    message: "Seller name is required",
                },
                {
                    code: "invalid_string",
                    validation: "email",
                    path: ["sellerInfo", "email"],
                    message: "Invalid email format",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.sellerInfo).toBeDefined();
            expect(result.sellerInfo?.name).toEqual(["Seller name is required"]);
            expect(result.sellerInfo?.email).toEqual(["Invalid email format"]);
        });

        it("should keep root level fields at root", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["name"],
                    message: "Name is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["description"],
                    message: "Description is required",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.name).toEqual(["Name is required"]);
            expect(result.description).toEqual(["Description is required"]);
        });

        it("should accumulate multiple errors per field", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["password"],
                    message: "Password is required",
                },
                {
                    code: "too_small",
                    minimum: 8,
                    type: "string",
                    inclusive: true,
                    path: ["password"],
                    message: "Password must be at least 8 characters",
                },
                {
                    code: "invalid_string",
                    validation: "regex",
                    path: ["password"],
                    message: "Password must contain uppercase letter",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.password).toEqual([
                "Password is required",
                "Password must be at least 8 characters",
                "Password must contain uppercase letter",
            ]);
        });
    });

    describe("Input Validation Tests", () => {
        it("should return empty structure for null/undefined issues", () => {
            const nullResult = buildFormErrorMap(null as any);
            const undefinedResult = buildFormErrorMap(undefined as any);

            expect(nullResult).toEqual({});
            expect(undefinedResult).toEqual({});
            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: issues parameter is null or undefined'
            );
        });

        it("should return empty structure for non-array issues", () => {
            const nonArrayInputs = [
                "string",
                42,
                { not: "an array" },
                true,
            ];

            nonArrayInputs.forEach(input => {
                const result = buildFormErrorMap(input as any);
                expect(result).toEqual({});
            });

            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: issues parameter is not an array'
            );
        });

        it("should skip invalid issue objects with warning", () => {
            const issues = [
                null,
                undefined,
                "string",
                42,
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["valid"],
                    message: "Valid message",
                }
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result.valid).toEqual(["Valid message"]);
            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: skipping invalid issue object'
            );
        });

        it("should skip issues with missing valid path array", () => {
            const issues = [
                {
                    code: "invalid_type",
                    message: "No path",
                    // path missing
                },
                {
                    code: "invalid_type",
                    path: "string path", // should be array
                    message: "String path",
                },
                {
                    code: "invalid_type",
                    path: ["valid"],
                    message: "Valid issue",
                }
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result.valid).toEqual(["Valid issue"]);
            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: issue missing valid path array'
            );
        });

        it("should skip issues with missing valid message string", () => {
            const issues = [
                {
                    code: "invalid_type",
                    path: ["field1"],
                    // message missing
                },
                {
                    code: "invalid_type",
                    path: ["field2"],
                    message: 42, // should be string
                },
                {
                    code: "invalid_type",
                    path: ["field3"],
                    message: "Valid message",
                }
            ] as any;

            const result = buildFormErrorMap(issues);

            expect(result.field3).toEqual(["Valid message"]);
            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: issue missing valid message string'
            );
        });
    });

    describe("Error Structure Tests", () => {
        it("should produce correct StructuredFormErrorMap structure", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "city"],
                    message: "City is required",
                },
                {
                    code: "invalid_type",
                    expected: "number",
                    received: "undefined",
                    path: ["rates", "nightly"],
                    message: "Nightly rate is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["sellerInfo", "name"],
                    message: "Seller name is required",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["description"],
                    message: "Description is required",
                },
            ];

            const result = buildFormErrorMap(issues);

            // Check structure matches StructuredFormErrorMap interface
            expect(typeof result).toBe('object');
            expect(typeof result.location).toBe('object');
            expect(typeof result.rates).toBe('object');
            expect(typeof result.sellerInfo).toBe('object');
            expect(Array.isArray(result.description)).toBe(true);
        });

        it("should handle deep nested error structures", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["deeply", "nested", "field"],
                    message: "Deeply nested field error",
                },
            ];

            const result = buildFormErrorMap(issues);

            // Should create a flat key for deeply nested paths that don't match predefined groups
            expect(result["deeply.nested.field"]).toEqual(["Deeply nested field error"]);
        });

        it("should preserve error message content exactly", () => {
            const complexMessage = "Complex error: expected string, received undefined at path.to.field";
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["test"],
                    message: complexMessage,
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.test).toEqual([complexMessage]);
        });
    });

    describe("Edge Cases Tests", () => {
        it("should handle malformed Zod error objects", () => {
            const malformedIssues = [
                { /* missing required fields */ },
                { code: "invalid_type" /* missing other fields */ },
                { path: [], message: "" /* invalid values */ },
            ] as any;

            const result = buildFormErrorMap(malformedIssues);

            expect(result).toEqual({});
            expect(console.warn).toHaveBeenCalled();
        });

        it("should handle extremely long path names", () => {
            const longPath = Array.from({ length: 100 }, (_, i) => `segment${i}`);
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: longPath,
                    message: "Long path error",
                }
            ];

            const result = buildFormErrorMap(issues);

            const expectedKey = longPath.join(".");
            expect(result[expectedKey]).toEqual(["Long path error"]);
        });

        it("should handle special characters in field names", () => {
            const specialPaths = [
                ["field-with-dashes"],
                ["field_with_underscores"],
                ["field.with.dots"],
                ["field with spaces"],
                ["field@with#symbols"],
            ];

            const issues: ZodIssue[] = specialPaths.map((path, index) => ({
                code: "invalid_type" as const,
                expected: "string" as const,
                received: "undefined" as const,
                path,
                message: `Error ${index}`,
            }));

            const result = buildFormErrorMap(issues);

            specialPaths.forEach((path, index) => {
                const key = path.join(".");
                expect(result[key]).toEqual([`Error ${index}`]);
            });
        });

        it("should handle very large error sets efficiently", () => {
            const largeIssues: ZodIssue[] = Array.from({ length: 1000 }, (_, i) => ({
                code: "invalid_type" as const,
                expected: "string" as const,
                received: "undefined" as const,
                path: [`field${i}`],
                message: `Error message ${i}`,
            }));

            const startTime = performance.now();
            const result = buildFormErrorMap(largeIssues);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
            expect(Object.keys(result)).toHaveLength(1000);
            expect(result.field999).toEqual(["Error message 999"]);
        });
    });

    describe("Error Handling and Recovery Tests", () => {
        it("should handle path processing failures gracefully", () => {
            // Mock Array.prototype.join to throw an error
            const originalJoin = Array.prototype.join;
            let joinCallCount = 0;
            Array.prototype.join = jest.fn().mockImplementation(function() {
                joinCallCount++;
                if (joinCallCount === 1) {
                    throw new Error("Path processing error");
                }
                return originalJoin.call(this);
            });

            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["failing"],
                    message: "This should fail",
                },
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["working"],
                    message: "This should work",
                },
            ];

            const result = buildFormErrorMap(issues);

            expect(result.working).toEqual(["This should work"]);
            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: error processing issue path:',
                expect.any(Error)
            );

            // Restore original join
            Array.prototype.join = originalJoin;
        });

        it("should handle path processing failures gracefully", () => {
            const issues = [{
                code: "invalid_type",
                expected: "string",
                received: "undefined",
                path: ["test"],
                message: "Test message",
            }] as any;

            // Mock Array.prototype.join to throw during path processing
            const originalJoin = Array.prototype.join;
            let joinCalled = false;
            Array.prototype.join = jest.fn().mockImplementation(function(separator) {
                if (!joinCalled && separator === ".") {
                    joinCalled = true;
                    throw new Error("Path processing error");
                }
                return originalJoin.call(this, separator);
            });

            const result = buildFormErrorMap(issues);

            // Should return empty structure when path processing fails
            expect(result).toEqual({});
            expect(console.warn).toHaveBeenCalledWith(
                'buildFormErrorMap: error processing issue path:',
                expect.any(Error)
            );

            // Restore Array.prototype.join
            Array.prototype.join = originalJoin;
        });

        it("should handle structure errors processing failures", () => {
            const issues: ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "undefined",
                    path: ["location", "city"],
                    message: "City is required",
                },
            ];

            // Mock the split method to throw an error during structuring
            const originalSplit = String.prototype.split;
            let splitCallCount = 0;
            String.prototype.split = jest.fn().mockImplementation(function(separator) {
                splitCallCount++;
                if (separator === "." && splitCallCount > 5) {
                    throw new Error("Split error during structuring");
                }
                return originalSplit.call(this, separator);
            });

            const result = buildFormErrorMap(issues);

            // Should still produce some result even if structuring partially fails
            expect(typeof result).toBe('object');

            // Restore split
            String.prototype.split = originalSplit;
        });

    });
});