/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Set environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';

// Add TextEncoder/TextDecoder polyfills for Node.js environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Add Web API polyfills for Next.js server actions
(global as any).Request = class Request {};

(global as any).Response = class Response {
    public status: number;
    public headers: any;
    public body: string;

    constructor(body?: BodyInit | null, options?: ResponseInit) {
        this.body = typeof body === 'string' ? body : body?.toString() || '';
        this.status = options?.status || 200;
        this.headers = new (global as any).Headers(options?.headers);
    }

    async json() {
        return JSON.parse(this.body);
    }

    async text() {
        return this.body;
    }
} as any;

(global as any).Headers = class Headers {
    private map = new Map<string, string>();

    constructor(init?: HeadersInit) {
        if (init) {
            if (init instanceof Headers) {
                init.forEach((value, key) => {
                    this.map.set(key.toLowerCase(), value);
                });
            } else if (Array.isArray(init)) {
                init.forEach(([key, value]) => {
                    this.map.set(key.toLowerCase(), value);
                });
            } else {
                Object.entries(init).forEach(([key, value]) => {
                    this.map.set(key.toLowerCase(), Array.isArray(value) ? value.join(', ') : value);
                });
            }
        }
    }

    get(name: string): string | null {
        return this.map.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string): void {
        this.map.set(name.toLowerCase(), value);
    }

    forEach(callback: (value: string, key: string) => void): void {
        this.map.forEach(callback);
    }
} as any;

// Dynamic imports for stream/web polyfills (not available as ES modules)
(global as any).ReadableStream = require('stream/web').ReadableStream;
(global as any).WritableStream = require('stream/web').WritableStream;
(global as any).TransformStream = require('stream/web').TransformStream;

global.console = {
    ...console,
    warn: jest.fn(),
    error: console.error,
    log: console.log,
}