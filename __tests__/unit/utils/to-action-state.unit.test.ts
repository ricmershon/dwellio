import { toActionState } from "@/utils/to-action-state";
import type { ActionState } from "@/types";

describe("toActionState", () => {
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

    describe("Valid ActionState objects", () => {
        it("should return valid ActionState with status", () => {
            const input: ActionState = {
                status: "success",
                message: "Operation successful",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: "success",
                message: "Operation successful",
            });
        });

        it("should return valid ActionState with boolean properties", () => {
            const input: ActionState = {
                isFavorite: true,
                isRead: false,
                isAccountLinked: true,
                shouldAutoLogin: false,
            };

            const result = toActionState(input);

            expect(result).toEqual({
                isFavorite: true,
                isRead: false,
                isAccountLinked: true,
                shouldAutoLogin: false,
            });
        });

        it("should return valid ActionState with user properties", () => {
            const input: ActionState = {
                userId: "user123",
                email: "test@example.com",
                password: "hashedpassword",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                userId: "user123",
                email: "test@example.com",
                password: "hashedpassword",
            });
        });

        it("should return valid ActionState with form data", () => {
            const formData = new FormData();
            formData.append("test", "value");

            const input: ActionState = {
                formData: formData,
                formErrorMap: { field: ["error"] },
            };

            const result = toActionState(input);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: { field: ["error"] },
            });
        });

        it("should return valid ActionState with canSignInWith array", () => {
            const input: ActionState = {
                canSignInWith: ["google", "github", "email"],
            };

            const result = toActionState(input);

            expect(result).toEqual({
                canSignInWith: ["google", "github", "email"],
            });
        });

        it("should preserve undefined and null values", () => {
            const input: ActionState = {
                status: undefined,
                message: null,
                userId: "test",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                userId: "test",
            });
        });
    });

    describe("Invalid input handling", () => {
        it("should return empty object for null input", () => {
            const result = toActionState(null as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: actionState parameter is null or undefined"
            );
        });

        it("should return empty object for undefined input", () => {
            const result = toActionState(undefined as any);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: actionState parameter is null or undefined"
            );
        });

        it("should return empty object for non-object input", () => {
            const invalidInputs = ["string", 123, true, Symbol("test")];

            invalidInputs.forEach(input => {
                const result = toActionState(input as any);

                expect(result).toEqual({});
                expect(consoleSpy.warn).toHaveBeenCalledWith(
                    "toActionState: actionState parameter is not an object"
                );
            });
        });

        it("should return empty object for array input", () => {
            const result = toActionState([1, 2, 3] as any);

            expect(result).toEqual({});
            // Arrays are objects in JavaScript, so no warning is issued
        });
    });

    describe("Property validation", () => {
        it("should warn when status is not a string", () => {
            const input: ActionState = {
                status: 123 as any,
                message: "test",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                message: "test",
            });
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: status property is not a string"
            );
        });

        it("should warn when message is not a string", () => {
            const input: ActionState = {
                status: "success" as any,
                message: 123 as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: "success",
            });
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: message property is not a string"
            );
        });

        it("should warn when isFavorite is not a boolean", () => {
            const input: ActionState = {
                isFavorite: "true" as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: isFavorite property is not a boolean"
            );
        });

        it("should warn when isRead is not a boolean", () => {
            const input: ActionState = {
                isRead: 1 as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: isRead property is not a boolean"
            );
        });

        it("should warn when userId is not a string", () => {
            const input: ActionState = {
                userId: 123 as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: userId property is not a string"
            );
        });

        it("should warn when email is not a string", () => {
            const input: ActionState = {
                email: {} as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: email property is not a string"
            );
        });

        it("should warn when password is not a string", () => {
            const input: ActionState = {
                password: [] as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: password property is not a string"
            );
        });

        it("should warn when isAccountLinked is not a boolean", () => {
            const input: ActionState = {
                isAccountLinked: "false" as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: isAccountLinked property is not a boolean"
            );
        });

        it("should warn when shouldAutoLogin is not a boolean", () => {
            const input: ActionState = {
                shouldAutoLogin: 0 as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: shouldAutoLogin property is not a boolean"
            );
        });

        it("should warn when canSignInWith is not an array", () => {
            const input: ActionState = {
                canSignInWith: "google,github" as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: canSignInWith property is not an array"
            );
        });

        it("should warn when formErrorMap is not an object", () => {
            const input: ActionState = {
                formErrorMap: "error" as any,
            };

            const result = toActionState(input);

            expect(result).toEqual({});
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                "toActionState: formErrorMap property is not an object"
            );
        });
    });

    describe("Property filtering and cleaning", () => {
        it("should filter out unknown properties", () => {
            const input = {
                status: "success",
                message: "test",
                extraProperty: "should be removed",
                anotherExtra: 123,
                nested: { object: "removed" },
            } as any;

            const result = toActionState(input);

            expect(result).toEqual({
                status: "success",
                message: "test",
            });

            expect(result).not.toHaveProperty("extraProperty");
            expect(result).not.toHaveProperty("anotherExtra");
            expect(result).not.toHaveProperty("nested");
        });

        it("should preserve original object structure for valid properties", () => {
            const input: ActionState = {
                status: "success",
                message: "test",
                isFavorite: true,
            };

            const result = toActionState(input);

            expect(result).toEqual(input);
            expect(result).not.toBe(input); // Should be a new object
        });

        it("should handle objects with prototype pollution attempts", () => {
            const input = {
                status: "success",
                __proto__: { malicious: "property" },
                constructor: { dangerous: "value" },
                prototype: { harmful: "data" },
            } as any;

            const result = toActionState(input);

            expect(result).toEqual({
                status: "success",
            });

            // These properties should not be copied from input to result
            expect((result as any).__proto__).not.toEqual({ malicious: "property" });
            expect(result.constructor).not.toEqual({ dangerous: "value" });
            expect((result as any).prototype).not.toEqual({ harmful: "data" });
        });
    });

    describe("Edge cases and boundary conditions", () => {
        it("should handle empty object", () => {
            const result = toActionState({});

            expect(result).toEqual({});
        });

        it("should handle object with only invalid properties", () => {
            const input = {
                extraProp1: "value1",
                extraProp2: "value2",
            } as any;

            const result = toActionState(input);

            expect(result).toEqual({});
        });

        it("should handle very long string values", () => {
            const longString = "a".repeat(10000);
            const input: ActionState = {
                status: "success" as any,
                message: longString,
                userId: longString,
            };

            const result = toActionState(input);

            expect(result.status).toBe("success");
            expect(result.message).toBe(longString);
            expect(result.userId).toBe(longString);
        });

        it("should handle special characters in strings", () => {
            const specialString = "Test\n\r\t\"'\\/@#$%^&*(){}[]|`~";
            const input: ActionState = {
                status: "info" as any,
                message: specialString,
                userId: specialString,
            };

            const result = toActionState(input);

            expect(result.status).toBe("info");
            expect(result.message).toBe(specialString);
            expect(result.userId).toBe(specialString);
        });

        it("should handle Unicode characters in strings", () => {
            const unicodeString = "Test 🎉 测试 ñáéíóú αβγ";
            const input: ActionState = {
                status: "warning" as any,
                message: unicodeString,
                userId: unicodeString,
            };

            const result = toActionState(input);

            expect(result.status).toBe("warning");
            expect(result.message).toBe(unicodeString);
            expect(result.userId).toBe(unicodeString);
        });

        it("should clone canSignInWith array", () => {
            const originalArray = ["google", "github"];
            const input: ActionState = {
                canSignInWith: originalArray,
            };

            const result = toActionState(input);

            expect(result.canSignInWith).toEqual(originalArray);
            expect(result.canSignInWith).not.toBe(originalArray); // Should be a new array
        });
    });

    describe("Error handling during processing", () => {
        it("should handle processing errors gracefully", () => {
            // Create a problematic object that throws during property access
            const problematicObject = {};
            Object.defineProperty(problematicObject, "status", {
                get() {
                    throw new Error("Property access error");
                },
            });

            const result = toActionState(problematicObject as any);

            expect(result).toEqual({});
            expect(consoleSpy.error).toHaveBeenCalledWith(
                "toActionState: error processing actionState:",
                expect.any(Error)
            );
        });
    });

    describe("Real-world usage scenarios", () => {
        it("should handle typical form validation state", () => {
            const input: ActionState = {
                status: "error",
                message: "Please fill in all required fields",
                formErrorMap: {
                    email: ["Email is required"],
                    password: ["Password is too short"],
                },
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: "error",
                message: "Please fill in all required fields",
                formErrorMap: {
                    email: ["Email is required"],
                    password: ["Password is too short"],
                },
            });
        });

        it("should handle successful operation state", () => {
            const input: ActionState = {
                status: "success",
                message: "Property saved successfully",
                userId: "user123",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                status: "success",
                message: "Property saved successfully",
                userId: "user123",
            });
        });

        it("should handle authentication state", () => {
            const input: ActionState = {
                isAccountLinked: false,
                canSignInWith: ["google", "github"],
                shouldAutoLogin: true,
                email: "test@example.com",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                isAccountLinked: false,
                canSignInWith: ["google", "github"],
                shouldAutoLogin: true,
                email: "test@example.com",
            });
        });

        it("should handle favorite/read state", () => {
            const input: ActionState = {
                isFavorite: true,
                isRead: false,
                message: "Item updated",
            };

            const result = toActionState(input);

            expect(result).toEqual({
                isFavorite: true,
                isRead: false,
                message: "Item updated",
            });
        });
    });

    describe("Type safety and return value", () => {
        it("should return ActionState type structure", () => {
            const input: ActionState = {
                status: "success",
                message: "test",
            };

            const result = toActionState(input);

            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
        });

        it("should return empty object for invalid input", () => {
            const result = toActionState("invalid" as any);

            expect(result).toEqual({});
        });

        it("should create a new object reference", () => {
            const input: ActionState = {
                status: "success",
                message: "test",
            };

            const result = toActionState(input);

            expect(result).not.toBe(input);
            expect(result).toEqual(input);
        });
    });

    describe("Performance considerations", () => {
        it("should complete quickly", () => {
            const input: ActionState = {
                status: "success",
                message: "test",
                isFavorite: true,
            };

            const start = performance.now();
            const result = toActionState(input);
            const end = performance.now();

            expect(result).toBeDefined();
            expect(end - start).toBeLessThan(10);
        });

        it("should handle multiple concurrent calls", () => {
            const input: ActionState = {
                status: "success",
                message: "test",
            };

            const results = Array.from({ length: 100 }, () => toActionState(input));

            results.forEach(result => {
                expect(result).toEqual(input);
            });
        });

        it("should handle large objects efficiently", () => {
            const largeInput = {
                status: "success",
                message: "test",
                ...Object.fromEntries(
                    Array.from({ length: 1000 }, (_, i) => [`extra${i}`, `value${i}`])
                ),
            } as any;

            const start = performance.now();
            const result = toActionState(largeInput);
            const end = performance.now();

            expect(result).toEqual({
                status: "success",
                message: "test",
            });
            expect(end - start).toBeLessThan(50);
        });
    });
});