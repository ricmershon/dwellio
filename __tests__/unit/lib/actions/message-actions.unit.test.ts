import { jest } from "@jest/globals";

// Mock external dependencies before importing
jest.mock("next/cache");
jest.mock("@/lib/db-connect");
jest.mock("@/utils/require-session-user");
jest.mock("@/models");

import { createMessage, toggleMessageRead, deleteMessage, getUnreadMessageCount } from "@/lib/actions/message-actions";
import { ActionStatus } from "@/types";
import { requireSessionUser } from "@/utils/require-session-user";
import { Message } from "@/models";
import { revalidatePath } from "next/cache";
// Test dataPLAN_V2
const validMessageFormData = {
    name: "John Smith Customer",
    email: "john.smith@example.com",
    phone: "555-987-6543",
    body: "I am interested in renting this property and would like to schedule a viewing. Please let me know your availability."
};

const mockSessionUser = {
    id: "user123",
    email: "test@example.com",
    name: "Test User"
};

// Helper function
const createFormDataFromObject = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    const appendToFormData = (obj: Record<string, any>, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const formKey = prefix ? `${prefix}.${key}` : key;

            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
                appendToFormData(value, formKey);
            } else if (Array.isArray(value)) {
                value.forEach(item => formData.append(formKey, item));
            } else if (value !== undefined && value !== null) {
                formData.append(formKey, value.toString());
            }
        }
    };

    appendToFormData(data);
    return formData;
};

// Mock implementations
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
const mockRequireSessionUser = requireSessionUser as jest.MockedFunction<typeof requireSessionUser>;

// Mock mongoose model methods
const mockMessageSave = jest.fn();
const mockMessageFindById = jest.fn();
const mockMessageDeleteOne = jest.fn();
const mockMessageCountDocuments = jest.fn();

const mockMessage = Message as jest.MockedClass<any>;

describe("message-actions", () => {
    const mockMessageDocument = {
        _id: "message123",
        ...validMessageFormData,
        sender: "user123",
        recipient: "recipient123",
        property: "property123",
        read: false,
        save: mockMessageSave,
        deleteOne: mockMessageDeleteOne
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockRequireSessionUser.mockResolvedValue(mockSessionUser as any);
        mockMessage.mockImplementation(() => ({
            ...mockMessageDocument,
            save: mockMessageSave
        }));

        mockMessage.findById = mockMessageFindById;
        mockMessage.countDocuments = mockMessageCountDocuments;

        (mockMessageSave as any).mockResolvedValue(mockMessageDocument as any);
    });

    describe("createMessage", () => {
        const createFormData = (data: Partial<typeof validMessageFormData> = {}, additionalFields: Record<string, string> = {}) => {
            const messageData = { ...validMessageFormData, ...data };
            const formData = createFormDataFromObject(messageData);

            formData.append("recipient", additionalFields.recipient || "recipient123");
            formData.append("property", additionalFields.property || "property123");

            return formData;
        };

        it("should create message successfully with valid data", async () => {
            const formData = createFormData();

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Message sent."
            });
            expect(mockMessageSave).toHaveBeenCalled();
        });

        it("should return validation errors for invalid data", async () => {
            const formData = createFormData({ name: "" }); // Invalid: empty name

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
            expect(mockMessageSave).not.toHaveBeenCalled();
        });

        it("should handle missing required fields", async () => {
            const formData = createFormData({ email: "" }); // Invalid: empty email

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
            expect(mockMessageSave).not.toHaveBeenCalled();
        });

        it("should handle database save error", async () => {
            const formData = createFormData();
            (mockMessageSave as any).mockRejectedValue(new Error("Save failed"));

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Failed to send message: Error: Save failed",
                formData: formData
            });
        });

        it("should include sender, recipient, and property in message document", async () => {
            const formData = createFormData({}, { recipient: "recipient456", property: "property456" });

            await createMessage({}, formData);

            expect(mockMessage).toHaveBeenCalledWith({
                ...validMessageFormData,
                sender: mockSessionUser.id,
                recipient: "recipient456",
                property: "property456"
            });
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated") as any);
            const formData = createFormData();

            await expect(createMessage({}, formData)).rejects.toThrow("Not authenticated");
        });

        it("should handle invalid email format", async () => {
            const formData = createFormData({ email: "invalid-email" });

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
        });

        it("should handle invalid phone format", async () => {
            const formData = createFormData({ phone: "" }); // Empty phone fails validation

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
        });

        it("should handle empty message body", async () => {
            const formData = createFormData({ body: "" });

            const result = await createMessage({}, formData);

            expect(result).toEqual({
                formData: formData,
                formErrorMap: expect.any(Object)
            });
        });
    });

    describe("toggleMessageRead", () => {
        const messageId = "message123";

        beforeEach(() => {
            (mockMessageFindById as any).mockResolvedValue({
                ...mockMessageDocument,
                recipient: { toString: () => mockSessionUser.id }
            } as any);
        });

        it("should toggle message from unread to read", async () => {
            const unreadMessage = {
                ...mockMessageDocument,
                read: false,
                recipient: { toString: () => mockSessionUser.id },
                save: mockMessageSave
            };
            (mockMessageFindById as any).mockResolvedValue(unreadMessage);

            const result = await toggleMessageRead(messageId);

            expect(unreadMessage.read).toBe(true);
            expect(mockMessageSave).toHaveBeenCalled();
            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Message marked read.",
                isRead: true
            });
            expect(mockRevalidatePath).toHaveBeenCalledWith("/messages");
        });

        it("should toggle message from read to unread", async () => {
            const readMessage = {
                ...mockMessageDocument,
                read: true,
                recipient: { toString: () => mockSessionUser.id },
                save: mockMessageSave
            };
            (mockMessageFindById as any).mockResolvedValue(readMessage);

            const result = await toggleMessageRead(messageId);

            expect(readMessage.read).toBe(false);
            expect(mockMessageSave).toHaveBeenCalled();
            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Message marked new.",
                isRead: false
            });
        });

        it("should return error if message not found", async () => {
            (mockMessageFindById as any).mockResolvedValue(null as any);

            const result = await toggleMessageRead(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Message not found."
            });
            expect(mockMessageSave).not.toHaveBeenCalled();
        });

        it("should return error if user not authorized", async () => {
            const unauthorizedMessage = {
                ...mockMessageDocument,
                recipient: { toString: () => "otheruser123" }
            };
            (mockMessageFindById as any).mockResolvedValue(unauthorizedMessage);

            const result = await toggleMessageRead(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Not authorized to change message."
            });
            expect(mockMessageSave).not.toHaveBeenCalled();
        });

        it("should handle database find error", async () => {
            (mockMessageFindById as any).mockRejectedValue(new Error("Find failed") as any);

            const result = await toggleMessageRead(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Error finding message: Error: Find failed"
            });
        });

        it("should handle database save error", async () => {
            const message = {
                ...mockMessageDocument,
                recipient: { toString: () => mockSessionUser.id },
                save: mockMessageSave
            };
            (mockMessageFindById as any).mockResolvedValue(message);
            (mockMessageSave as any).mockRejectedValue(new Error("Save failed"));

            const result = await toggleMessageRead(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Failed to change message: Error: Save failed"
            });
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated") as any);

            await expect(toggleMessageRead(messageId)).rejects.toThrow("Not authenticated");
        });
    });

    describe("deleteMessage", () => {
        const messageId = "message123";

        beforeEach(() => {
            (mockMessageFindById as any).mockResolvedValue({
                ...mockMessageDocument,
                recipient: { toString: () => mockSessionUser.id }
            } as any);
        });

        it("should delete message successfully", async () => {
            const message = {
                ...mockMessageDocument,
                recipient: { toString: () => mockSessionUser.id },
                deleteOne: mockMessageDeleteOne
            };
            (mockMessageFindById as any).mockResolvedValue(message);

            const result = await deleteMessage(messageId);

            expect(mockMessageDeleteOne).toHaveBeenCalled();
            expect(result).toEqual({
                status: ActionStatus.SUCCESS,
                message: "Message deleted."
            });
            expect(mockRevalidatePath).toHaveBeenCalledWith("/messages");
        });

        it("should return error if message not found", async () => {
            (mockMessageFindById as any).mockResolvedValue(null as any);

            const result = await deleteMessage(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Message not found."
            });
            expect(mockMessageDeleteOne).not.toHaveBeenCalled();
        });

        it("should return error if user not authorized", async () => {
            const unauthorizedMessage = {
                ...mockMessageDocument,
                recipient: { toString: () => "otheruser123" }
            };
            (mockMessageFindById as any).mockResolvedValue(unauthorizedMessage);

            const result = await deleteMessage(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Not authorized to change message."
            });
            expect(mockMessageDeleteOne).not.toHaveBeenCalled();
        });

        it("should handle database find error", async () => {
            (mockMessageFindById as any).mockRejectedValue(new Error("Find failed") as any);

            const result = await deleteMessage(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Error finding message: Error: Find failed"
            });
        });

        it("should handle database delete error", async () => {
            const message = {
                ...mockMessageDocument,
                recipient: { toString: () => mockSessionUser.id },
                deleteOne: mockMessageDeleteOne
            };
            (mockMessageFindById as any).mockResolvedValue(message);
            (mockMessageDeleteOne as any).mockRejectedValue(new Error("Delete failed"));

            const result = await deleteMessage(messageId);

            expect(result).toEqual({
                status: ActionStatus.ERROR,
                message: "Failed to delete message: Error: Delete failed"
            });
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated") as any);

            await expect(deleteMessage(messageId)).rejects.toThrow("Not authenticated");
        });
    });

    describe("getUnreadMessageCount", () => {
        it("should return unread message count successfully", async () => {
            (mockMessageCountDocuments as any).mockResolvedValue(5 as any);

            const result = await getUnreadMessageCount();

            expect(result).toEqual({ unreadCount: 5 });
            expect(mockMessageCountDocuments).toHaveBeenCalledWith({
                recipient: mockSessionUser.id,
                read: false
            });
        });

        it("should return zero when no unread messages", async () => {
            (mockMessageCountDocuments as any).mockResolvedValue(0 as any);

            const result = await getUnreadMessageCount();

            expect(result).toEqual({ unreadCount: 0 });
        });

        it("should handle database error", async () => {
            (mockMessageCountDocuments as any).mockRejectedValue(new Error("Count failed") as any);

            await expect(getUnreadMessageCount()).rejects.toThrow("Failed to fetch unread message count: Error: Count failed");
        });

        it("should require authenticated user", async () => {
            mockRequireSessionUser.mockRejectedValue(new Error("Not authenticated") as any);

            await expect(getUnreadMessageCount()).rejects.toThrow("Not authenticated");
        });

        it("should handle large unread counts", async () => {
            (mockMessageCountDocuments as any).mockResolvedValue(999 as any);

            const result = await getUnreadMessageCount();

            expect(result).toEqual({ unreadCount: 999 });
        });

        it("should filter by recipient and read status correctly", async () => {
            (mockMessageCountDocuments as any).mockResolvedValue(3 as any);

            await getUnreadMessageCount();

            expect(mockMessageCountDocuments).toHaveBeenCalledWith({
                recipient: mockSessionUser.id,
                read: false
            });
        });
    });
});