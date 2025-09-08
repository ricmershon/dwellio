import { User } from '@/models';

// Mock NextAuth handlers
export const mockNextAuthHandlers = () => {
  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();
  const mockGetSession = jest.fn();
  
  // Mock successful signin
  mockSignIn.mockImplementation(async (provider: string, credentials?: any) => {
    if (provider === 'credentials') {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required.');
      }
      
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        throw new Error(`No account found for ${credentials.email}.`);
      }
      
      return { user, error: null };
    }
    
    if (provider === 'google') {
      return { user: { id: 'google-user-id' }, error: null };
    }
    
    return { error: 'Invalid provider' };
  });
  
  return {
    mockSignIn,
    mockSignOut,
    mockGetSession,
  };
};

// Mock Google OAuth profile
export const mockGoogleProfile = {
  email: 'google@example.com',
  name: 'Google User',
  picture: 'https://example.com/google-avatar.jpg',
  email_verified: true,
  sub: 'google-user-123',
};

// Mock credentials payload
export const mockCredentialsPayload = {
  email: 'test@example.com',
  password: 'testPassword123',
  action: 'signin',
};

// Mock invalid credentials
export const mockInvalidCredentials = {
  email: 'nonexistent@example.com',
  password: 'wrongPassword',
  action: 'signin',
};

// Mock missing credentials
export const mockMissingCredentials = [
  { email: '', password: 'password' },
  { email: 'test@example.com', password: '' },
  { password: 'password' }, // missing email
  { email: 'test@example.com' }, // missing password
];

// Mock NextAuth session response
export const mockSessionResponse = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
  },
  expires: '2024-12-31T23:59:59.999Z',
};

// Mock JWT token
export const mockJWTToken = {
  sub: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
};

// Mock authentication callbacks
export const mockAuthCallbacks = {
  signIn: jest.fn().mockResolvedValue(true),
  session: jest.fn().mockImplementation(({ session, token }) => {
    if (token.sub) {
      session.user.id = token.sub;
    }
    return session;
  }),
  jwt: jest.fn().mockImplementation(({ token, user }) => {
    if (user) {
      token.sub = user.id;
    }
    return token;
  }),
};

// Mock authentication providers configuration
export const mockAuthConfig = {
  providers: [
    {
      id: 'google',
      name: 'Google',
      type: 'oauth',
      clientId: 'test-google-client-id',
      clientSecret: 'test-google-client-secret',
    },
    {
      id: 'credentials',
      name: 'Email and Password',
      type: 'credentials',
      authorize: jest.fn(),
    },
  ],
  session: { strategy: 'jwt' },
  callbacks: mockAuthCallbacks,
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

// Mock password verification
export const mockPasswordVerification = {
  valid: jest.fn().mockResolvedValue(true),
  invalid: jest.fn().mockResolvedValue(false),
};

// Mock database operations for auth
export const mockAuthDatabaseOps = {
  findUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
};

// Setup auth mocks
export const setupAuthMocks = () => {
  // Mock NextAuth
  jest.mock('next-auth', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      GET: jest.fn(),
      POST: jest.fn(),
    })),
  }));
  
  // Mock NextAuth providers
  jest.mock('next-auth/providers/google', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue(mockAuthConfig.providers[0]),
  }));
  
  jest.mock('next-auth/providers/credentials', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue(mockAuthConfig.providers[1]),
  }));
  
  // Mock password utils
  jest.mock('@/utils/password-utils', () => ({
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
  }));
  
  // Mock database connection
  jest.mock('@/lib/db-connect', () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue(true),
  }));
};

// Cleanup auth mocks
export const cleanupAuthMocks = () => {
  jest.resetAllMocks();
  jest.clearAllMocks();
};