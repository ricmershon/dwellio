import { ActionStatus } from "@/types";

// Mock all external dependencies first
jest.mock('@/lib/db-connect', () => jest.fn());
jest.mock('@/models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));
jest.mock('@/utils/password-utils', () => ({
    hashPassword: jest.fn(),
    validatePassword: jest.fn()
}));
jest.mock('@/utils/to-action-state', () => ({
    toActionState: jest.fn()
}));

// Import after mocks
import { createCredentialsUser } from '@/lib/actions/user-actions';
import { User } from '@/models';
import { hashPassword, validatePassword } from '@/utils/password-utils';
import { toActionState } from '@/utils/to-action-state';
import dbConnect from '@/lib/db-connect';

// Create typed mocks
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockUser = User as jest.Mocked<typeof User>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockValidatePassword = validatePassword as jest.MockedFunction<typeof validatePassword>;
const mockToActionState = toActionState as jest.MockedFunction<typeof toActionState>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('User Actions Tests', () => {
    let mockFormData: FormData;

    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined as any);
        mockToActionState.mockImplementation((state: any) => state);
        
        // Create fresh FormData for each test
        mockFormData = new FormData();
        mockFormData.set('email', 'test@example.com');
        mockFormData.set('password', 'ValidPassword123!');
        mockFormData.set('username', 'testuser');
    });

    afterAll(() => {
        mockConsoleLog.mockRestore();
        mockConsoleError.mockRestore();
    });

    describe('createCredentialsUser', () => {
        describe('Input Validation', () => {
            it('should reject request when email is missing', async () => {
                const formData = new FormData();
                formData.set('password', 'ValidPassword123!');

                const prevState = {};
                const result = await createCredentialsUser(prevState, formData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Email and password are required."
                });
            });

            it('should reject request when password is missing', async () => {
                const formData = new FormData();
                formData.set('email', 'test@example.com');

                const prevState = {};
                const result = await createCredentialsUser(prevState, formData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Email and password are required."
                });
            });

            it('should reject invalid email format', async () => {
                const formData = new FormData();
                formData.set('email', 'invalid-email');
                formData.set('password', 'ValidPassword123!');

                const prevState = {};
                const result = await createCredentialsUser(prevState, formData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Please enter a valid email address."
                });
            });

            it('should accept valid email formats', async () => {
                const validEmails = [
                    'test@example.com',
                    'user.name@domain.co.uk',
                    'test123@test-domain.org'
                ];

                for (const email of validEmails) {
                    mockUser.findOne.mockResolvedValue(null);
                    mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                    mockHashPassword.mockResolvedValue('hashed-password');
                    mockUser.create.mockResolvedValue({ _id: 'new-user-id' } as any);

                    const formData = new FormData();
                    formData.set('email', email);
                    formData.set('password', 'ValidPassword123!');

                    const prevState = {};
                    await createCredentialsUser(prevState, formData);

                    expect(mockUser.findOne).toHaveBeenCalledWith({ email: email.toLowerCase() });
                }
            });
        });

        describe('Account Linking Scenario', () => {
            it('should link password to existing Google OAuth account', async () => {
                const existingUser = {
                    _id: 'existing-user-id',
                    email: 'test@example.com',
                    username: 'existing-username',
                    passwordHash: null, // OAuth account without password
                    save: jest.fn().mockResolvedValue(true)
                };

                mockUser.findOne.mockResolvedValue(existingUser as any);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleLog).toHaveBeenCalledWith('>>> Linking password to existing OAuth account: test@example.com.');
                expect(mockValidatePassword).toHaveBeenCalledWith('ValidPassword123!');
                expect(mockHashPassword).toHaveBeenCalledWith('ValidPassword123!');
                expect(existingUser.passwordHash).toBe('hashed-password');
                expect(existingUser.save).toHaveBeenCalledTimes(1);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.SUCCESS,
                    userId: 'existing-user-id',
                    message: "Password successfully added to your existin Google account. You can now sign in with either method.",
                    isAccountLinked: true,
                    canSignInWith: ["google", "credentials"],
                    email: "test@example.com",
                    password: "ValidPassword123!",
                    shouldAutoLogin: true
                });
            });

            it('should update username during account linking if different', async () => {
                const existingUser = {
                    _id: 'existing-user-id',
                    email: 'test@example.com',
                    username: 'old-username',
                    passwordHash: null,
                    save: jest.fn().mockResolvedValue(true)
                };

                // Mock for finding existing user, then for checking username availability
                mockUser.findOne
                    .mockResolvedValueOnce(existingUser as any)
                    .mockResolvedValueOnce(null); // Username is available

                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');

                const formData = new FormData();
                formData.set('email', 'test@example.com');
                formData.set('password', 'ValidPassword123!');
                formData.set('username', 'new-username');

                const prevState = {};
                await createCredentialsUser(prevState, formData);

                expect(mockUser.findOne).toHaveBeenCalledWith({
                    username: 'new-username',
                    _id: { $ne: 'existing-user-id' }
                });
                expect(existingUser.username).toBe('new-username');
            });

            it('should not update username if it is taken by another user', async () => {
                const existingUser = {
                    _id: 'existing-user-id',
                    email: 'test@example.com',
                    username: 'old-username',
                    passwordHash: null,
                    save: jest.fn().mockResolvedValue(true)
                };

                const userWithTakenUsername = {
                    _id: 'other-user-id',
                    username: 'new-username'
                };

                // Mock for finding existing user, then for checking username availability
                mockUser.findOne
                    .mockResolvedValueOnce(existingUser as any)
                    .mockResolvedValueOnce(userWithTakenUsername as any); // Username is taken

                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');

                const formData = new FormData();
                formData.set('email', 'test@example.com');
                formData.set('password', 'ValidPassword123!');
                formData.set('username', 'new-username');

                const prevState = {};
                await createCredentialsUser(prevState, formData);

                expect(existingUser.username).toBe('old-username'); // Should remain unchanged
            });

            it('should handle invalid password during account linking', async () => {
                const existingUser = {
                    _id: 'existing-user-id',
                    email: 'test@example.com',
                    passwordHash: null
                };

                mockUser.findOne.mockResolvedValue(existingUser as any);
                mockValidatePassword.mockReturnValue({ 
                    isValid: false, 
                    errors: ['Password too short', 'Must contain special characters'] 
                });

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Password too short Must contain special characters"
                });
            });
        });

        describe('Existing Credentials Account', () => {
            it('should reject when user already has credentials account', async () => {
                const existingUser = {
                    _id: 'existing-user-id',
                    email: 'test@example.com',
                    passwordHash: 'existing-hash' // User already has password
                };

                mockUser.findOne.mockResolvedValue(existingUser as any);

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'An account with the email "test@example.com" already exists.'
                });
            });
        });

        describe('New User Creation', () => {
            it('should create new user with valid credentials', async () => {
                mockUser.findOne.mockResolvedValue(null); // No existing user
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');
                mockUser.create.mockResolvedValue({ _id: 'new-user-id' } as any);

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleLog).toHaveBeenCalledWith('>>> Creating new credentials account: test@example.com');
                expect(mockUser.create).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    username: 'testuser',
                    passwordHash: 'hashed-password',
                    image: null
                });

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.SUCCESS,
                    message: "Account created successfully.",
                    userId: 'new-user-id',
                    isAccountLinked: false,
                    canSignInWith: ["credentials"],
                    email: "test@example.com",
                    password: "ValidPassword123!",
                    shouldAutoLogin: true
                });
            });

            it('should use email prefix as username when username not provided', async () => {
                const formData = new FormData();
                formData.set('email', 'john.doe@example.com');
                formData.set('password', 'ValidPassword123!');
                // No username provided

                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');
                mockUser.create.mockResolvedValue({ _id: 'new-user-id' } as any);

                const prevState = {};
                await createCredentialsUser(prevState, formData);

                expect(mockUser.create).toHaveBeenCalledWith({
                    email: 'john.doe@example.com',
                    username: 'john.doe', // Extracted from email
                    passwordHash: 'hashed-password',
                    image: null
                });
            });

            it('should reject when password validation fails for new user', async () => {
                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ 
                    isValid: false, 
                    errors: ['Password must be at least 8 characters'] 
                });

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Password must be at least 8 characters"
                });
            });

            it('should reject when username is already taken', async () => {
                const existingUserWithUsername = {
                    _id: 'other-user-id',
                    username: 'testuser'
                };

                // First call returns null (no user with email), second returns user with username
                mockUser.findOne
                    .mockResolvedValueOnce(null)
                    .mockResolvedValueOnce(existingUserWithUsername as any);

                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: 'Username "testuser" already taken.'
                });
            });
        });

        describe('Database and Server Errors', () => {
            it('should handle database connection errors', async () => {
                mockDbConnect.mockRejectedValue(new Error('Database connection failed'));

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleError).toHaveBeenCalledWith('>>> User registration error: Error: Database connection failed');
                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it('should handle user lookup errors', async () => {
                mockUser.findOne.mockRejectedValue(new Error('Database query failed'));

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleError).toHaveBeenCalledWith('>>> User registration error: Error: Database query failed');
                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it('should handle password hashing errors', async () => {
                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockRejectedValue(new Error('Hashing failed'));

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleError).toHaveBeenCalledWith('>>> User registration error: Error: Hashing failed');
                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it('should handle user creation errors', async () => {
                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');
                mockUser.create.mockRejectedValue(new Error('User creation failed'));

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleError).toHaveBeenCalledWith('>>> User registration error: Error: User creation failed');
                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });

            it('should handle account linking save errors', async () => {
                const existingUser = {
                    _id: 'existing-user-id',
                    email: 'test@example.com',
                    username: 'existing-username',
                    passwordHash: null,
                    save: jest.fn().mockRejectedValue(new Error('Save failed'))
                };

                mockUser.findOne.mockResolvedValue(existingUser as any);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');

                const prevState = {};
                const result = await createCredentialsUser(prevState, mockFormData);

                expect(mockConsoleError).toHaveBeenCalledWith('>>> User registration error: Error: Save failed');
                expect(mockToActionState).toHaveBeenCalledWith({
                    status: ActionStatus.ERROR,
                    message: "Internal server error. Please try again."
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty username gracefully', async () => {
                const formData = new FormData();
                formData.set('email', 'test@example.com');
                formData.set('password', 'ValidPassword123!');
                formData.set('username', '   '); // Whitespace only

                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');
                mockUser.create.mockResolvedValue({ _id: 'new-user-id' } as any);

                const prevState = {};
                await createCredentialsUser(prevState, formData);

                expect(mockUser.create).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    username: 'test', // Should use email prefix
                    passwordHash: 'hashed-password',
                    image: null
                });
            });

            it('should convert email to lowercase', async () => {
                const formData = new FormData();
                formData.set('email', 'Test@EXAMPLE.COM');
                formData.set('password', 'ValidPassword123!');
                formData.set('username', 'testuser');

                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');
                mockUser.create.mockResolvedValue({ _id: 'new-user-id' } as any);

                const prevState = {};
                await createCredentialsUser(prevState, formData);

                expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
                expect(mockUser.create).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    username: 'testuser',
                    passwordHash: 'hashed-password',
                    image: null
                });
            });

            it('should handle username with special characters', async () => {
                const formData = new FormData();
                formData.set('email', 'test@example.com');
                formData.set('password', 'ValidPassword123!');
                formData.set('username', '  user-name_123  '); // With spaces and special chars

                mockUser.findOne.mockResolvedValue(null);
                mockValidatePassword.mockReturnValue({ isValid: true, errors: [] });
                mockHashPassword.mockResolvedValue('hashed-password');
                mockUser.create.mockResolvedValue({ _id: 'new-user-id' } as any);

                const prevState = {};
                await createCredentialsUser(prevState, formData);

                expect(mockUser.create).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    username: 'user-name_123', // Trimmed
                    passwordHash: 'hashed-password',
                    image: null
                });
            });
        });
    });
});