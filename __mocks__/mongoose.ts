// Mock for mongoose module (external dependency)

// Mock Types first
export class ObjectId {
    constructor(id?: string) {
        this._id = id || Math.random().toString(16).substring(2);
    }

    toString() {
        return this._id;
    }

    private _id: string;
}

export const connect = jest.fn().mockResolvedValue({ connection: { readyState: 1 } });
export const disconnect = jest.fn().mockResolvedValue(undefined);

export const startSession = jest.fn().mockResolvedValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
});

export const model = jest.fn();
const SchemaConstructor: any = jest.fn().mockImplementation((definition) => ({
    definition,
    methods: {},
    statics: {},
    index: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
}));

// Add Schema.Types property
SchemaConstructor.Types = {
    ObjectId: ObjectId,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Array: Array,
};

export const Schema = SchemaConstructor;

export const models = {};

// Mock connection object
export const connection = {
    listeners: jest.fn().mockReturnValue([]),
    on: jest.fn(),
    off: jest.fn(),
    readyState: 1,
};

export const Types = {
    ObjectId: ObjectId,
};

const mongoose = {
    connect,
    disconnect,
    model,
    Schema,
    models,
    startSession,
    Types,
    connection,
};

export default mongoose;