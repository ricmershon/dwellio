// Mock for next-auth
module.exports = {
    getServerSession: jest.fn(() => Promise.resolve(null))
};