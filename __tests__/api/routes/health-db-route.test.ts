/**
 * Health DB Route Integration Tests
 * 
 * Tests the actual API route handler to ensure coverage
 */

// Mock mongoose before any imports to prevent real database connections
jest.mock('mongoose', () => ({
    connection: {
        readyState: 1,
        listeners: jest.fn().mockReturnValue([]),
        on: jest.fn()
    },
    set: jest.fn(),
    connect: jest.fn().mockResolvedValue({
        connection: {
            readyState: 1
        },
        get: jest.fn((key: string) => {
            if (key === 'strictQuery') return true;
            if (key === 'bufferCommands') return false;
            return undefined;
        }),
        connect: jest.fn()
    }),
    disconnect: jest.fn()
}));

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
import dbConnect from '@/lib/db-connect';
import mongoose from 'mongoose';

describe('/api/health/db Route Handler', () => {
    // Mock environment variables for testing
    const originalEnv = process.env;
    const mockMongoose = mongoose as jest.Mocked<typeof mongoose>;
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset global mongoose state between tests
        if (global._mongoose) {
            global._mongoose.conn = null;
            global._mongoose.promise = null;
        }
        // Reset mongoose mocks
        mockMongoose.connect.mockResolvedValue({
            connection: { readyState: 1 },
            get: jest.fn((key: string) => {
                if (key === 'strictQuery') return true;
                if (key === 'bufferCommands') return false;
                return undefined;
            }),
            connect: jest.fn()
        } as any);
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('GET /api/health/db', () => {
        it('should return success response with valid MongoDB URI', async () => {
            // Ensure we have a test MongoDB URI
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toBe('application/json');
            expect(data).toEqual({ ok: true });
            expect(mockMongoose.connect).toHaveBeenCalled();
        });

        it('should handle database connection errors', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
            mockMongoose.connect.mockRejectedValue(new Error('Connection failed'));

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.ok).toBe(false);
            expect(data.error).toBe('Connection failed');
        });

        it('should return proper JSON headers in response', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            const response = await GET();
            expect(response.headers.get('content-type')).toBe('application/json');
        });

        it('should handle route configuration correctly', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            // Test that the route works with proper configuration
            const response = await GET();
            expect(response).toBeInstanceOf(Response);
            expect(typeof response.status).toBe('number');
        });
    });

    describe('db-connect.ts Integration', () => {
        beforeEach(() => {
            // Ensure clean state for db-connect tests
            if (global._mongoose) {
                global._mongoose.conn = null;
                global._mongoose.promise = null;
            }
        });

        it('should establish database connection successfully', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            const connection = await dbConnect();
            
            expect(connection).toBeDefined();
            expect(connection.connection).toBeDefined();
            expect(typeof connection.connect).toBe('function');
            expect(mockMongoose.set).toHaveBeenCalledWith('strictQuery', true);
            expect(mockMongoose.set).toHaveBeenCalledWith('bufferCommands', false);
        });

        it('should reuse existing connection from global cache', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            // First connection
            const connection1 = await dbConnect();
            expect(global._mongoose?.conn).toBeDefined();

            // Second connection should reuse the cached one
            const connection2 = await dbConnect();
            expect(connection2).toBe(connection1);
            expect(global._mongoose?.conn).toBe(connection1);
        });

        it('should initialize global mongoose state correctly', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            // Clear global state
            if (global._mongoose) {
                global._mongoose.conn = null;
                global._mongoose.promise = null;
            }

            expect(global._mongoose).toBeDefined();
            expect(global._mongoose?.conn).toBeNull();
            expect(global._mongoose?.promise).toBeNull();

            await dbConnect();

            expect(global._mongoose?.conn).toBeDefined();
            expect(global._mongoose?.promise).toBeDefined();
        });

        it('should configure mongoose settings correctly', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

            await dbConnect();
            
            // Test mongoose configuration calls
            expect(mockMongoose.set).toHaveBeenCalledWith('strictQuery', true);
            expect(mockMongoose.set).toHaveBeenCalledWith('bufferCommands', false);
        });

        it('should handle missing MongoDB URI', async () => {
            // The db-connect module checks for MONGODB_URI at import time
            // So we test this by importing it in an environment without MONGODB_URI
            const originalUri = process.env.MONGODB_URI;
            delete process.env.MONGODB_URI;

            // Clear the module cache to force re-import
            jest.resetModules();
            
            // Re-import should throw
            await expect(async () => {
                const { default: dbConnect } = await import('@/lib/db-connect');
                return dbConnect;
            }).rejects.toThrow('Missing MONGODB_URI');

            // Restore for other tests
            process.env.MONGODB_URI = originalUri;
            jest.resetModules();
        });

        it('should handle connection errors', async () => {
            process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
            mockMongoose.connect.mockRejectedValue(new Error('Connection failed'));

            await expect(async () => {
                await dbConnect();
            }).rejects.toThrow('Connection failed');
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