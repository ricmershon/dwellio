import '@testing-library/jest-dom';

// Set environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';

// Add TextEncoder/TextDecoder polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add Web API polyfills for Next.js server actions
global.Request = class Request {};
global.Response = class Response {};
global.Headers = class Headers {};
global.ReadableStream = require('stream/web').ReadableStream;
global.WritableStream = require('stream/web').WritableStream;
global.TransformStream = require('stream/web').TransformStream;

global.console = {
    ...console,
    warn: jest.fn(),
    error: console.error,
    log: console.log,
}