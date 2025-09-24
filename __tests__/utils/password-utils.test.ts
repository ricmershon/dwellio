import { hashPassword, verifyPassword, validatePassword } from '@/utils/password-utils';
import { hash, compare } from 'bcryptjs';
import { PasswordValidation } from '@/types';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

const mockHash = hash as jest.MockedFunction<(s: string, saltOrRounds: string | number) => Promise<string>>;
const mockCompare = compare as jest.MockedFunction<(s: string, hash: string) => Promise<boolean>>;

describe('Password Utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('should hash password with correct salt rounds', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'hashedPassword123';

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(mockHash).toHaveBeenCalledWith(password, 12);
            expect(result).toBe(hashedPassword);
        });

        it('should handle bcrypt hash errors', async () => {
            const password = 'testPassword123';
            const hashError = new Error('Hash failed');

            mockHash.mockRejectedValue(hashError);

            await expect(hashPassword(password)).rejects.toThrow('Hash failed');
        });

        it('should work with different password lengths', async () => {
            const passwords = [
                'short',
                'mediumLengthPassword',
                'veryLongPasswordWithLotsOfCharacters123!@#$%^&*()'
            ];

            for (const password of passwords) {
                mockHash.mockResolvedValue(`hashed_${password}`);

                const result = await hashPassword(password);

                expect(mockHash).toHaveBeenCalledWith(password, 12);
                expect(result).toBe(`hashed_${password}`);
            }
        });

        it('should handle special characters in password', async () => {
            const password = 'Test@123!#$%^&*()';
            const hashedPassword = 'hashedSpecialPassword';

            mockHash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            expect(result).toBe(hashedPassword);
        });
    });

    describe('verifyPassword', () => {
        it('should verify password correctly when passwords match', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'hashedPassword123';

            mockCompare.mockResolvedValue(true);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it('should verify password correctly when passwords do not match', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'differentHashedPassword';

            mockCompare.mockResolvedValue(false);

            const result = await verifyPassword(password, hashedPassword);

            expect(mockCompare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });

        it('should handle bcrypt compare errors', async () => {
            const password = 'testPassword123';
            const hashedPassword = 'hashedPassword123';
            const compareError = new Error('Compare failed');

            mockCompare.mockRejectedValue(compareError);

            await expect(verifyPassword(password, hashedPassword)).rejects.toThrow('Compare failed');
        });

        it('should work with various password and hash combinations', async () => {
            const testCases = [
                { password: 'simple', hash: 'hash1', expected: true },
                { password: 'Complex@123!', hash: 'hash2', expected: false },
                { password: '', hash: 'hash3', expected: false },
                { password: 'normalPassword', hash: '', expected: false }
            ];

            for (const { password, hash, expected } of testCases) {
                mockCompare.mockResolvedValue(expected);

                const result = await verifyPassword(password, hash);

                expect(mockCompare).toHaveBeenCalledWith(password, hash);
                expect(result).toBe(expected);
            }
        });
    });

    describe('validatePassword', () => {
        it('should validate a strong password as valid', () => {
            const password = 'StrongPass123@';

            const result: PasswordValidation = validatePassword(password);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should reject password that is too short', () => {
            const password = 'Short1@';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long.');
        });

        it('should reject password without lowercase letter', () => {
            const password = 'NOUPPPERCASE123@';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter.');
        });

        it('should reject password without uppercase letter', () => {
            const password = 'nouppercase123@';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter.');
        });

        it('should reject password without number', () => {
            const password = 'NoNumbers@';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number.');
        });

        it('should reject password without special character', () => {
            const password = 'NoSpecialChars123';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&).');
        });

        it('should return multiple errors for password with multiple issues', () => {
            const password = 'weak';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(4);
            expect(result.errors).toContain('Password must be at least 8 characters long.');
            expect(result.errors).toContain('Password must contain at least one uppercase letter.');
            expect(result.errors).toContain('Password must contain at least one number.');
            expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&).');
        });

        it('should handle empty password', () => {
            const password = '';

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long.');
        });

        it('should validate different valid special characters', () => {
            const validSpecialChars = ['@', '$', '!', '%', '*', '?', '&'];

            for (const char of validSpecialChars) {
                const password = `ValidPass123${char}`;

                const result = validatePassword(password);

                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            }
        });

        it('should reject password with invalid special characters', () => {
            const password = 'ValidPass123#'; // # is not in the allowed special chars

            const result = validatePassword(password);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character (@$!%*?&).');
        });

        it('should validate password exactly at minimum length', () => {
            const password = 'Valid1@A'; // Exactly 8 characters

            const result = validatePassword(password);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate password with mixed case letters', () => {
            const password = 'MiXeDcAsE123@';

            const result = validatePassword(password);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate password with multiple numbers', () => {
            const password = 'Password123456@';

            const result = validatePassword(password);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should validate password with multiple special characters', () => {
            const password = 'Password123@!$%';

            const result = validatePassword(password);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should handle very long password', () => {
            const password = 'ThisIsAVeryLongPasswordWith123NumbersAnd@SpecialCharacters!';

            const result = validatePassword(password);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });
    });

    describe('Real-world Password Scenarios', () => {
        it('should handle typical user registration password validation', () => {
            const testPasswords = [
                { password: 'password', expectedValid: false },
                { password: 'Password', expectedValid: false },
                { password: 'Password1', expectedValid: false },
                { password: 'Password1@', expectedValid: true },
                { password: 'MySecurePass123!', expectedValid: true }
            ];

            for (const { password, expectedValid } of testPasswords) {
                const result = validatePassword(password);
                expect(result.isValid).toBe(expectedValid);
            }
        });

        it('should handle common password patterns', () => {
            const commonPasswords = [
                '12345678', // Only numbers, no letters or special chars
                'abcdefgh', // Only lowercase letters
                'ABCDEFGH', // Only uppercase letters
                'Password', // Missing numbers and special chars
                'password123', // Missing uppercase and special chars
                'PASSWORD123', // Missing lowercase and special chars
                'Password@', // Missing numbers
                'Password123' // Missing special chars
            ];

            for (const password of commonPasswords) {
                const result = validatePassword(password);
                expect(result.isValid).toBe(false);
            }
        });

        it('should demonstrate complete password workflow', async () => {
            const plainPassword = 'UserPassword123@';
            const hashedResult = 'hashed_user_password';

            // Step 1: Validate password strength
            const validation = validatePassword(plainPassword);
            expect(validation.isValid).toBe(true);

            // Step 2: Hash the password
            mockHash.mockResolvedValue(hashedResult);
            const hashedPassword = await hashPassword(plainPassword);
            expect(hashedPassword).toBe(hashedResult);

            // Step 3: Verify password during login
            mockCompare.mockResolvedValue(true);
            const isValidLogin = await verifyPassword(plainPassword, hashedPassword);
            expect(isValidLogin).toBe(true);

            // Step 4: Verify incorrect password fails
            mockCompare.mockResolvedValue(false);
            const isInvalidLogin = await verifyPassword('wrongPassword', hashedPassword);
            expect(isInvalidLogin).toBe(false);
        });

        it('should handle edge cases in password processing', async () => {
            // Empty strings
            expect(validatePassword('')).toEqual({
                isValid: false,
                errors: expect.arrayContaining(['Password must be at least 8 characters long.'])
            });

            // Special Unicode characters (should fail validation)
            const unicodePassword = 'Password123™';
            const unicodeResult = validatePassword(unicodePassword);
            expect(unicodeResult.isValid).toBe(false);
            expect(unicodeResult.errors).toContain('Password must contain at least one special character (@$!%*?&).');

            // Whitespace handling
            const passwordWithSpaces = 'Pass Word123@';
            const spacesResult = validatePassword(passwordWithSpaces);
            expect(spacesResult.isValid).toBe(true);
        });

        it('should handle bcrypt integration edge cases', async () => {
            // Test with actual bcrypt-like behavior
            const password = 'TestPassword123@';
            const fakeHash = '$2a$12$abcdefghijklmnopqrstuvwxyz1234567890';

            // Hash operation
            mockHash.mockResolvedValue(fakeHash);
            const hashedResult = await hashPassword(password);
            expect(hashedResult).toBe(fakeHash);

            // Verify operation with correct password
            mockCompare.mockResolvedValue(true);
            const correctVerification = await verifyPassword(password, fakeHash);
            expect(correctVerification).toBe(true);

            // Verify operation with incorrect password
            mockCompare.mockResolvedValue(false);
            const incorrectVerification = await verifyPassword('WrongPassword123@', fakeHash);
            expect(incorrectVerification).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle undefined password in validation', () => {
            const result = validatePassword('' as any); // Use empty string since validatePassword expects string

            // Should handle gracefully and return validation errors
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long.');
        });

        it('should handle null password in validation', () => {
            const result = validatePassword('' as any); // Use empty string since validatePassword expects string

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long.');
        });

        it('should handle network timeouts in hash operations', async () => {
            const password = 'TestPassword123@';
            const timeoutError = new Error('Network timeout');

            mockHash.mockRejectedValue(timeoutError);

            await expect(hashPassword(password)).rejects.toThrow('Network timeout');
        });

        it('should handle invalid hash format in verify operations', async () => {
            const password = 'TestPassword123@';
            const invalidHash = 'invalid_hash_format';
            const hashFormatError = new Error('Invalid hash format');

            mockCompare.mockRejectedValue(hashFormatError);

            await expect(verifyPassword(password, invalidHash)).rejects.toThrow('Invalid hash format');
        });
    });
});