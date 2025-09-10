// Mock for Mongoose module to prevent ES module issues in Jest
const mockSchema = jest.fn().mockImplementation(() => ({
  pre: jest.fn(),
  post: jest.fn(),
  methods: {},
  statics: {},
}));

const mockModel = jest.fn().mockImplementation(() => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  save: jest.fn(),
}));

const mockConnection = {
  readyState: 1,
  listeners: jest.fn().mockReturnValue([]),
  on: jest.fn(),
  once: jest.fn(),
  removeListener: jest.fn(),
};

module.exports = {
  default: {
    connect: jest.fn().mockResolvedValue(true),
    connection: mockConnection,
    Schema: mockSchema,
    model: mockModel,
    models: {},
  },
  connect: jest.fn().mockResolvedValue(true),
  connection: mockConnection,
  Schema: mockSchema,
  model: mockModel,
  models: {},
};