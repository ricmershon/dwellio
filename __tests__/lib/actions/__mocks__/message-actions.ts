// Mock for @/lib/actions/message-actions
export const createMessage = jest.fn().mockResolvedValue({
    status: 'success',
    message: 'Message created successfully'
});

export const deleteMessage = jest.fn().mockResolvedValue({
    status: 'success',
    message: 'Message deleted successfully'
});

export const toggleMessageRead = jest.fn().mockResolvedValue({
    status: 'success',
    message: 'Message status updated'
});

export const getUnreadMessageCount = jest.fn().mockResolvedValue(0);