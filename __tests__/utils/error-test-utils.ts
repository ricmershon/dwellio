/**
 * Shared error handling testing utilities to reduce duplicate error tests
 */

/**
 * Creates a mock network error for testing
 */
export const createNetworkError = (message: string = 'Network timeout') => {
    const error = new Error(message);
    error.name = 'NetworkError';
    return error;
};

/**
 * Creates a mock database error for testing
 */
export const createDatabaseError = (message: string = 'Database connection failed') => {
    const error = new Error(message);
    error.name = 'DatabaseError';
    return error;
};

/**
 * Creates a mock validation error for testing
 */
export const createValidationError = (message: string = 'Validation failed') => {
    const error = new Error(message);
    error.name = 'ValidationError';
    return error;
};

/**
 * Verifies that server action handles errors gracefully
 */
export const expectServerActionError = async (
    action: () => Promise<any>,
    expectedBehavior: 'throw' | 'return-error' = 'throw'
) => {
    if (expectedBehavior === 'throw') {
        await expect(action()).rejects.toThrow();
    } else {
        const result = await action();
        expect(result).toMatchObject({
            status: expect.stringMatching(/error|failed/i)
        });
    }
};

/**
 * Tests that component doesn't crash on error
 */
export const expectGracefulErrorHandling = (
    renderComponent: () => void,
    errorScenario: string
) => {
    expect(() => renderComponent()).not.toThrow();
};

/**
 * Verifies error logging in development mode
 */
export const expectErrorLogging = (
    consoleSpy: jest.SpyInstance,
    errorMessage: string
) => {
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.objectContaining({
            message: expect.stringContaining(errorMessage)
        })
    );
};

/**
 * Verifies that error state is maintained properly
 */
export const expectErrorStateHandling = (
    component: any,
    originalState: any
) => {
    // Verify component returns to original state after error
    expect(component.state).toEqual(originalState);
};