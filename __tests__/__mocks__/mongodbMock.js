// Mock for MongoDB module to prevent ES module issues in Jest
const mockObjectId = jest.fn().mockImplementation((id) => ({
  _id: id || 'mock-object-id',
  toString: () => id || 'mock-object-id',
}));

module.exports = {
  MongoClient: {
    connect: jest.fn().mockResolvedValue({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn(),
          insertOne: jest.fn(),
          updateOne: jest.fn(),
          deleteOne: jest.fn(),
        }),
      }),
      close: jest.fn(),
    }),
  },
  ObjectId: mockObjectId,
  Db: jest.fn(),
  Collection: jest.fn(),
};