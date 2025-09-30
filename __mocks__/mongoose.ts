// Mock for mongoose
const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn()
};

const mockTypes = {
    ObjectId: jest.fn((id) => ({
        toString: () => id,
        _id: id
    }))
};

const mockSchema = function(this: any, definition: any) {
    this.definition = definition;
    this.add = jest.fn();
    this.pre = jest.fn();
    this.post = jest.fn();
    return this;
};

mockSchema.Types = {
    ObjectId: mockTypes.ObjectId,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Array: Array
};

const mockModel = function(name: any, schema: any) {
    const model: any = jest.fn();
    model.findById = jest.fn();
    model.findOne = jest.fn();
    model.create = jest.fn();
    model.updateOne = jest.fn();
    model.updateMany = jest.fn();
    model.deleteOne = jest.fn();
    model.countDocuments = jest.fn();
    model.findByIdAndUpdate = jest.fn();
    model.findByIdAndDelete = jest.fn();
    return model;
};

const mongoose = {
    connection: {
        listeners: jest.fn(() => []),
        on: jest.fn(),
        readyState: 1
    },
    startSession: jest.fn(() => mockSession),
    Types: mockTypes,
    connect: jest.fn(() => Promise.resolve()),
    Schema: mockSchema,
    model: mockModel,
    models: {} // Empty models object initially
};

module.exports = mongoose;
module.exports.startSession = jest.fn(() => mockSession);
module.exports.Types = mockTypes;
module.exports.Schema = mockSchema;
module.exports.model = mockModel;
module.exports.models = {};