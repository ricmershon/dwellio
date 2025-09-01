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
(global as any).Response = class Response {};
(global as any).Headers = class Headers {};

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