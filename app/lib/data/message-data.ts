import dbConnect from "@/app/config/database-config";
import { Message, MessageInterface } from "@/app/models"
import { toSerializedOjbect } from "@/app/utils/to-serialized-object";

/**
 * Returns all messages in the database for the currently logged in user,
 * ordered by unread then read.
 * 
 * @param {string} userId - ObjectId in database for user/property owner.
 * @returns Promise<MessageInterface[]>
 */
export const fetchMessages = async (userId: string) => {
    try {
        await dbConnect();
        const unreadMessages: MessageInterface[] | null = await Message.find({
            recipient: userId,
            read: false
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('property', 'name')

        const readMessages: MessageInterface[] | null = await Message.find({
            recipient: userId,
            read: true
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('property', 'name')

        const messages: MessageInterface[] = [...unreadMessages, ...readMessages].map((messageDoc) => (
            toSerializedOjbect(messageDoc)
        ));
        return messages;
    } catch (error) {
        console.error(`>>> Database error fetching messages: ${error}`);
        throw new Error(`Failed to fetch messages data: ${error}`);
    }
}