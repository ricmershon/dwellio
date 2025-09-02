import dbConnect from "@/lib/db-connect";
import { Message, MessageDocument } from "@/models"
import { toSerializedObject } from "@/utils/to-serialized-object";

/**
 * Returns all messages in the database for the currently logged in user,
 * ordered by unread then read.
 * 
 * @param {string} userId - ObjectId in database for user/property owner.
 * @returns Promise<MessageDocument[]>
 */
export const fetchMessages = async (userId: string) => {
    try {
        await dbConnect();
        const unreadMessages: MessageDocument[] | null = await Message.find({
            recipient: userId,
            read: false
        })
            .sort({ createdAt: -1 })
            .populate("sender", "username")
            .populate("property", "name")

        const readMessages: MessageDocument[] | null = await Message.find({
            recipient: userId,
            read: true
        })
            .sort({ createdAt: -1 })
            .populate("sender", "username")
            .populate("property", "name")

        const messages: MessageDocument[] = [...unreadMessages, ...readMessages].map((messageDoc) => (
            toSerializedObject(messageDoc)
        ));
        return messages;
    } catch (error) {
        console.error(`>>> Database error fetching messages: ${error}`);
        throw new Error(`Failed to fetch messages data: ${error}`);
    }
}