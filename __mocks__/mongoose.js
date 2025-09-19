const Schema = jest.fn().mockImplementation(() => ({
    methods: {},
    statics: {},
    pre: jest.fn(),
    post: jest.fn()
}))

Schema.Types = {
    ObjectId: 'ObjectId'
}

const mongoose = {
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn().mockResolvedValue({}),
    connection: {
        readyState: 1,
        listeners: jest.fn().mockReturnValue([]),
        on: jest.fn(),
        once: jest.fn()
    },
    Schema,
    model: jest.fn().mockReturnValue({
        find: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn()
    }),
    models: {}
}

mongoose.default = mongoose

module.exports = mongoose