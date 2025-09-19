export class MongoClient {
    static connect = jest.fn().mockResolvedValue({
        db: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
                findOne: jest.fn(),
                find: jest.fn().mockReturnValue({
                    toArray: jest.fn().mockResolvedValue([])
                }),
                insertOne: jest.fn(),
                updateOne: jest.fn(),
                deleteOne: jest.fn()
            })
        }),
        close: jest.fn()
    })
}

export const ObjectId = jest.fn().mockImplementation((id) => ({ toString: () => id || 'mock-object-id' }))