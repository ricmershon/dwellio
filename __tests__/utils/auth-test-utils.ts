/**
 * Shared authentication testing utilities to reduce duplicate auth tests
 */
import { Session } from 'next-auth';

/**
 * Creates a mock authenticated user for testing
 */
export const createMockAuthenticatedUser = (overrides: Partial<Session['user']> = {}) => ({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
});

/**
 * Creates a mock session with authenticated user
 */
export const createMockSession = (userOverrides: Partial<Session['user']> = {}): Session => ({
    user: createMockAuthenticatedUser(userOverrides),
    expires: '2025-12-31T23:59:59.999Z'
});

/**
 * Verifies that requireSessionUser was called
 */
export const expectAuthenticationRequired = (mockRequireSessionUser: jest.Mock) => {
    expect(mockRequireSessionUser).toHaveBeenCalled();
};

/**
 * Verifies that authentication function was called with proper session
 */
export const expectSessionUserCalled = (mockGetSessionUser: jest.Mock) => {
    expect(mockGetSessionUser).toHaveBeenCalled();
};

/**
 * Sets up mock for authenticated user scenario
 */
export const mockAuthenticatedUser = (
    mockGetSessionUser: jest.Mock,
    userOverrides: Partial<Session['user']> = {}
) => {
    const user = createMockAuthenticatedUser(userOverrides);
    mockGetSessionUser.mockResolvedValue(user);
    return user;
};

/**
 * Sets up mock for unauthenticated user scenario
 */
export const mockUnauthenticatedUser = (mockGetSessionUser: jest.Mock) => {
    mockGetSessionUser.mockResolvedValue(null);
};

/**
 * Verifies authentication error handling
 */
export const expectAuthenticationError = async (
    mockAction: jest.Mock,
    errorMessage: string = 'Authentication required'
) => {
    await expect(mockAction).rejects.toThrow(
        expect.stringContaining(errorMessage)
    );
};