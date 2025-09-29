import { hash, compare } from "bcryptjs";
import { hashPassword, verifyPassword, validatePassword } from "@/utils/password-utils";
import { PasswordValidation } from "@/types";

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

const mockHash = hash as jest.MockedFunction<(data: string | Buffer, saltOrRounds: string | number) => Promise<string>>;
const mockCompare = compare as jest.MockedFunction<(data: string | Buffer, encrypted: string) => Promise<boolean>>;

describe("password-utils", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("hashPassword", () => {
        it("should hash password with correct salt rounds", async () => {
            const password = "testPassword123";
            const hashedPassword = "$2a$12$hashedPasswordString";

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(mockHash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it("should handle empty password", async () => {
            const password = "";
            const hashedPassword = "$2a$12$emptyPasswordHash";

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(mockHash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it("should handle special characters in password", async () => {
            const password = "Test@123!#$%^&*";
            const hashedPassword = "$2a$12$specialCharsHash";

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(mockHash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it("should handle very long passwords", async () => {
            const password = "a".repeat(1000);
            const hashedPassword = "$2a$12$longPasswordHash";

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(mockHash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it("should handle unicode characters", async () => {
            const password = "paw�r123!";
            const hashedPassword = "$2a$12$unicodePasswordHash";

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(mockHash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it("should propagate errors from bcryptjs hash", async () => {
            const password = "testPassword123";
            const error = new Error("Hashing failed");

            mockHash.mockRejectedValue(error);

            await expect(hashPassword(password)).rejects.toThrow("Hashing failed");
            expect(mockHash).toHaveBeenCalledWith(password, 12);
        });

        it("should maintain consistent salt rounds", async () => {
            const passwords = ["pass1", "pass2", "pass3"];

            mockHash.mockImplementation((pass, salt) =>
                Promise.resolve(`hash_${pass}_salt_${salt}`)
            );

            for (let i = 0; i < passwords.length; i++) {
                await hashPassword(passwords[i]);
                expect(mockHash).toHaveBeenNthCalledWith(i + 1, passwords[i], 12);
            }
        });
    });

    describe("verifyPassword", () => {
        it("should verify correct password successfully", async () => {
            const password = "testPassword123";
            const hashedPassword = "$2a$12$hashedPasswordString";

            mockCompare.mockResolvedValue(true);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it("should reject incorrect password", async () => {
            const password = "wrongPassword";
            const hashedPassword = "$2a$12$hashedPasswordString";

            mockCompare.mockResolvedValue(false);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });

        it("should handle empty password verification", async () => {
            const password = "";
            const hashedPassword = "$2a$12$emptyPasswordHash";

            mockCompare.mockResolvedValue(false);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });

        it("should handle empty hash verification", async () => {
            const password = "testPassword123";
            const hashedPassword = "";

            mockCompare.mockResolvedValue(false);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });

        it("should handle special characters in password verification", async () => {
            const password = "Test@123!#$%^&*";
            const hashedPassword = "$2a$12$specialCharsHash";

            mockCompare.mockResolvedValue(true);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it("should handle unicode characters in verification", async () => {
            const password = "paw�r123!";
            const hashedPassword = "$2a$12$unicodePasswordHash";

            mockCompare.mockResolvedValue(true);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it("should propagate errors from bcryptjs compare", async () => {
            const password = "testPassword123";
            const hashedPassword = "$2a$12$hashedPasswordString";
            const error = new Error("Comparison failed");

            mockCompare.mockRejectedValue(error);

            await expect(verifyPassword(password, hashedPassword)).rejects.toThrow("Comparison failed");
            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
        });

        it("should handle malformed hash gracefully", async () => {
            const password = "testPassword123";
            const malformedHash = "not-a-valid-hash";

            mockCompare.mockRejectedValue(new Error("Invalid hash"));

            await expect(verifyPassword(password, malformedHash)).rejects.toThrow("Invalid hash");
            expect(mockCompare).toHaveBeenCalledWith(password, malformedHash);
        });

        it("should handle null/undefined inputs", async () => {
            mockCompare.mockResolvedValue(false);

            await verifyPassword(null as any, "hash");
            expect(mockCompare).toHaveBeenCalledWith(null, "hash");

            await verifyPassword("password", null as any);
            expect(mockCompare).toHaveBeenCalledWith("password", null);

            await verifyPassword(undefined as any, undefined as any);
            expect(mockCompare).toHaveBeenCalledWith(undefined, undefined);
        });
    });

    describe("validatePassword", () => {
        describe("Valid passwords", () => {
            it("should validate strong password with all requirements", () => {
                const password = "StrongP@ssw0rd";

                const result: PasswordValidation = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });

            it("should validate minimum valid password", () => {
                const password = "Aa1@bcde";

                const result = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });

            it("should validate password with all special characters", () => {
                const password = "Test123@$!%*?&";

                const result = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });

            it("should validate very long valid password", () => {
                const password = "VeryLongPassword123@" + "a".repeat(100);

                const result = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });
        });

        describe("Invalid passwords - length requirement", () => {
            it("should reject password shorter than 8 characters", () => {
                const password = "Test1@";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must be at least 8 characters long.");
            });

            it("should reject empty password", () => {
                const password = "";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must be at least 8 characters long.");
            });

            it("should reject password with exactly 7 characters", () => {
                const password = "Test1@a";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must be at least 8 characters long.");
            });
        });

        describe("Invalid passwords - character requirements", () => {
            it("should reject password without lowercase letters", () => {
                const password = "TESTPASS1@";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must contain at least one lowercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one uppercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one number.");
                expect(result.errors).not.toContain("Password must contain at least one special character (@$!%*?&).");
            });

            it("should reject password without uppercase letters", () => {
                const password = "testpass1@";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must contain at least one uppercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one lowercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one number.");
                expect(result.errors).not.toContain("Password must contain at least one special character (@$!%*?&).");
            });

            it("should reject password without numbers", () => {
                const password = "TestPass@";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must contain at least one number.");
                expect(result.errors).not.toContain("Password must contain at least one lowercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one uppercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one special character (@$!%*?&).");
            });

            it("should reject password without special characters", () => {
                const password = "TestPass1";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                expect(result.errors).not.toContain("Password must contain at least one lowercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one uppercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one number.");
            });

            it("should reject password with invalid special characters", () => {
                const password = "TestPass1#";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
            });
        });

        describe("Invalid passwords - multiple violations", () => {
            it("should report all validation errors for completely invalid password", () => {
                const password = "abc";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toEqual([
                    "Password must be at least 8 characters long.",
                    "Password must contain at least one uppercase letter.",
                    "Password must contain at least one number.",
                    "Password must contain at least one special character (@$!%*?&).",
                ]);
            });

            it("should report length and character requirement errors", () => {
                const password = "Test";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContain("Password must be at least 8 characters long.");
                expect(result.errors).toContain("Password must contain at least one number.");
                expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                expect(result.errors).not.toContain("Password must contain at least one lowercase letter.");
                expect(result.errors).not.toContain("Password must contain at least one uppercase letter.");
            });

            it("should report missing uppercase and special character", () => {
                const password = "testpass123";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toEqual([
                    "Password must contain at least one uppercase letter.",
                    "Password must contain at least one special character (@$!%*?&).",
                ]);
            });
        });

        describe("Edge cases and special inputs", () => {
            it("should handle password with only spaces", () => {
                const password = "        ";

                const result = validatePassword(password);

                expect(result.isValid).toBe(false);
                expect(result.errors).toEqual([
                    "Password must contain at least one lowercase letter.",
                    "Password must contain at least one uppercase letter.",
                    "Password must contain at least one number.",
                    "Password must contain at least one special character (@$!%*?&).",
                ]);
            });

            it("should handle password with unicode characters", () => {
                const password = "T�st123@";

                const result = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });

            it("should handle password with mixed valid and invalid special chars", () => {
                const password = "TestPass1@#";

                const result = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });

            it("should validate each special character individually", () => {
                const specialChars = ["@", "$", "!", "%", "*", "?", "&"];

                specialChars.forEach(char => {
                    const password = `TestPass1${char}`;
                    const result = validatePassword(password);

                    expect(result.isValid).toBe(true);
                    expect(result.errors).toEqual([]);
                });
            });

            it("should handle password with numbers at different positions", () => {
                const passwords = ["1TestPass@", "Test1Pass@", "TestPass1@", "TestPass@1"];

                passwords.forEach(password => {
                    const result = validatePassword(password);

                    expect(result.isValid).toBe(true);
                    expect(result.errors).toEqual([]);
                });
            });

            it("should handle null or undefined input by throwing error", () => {
                // The current implementation doesn't handle null/undefined gracefully
                // It will throw when trying to access .length property
                expect(() => validatePassword(null as any)).toThrow();
                expect(() => validatePassword(undefined as any)).toThrow();
            });
        });

        describe("Regex validation accuracy", () => {
            it("should correctly identify lowercase letters in various positions", () => {
                const passwordsWithLowercase = [
                    "aTestPass1@",
                    "TestaPass1@",
                    "TestPassa1@",
                    "TestPass1a@"
                ];

                passwordsWithLowercase.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.errors).not.toContain("Password must contain at least one lowercase letter.");
                });
            });

            it("should correctly identify uppercase letters in various positions", () => {
                const passwordsWithUppercase = [
                    "Atestpass1@",
                    "testApass1@",
                    "testpassA1@",
                    "testpass1A@"
                ];

                passwordsWithUppercase.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.errors).not.toContain("Password must contain at least one uppercase letter.");
                });
            });

            it("should correctly identify numbers in various positions", () => {
                const passwordsWithNumbers = [
                    "1TestPass@",
                    "Test1Pass@",
                    "TestPass1@",
                    "TestPass@1"
                ];

                passwordsWithNumbers.forEach(password => {
                    const result = validatePassword(password);
                    expect(result.errors).not.toContain("Password must contain at least one number.");
                });
            });

            it("should only accept specified special characters", () => {
                const validSpecialChars = "@$!%*?&";
                const invalidSpecialChars = "#^()[]{}|\\:;\"'<>,.`~";

                validSpecialChars.split("").forEach(char => {
                    const password = `TestPass1${char}`;
                    const result = validatePassword(password);
                    expect(result.errors).not.toContain("Password must contain at least one special character (@$!%*?&).");
                });

                invalidSpecialChars.split("").forEach(char => {
                    const password = `TestPass1${char}`;
                    const result = validatePassword(password);
                    expect(result.errors).toContain("Password must contain at least one special character (@$!%*?&).");
                });
            });
        });

        describe("Return type validation", () => {
            it("should return correct PasswordValidation interface structure", () => {
                const password = "TestPass1@";

                const result = validatePassword(password);

                expect(result).toHaveProperty("isValid");
                expect(result).toHaveProperty("errors");
                expect(typeof result.isValid).toBe("boolean");
                expect(Array.isArray(result.errors)).toBe(true);
                expect(result.errors.every(error => typeof error === "string")).toBe(true);
            });

            it("should maintain immutable error array", () => {
                const password = "invalid";

                const result = validatePassword(password);
                const originalErrorsLength = result.errors.length;

                // Attempt to modify the errors array
                result.errors.push("New error");

                // Validate that calling the function again returns fresh array
                const result2 = validatePassword(password);
                expect(result2.errors.length).toBe(originalErrorsLength);
            });
        });
    });

    describe("Integration scenarios", () => {
        it("should work together: hash and verify valid password", async () => {
            const password = "TestPass123@";

            // Mock the actual bcrypt behavior
            const hashedPassword = "$2a$12$mockHashedPassword";
            mockHash.mockResolvedValue(hashedPassword);
            mockCompare.mockResolvedValue(true);

            // Validate, hash, and verify
            const validation = validatePassword(password);
            expect(validation.isValid).toBe(true);

            const hash = await hashPassword(password);
            expect(hash).toBe(hashedPassword);

            const verified = await verifyPassword(password, hash);
            expect(verified).toBe(true);
        });

        it("should work together: reject invalid password through validation", async () => {
            const password = "weak";

            // Validate first
            const validation = validatePassword(password);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);

            // Even though we could hash it, validation should prevent it
            // This demonstrates the intended workflow
        });

        it("should handle complete password change workflow", async () => {
            const oldPassword = "OldPass123@";
            const newPassword = "NewPass456!";
            const oldHash = "$2a$12$oldPasswordHash";
            const newHash = "$2a$12$newPasswordHash";

            // Setup mocks
            mockCompare.mockImplementation((pass, hash) => {
                if (pass === oldPassword && hash === oldHash) return Promise.resolve(true);
                return Promise.resolve(false);
            });
            mockHash.mockResolvedValue(newHash);

            // Workflow: verify old password, validate new password, hash new password
            const oldPasswordValid = await verifyPassword(oldPassword, oldHash);
            expect(oldPasswordValid).toBe(true);

            const newPasswordValidation = validatePassword(newPassword);
            expect(newPasswordValidation.isValid).toBe(true);

            const newPasswordHash = await hashPassword(newPassword);
            expect(newPasswordHash).toBe(newHash);
        });
    });
});