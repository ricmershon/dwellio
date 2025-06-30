import dbConnect from "@/app/config/database-config";
import { Message, MessageInterface } from "@/app/models"
import { toSerializedOjbect } from "@/app/utils/to-serialized-object";

export const fetchMessages = async (userId: string) => {
    await dbConnect();
    
    let unreadMessages: MessageInterface[] | null;
    let readMessages: MessageInterface[] | null;

    try {
        unreadMessages = await Message.find({
            recipient: userId,
            read: false
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('property', 'name')

        readMessages = await Message.find({
            recipient: userId,
            read: true
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('property', 'name')

    } catch (error) {
        throw new Error(`Failed to fetch message data: ${error}`)
    }

    const messages: MessageInterface[] = [...unreadMessages, ...readMessages].map((messageDoc) => (
        toSerializedOjbect(messageDoc)
    ));

    return messages;
}