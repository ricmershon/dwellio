// Mock for @/lib/data/message-data
export const fetchMessages = jest.fn().mockResolvedValue([]);

// fetchUnreadMessageCount doesn't exist, use getUnreadMessageCount from actions instead

export const fetchMessagesByProperty = jest.fn().mockResolvedValue([]);

export const fetchMessagesByUser = jest.fn().mockResolvedValue([]);