// Mock for next-auth/next (external dependency)
export const getServerSession = jest.fn().mockResolvedValue({
    user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});