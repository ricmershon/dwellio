/**
 * Auth Options Authorize Function Tests
 * 
 * Tests the actual authorize function in auth-options to improve coverage
 */

// Mock dependencies before importing auth-options
jest.mock('@/lib/db-connect');
jest.mock('@/utils/password-utils');
jest.mock('@/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Property: jest.fn(),
  Message: jest.fn(),
  StaticInputs: jest.fn(),
}));

import { authOptions } from '@/config/auth-options';

import dbConnect from '@/lib/db-connect';
import { verifyPassword } from '@/utils/password-utils';
import { User } from '@/models';

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockUser = User as jest.Mocked<typeof User>;

describe('Auth Options - Authorize Function Coverage', () => {
  let authorizeFunction: any;

  beforeAll(() => {
    // Extract the authorize function from credentials provider
    const credentialsProvider = authOptions.providers.find(
      (p: any) => p.id === 'credentials' || p.type === 'credentials'
    ) as any;
    
    // Try to get the authorize function from the options property
    authorizeFunction = credentialsProvider?.options?.authorize || credentialsProvider?.authorize;
    
    if (!authorizeFunction) {
      throw new Error('Could not find authorize function in credentials provider');
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(true as any);
  });

  describe('Credentials Validation', () => {
    it('should throw error when email is missing', async () => {
      const credentials = { password: 'password123' };

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'Email and password are required.'
      );

      expect(mockDbConnect).not.toHaveBeenCalled();
    });

    it('should throw error when password is missing', async () => {
      const credentials = { email: 'test@example.com' };

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'Email and password are required.'
      );

      expect(mockDbConnect).not.toHaveBeenCalled();
    });

    it('should throw error when both email and password are missing', async () => {
      const credentials = {};

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'Email and password are required.'
      );

      expect(mockDbConnect).not.toHaveBeenCalled();
    });

    it('should throw error when credentials is null', async () => {
      await expect(authorizeFunction(null)).rejects.toThrow(
        'Email and password are required.'
      );

      expect(mockDbConnect).not.toHaveBeenCalled();
    });
  });

  describe('User Lookup', () => {
    it('should throw error when user does not exist', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      mockUser.findOne.mockResolvedValueOnce(null);

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'No account found for nonexistent@example.com.'
      );

      expect(mockDbConnect).toHaveBeenCalledTimes(1);
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: credentials.email });
    });

    it('should connect to database before user lookup', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockUser.findOne.mockResolvedValueOnce(null);

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'No account found for test@example.com.'
      );

      expect(mockDbConnect).toHaveBeenCalledTimes(1);
      expect(mockUser.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('OAuth User Detection', () => {
    it('should throw error for OAuth-only user (no password hash)', async () => {
      const credentials = {
        email: 'oauth@example.com',
        password: 'password123'
      };

      const oauthUser = {
        _id: 'user-123',
        email: 'oauth@example.com',
        username: 'OAuth User',
        passwordHash: null // OAuth-only user
      };

      mockUser.findOne.mockResolvedValueOnce(oauthUser);

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'oauth@example.com is linked to a Google account. Please sign in with Google or register the account with a password.'
      );

      expect(mockDbConnect).toHaveBeenCalledTimes(1);
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(mockVerifyPassword).not.toHaveBeenCalled();
    });

    it('should throw error for OAuth-only user (undefined password hash)', async () => {
      const credentials = {
        email: 'oauth2@example.com',
        password: 'password123'
      };

      const oauthUser = {
        _id: 'user-456',
        email: 'oauth2@example.com',
        username: 'OAuth User 2',
        passwordHash: undefined // Also OAuth-only
      };

      mockUser.findOne.mockResolvedValueOnce(oauthUser);

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'oauth2@example.com is linked to a Google account. Please sign in with Google or register the account with a password.'
      );
    });
  });

  describe('Password Verification', () => {
    it('should throw error for invalid password', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      const user = {
        _id: 'user-789',
        email: 'user@example.com',
        username: 'Regular User',
        passwordHash: 'hashed-password'
      };

      mockUser.findOne.mockResolvedValueOnce(user);
      mockVerifyPassword.mockResolvedValueOnce(false);

      await expect(authorizeFunction(credentials)).rejects.toThrow('Invalid password.');

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        credentials.password,
        user.passwordHash
      );
    });

    it('should verify password with correct arguments', async () => {
      const credentials = {
        email: 'user@example.com',
        password: 'correctpassword'
      };

      const user = {
        _id: 'user-789',
        email: 'user@example.com',
        username: 'Regular User',
        passwordHash: 'hashed-password'
      };

      mockUser.findOne.mockResolvedValueOnce(user);
      mockVerifyPassword.mockResolvedValueOnce(true);

      const result = await authorizeFunction(credentials);

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        'correctpassword',
        'hashed-password'
      );
      expect(result).toBeDefined();
    });
  });

  describe('Successful Authorization', () => {
    it('should return user object on successful authentication', async () => {
      const credentials = {
        email: 'valid@example.com',
        password: 'correctpassword'
      };

      const user = {
        _id: 'user-success',
        email: 'valid@example.com',
        username: 'Valid User',
        passwordHash: 'hashed-password',
        image: 'avatar.jpg'
      };

      mockUser.findOne.mockResolvedValueOnce(user);
      mockVerifyPassword.mockResolvedValueOnce(true);

      const result = await authorizeFunction(credentials);

      expect(result).toEqual({
        id: 'user-success',
        email: 'valid@example.com',
        name: 'Valid User',
        image: 'avatar.jpg'
      });

      expect(mockDbConnect).toHaveBeenCalledTimes(1);
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(mockVerifyPassword).toHaveBeenCalledWith(
        credentials.password,
        user.passwordHash
      );
    });

    it('should handle user without image', async () => {
      const credentials = {
        email: 'noimage@example.com',
        password: 'password123'
      };

      const user = {
        _id: 'user-noimage',
        email: 'noimage@example.com',
        username: 'User No Image',
        passwordHash: 'hashed-password',
        image: null
      };

      mockUser.findOne.mockResolvedValueOnce(user);
      mockVerifyPassword.mockResolvedValueOnce(true);

      const result = await authorizeFunction(credentials);

      expect(result).toEqual({
        id: 'user-noimage',
        email: 'noimage@example.com',
        name: 'User No Image',
        image: null
      });
    });

    it('should convert ObjectId to string', async () => {
      const credentials = {
        email: 'objectid@example.com',
        password: 'password123'
      };

      const mockObjectId = {
        toString: jest.fn().mockReturnValue('converted-id-string')
      };

      const user = {
        _id: mockObjectId,
        email: 'objectid@example.com',
        username: 'ObjectId User',
        passwordHash: 'hashed-password',
        image: null
      };

      mockUser.findOne.mockResolvedValueOnce(user);
      mockVerifyPassword.mockResolvedValueOnce(true);

      const result = await authorizeFunction(credentials);

      expect(mockObjectId.toString).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('converted-id-string');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockDbConnect.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'Database connection failed'
      );

      expect(mockUser.findOne).not.toHaveBeenCalled();
    });

    it('should handle user lookup errors', async () => {
      const credentials = {
        email: 'error@example.com',
        password: 'password123'
      };

      mockUser.findOne.mockRejectedValueOnce(new Error('Database query failed'));

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'Database query failed'
      );

      expect(mockDbConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle password verification errors', async () => {
      const credentials = {
        email: 'error@example.com',
        password: 'password123'
      };

      const user = {
        _id: 'user-error',
        email: 'error@example.com',
        username: 'Error User',
        passwordHash: 'hashed-password'
      };

      mockUser.findOne.mockResolvedValueOnce(user);
      mockVerifyPassword.mockRejectedValueOnce(new Error('Password verification failed'));

      await expect(authorizeFunction(credentials)).rejects.toThrow(
        'Password verification failed'
      );
    });
  });
});