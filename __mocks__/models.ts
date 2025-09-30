// Mock for @/models
const Property: any = jest.fn();
Property.findById = jest.fn();
Property.findByIdAndDelete = jest.fn();
Property.findByIdAndUpdate = jest.fn();
Property.create = jest.fn();

const Message: any = jest.fn();
Message.findById = jest.fn();
Message.countDocuments = jest.fn();
Message.create = jest.fn();

const User: any = jest.fn();
User.findById = jest.fn();
User.findOne = jest.fn();
User.create = jest.fn();
User.updateOne = jest.fn();
User.updateMany = jest.fn();

module.exports = {
    Property,
    PropertyDocument: {},
    Message,
    MessageDocument: {},
    User,
    UserDocument: {}
};