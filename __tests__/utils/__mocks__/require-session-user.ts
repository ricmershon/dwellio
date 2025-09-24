// Mock for @/utils/require-session-user (application module)
export const requireSessionUser = jest.fn().mockResolvedValue({
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
});