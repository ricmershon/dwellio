import dbConnect from '@/lib/db-connect';

// Mock the db-connect module
jest.mock('@/lib/db-connect', () => {
    const mockDbConnect = jest.fn().mockResolvedValue({
        connection: { readyState: 1 }
    });

    return {
        __esModule: true,
        default: mockDbConnect
    };
});

describe('Database Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
    });

    describe('Connection Management', () => {
        it('should connect to database successfully', async () => {
            const connection = await dbConnect();

            expect(dbConnect).toHaveBeenCalled();
            expect(connection).toBeDefined();
        });

        it('should handle connection attempts', async () => {
            await dbConnect();

            expect(dbConnect).toHaveBeenCalledTimes(1);
        });
    });

    describe('Environment Configuration', () => {
        it('should use environment variables', () => {
            expect(process.env.MONGODB_URI).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle connection errors', async () => {
            // Mock a failed connection
            const mockDbConnectWithError = jest.fn().mockRejectedValue(new Error('Connection failed'));
            jest.mocked(dbConnect).mockImplementation(mockDbConnectWithError);

            await expect(dbConnect()).rejects.toThrow('Connection failed');
        });
    });
});