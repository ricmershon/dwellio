/**
 * Password Utils Tests
 * 
 * Section 7 of UTILS_TEST_PLAN
 * Tests password hashing, verification, and strength validation with bcryptjs
 */

// @ts-nocheck - Test file with bcryptjs mocking

import { hashPassword, verifyPassword, validatePassword } from "@/utils/password-utils";
import type { PasswordValidation } from "@/types";

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Get the mocked functions
import { hash, compare } from "bcryptjs";
const mockHash = hash as jest.MockedFunction<typeof hash>;
const mockCompare = compare as jest.MockedFunction<typeof compare>;

describe("password-utils", () => {
    const originalConsoleError = console.error;
    
    beforeEach(() => {
        jest.clearAllMocks();
        console.error = jest.fn();
    });
    
    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe("hashPassword", () => {
        describe("Password Hashing Tests", () => {
            it("should hash password with correct salt rounds", async () => {
                const password = "testPassword123!";
                const hashedPassword = "$2a$12$hashedPasswordString";
                mockHash.mockResolvedValue(hashedPassword);

                const result = await hashPassword(password);

                expect(mockHash).toHaveBeenCalledWith(password, 12);
                expect(result).toBe(hashedPassword);
            });

            it("should handle various password lengths", async () => {
                const passwords = [
                    "short",
                    "mediumLengthPassword123!",
                    "veryLongPasswordWithManyCharactersAndSymbols123!@#$%^&*()",
                ];

                for (const password of passwords) {
                    const hashedPassword = `$2a$12$hashed_${password.length}`;
                    mockHash.mockResolvedValue(hashedPassword);

                    const result = await hashPassword(password);
                    
                    expect(mockHash).toHaveBeenCalledWith(password, 12);
                    expect(result).toBe(hashedPassword);
                }
            });

            it("should handle passwords with special characters", async () => {
                const specialPasswords = [
                    "pass@#$%^&*()",
                    "üñíçødé123!",
                    "emoji😀password!",
                    "spaces in password!",
                    "tabs\tand\nnewlines!",
                ];

                for (const password of specialPasswords) {
                    const hashedPassword = `$2a$12$special_${password.replace(/\W/g, "_")}`;
                    mockHash.mockResolvedValue(hashedPassword);

                    const result = await hashPassword(password);
                    
                    expect(mockHash).toHaveBeenCalledWith(password, 12);
                    expect(result).toBe(hashedPassword);
                }
            });

            it("should handle empty and whitespace passwords", async () => {
                const edgeCasePasswords = ["", " ", "\t", "\n", "   "];

                for (const password of edgeCasePasswords) {
                    const hashedPassword = `$2a$12$empty_hash`;
                    mockHash.mockResolvedValue(hashedPassword);

                    const result = await hashPassword(password);
                    
                    expect(mockHash).toHaveBeenCalledWith(password, 12);
                    expect(result).toBe(hashedPassword);
                }
            });
        });

        describe("bcryptjs Integration Tests", () => {
            it("should use salt rounds of 12", async () => {
                mockHash.mockResolvedValue("$2a$12$mockedHash");
                
                await hashPassword("testPassword");
                
                expect(mockHash).toHaveBeenCalledWith("testPassword", 12);
            });

            it("should return bcryptjs hash result", async () => {
                const expectedHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYCb.T7f/RBOF.C";
                mockHash.mockResolvedValue(expectedHash);

                const result = await hashPassword("securePassword123!");
                
                expect(result).toBe(expectedHash);
            });

            it("should handle bcryptjs errors gracefully", async () => {
                const bcryptError = new Error("bcrypt hashing failed");
                mockHash.mockRejectedValue(bcryptError);

                await expect(hashPassword("testPassword")).rejects.toThrow("bcrypt hashing failed");
            });
        });

        describe("Performance Tests", () => {
            it("should complete hashing within reasonable time", async () => {
                mockHash.mockResolvedValue("$2a$12$quickHash");
                
                const startTime = performance.now();
                await hashPassword("testPassword");
                const endTime = performance.now();

                // Mocked version should be very fast
                expect(endTime - startTime).toBeLessThan(10);
            });

            it("should handle concurrent hashing operations", async () => {
                mockHash.mockResolvedValue("$2a$12$concurrentHash");
                
                const passwords = Array.from({ length: 10 }, (_, i) => `password${i}`);
                const promises = passwords.map(password => hashPassword(password));
                
                const results = await Promise.all(promises);
                
                expect(results).toHaveLength(10);
                expect(mockHash).toHaveBeenCalledTimes(10);
                results.forEach(result => {
                    expect(result).toBe("$2a$12$concurrentHash");
                });
            });
        });
    });

    describe("verifyPassword", () => {
        describe("Password Verification Tests", () => {
            it("should verify correct password against hash", async () => {
                const password = "correctPassword123!";
                const hash = "$2a$12$hashedPassword";
                mockCompare.mockResolvedValue(true);

                const result = await verifyPassword(password, hash);

                expect(mockCompare).toHaveBeenCalledWith(password, hash);
                expect(result).toBe(true);
            });

            it("should reject incorrect password against hash", async () => {
                const password = "wrongPassword";
                const hash = "$2a$12$hashedPassword";
                mockCompare.mockResolvedValue(false);

                const result = await verifyPassword(password, hash);

                expect(mockCompare).toHaveBeenCalledWith(password, hash);
                expect(result).toBe(false);
            });

            it("should handle various password and hash combinations", async () => {
                const testCases = [
                    { password: "test123!", hash: "$2a$12$hash1", expected: true },
                    { password: "wrong", hash: "$2a$12$hash1", expected: false },
                    { password: "complex@Password123", hash: "$2a$12$complex", expected: true },
                    { password: "", hash: "$2a$12$empty", expected: false },
                    { password: "üñíçødé", hash: "$2a$12$unicode", expected: true },
                ];

                for (const { password, hash, expected } of testCases) {
                    mockCompare.mockResolvedValue(expected);

                    const result = await verifyPassword(password, hash);
                    
                    expect(mockCompare).toHaveBeenCalledWith(password, hash);
                    expect(result).toBe(expected);
                }
            });

            it("should handle malformed hash strings", async () => {
                const password = "testPassword";
                const malformedHashes = [
                    "notAValidHash",
                    "$2a$12$",
                    "plaintext",
                    "",
                    "$1$invalid$format",
                ];

                for (const hash of malformedHashes) {
                    mockCompare.mockResolvedValue(false);

                    const result = await verifyPassword(password, hash);
                    
                    expect(mockCompare).toHaveBeenCalledWith(password, hash);
                    expect(result).toBe(false);
                }
            });
        });

        describe("bcryptjs Integration Tests", () => {
            it("should use bcryptjs compare function", async () => {
                mockCompare.mockResolvedValue(true);
                
                await verifyPassword("password", "$2a$12$hash");
                
                expect(mockCompare).toHaveBeenCalledWith("password", "$2a$12$hash");
            });

            it("should handle bcryptjs comparison errors", async () => {
                const bcryptError = new Error("bcrypt comparison failed");
                mockCompare.mockRejectedValue(bcryptError);

                await expect(verifyPassword("password", "$2a$12$hash")).rejects.toThrow("bcrypt comparison failed");
            });

            it("should return boolean result from bcryptjs", async () => {
                mockCompare.mockResolvedValue(true);
                expect(await verifyPassword("pass", "hash")).toBe(true);

                mockCompare.mockResolvedValue(false);
                expect(await verifyPassword("pass", "hash")).toBe(false);
            });
        });

        describe("Security Tests", () => {
            it("should handle timing attack scenarios", async () => {
                // Both valid and invalid should take similar time (mocked)
                mockCompare.mockResolvedValue(true);
                const startValid = performance.now();
                await verifyPassword("validPassword", "$2a$12$validHash");
                const endValid = performance.now();

                mockCompare.mockResolvedValue(false);
                const startInvalid = performance.now();
                await verifyPassword("invalidPassword", "$2a$12$validHash");
                const endInvalid = performance.now();

                // In real bcrypt, timing should be similar, but mocked version is instant
                expect(endValid - startValid).toBeLessThan(10);
                expect(endInvalid - startInvalid).toBeLessThan(10);
            });

            it("should handle null and undefined inputs securely", async () => {
                mockCompare.mockResolvedValue(false);

                // These should not throw but return false
                expect(await verifyPassword(null as any, "$2a$12$hash")).toBe(false);
                expect(await verifyPassword("password", null as any)).toBe(false);
                expect(await verifyPassword(undefined as any, "$2a$12$hash")).toBe(false);
                expect(await verifyPassword("password", undefined as any)).toBe(false);
            });
        });
    });

    describe("validatePassword", () => {
        describe("Password Strength Validation Tests", () => {
            it("should validate strong passwords as valid", () => {
                const strongPasswords = [
                    "StrongPass123!",
                    "Complex@Password1",
                    "Secure&Strong2024",
                    "MyP@ssw0rd123",
                    "Valid123@Password",
                ];

                strongPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
            });

            it("should reject passwords shorter than 8 characters", () => {
                const shortPasswords = [
                    "Ab1!",
                    "Short1@",
                    "1234567",
                    "Abc123!",
                    "",
                ];

                shortPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must be at least 8 characters long.");
                });
            });

            it("should require at least one lowercase letter", () => {
                const noLowercasePasswords = [
                    "UPPERCASE123!",
                    "ALL_CAPS@2024",
                    "NO-LOWER_CASE123",
                    "123456789@",
                ];

                noLowercasePasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must contain at least one lowercase letter.");
                });
            });

            it("should require at least one uppercase letter", () => {
                const noUppercasePasswords = [
                    "lowercase123!",
                    "all_lower@2024",
                    "no-upper_case123",
                    "alllowercase@",
                ];

                noUppercasePasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must contain at least one uppercase letter.");
                });
            });

            it("should require at least one number", () => {
                const noNumberPasswords = [
                    "NoNumbers@Here",
                    "AllLetters!Only",
                    "Password@Without",
                    "OnlyLetters&Symbols!",
                ];

                noNumberPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must contain at least one number.");
                });
            });

            it("should require at least one special character", () => {
                const noSpecialCharPasswords = [
                    "NoSpecialChars123",
                    "OnlyLettersAndNumbers123",
                    "AlphaNumeric2024",
                    "PlainPassword123",
                ];

                noSpecialCharPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                });
            });
        });

        describe("Special Character Validation Tests", () => {
            it("should accept all allowed special characters", () => {
                const allowedSpecialChars = ["@", "$", "!", "%", "*", "?", "&"];
                
                allowedSpecialChars.forEach(char => {
                    const password = `ValidPass123${char}`;
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
            });

            it("should reject passwords with only disallowed special characters", () => {
                const disallowedSpecialPasswords = [
                    "Password123#",
                    "Valid123^",
                    "Strong123~",
                    "Secure123+",
                    "Complex123=",
                ];

                disallowedSpecialPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                });
            });

            it("should handle multiple special characters", () => {
                const multiSpecialPasswords = [
                    "Complex@Pass123!",
                    "Secure$Password1%",
                    "Strong@123!Password",
                    "Valid&Pass@123*",
                ];

                multiSpecialPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
            });
        });

        describe("Combined Validation Error Tests", () => {
            it("should return multiple errors for passwords with multiple issues", () => {
                const result = validatePassword("weak");
                
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must be at least 8 characters long.");
                expect(result.errors).toContain("Password must contain at least one uppercase letter.");
                expect(result.errors).toContain("Password must contain at least one number.");
                expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                expect(result.errors).toHaveLength(4);
            });

            it("should return specific error combinations", () => {
                const testCases = [
                    {
                        password: "short",
                        expectedErrors: [
                            "Password must be at least 8 characters long.",
                            "Password must contain at least one uppercase letter.",
                            "Password must contain at least one number.",
                            "Password must contain at least one special character (@$!%*?&).",
                        ]
                    },
                    {
                        password: "ONLYUPPERCASE",
                        expectedErrors: [
                            "Password must contain at least one lowercase letter.",
                            "Password must contain at least one number.",
                            "Password must contain at least one special character (@$!%*?&).",
                        ]
                    },
                    {
                        password: "onlylowercase",
                        expectedErrors: [
                            "Password must contain at least one uppercase letter.",
                            "Password must contain at least one number.",
                            "Password must contain at least one special character (@$!%*?&).",
                        ]
                    }
                ];

                testCases.forEach(({ password, expectedErrors }) => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toHaveLength(expectedErrors.length);
                    expectedErrors.forEach(error => {
                        expect(result.errors).toContain(error);
                    });
                });
            });
        });

        describe("Edge Cases and Input Validation Tests", () => {
            it("should handle null and undefined inputs", () => {
                // The actual function doesn't handle null/undefined gracefully - it throws
                expect(() => validatePassword(null as any)).toThrow();
                expect(() => validatePassword(undefined as any)).toThrow();
            });

            it("should handle empty string", () => {
                const result = validatePassword("");
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must be at least 8 characters long.");
                expect(result.errors).toContain("Password must contain at least one lowercase letter.");
                expect(result.errors).toContain("Password must contain at least one uppercase letter.");
                expect(result.errors).toContain("Password must contain at least one number.");
                expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
            });

            it("should handle whitespace-only passwords", () => {
                const whitespacePasswords = ["        ", "\t\t\t\t\t\t\t\t", "\n\n\n\n\n\n\n\n"];
                
                whitespacePasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain("Password must contain at least one lowercase letter.");
                    expect(result.errors).toContain("Password must contain at least one uppercase letter.");
                    expect(result.errors).toContain("Password must contain at least one number.");
                    expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                });
            });

            it("should handle unicode characters", () => {
                const validUnicodePasswords = [
                    "Unicødé123@", // Valid with unicode - has ASCII upper/lower + unicode chars
                ];

                validUnicodePasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
                
                // This fails because it lacks uppercase
                const invalidUnicodePassword = "üñíçødé123@"; // All lowercase unicode
                const result = validatePassword(invalidUnicodePassword);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must contain at least one uppercase letter.');
                
                // These actually pass - the regex works correctly with $ and !
                const workingSpecialCharPasswords = [
                    "TestPassword123$", // $ works correctly
                    "TestPassword123!", // ! works correctly  
                ];
                
                workingSpecialCharPasswords.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.isValid).toBe(true);
                    expect(result.errors).toHaveLength(0);
                });
            });
        });

        describe("Return Type Validation Tests", () => {
            it("should return PasswordValidation interface", () => {
                const result = validatePassword("TestPassword123!");
                
                expect(result).toHaveProperty("isValid");
                expect(result).toHaveProperty("errors");
                expect(typeof result.isValid).toBe("boolean");
                expect(Array.isArray(result.errors)).toBe(true);
                expect(result.errors.every(error => typeof error === "string")).toBe(true);
            });

            it("should return consistent structure for all inputs", () => {
                const testInputs = [
                    "ValidPassword123!",
                    "invalid",
                    "",
                    "123456789",
                    "ALLUPPERCASE123!",
                    "alllowercase123!",
                ];

                testInputs.forEach(password => {
                    const result = validatePassword(password);
                    expect(result).toHaveProperty("isValid");
                    expect(result).toHaveProperty("errors");
                    expect(typeof result.isValid).toBe("boolean");
                    expect(Array.isArray(result.errors)).toBe(true);
                });
            });
        });

        describe("Performance Tests", () => {
            it("should validate passwords quickly", () => {
                const password = "TestPassword123!";
                
                const startTime = performance.now();
                validatePassword(password);
                const endTime = performance.now();
                
                expect(endTime - startTime).toBeLessThan(5); // Should be very fast
            });

            it("should handle many validation requests efficiently", () => {
                const passwords = Array.from({ length: 1000 }, (_, i) => `TestPassword${i}!`);
                
                const startTime = performance.now();
                passwords.forEach(password => validatePassword(password));
                const endTime = performance.now();
                
                expect(endTime - startTime).toBeLessThan(100); // Should handle 1000 validations quickly
            });
        });
    });

    describe("Integration Tests", () => {
        describe("Full Password Workflow Tests", () => {
            it("should hash and verify valid password successfully", async () => {
                const password = "SecurePassword123!";
                const hashedPassword = "$2a$12$mockHashedPassword";
                
                // Mock hashing
                mockHash.mockResolvedValue(hashedPassword);
                const hash = await hashPassword(password);
                expect(hash).toBe(hashedPassword);
                
                // Mock verification
                mockCompare.mockResolvedValue(true);
                const isValid = await verifyPassword(password, hash);
                expect(isValid).toBe(true);
                
                // Validate password strength
                const validation = validatePassword(password);
                expect(validation.isValid).toBe(true);
                expect(validation.errors).toHaveLength(0);
            });

            it("should reject weak passwords in workflow", async () => {
                const weakPassword = "weak";
                
                // Password should fail validation
                const validation = validatePassword(weakPassword);
                expect(validation.isValid).toBe(false);
                expect(validation.errors.length).toBeGreaterThan(0);
                
                // But hashing/verification should still work if needed
                const hashedPassword = "$2a$12$mockHashedWeakPassword";
                mockHash.mockResolvedValue(hashedPassword);
                const hash = await hashPassword(weakPassword);
                expect(hash).toBe(hashedPassword);
                
                mockCompare.mockResolvedValue(true);
                const isValid = await verifyPassword(weakPassword, hash);
                expect(isValid).toBe(true);
            });

            it("should handle password change workflow", async () => {
                const oldPassword = "OldPassword123!";
                const newPassword = "NewSecurePassword123!";
                const oldHash = "$2a$12$oldPasswordHash";
                const newHash = "$2a$12$newPasswordHash";
                
                // Verify old password
                mockCompare.mockResolvedValue(true);
                const oldPasswordValid = await verifyPassword(oldPassword, oldHash);
                expect(oldPasswordValid).toBe(true);
                
                // Validate new password strength
                const newPasswordValidation = validatePassword(newPassword);
                expect(newPasswordValidation.isValid).toBe(true);
                
                // Hash new password
                mockHash.mockResolvedValue(newHash);
                const newPasswordHashed = await hashPassword(newPassword);
                expect(newPasswordHashed).toBe(newHash);
                
                // Verify new password works
                mockCompare.mockResolvedValue(true);
                const newPasswordVerified = await verifyPassword(newPassword, newPasswordHashed);
                expect(newPasswordVerified).toBe(true);
                
                // Ensure old password no longer works with new hash
                mockCompare.mockResolvedValue(false);
                const oldPasswordWithNewHash = await verifyPassword(oldPassword, newHash);
                expect(oldPasswordWithNewHash).toBe(false);
            });
        });

        describe("Error Handling Integration Tests", () => {
            it("should handle bcrypt errors throughout workflow", async () => {
                const password = "TestPassword123!";
                
                // Hash failure
                mockHash.mockRejectedValue(new Error("Hashing failed"));
                await expect(hashPassword(password)).rejects.toThrow("Hashing failed");
                
                // Verification failure
                mockCompare.mockRejectedValue(new Error("Verification failed"));
                await expect(verifyPassword(password, "$2a$12$hash")).rejects.toThrow("Verification failed");
                
                // Validation should still work
                const validation = validatePassword(password);
                expect(validation.isValid).toBe(true);
            });
        });
    });
});