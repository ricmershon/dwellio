import { jest } from "@jest/globals";

// Mock external dependencies before importing
jest.mock("@/lib/db-connect");
jest.mock("@/models");
jest.mock("@/utils/to-serialized-object");

import { fetchMessages } from "@/lib/data/message-data";
import dbConnect from "@/lib/db-connect";
import { Message } from "@/models";
import { toSerializedObject } from "@/utils/to-serialized-object";

// Mock implementations
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockMessage = Message as any;
const mockToSerializedObject = toSerializedObject as jest.MockedFunction<typeof toSerializedObject>;

// Test data
const mockUnreadMessage = {
    _id: "message123",
    sender: {
        _id: "sender123",
        username: "johndoe"
    },
    recipient: "user123",
    property: {
        _id: "property123",
        name: "Beautiful Apartment"
    },
    email: "sender@example.com",
    phone: "555-0123",
    body: "I am interested in this property",
    read: false,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z")
};

const mockReadMessage = {
    _id: "message456",
    sender: {
        _id: "sender456",
        username: "janedoe"
    },
    recipient: "user123",
    property: {
        _id: "property456",
        name: "Cozy House"
    },
    email: "sender2@example.com",
    phone: "555-0456",
    body: "When is the property available?",
    read: true,
    createdAt: new Date("2024-01-10T10:00:00Z"),
    updatedAt: new Date("2024-01-12T10:00:00Z")
};

describe("message-data", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDbConnect.mockResolvedValue(undefined as any);
        mockToSerializedObject.mockImplementation((obj: any) => obj);
    });

    describe("fetchMessages", () => {
        it("should fetch messages successfully with unread first", async () => {
            const mockUnreadMessages = [mockUnreadMessage, { ...mockUnreadMessage, _id: "message789" }];
            const mockReadMessages = [mockReadMessage];

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce(mockUnreadMessages as any);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce(mockReadMessages as any);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(mockDbConnect).toHaveBeenCalledTimes(1);
            expect(mockMessage.find).toHaveBeenCalledTimes(2);
            expect(mockMessage.find).toHaveBeenCalledWith({ recipient: "user123", read: false });
            expect(mockMessage.find).toHaveBeenCalledWith({ recipient: "user123", read: true });
            expect(mockToSerializedObject).toHaveBeenCalledTimes(3);
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual(mockUnreadMessage);
            expect(result[1]._id).toEqual("message789");
            expect(result[2]).toEqual(mockReadMessage);
        });

        it("should sort unread messages by createdAt descending", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await fetchMessages("user123");

            expect(mockUnreadQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });

        it("should sort read messages by createdAt descending", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await fetchMessages("user123");

            expect(mockReadQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
        });

        it("should populate sender with username", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await fetchMessages("user123");

            expect(mockUnreadQuery.populate).toHaveBeenCalledWith("sender", "username");
            expect(mockReadQuery.populate).toHaveBeenCalledWith("sender", "username");
        });

        it("should populate property with name", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await fetchMessages("user123");

            expect(mockUnreadQuery.populate).toHaveBeenCalledWith("property", "name");
            expect(mockReadQuery.populate).toHaveBeenCalledWith("property", "name");
        });

        it("should return only unread messages when no read messages exist", async () => {
            const mockUnreadMessages = [mockUnreadMessage];

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce(mockUnreadMessages);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockUnreadMessage);
        });

        it("should return only read messages when no unread messages exist", async () => {
            const mockReadMessages = [mockReadMessage];

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce(mockReadMessages);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockReadMessage);
        });

        it("should return empty array when user has no messages", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it("should handle database error on unread messages query", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockRejectedValueOnce(new Error("Database error"));

            mockMessage.find = jest.fn().mockReturnValueOnce(mockUnreadQuery);

            await expect(fetchMessages("user123")).rejects.toThrow("Failed to fetch messages data");

            expect(mockMessage.find).toHaveBeenCalledWith({ recipient: "user123", read: false });
        });

        it("should handle database error on read messages query", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockRejectedValueOnce(new Error("Database error"));

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await expect(fetchMessages("user123")).rejects.toThrow("Failed to fetch messages data");

            expect(mockMessage.find).toHaveBeenCalledTimes(2);
        });

        it("should handle database connection error", async () => {
            mockDbConnect.mockRejectedValue(new Error("Connection failed"));

            await expect(fetchMessages("user123")).rejects.toThrow("Connection failed");

            expect(mockDbConnect).toHaveBeenCalled();
        });

        it("should handle empty string user id", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await fetchMessages("");

            expect(mockMessage.find).toHaveBeenCalledWith({ recipient: "", read: false });
            expect(mockMessage.find).toHaveBeenCalledWith({ recipient: "", read: true });
        });

        it("should handle invalid user id format", async () => {
            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockRejectedValueOnce(new Error("Invalid ObjectId"));

            mockMessage.find = jest.fn().mockReturnValueOnce(mockUnreadQuery);

            await expect(fetchMessages("invalid-id")).rejects.toThrow("Failed to fetch messages data");
        });

        it("should serialize all message documents", async () => {
            const mockUnreadMessages = [mockUnreadMessage, { ...mockUnreadMessage, _id: "message789" }];
            const mockReadMessages = [mockReadMessage, { ...mockReadMessage, _id: "message101" }];

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce(mockUnreadMessages);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce(mockReadMessages);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            await fetchMessages("user123");

            expect(mockToSerializedObject).toHaveBeenCalledTimes(4);
            expect(mockToSerializedObject).toHaveBeenCalledWith(mockUnreadMessages[0]);
            expect(mockToSerializedObject).toHaveBeenCalledWith(mockUnreadMessages[1]);
            expect(mockToSerializedObject).toHaveBeenCalledWith(mockReadMessages[0]);
            expect(mockToSerializedObject).toHaveBeenCalledWith(mockReadMessages[1]);
        });

        it("should handle null sender in message", async () => {
            const messageWithNullSender = { ...mockUnreadMessage, sender: null };

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([messageWithNullSender]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toHaveLength(1);
            expect(result[0].sender).toBeNull();
        });

        it("should handle null property in message", async () => {
            const messageWithNullProperty = { ...mockUnreadMessage, property: null };

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([messageWithNullProperty]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toHaveLength(1);
            expect(result[0].property).toBeNull();
        });

        it("should maintain message order with unread messages first", async () => {
            const unreadMsg1 = { ...mockUnreadMessage, _id: "unread1", createdAt: new Date("2024-01-20") };
            const unreadMsg2 = { ...mockUnreadMessage, _id: "unread2", createdAt: new Date("2024-01-19") };
            const readMsg1 = { ...mockReadMessage, _id: "read1", createdAt: new Date("2024-01-18") };
            const readMsg2 = { ...mockReadMessage, _id: "read2", createdAt: new Date("2024-01-17") };

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([unreadMsg1, unreadMsg2]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([readMsg1, readMsg2]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toHaveLength(4);
            expect(result[0]._id).toBe("unread1");
            expect(result[1]._id).toBe("unread2");
            expect(result[2]._id).toBe("read1");
            expect(result[3]._id).toBe("read2");
        });

        it("should handle messages with missing optional fields", async () => {
            const minimalMessage = {
                _id: "minimal1",
                sender: { _id: "sender1", username: "user" },
                recipient: "user123",
                property: { _id: "prop1", name: "Property" },
                body: "Test message",
                read: false,
                createdAt: new Date()
            };

            const mockUnreadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockUnreadQuery.populate.mockReturnValueOnce(mockUnreadQuery).mockResolvedValueOnce([minimalMessage]);

            const mockReadQuery = {
                sort: (jest.fn() as any).mockReturnThis(),
                populate: (jest.fn() as any).mockReturnThis()
            } as any;
            mockReadQuery.populate.mockReturnValueOnce(mockReadQuery).mockResolvedValueOnce([]);

            mockMessage.find = jest.fn()
                .mockReturnValueOnce(mockUnreadQuery)
                .mockReturnValueOnce(mockReadQuery);

            const result = await fetchMessages("user123");

            expect(result).toHaveLength(1);
            expect(result[0]._id).toBe("minimal1");
        });
    });
});
