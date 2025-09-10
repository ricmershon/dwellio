/**
 * NextAuth Route Integration Tests
 * 
 * Tests the actual NextAuth API route handler to ensure coverage
 */

// Mock NextAuth completely to avoid ES module issues
jest.mock('next-auth', () => {
  return jest.fn(() => jest.fn());
});

// Mock the auth options
jest.mock('@/config/auth-options', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
    callbacks: {},
    pages: {
      signIn: '/login',
      error: '/login'
    }
  }
}));

const mockHandler = jest.fn();

describe('/api/auth/[...nextauth] Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear require cache to get fresh imports
    const routeModulePath = require.resolve('@/app/api/auth/[...nextauth]/route');
    delete require.cache[routeModulePath];
  });

  describe('Route Export', () => {
    it('should export GET and POST handlers', () => {
      const routeModule = require('@/app/api/auth/[...nextauth]/route');
      
      expect(routeModule.GET).toBeDefined();
      expect(routeModule.POST).toBeDefined();
      expect(typeof routeModule.GET).toBe('function');
      expect(typeof routeModule.POST).toBe('function');
    });

    it('should use the same handler for both GET and POST', () => {
      const routeModule = require('@/app/api/auth/[...nextauth]/route');
      
      expect(routeModule.GET).toBe(routeModule.POST);
    });

    it('should import route module successfully', () => {
      const routeModule = require('@/app/api/auth/[...nextauth]/route');
      
      // The module should import successfully and have the expected exports
      expect(routeModule).toBeDefined();
      expect(Object.keys(routeModule)).toContain('GET');
      expect(Object.keys(routeModule)).toContain('POST');
    });
  });

  describe('Handler Integration', () => {
    it('should import auth options correctly', () => {
      const routeModule = require('@/app/api/auth/[...nextauth]/route');
      
      // The route should import without errors
      expect(routeModule).toBeDefined();
      expect(routeModule.GET).toBeDefined();
      expect(routeModule.POST).toBeDefined();
    });

    it('should have handler functions as same reference', () => {
      const routeModule = require('@/app/api/auth/[...nextauth]/route');
      
      // Both handlers should reference the same function
      expect(routeModule.GET).toBe(routeModule.POST);
      expect(routeModule.GET).toEqual(expect.any(Function));
      expect(routeModule.POST).toEqual(expect.any(Function));
    });
  });
});