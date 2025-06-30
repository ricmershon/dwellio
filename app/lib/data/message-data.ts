import { Message } from "@/app/models"
import { toSerializedOjbect } from "@/app/utils/to-serialized-object";

export const fetchMessages = async (userId: string) => {
    let unreadMessages;
    let readMessages;

    try {
        unreadMessages = await Message.find({
            recipient: userId,
            read: false
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('property', 'name')
            .lean();

        readMessages = await Message.find({
            recipient: userId,
            read: true
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('property', 'name')
            .lean();

    } catch (error) {
        throw new Error(`Failed to fetch message data: ${error}`)
    }

    const messages = [...unreadMessages, ...readMessages].map((messageDoc) => (
        toSerializedOjbect(messageDoc)
    ));

    return messages;
}