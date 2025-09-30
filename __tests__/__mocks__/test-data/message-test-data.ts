// Test data for message-related tests
const validMessageFormData = {
    name: "John Smith Customer",
    email: "john.smith@example.com",
    phone: "555-987-6543",
    body: "I am interested in renting this property and would like to schedule a viewing. Please let me know your availability."
};

const mockMessageDocument = {
    _id: "message123",
    ...validMessageFormData,
    sender: "user123",
    recipient: "recipient123",
    property: "property123",
    read: false,
    save: jest.fn(),
    deleteOne: jest.fn()
};

const mockSessionUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User"
};

export {
    validMessageFormData,
    mockMessageDocument,
    mockSessionUser
};