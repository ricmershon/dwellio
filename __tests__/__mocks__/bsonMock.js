// Mock for BSON module to prevent ES module issues in Jest
module.exports = {
  ObjectId: jest.fn().mockImplementation((id) => ({
    _id: id || 'mock-object-id',
    toString: () => id || 'mock-object-id',
  })),
  Binary: jest.fn(),
  Code: jest.fn(),
  DBRef: jest.fn(),
  Decimal128: jest.fn(),
  Double: jest.fn(),
  Int32: jest.fn(),
  Long: jest.fn(),
  MaxKey: jest.fn(),
  MinKey: jest.fn(),
  Timestamp: jest.fn(),
  UUID: jest.fn(),
  BSONError: Error,
  BSONRegExp: RegExp,
  BSONSymbol: Symbol,
  BSONType: {},
  serialize: jest.fn(),
  deserialize: jest.fn(),
  calculateObjectSize: jest.fn(() => 100),
  EJSON: {
    parse: jest.fn(),
    stringify: jest.fn(),
  },
};