import { NextRequest } from 'next/server';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '@/models';
import { hashPassword } from '@/utils/password-utils';

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  Object.assign(process.env, {
    NODE_ENV: 'test',
    NEXTAUTH_SECRET: 'test-secret-key',
    NEXTAUTH_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  });
};

// In-memory MongoDB setup for testing
let mongoServer: MongoMemoryServer;

export const setupTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  
  // Set the test database URI
  process.env.MONGODB_URI = mongoUri;
};

export const teardownTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

// Test data factories
export const createTestUser = async (overrides: Partial<{
  email: string;
  username: string;
  password: string;
  image: string;
  isOAuthOnly: boolean;
}> = {}) => {
  const defaultData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'testPassword123',
    image: null,
    isOAuthOnly: false,
    ...overrides
  };

  const userData: {
    email: string;
    username: string;
    image: string | null;
    passwordHash?: string | null;
  } = {
    email: defaultData.email,
    username: defaultData.username,
    image: defaultData.image,
  };

  if (!defaultData.isOAuthOnly && defaultData.password) {
    userData.passwordHash = await hashPassword(defaultData.password);
  } else {
    userData.passwordHash = null;
  }

  return await User.create(userData);
};

export const createOAuthUser = async (overrides: Partial<{
  email: string;
  username: string;
  image: string;
}> = {}) => {
  return createTestUser({ ...overrides, isOAuthOnly: true });
};

// Mock NextAuth session
export const mockNextAuthSession = (user: {
  id: string;
  email: string;
  name: string;
  image?: string;
}) => ({
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image || null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
});

// Mock database connection error
export const mockDatabaseError = () => {
  const originalConnect = mongoose.connect;
  jest.spyOn(mongoose, 'connect').mockImplementation(() => {
    throw new Error('Database connection failed');
  });
  
  return () => {
    mongoose.connect = originalConnect;
  };
};

// Mock NextAuth providers
export const mockGoogleProvider = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  clientId: 'test-google-client-id',
  clientSecret: 'test-google-client-secret',
};

export const mockCredentialsProvider = {
  id: 'credentials',
  name: 'Email and Password',
  type: 'credentials',
};

// Test request builders
export const createAuthRequest = (method: 'GET' | 'POST', body?: any) => {
  const url = 'http://localhost:3000/api/auth/signin/credentials';
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const createHealthCheckRequest = () => {
  const url = 'http://localhost:3000/api/health/db';
  return new NextRequest(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });
};

// Response validation helpers
export const validateJsonResponse = async (response: Response) => {
  expect(response.headers.get('content-type')).toBe('application/json');
  const data = await response.json();
  return data;
};

export const validateHealthResponse = (data: { ok: boolean; error?: string }, expectedStatus: boolean) => {
  expect(data).toHaveProperty('ok', expectedStatus);
  if (!expectedStatus) {
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  }
};

// Clean up test data
export const cleanupTestData = async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
  }
};

// Test timeouts
export const TEST_TIMEOUT = 10000; // 10 seconds

// Test constants
export const TEST_USERS = {
  CREDENTIALS: {
    email: 'credentials@test.com',
    username: 'credentialsuser',
    password: 'testPassword123',
  },
  OAUTH_ONLY: {
    email: 'oauth@test.com',
    username: 'oauthuser',
    image: 'https://example.com/image.jpg',
  },
  EXISTING: {
    email: 'existing@test.com',
    username: 'existinguser',
    password: 'existingPassword123',
  },
};

// Mock environment for different scenarios
export const mockEnvironment = (env: 'development' | 'test' | 'production') => {
  const originalEnv = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: env });
  
  return () => {
    Object.assign(process.env, { NODE_ENV: originalEnv });
  };
};