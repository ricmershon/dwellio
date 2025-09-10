/**
 * Health DB Route Integration Tests
 * 
 * Tests the actual API route handler to ensure coverage
 */

// Set up Response polyfill for Node.js environment
Object.defineProperty(global, 'Response', {
  value: class Response {
    status: number;
    _headers: Map<string, string>;
    body: string;

    constructor(body: string | null, init?: { status?: number; headers?: Record<string, string> }) {
      this.status = init?.status || 200;
      this._headers = new Map();
      this.body = body || '';
      
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this._headers.set(key, value);
        });
      }
    }

    get headers() {
      return {
        get: (key: string) => this._headers.get(key)
      };
    }

    async text() {
      return this.body;
    }

    async json() {
      return JSON.parse(this.body);
    }
  }
});

import { GET } from '@/app/api/health/db/route';

// Mock the database connection
jest.mock('@/lib/db-connect');

// Import the mocked function
import dbConnect from '@/lib/db-connect';

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;

describe('/api/health/db Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health/db', () => {
    it('should return success response when database connects', async () => {
      mockDbConnect.mockResolvedValueOnce(true as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(data).toEqual({ ok: true });
      expect(mockDbConnect).toHaveBeenCalledTimes(1);
    });

    it('should return error response when database connection fails', async () => {
      const errorMessage = 'Database connection failed';
      mockDbConnect.mockRejectedValueOnce(new Error(errorMessage));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(data).toEqual({
        ok: false,
        error: errorMessage
      });
      expect(mockDbConnect).toHaveBeenCalledTimes(1);
    });

    it('should handle errors without message property', async () => {
      const errorWithoutMessage = { name: 'CustomError', code: 500 };
      mockDbConnect.mockRejectedValueOnce(errorWithoutMessage);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error).toBeUndefined();
    });

    it('should handle synchronous errors', async () => {
      mockDbConnect.mockImplementationOnce(() => {
        throw new Error('Synchronous database error');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Synchronous database error');
    });

    it('should return proper JSON headers in all responses', async () => {
      mockDbConnect.mockResolvedValueOnce(true as any);

      const successResponse = await GET();
      expect(successResponse.headers.get('content-type')).toBe('application/json');

      mockDbConnect.mockRejectedValueOnce(new Error('Test error'));
      
      const errorResponse = await GET();
      expect(errorResponse.headers.get('content-type')).toBe('application/json');
    });
  });

  describe('Route Configuration', () => {
    it('should have correct runtime and dynamic exports', () => {
      // These are tested by importing the module
      const routeModule = require('@/app/api/health/db/route');
      
      expect(routeModule.runtime).toBe('nodejs');
      expect(routeModule.dynamic).toBe('force-dynamic');
    });
  });
});