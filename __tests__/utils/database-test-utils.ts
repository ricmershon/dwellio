/**
 * Shared database testing utilities for mocking and testing database operations
 */

/**
 * Creates a mock database connection that resolves successfully
 */
export const mockSuccessfulDbConnect = (mockDbConnect: jest.Mock) => {
    mockDbConnect.mockResolvedValue(undefined);
};

/**
 * Creates a mock database connection that rejects with an error
 */
export const mockFailedDbConnect = (mockDbConnect: jest.Mock, error: Error) => {
    mockDbConnect.mockRejectedValue(error);
};

/**
 * Creates a mock Mongoose query chain with lean() method
 */
export const createMockQueryChain = (resolvedValue: unknown) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(resolvedValue),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis()
});

/**
 * Creates a mock Mongoose model with standard methods
 */
export const createMockModel = (data: unknown) => ({
    findById: jest.fn().mockReturnValue(createMockQueryChain(data)),
    findOne: jest.fn().mockReturnValue(createMockQueryChain(data)),
    find: jest.fn().mockReturnValue(createMockQueryChain(data)),
    countDocuments: jest.fn().mockResolvedValue(1),
    aggregate: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue(data),
    findByIdAndUpdate: jest.fn().mockResolvedValue(data),
    findByIdAndDelete: jest.fn().mockResolvedValue(data)
});

/**
 * Creates a database error for testing
 */
export const createDatabaseError = (message: string = 'Database operation failed') => {
    const error = new Error(message);
    error.name = 'DatabaseError';
    return error;
};

/**
 * Verifies that console error was called with database error message
 */
export const expectDatabaseErrorLogged = (
    consoleSpy: jest.SpyInstance,
    operation: string,
    errorMessage: string
) => {
    expect(consoleSpy).toHaveBeenCalledWith(
        `>>> Database error ${operation}: Error: ${errorMessage}`
    );
};

/**
 * Verifies that a database function throws with proper error format
 */
export const expectDatabaseFunctionError = async (
    action: () => Promise<unknown>,
    operation: string,
    errorMessage: string
) => {
    await expect(action()).rejects.toThrow(
        `Failed to ${operation}: Error: ${errorMessage}`
    );
};