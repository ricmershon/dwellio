'use server';

import { revalidatePath } from "next/cache";

import dbConnect from "@/app/config/database-config";
import { Message, MessageDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
import { toActionState } from "@/app/utils/to-action-state";
import { ActionState } from "@/app/lib/definitions";

export const createMessage = async (prevState: ActionState, formData: FormData) => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const newMessage = new Message({
        sender: sessionUser.id,
        recipient: formData.get('recipient'),
        property: formData.get('property'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        body: formData.get('body')
    });

    await newMessage.save();

    return toActionState('Message sent.', 'SUCCESS');
}

export const toggleMessageRead = async (messageId: string) => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const message: MessageDocument | null = await Message.findById(messageId);
    if (!message) {
        throw new Error('Message not found.')
    }

    // Verify ownership
    if (message.recipient.toString() !== sessionUser.id) {
        throw new Error('Not authorized to change message.');
    }

    message.read = !message.read;
    await message.save();

    revalidatePath('/messages');
    return toActionState(
        `Message marked ${message.read ? 'read.' : 'new.'}`,
        'SUCCESS',
        undefined,
        message.read
    );
}

export const deleteMessage = async (messageId: string) => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const message: MessageDocument | null = await Message.findById(messageId);
    if (!message) {
        return toActionState('Message not found.', 'ERROR');
    }

    // Verify ownwership
    if (message.recipient.toString() !== sessionUser.id) {
        throw new Error('Not authorized to delete message.');
    }

    await message.deleteOne();

    revalidatePath('/messages');
    return toActionState('Message successfully deleted.', 'SUCCESS');
}

export const getUnreadMessageCount = async () => {
    await dbConnect();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const unreadCount = await Message.countDocuments({
        recipient: sessionUser.id,
        read: false
    });

    return { unreadCount }
}
