/**
 * User Actions Integration Tests
 *
 * Tests Server Actions integration with FormData handling, validation schemas,
 * account linking logic, and password validation.
 */
import { jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('@/lib/db-connect');
jest.mock('@/utils/password-utils');
jest.mock('@/models');

import { Types } from 'mongoose';
import { createCredentialsUser } from '@/lib/actions/user-actions';
import { User } from '@/models';
import { ActionStatus } from '@/types';
import { hashPassword, validatePassword } from '@/utils/password-utils';

const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;

describe('User Actions - Server Actions Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        mockHashPassword.mockResolvedValue('$2b$10$hashedPasswordExample');
        mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
    });

    describe('createCredentialsUser - New User Flow', () => {
        it('should create new user with valid credentials', async () => {
            const userId = new Types.ObjectId();
            (User.findOne as any).mockResolvedValue(null); // No existing user
            (User.create as any).mockResolvedValue({ _id: userId });

            const formData = new FormData();
            formData.append('email', 'newuser@example.com');
            formData.append('password', 'SecurePassword123!');
            formData.append('username', 'newusername');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toBe('Account created successfully.');
            expect(result.userId).toBe(userId.toString());
            expect(result.isAccountLinked).toBe(false);
            expect(result.canSignInWith).toEqual(['credentials']);
            expect(result.shouldAutoLogin).toBe(true);
            expect(result.email).toBe('newuser@example.com');
            expect(result.password).toBe('SecurePassword123!');
        });

        it('should create username from email if not provided', async () => {
            const userId = new Types.ObjectId();
            (User.findOne as any).mockResolvedValue(null);
            (User.create as any).mockResolvedValue({ _id: userId });

            const formData = new FormData();
            formData.append('email', 'testuser@example.com');
            formData.append('password', 'Password123!');
            // No username provided

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect((User.create as any).mock.calls[0][0].username).toBe('testuser');
        });

        it('should lowercase email when creating user', async () => {
            const userId = new Types.ObjectId();
            (User.findOne as any).mockResolvedValue(null);
            (User.create as any).mockResolvedValue({ _id: userId });

            const formData = new FormData();
            formData.append('email', 'UPPERCASE@EXAMPLE.COM');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect((User.create as any).mock.calls[0][0].email).toBe('uppercase@example.com');
        });

        it('should validate password strength', async () => {
            mockValidatePassword.mockReturnValue({
                isValid: false,
                errors: ['Password must be at least 8 characters', 'Password must contain a number']
            });

            const formData = new FormData();
            formData.append('email', 'test@example.com');
            formData.append('password', 'weak');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toContain('Password must be at least 8 characters');
            expect(result.message).toContain('Password must contain a number');
        });

        it('should return error for missing email', async () => {
            const formData = new FormData();
            formData.append('password', 'Password123!');
            // Missing email

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Email and password are required.');
        });

        it('should return error for missing password', async () => {
            const formData = new FormData();
            formData.append('email', 'test@example.com');
            // Missing password

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Email and password are required.');
        });

        it('should validate email format', async () => {
            const formData = new FormData();
            formData.append('email', 'invalid-email');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Please enter a valid email address.');
        });

        it('should return error for duplicate username', async () => {
            (User.findOne as any)
                .mockResolvedValueOnce(null) // First call: check for email
                .mockResolvedValueOnce({ username: 'existinguser' }); // Second call: check username

            const formData = new FormData();
            formData.append('email', 'new@example.com');
            formData.append('password', 'Password123!');
            formData.append('username', 'existinguser');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Username "existinguser" is already taken.');
        });

        it('should return error for existing credentials account', async () => {
            (User.findOne as any).mockResolvedValue({
                email: 'existing@example.com',
                passwordHash: 'existinghash'
            });

            const formData = new FormData();
            formData.append('email', 'existing@example.com');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('An account with the email "existing@example.com" already exists.');
        });
    });

    describe('createCredentialsUser - OAuth Account Linking', () => {
        it('should link password to existing OAuth account', async () => {
            const userId = new Types.ObjectId();
            const mockOAuthUser = {
                _id: userId,
                email: 'oauth@example.com',
                username: 'oauthuser',
                passwordHash: undefined,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (User.findOne as any).mockResolvedValue(mockOAuthUser);

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'NewPassword123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.message).toContain('Password successfully added to your existing Google account');
            expect(result.isAccountLinked).toBe(true);
            expect(result.canSignInWith).toEqual(['google', 'credentials']);
            expect(result.shouldAutoLogin).toBe(true);
            expect(mockOAuthUser.passwordHash).toBe('$2b$10$hashedPasswordExample');
            expect(mockOAuthUser.save).toHaveBeenCalled();
        });

        it('should update username during account linking if provided and different', async () => {
            const userId = new Types.ObjectId();
            const mockOAuthUser = {
                _id: userId,
                email: 'oauth@example.com',
                username: 'oldusername',
                passwordHash: undefined,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (User.findOne as any)
                .mockResolvedValueOnce(mockOAuthUser) // First call: find existing user
                .mockResolvedValueOnce(null); // Second call: check if new username is taken

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'Password123!');
            formData.append('username', 'newusername');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(mockOAuthUser.username).toBe('newusername');
        });

        it('should not update username if already taken', async () => {
            const userId = new Types.ObjectId();
            const mockOAuthUser = {
                _id: userId,
                email: 'oauth@example.com',
                username: 'oldusername',
                passwordHash: undefined,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (User.findOne as any)
                .mockResolvedValueOnce(mockOAuthUser) // First call: find existing user
                .mockResolvedValueOnce({ username: 'takenusername' }); // Second call: username is taken

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'Password123!');
            formData.append('username', 'takenusername');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(mockOAuthUser.username).toBe('oldusername'); // Unchanged
        });

        it('should not update username if same as current', async () => {
            const userId = new Types.ObjectId();
            const mockOAuthUser = {
                _id: userId,
                email: 'oauth@example.com',
                username: 'sameusername',
                passwordHash: undefined,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (User.findOne as any).mockResolvedValue(mockOAuthUser);

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'Password123!');
            formData.append('username', 'sameusername');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(mockOAuthUser.username).toBe('sameusername');
        });

        it('should validate password strength during account linking', async () => {
            const mockOAuthUser = {
                email: 'oauth@example.com',
                username: 'oauthuser',
                passwordHash: undefined
            };
            (User.findOne as any).mockResolvedValue(mockOAuthUser);
            mockValidatePassword.mockReturnValue({
                isValid: false,
                errors: ['Password too weak']
            });

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'weak');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toContain('Password too weak');
        });

        it('should handle case-insensitive email matching for linking', async () => {
            const userId = new Types.ObjectId();
            const mockOAuthUser = {
                _id: userId,
                email: 'oauth@example.com',
                username: 'oauthuser',
                passwordHash: undefined,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (User.findOne as any).mockResolvedValue(mockOAuthUser);

            const formData = new FormData();
            formData.append('email', 'OAUTH@EXAMPLE.COM'); // Uppercase
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.SUCCESS);
            expect(result.isAccountLinked).toBe(true);
            expect((User.findOne as any).mock.calls[0][0].email).toBe('oauth@example.com');
        });
    });

    describe('createCredentialsUser - Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            (User.findOne as any).mockRejectedValue(new Error('Database connection error'));

            const formData = new FormData();
            formData.append('email', 'test@example.com');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Internal server error. Please try again.');
        });

        it('should handle user creation errors', async () => {
            (User.findOne as any).mockResolvedValue(null);
            (User.create as any).mockRejectedValue(new Error('Unique constraint violation'));

            const formData = new FormData();
            formData.append('email', 'test@example.com');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Internal server error. Please try again.');
        });

        it('should handle password hashing errors', async () => {
            (User.findOne as any).mockResolvedValue(null);
            mockHashPassword.mockRejectedValue(new Error('Hashing error') as never);

            const formData = new FormData();
            formData.append('email', 'test@example.com');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Internal server error. Please try again.');
        });

        it('should handle account linking save errors', async () => {
            const mockOAuthUser = {
                _id: new Types.ObjectId(),
                email: 'oauth@example.com',
                username: 'oauthuser',
                passwordHash: undefined,
                save: jest.fn().mockRejectedValue(new Error('Save error') as never)
            };
            (User.findOne as any).mockResolvedValue(mockOAuthUser);

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result.status).toBe(ActionStatus.ERROR);
            expect(result.message).toBe('Internal server error. Please try again.');
        });
    });

    describe('createCredentialsUser - ActionState Response Structure', () => {
        it('should return correct ActionState for account linking', async () => {
            const userId = new Types.ObjectId();
            const mockOAuthUser = {
                _id: userId,
                email: 'oauth@example.com',
                username: 'oauthuser',
                passwordHash: undefined,
                save: jest.fn().mockResolvedValue(undefined as never)
            };
            (User.findOne as any).mockResolvedValue(mockOAuthUser);

            const formData = new FormData();
            formData.append('email', 'oauth@example.com');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result).toHaveProperty('status', ActionStatus.SUCCESS);
            expect(result).toHaveProperty('userId');
            expect(result).toHaveProperty('isAccountLinked', true);
            expect(result).toHaveProperty('canSignInWith', ['google', 'credentials']);
            expect(result).toHaveProperty('shouldAutoLogin', true);
            expect(result.message).toContain('Password successfully added');
        });

        it('should return correct ActionState for validation errors', async () => {
            const formData = new FormData();
            formData.append('email', 'invalid');
            formData.append('password', 'Password123!');

            const result = await createCredentialsUser({}, formData);

            expect(result).toHaveProperty('status', ActionStatus.ERROR);
            expect(result).toHaveProperty('message');
            expect(result).not.toHaveProperty('userId');
            expect(result).not.toHaveProperty('shouldAutoLogin');
        });

        it('should not include sensitive data in error responses', async () => {
            mockValidatePassword.mockReturnValue({
                isValid: false,
                errors: ['Password too weak']
            });

            const formData = new FormData();
            formData.append('email', 'test@example.com');
            formData.append('password', 'weakpassword');

            const result = await createCredentialsUser({}, formData);

            expect(result.password).toBeUndefined();
            expect(result.userId).toBeUndefined();
        });
    });
});
