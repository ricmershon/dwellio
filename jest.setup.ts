import '@testing-library/jest-dom';
global.console = {
    ...console,
    warn: jest.fn(),
    error: console.error,
    log: console.log,
}