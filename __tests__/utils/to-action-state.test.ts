/**
 * To Action State Tests
 * 
 * Section 9 of UTILS_TEST_PLAN
 * Tests ActionState object creation and validation with property type checking
 */

// @ts-nocheck - Test file with ActionState type testing

import { toActionState } from "@/utils/to-action-state";
import { ActionStatus, ActionState } from "@/types";
import { StructuredFormErrorMap } from "@/utils/build-form-error-map";

describe("toActionState", () => {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        jest.clearAllMocks();
        console.warn = jest.fn();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
    });

    describe("Valid ActionState Creation Tests", () => {
        it("should return valid ActionState with all properties", () => {
            const mockFormErrorMap: StructuredFormErrorMap = {
                name: { message: "Name is required", type: "required" },
            };
            
            const mockFormData = new FormData();
            mockFormData.append("test", "value");
            
            const inputState: ActionState = {
                status: ActionStatus.SUCCESS,
                message: "Operation successful",
                isFavorite: true,
                isRead: false,
                formData: mockFormData,
                formErrorMap: mockFormErrorMap,
                userId: "user123",
                isAccountLinked: true,
                canSignInWith: ["google", "github"],
                email: "test@example.com",
                password: "securePassword",
                shouldAutoLogin: false,
            };

            const result = toActionState(inputState);

            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Operation successful",
                isFavorite: true,
                isRead: false,
                formData: mockFormData,
                formErrorMap: mockFormErrorMap,
                userId: "user123",
                isAccountLinked: true,
                canSignInWith: ["google", "github"],
                email: "test@example.com",
                password: "securePassword",
                shouldAutoLogin: false,
            });
            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should handle partial ActionState objects", () => {
            const partialInputs = [
                { status: ActionStatus.INFO },
                { message: "Info message" },
                { isFavorite: true },
                { isRead: false },
                { userId: "user456" },
                { email: "partial@test.com" },
                { isAccountLinked: false },
                { shouldAutoLogin: true },
                { canSignInWith: ["email"] },
            ];

            partialInputs.forEach(input => {
                const result = toActionState(input);
                expect(result).toEqual(input);
                expect(console.warn).not.toHaveBeenCalled();
            });
        });

        it("should handle empty ActionState object", () => {
            const result = toActionState({});
            expect(result).toEqual({});
            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should return new object reference", () => {
            const input = { status: ActionStatus.SUCCESS };
            const result = toActionState(input);
            
            expect(result).toEqual(input);
            expect(result).not.toBe(input); // Different object reference
        });
    });

    describe("Property Type Validation Tests", () => {
        describe("Status Property Validation", () => {
            it("should accept valid status strings", () => {
                const validStatuses = [
                    ActionStatus.INFO,
                    ActionStatus.SUCCESS,
                    ActionStatus.WARNING,
                    ActionStatus.ERROR,
                ];

                validStatuses.forEach(status => {
                    const result = toActionState({ status });
                    expect(result.status).toBe(status);
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-string status values", () => {
                const invalidStatuses = [123, true, [], {}];

                invalidStatuses.forEach(status => {
                    const result = toActionState({ status } as any);
                    expect(result.status).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: status property is not a string"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should handle null status without warning", () => {
                const result = toActionState({ status: null } as any);
                expect(result.status).toBeUndefined();
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should accept undefined and null status", () => {
                expect(toActionState({ status: undefined }).status).toBeUndefined();
                expect(toActionState({ status: null }).status).toBeUndefined();
                expect(console.warn).not.toHaveBeenCalled();
            });
        });

        describe("Message Property Validation", () => {
            it("should accept valid message strings", () => {
                const validMessages = [
                    "Success message",
                    "Error occurred",
                    "Warning: check input",
                    "",
                    "🚀 Unicode message",
                ];

                validMessages.forEach(message => {
                    const result = toActionState({ message });
                    expect(result.message).toBe(message);
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-string message values", () => {
                const invalidMessages = [123, true, [], {}];

                invalidMessages.forEach(message => {
                    const result = toActionState({ message } as any);
                    expect(result.message).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: message property is not a string"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should handle null message without warning", () => {
                const result = toActionState({ message: null } as any);
                expect(result.message).toBeUndefined();
                expect(console.warn).not.toHaveBeenCalled();
            });
        });

        describe("Boolean Properties Validation", () => {
            it("should accept valid boolean values for isFavorite", () => {
                expect(toActionState({ isFavorite: true }).isFavorite).toBe(true);
                expect(toActionState({ isFavorite: false }).isFavorite).toBe(false);
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should reject non-boolean isFavorite values", () => {
                const invalidValues = [1, 0, "true", "false", [], {}];

                invalidValues.forEach(isFavorite => {
                    const result = toActionState({ isFavorite } as any);
                    expect(result.isFavorite).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: isFavorite property is not a boolean"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should accept valid boolean values for isRead", () => {
                expect(toActionState({ isRead: true }).isRead).toBe(true);
                expect(toActionState({ isRead: false }).isRead).toBe(false);
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should reject non-boolean isRead values", () => {
                const invalidValues = [1, 0, "true", "false", [], {}];

                invalidValues.forEach(isRead => {
                    const result = toActionState({ isRead } as any);
                    expect(result.isRead).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: isRead property is not a boolean"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should accept valid boolean values for isAccountLinked", () => {
                expect(toActionState({ isAccountLinked: true }).isAccountLinked).toBe(true);
                expect(toActionState({ isAccountLinked: false }).isAccountLinked).toBe(false);
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should reject non-boolean isAccountLinked values", () => {
                const invalidValues = [1, 0, "true", "false", [], {}];

                invalidValues.forEach(isAccountLinked => {
                    const result = toActionState({ isAccountLinked } as any);
                    expect(result.isAccountLinked).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: isAccountLinked property is not a boolean"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should accept valid boolean values for shouldAutoLogin", () => {
                expect(toActionState({ shouldAutoLogin: true }).shouldAutoLogin).toBe(true);
                expect(toActionState({ shouldAutoLogin: false }).shouldAutoLogin).toBe(false);
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should reject non-boolean shouldAutoLogin values", () => {
                const invalidValues = [1, 0, "true", "false", [], {}];

                invalidValues.forEach(shouldAutoLogin => {
                    const result = toActionState({ shouldAutoLogin } as any);
                    expect(result.shouldAutoLogin).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: shouldAutoLogin property is not a boolean"
                    );
                    jest.clearAllMocks();
                });
            });
        });

        describe("String Properties Validation", () => {
            it("should accept valid userId strings", () => {
                const validUserIds = ["user123", "uuid-12345", "", "long-user-id-string"];

                validUserIds.forEach(userId => {
                    const result = toActionState({ userId });
                    expect(result.userId).toBe(userId);
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-string userId values", () => {
                const invalidUserIds = [123, true, [], {}];

                invalidUserIds.forEach(userId => {
                    const result = toActionState({ userId } as any);
                    expect(result.userId).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: userId property is not a string"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should accept valid email strings", () => {
                const validEmails = [
                    "test@example.com",
                    "user@domain.co.uk",
                    "",
                    "unicode@tëst.com",
                ];

                validEmails.forEach(email => {
                    const result = toActionState({ email });
                    expect(result.email).toBe(email);
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-string email values", () => {
                const invalidEmails = [123, true, [], {}];

                invalidEmails.forEach(email => {
                    const result = toActionState({ email } as any);
                    expect(result.email).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: email property is not a string"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should accept valid password strings", () => {
                const validPasswords = [
                    "securePassword123",
                    "weak",
                    "",
                    "password with spaces",
                ];

                validPasswords.forEach(password => {
                    const result = toActionState({ password });
                    expect(result.password).toBe(password);
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-string password values", () => {
                const invalidPasswords = [123, true, [], {}];

                invalidPasswords.forEach(password => {
                    const result = toActionState({ password } as any);
                    expect(result.password).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: password property is not a string"
                    );
                    jest.clearAllMocks();
                });
            });
        });

        describe("Array Properties Validation", () => {
            it("should accept valid canSignInWith arrays", () => {
                const validArrays = [
                    ["google"],
                    ["google", "github"],
                    ["email", "google", "github"],
                    [],
                    ["single-item"],
                ];

                validArrays.forEach(canSignInWith => {
                    const result = toActionState({ canSignInWith });
                    expect(result.canSignInWith).toEqual(canSignInWith);
                    expect(result.canSignInWith).not.toBe(canSignInWith); // Should be a copy
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-array canSignInWith values", () => {
                const invalidArrays = [123, true, "google", {}];

                invalidArrays.forEach(canSignInWith => {
                    const result = toActionState({ canSignInWith } as any);
                    expect(result.canSignInWith).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: canSignInWith property is not a boolean"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should handle null canSignInWith without warning", () => {
                const result = toActionState({ canSignInWith: null } as any);
                expect(result.canSignInWith).toBeUndefined();
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should create a copy of canSignInWith array", () => {
                const originalArray = ["google", "github"];
                const result = toActionState({ canSignInWith: originalArray });
                
                expect(result.canSignInWith).toEqual(originalArray);
                expect(result.canSignInWith).not.toBe(originalArray);
                
                // Modifying original should not affect result
                originalArray.push("facebook");
                expect(result.canSignInWith).not.toContain("facebook");
            });
        });

        describe("Object Properties Validation", () => {
            it("should accept FormData objects for formData", () => {
                const formData = new FormData();
                formData.append("test", "value");
                
                const result = toActionState({ formData });
                expect(result.formData).toBe(formData);
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should accept null and undefined formData", () => {
                expect(toActionState({ formData: null }).formData).toBeUndefined();
                expect(toActionState({ formData: undefined }).formData).toBeUndefined();
                expect(console.warn).not.toHaveBeenCalled();
            });

            it("should accept valid object for formErrorMap", () => {
                const errorMaps = [
                    { field: { message: "Error", type: "required" } },
                    {},
                    { multiple: { message: "Error 1" }, fields: { message: "Error 2" } },
                ];

                errorMaps.forEach(formErrorMap => {
                    const result = toActionState({ formErrorMap });
                    expect(result.formErrorMap).toBe(formErrorMap);
                    expect(console.warn).not.toHaveBeenCalled();
                });
            });

            it("should reject non-object formErrorMap values", () => {
                const invalidObjects = [123, true, "string"];

                invalidObjects.forEach(formErrorMap => {
                    const result = toActionState({ formErrorMap } as any);
                    expect(result.formErrorMap).toBeUndefined();
                    expect(console.warn).toHaveBeenCalledWith(
                        "toActionState: formErrorMap property is not an object"
                    );
                    jest.clearAllMocks();
                });
            });

            it("should accept arrays as formErrorMap (JavaScript typeof behavior)", () => {
                const arrayErrorMap = ["error1", "error2"];
                const result = toActionState({ formErrorMap: arrayErrorMap } as any);
                expect(result.formErrorMap).toBe(arrayErrorMap);
                expect(console.warn).not.toHaveBeenCalled();
            });
        });
    });

    describe("Input Validation Tests", () => {
        it("should return empty object for null input", () => {
            const result = toActionState(null as any);
            expect(result).toEqual({});
            expect(console.warn).toHaveBeenCalledWith(
                "toActionState: actionState parameter is null or undefined"
            );
        });

        it("should return empty object for undefined input", () => {
            const result = toActionState(undefined as any);
            expect(result).toEqual({});
            expect(console.warn).toHaveBeenCalledWith(
                "toActionState: actionState parameter is null or undefined"
            );
        });

        it("should return empty object for non-object input", () => {
            const nonObjectInputs = [123, "string", true, Symbol()];

            nonObjectInputs.forEach(input => {
                const result = toActionState(input as any);
                expect(result).toEqual({});
                expect(console.warn).toHaveBeenCalledWith(
                    "toActionState: actionState parameter is not an object"
                );
                jest.clearAllMocks();
            });
        });

        it("should accept arrays as objects (JavaScript typeof behavior)", () => {
            const result = toActionState([] as any);
            expect(result).toEqual({});
            expect(console.warn).not.toHaveBeenCalled();
        });

        it("should handle falsy values correctly", () => {
            const falsyValues = [false, 0, "", NaN];

            falsyValues.forEach(input => {
                const result = toActionState(input as any);
                expect(result).toEqual({});
                expect(console.warn).toHaveBeenCalledWith(
                    "toActionState: actionState parameter is null or undefined"
                );
                jest.clearAllMocks();
            });
        });
    });

    describe("Error Handling Tests", () => {
        it("should handle destructuring errors gracefully", () => {
            // Create an object that throws when accessed
            const problematicObject = {};
            Object.defineProperty(problematicObject, "status", {
                get() {
                    throw new Error("Property access error");
                }
            });

            const result = toActionState(problematicObject as any);
            expect(result).toEqual({});
            expect(console.error).toHaveBeenCalledWith(
                "toActionState: error processing actionState:",
                expect.any(Error)
            );
        });

        it("should handle circular references in input", () => {
            const circularObject: any = { status: ActionStatus.INFO };
            circularObject.self = circularObject;

            const result = toActionState(circularObject);
            expect(result.status).toBe(ActionStatus.INFO);
            expect(result.self).toBeUndefined(); // Circular reference not included
        });

        it("should never throw exceptions", () => {
            const problematicInputs = [
                null,
                undefined,
                123,
                "string",
                [],
                Symbol(),
                { get status() { throw new Error("Error"); } },
            ];

            problematicInputs.forEach(input => {
                expect(() => toActionState(input as any)).not.toThrow();
            });
        });
    });

    describe("Edge Cases and Complex Scenarios", () => {
        it("should handle objects with extra properties", () => {
            const inputWithExtras = {
                status: ActionStatus.SUCCESS,
                message: "Success",
                extraProperty: "should be ignored",
                anotherExtra: { nested: "object" },
            };

            const result = toActionState(inputWithExtras as any);
            
            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe("Success");
            expect(result.extraProperty).toBeUndefined();
            expect(result.anotherExtra).toBeUndefined();
        });

        it("should handle mixed valid and invalid properties", () => {
            const mixedInput = {
                status: ActionStatus.SUCCESS, // Valid
                message: 123, // Invalid - not string
                isFavorite: true, // Valid
                isRead: "not boolean", // Invalid - not boolean
                userId: "valid-user", // Valid
                formErrorMap: "not object", // Invalid - not object
            };

            const result = toActionState(mixedInput as any);
            
            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBeUndefined();
            expect(result.isFavorite).toBe(true);
            expect(result.isRead).toBeUndefined();
            expect(result.userId).toBe("valid-user");
            expect(result.formErrorMap).toBeUndefined();
            
            expect(console.warn).toHaveBeenCalledWith(
                "toActionState: message property is not a string"
            );
            expect(console.warn).toHaveBeenCalledWith(
                "toActionState: isRead property is not a boolean"
            );
            expect(console.warn).toHaveBeenCalledWith(
                "toActionState: formErrorMap property is not an object"
            );
        });

        it("should handle very large objects efficiently", () => {
            const largeObject = {
                status: ActionStatus.SUCCESS,
                message: "a".repeat(10000),
                userId: "user123",
                canSignInWith: new Array(1000).fill("provider"),
            };

            const startTime = performance.now();
            const result = toActionState(largeObject);
            const endTime = performance.now();
            
            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toHaveLength(10000);
            expect(result.canSignInWith).toHaveLength(1000);
            expect(endTime - startTime).toBeLessThan(100); // Should be reasonably fast
        });

        it("should handle objects with null prototype", () => {
            const nullProtoObject = Object.create(null);
            nullProtoObject.status = ActionStatus.INFO;
            nullProtoObject.message = "Null prototype object";

            const result = toActionState(nullProtoObject);
            expect(result.status).toBe(ActionStatus.INFO);
            expect(result.message).toBe("Null prototype object");
        });
    });

    describe("Type Safety and Return Value Tests", () => {
        it("should return ActionState interface compliant object", () => {
            const input = {
                status: ActionStatus.SUCCESS,
                message: "Test message",
                isFavorite: true,
                isRead: false,
                userId: "user123",
                isAccountLinked: true,
                canSignInWith: ["google"],
                email: "test@example.com",
                password: "password",
                shouldAutoLogin: false,
            };

            const result = toActionState(input);
            
            // All properties should match ActionState interface
            if (result.status) expect(typeof result.status).toBe("string");
            if (result.message) expect(typeof result.message).toBe("string");
            if (result.isFavorite !== undefined) expect(typeof result.isFavorite).toBe("boolean");
            if (result.isRead !== undefined) expect(typeof result.isRead).toBe("boolean");
            if (result.userId) expect(typeof result.userId).toBe("string");
            if (result.isAccountLinked !== undefined) expect(typeof result.isAccountLinked).toBe("boolean");
            if (result.canSignInWith) expect(Array.isArray(result.canSignInWith)).toBe(true);
            if (result.email) expect(typeof result.email).toBe("string");
            if (result.password) expect(typeof result.password).toBe("string");
            if (result.shouldAutoLogin !== undefined) expect(typeof result.shouldAutoLogin).toBe("boolean");
        });

        it("should only include defined properties in result", () => {
            const sparseInput = {
                status: ActionStatus.INFO,
                // message: undefined (omitted)
                isFavorite: true,
                // isRead: undefined (omitted)
            };

            const result = toActionState(sparseInput);
            
            expect(result).toHaveProperty("status");
            expect(result).not.toHaveProperty("message");
            expect(result).toHaveProperty("isFavorite");
            expect(result).not.toHaveProperty("isRead");
            
            expect(Object.keys(result)).toEqual(["status", "isFavorite"]);
        });

        it("should handle all ActionStatus enum values", () => {
            const statusValues = [
                ActionStatus.INFO,
                ActionStatus.SUCCESS,
                ActionStatus.WARNING,
                ActionStatus.ERROR,
            ];

            statusValues.forEach(status => {
                const result = toActionState({ status });
                expect(result.status).toBe(status);
            });
        });
    });

    describe("Performance Tests", () => {
        it("should process ActionState objects quickly", () => {
            const complexState = {
                status: ActionStatus.SUCCESS,
                message: "Complex state",
                isFavorite: true,
                isRead: false,
                userId: "user123",
                isAccountLinked: true,
                canSignInWith: ["google", "github", "email"],
                email: "test@example.com",
                password: "password123",
                shouldAutoLogin: false,
                formErrorMap: { field1: { message: "Error 1" } },
            };

            const startTime = performance.now();
            toActionState(complexState);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(10);
        });

        it("should handle multiple concurrent calls efficiently", () => {
            const state = { status: ActionStatus.SUCCESS, message: "Concurrent test" };
            
            const promises = Array.from({ length: 100 }, () => 
                Promise.resolve(toActionState(state))
            );
            
            return Promise.all(promises).then(results => {
                expect(results).toHaveLength(100);
                results.forEach(result => {
                    expect(result.status).toBe(ActionStatus.SUCCESS);
                    expect(result.message).toBe("Concurrent test");
                });
            });
        });
    });
});