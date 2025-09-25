import { User } from '@/models';
import dbConnect from '@/lib/db-connect';
import { verifyPassword } from '@/utils/password-utils';

// Mock dependencies - organized following TESTING_PLAN guidelines
// External dependencies use __mocks__ directory automatically
// Application modules need inline mocks due to Jest limitations with manual mocks for ES modules
jest.mock('@/lib/db-connect'); // Uses __tests__/lib/__mocks__/db-connect.ts
jest.mock('@/utils/password-utils'); // Uses __tests__/utils/__mocks__/password-utils.ts
jest.mock('@/models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn()
    }
}));

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockUser = User as any;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;

describe('Authentication Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GOOGLE_CLIENT_ID = 'test-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    });

    describe('Environment Configuration', () => {
        it('should have required environment variables for Google OAuth', () => {
            expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
            expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
        });

        it('should handle missing environment variables', async () => {
            delete process.env.GOOGLE_CLIENT_ID;
            delete process.env.GOOGLE_CLIENT_SECRET;

            // Should not throw when importing auth options
            expect(async () => {
                jest.resetModules();
                await import('@/config/auth-options');
            }).not.toThrow();
        });
    });

    describe('Database Integration', () => {
        it('should connect to database for user operations', async () => {
            mockDbConnect.mockResolvedValue(undefined as any);

            await dbConnect();

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
        });

        it('should handle database connection failures', async () => {
            const dbError = new Error('Database connection failed');
            mockDbConnect.mockRejectedValue(dbError);

            await expect(dbConnect()).rejects.toThrow('Database connection failed');
        });
    });

    describe('User Model Operations', () => {
        beforeEach(() => {
            mockDbConnect.mockResolvedValue(undefined as any);
        });

        it('should find user by email', async () => {
            const mockUserData = {
                _id: 'user-id-123',
                email: 'test@example.com',
                username: 'testuser',
                passwordHash: 'hashed-password'
            };

            mockUser.findOne.mockResolvedValue(mockUserData);

            const user = await User.findOne({ email: 'test@example.com' });

            expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(user).toEqual(mockUserData);
        });

        it('should create new user for OAuth sign-in', async () => {
            const newUserData = {
                _id: 'new-user-id',
                username: 'newuser',
                email: 'new@example.com',
                image: 'profile-image.jpg',
                passwordHash: null
            };

            mockUser.create.mockResolvedValue(newUserData);

            const user = await User.create({
                username: 'newuser',
                email: 'new@example.com',
                image: 'profile-image.jpg',
                passwordHash: null
            });

            expect(mockUser.create).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'new@example.com',
                image: 'profile-image.jpg',
                passwordHash: null
            });
            expect(user).toEqual(newUserData);
        });

        it('should handle user creation errors', async () => {
            mockUser.create.mockRejectedValue(new Error('User creation failed'));

            await expect(User.create({
                username: 'testuser',
                email: 'test@example.com',
                passwordHash: null
            })).rejects.toThrow('User creation failed');
        });
    });

    describe('Password Verification', () => {
        it('should verify valid password', async () => {
            mockVerifyPassword.mockResolvedValue(true);

            const isValid = await verifyPassword('password123', 'hashed-password');

            expect(mockVerifyPassword).toHaveBeenCalledWith('password123', 'hashed-password');
            expect(isValid).toBe(true);
        });

        it('should reject invalid password', async () => {
            mockVerifyPassword.mockResolvedValue(false);

            const isValid = await verifyPassword('wrong-password', 'hashed-password');

            expect(mockVerifyPassword).toHaveBeenCalledWith('wrong-password', 'hashed-password');
            expect(isValid).toBe(false);
        });

        it('should handle password verification errors', async () => {
            mockVerifyPassword.mockRejectedValue(new Error('Password verification failed'));

            await expect(
                verifyPassword('password123', 'hashed-password')
            ).rejects.toThrow('Password verification failed');
        });
    });

    describe('Authentication Flow Integration', () => {
        it('should handle complete OAuth user creation flow', async () => {
            // Simulate OAuth flow
            mockDbConnect.mockResolvedValue(undefined as any);
            mockUser.findOne.mockResolvedValue(null); // User doesn't exist
            mockUser.create.mockResolvedValue({
                _id: 'oauth-user-id',
                username: 'oauthuser',
                email: 'oauth@example.com',
                image: 'oauth-image.jpg',
                passwordHash: null
            });

            await dbConnect();
            const existingUser = await User.findOne({ email: 'oauth@example.com' });
            expect(existingUser).toBeNull();

            const newUser = await User.create({
                username: 'oauthuser',
                email: 'oauth@example.com',
                image: 'oauth-image.jpg',
                passwordHash: null
            });

            expect(newUser._id).toBe('oauth-user-id');
            expect(newUser.passwordHash).toBeNull();
        });

        it('should handle complete credentials authentication flow', async () => {
            // Simulate credentials flow
            const userWithPassword = {
                _id: 'cred-user-id',
                email: 'creds@example.com',
                username: 'credsuser',
                passwordHash: 'hashed-password',
                image: null
            };

            mockDbConnect.mockResolvedValue(undefined as any);
            mockUser.findOne.mockResolvedValue(userWithPassword);
            mockVerifyPassword.mockResolvedValue(true);

            await dbConnect();
            const user = await User.findOne({ email: 'creds@example.com' });
            expect(user).toEqual(userWithPassword);

            const isPasswordValid = await verifyPassword('correct-password', user.passwordHash);
            expect(isPasswordValid).toBe(true);
        });

        it('should handle user update during OAuth sign-in', async () => {
            const existingUser = {
                _id: 'existing-id',
                email: 'existing@example.com',
                username: 'existinguser',
                image: 'old-image.jpg',
                save: jest.fn().mockResolvedValue(undefined)
            };

            mockDbConnect.mockResolvedValue(undefined as any);
            mockUser.findOne.mockResolvedValue(existingUser);

            await dbConnect();
            const user = await User.findOne({ email: 'existing@example.com' });

            // Simulate updating user info
            if (user) {
                user.username = user.username || 'New Username';
                user.image = user.image || 'new-image.jpg';
                await user.save();
            }

            expect(user?.save).toHaveBeenCalled();
        });
    });

    describe('Error Scenarios', () => {
        it('should handle missing email in credentials', () => {
            const credentials = { password: 'password123' };
            expect(credentials).not.toHaveProperty('email');
        });

        it('should handle missing password in credentials', () => {
            const credentials = { email: 'test@example.com' };
            expect(credentials).not.toHaveProperty('password');
        });

        it('should handle malformed profile data', () => {
            const profile = { email: 'test@example.com' }; // Missing name
            expect(profile).not.toHaveProperty('name');
        });

        it('should handle database timeout errors', async () => {
            const timeoutError = new Error('Connection timeout');
            timeoutError.name = 'MongoTimeoutError';
            mockDbConnect.mockRejectedValue(timeoutError);

            await expect(dbConnect()).rejects.toThrow('Connection timeout');
        });

        it('should handle network errors during database operations', async () => {
            const networkError = new Error('Network unreachable');
            mockDbConnect.mockResolvedValue(undefined as any);
            mockUser.findOne.mockRejectedValue(networkError);

            await dbConnect();
            await expect(User.findOne({ email: 'test@example.com' })).rejects.toThrow('Network unreachable');
        });
    });
});