/**
 * Shared mock testing utilities for consistent mocking patterns
 */

/**
 * Creates a mock function that resolves with a value
 */
export const createMockResolve = <T>(value: T): jest.Mock<Promise<T>, unknown[]> => {
    return jest.fn().mockResolvedValue(value);
};

/**
 * Creates a mock function that rejects with an error
 */
export const createMockReject = (error: Error | string): jest.Mock<Promise<never>, unknown[]> => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return jest.fn().mockRejectedValue(errorObj);
};

/**
 * Creates a mock function that returns a value synchronously
 */
export const createMockReturn = <T>(value: T): jest.Mock<T, unknown[]> => {
    return jest.fn().mockReturnValue(value);
};

/**
 * Creates a mock console spy for error logging tests
 */
export const createConsoleErrorSpy = (): jest.SpyInstance => {
    return jest.spyOn(console, 'error').mockImplementation();
};

/**
 * Creates a mock console spy for log tests
 */
export const createConsoleLogSpy = (): jest.SpyInstance => {
    return jest.spyOn(console, 'log').mockImplementation();
};

/**
 * Sets up multiple mocks with their resolved values
 */
export const setupMockResolves = (mocks: Record<string, { mock: jest.Mock; value: unknown }>) => {
    Object.entries(mocks).forEach(([, { mock, value }]) => {
        mock.mockResolvedValue(value);
    });
};

/**
 * Verifies that mock functions were called the expected number of times
 */
export const expectCallCounts = (mocks: jest.Mock[], expectedCalls: number = 1) => {
    mocks.forEach((mock) => {
        expect(mock).toHaveBeenCalledTimes(expectedCalls);
    });
};

/**
 * Resets all provided mocks
 */
export const resetAllMocks = (mocks: jest.Mock[]) => {
    mocks.forEach(mock => mock.mockReset());
};