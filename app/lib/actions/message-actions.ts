'use server';

import { revalidatePath } from "next/cache";

import dbConnect from "@/app/config/database-config";
import { Message, MessageDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
import { toActionState } from "@/app/utils/to-action-state";
import { ActionState } from "@/app/lib/definitions";
import { MessageInput } from "@/app/schemas/message-schema";
import { buildFormErrorMap } from "@/app/utils/build-form-error-map";

export const createMessage = async (_prevState: ActionState, formData: FormData) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    const validationResults = MessageInput.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        body: formData.get('body')
    });

    /**
     * Return immediately if form validation fails.
     */
    if (!validationResults.success) {
        const formErrorMap = buildFormErrorMap(validationResults.error.issues);
        console.log(formErrorMap);
        return {
            formData: formData,
            formErrorMap: formErrorMap
        } as ActionState
    }

    try {
        await dbConnect();

        const newMessage = new Message({
            ...validationResults.data,
            sender: sessionUser.id,
            recipient: formData.get('recipient'),
            property: formData.get('property'),
        });
        await newMessage.save();

        return toActionState('Message sent.', 'SUCCESS');

    } catch (error) {
        console.error(`>>> Database error sending a message: ${error}`);

        /**
         * Return form data so the form can be repopulated and the user does
         * not have to re-enter info.
         */
        return toActionState(
            `Failed to send message: ${error}`,
            'ERROR',
            undefined,
            undefined,
            formData
        );
    }
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
    return {
        message: `Message marked ${message.read ? 'read.' : 'new.'}`,
        status: 'SUCCESS',
        isRead: message.read
    } as ActionState;
}

export const deleteMessage = async (messageId: string) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    /**
     * Confirm message's existence and verify ownership.
     */
    const message: MessageDocument | null = await Message.findById(messageId);
    if (!message) {
        return toActionState('Message not found.', 'ERROR');
    }

    if (message.recipient.toString() !== sessionUser.id) {
        return toActionState('Not authorized to delete message.', 'ERROR');
    }

    try {
        await dbConnect();
        await message.deleteOne();
    } catch (error) {
        console.error(`>>> Database error updating a property: ${error}`);

        return {
            status: 'ERROR',
            message: `Failed to delete message: ${error}`
        } as ActionState;
    }

    revalidatePath('/messages');
    return {
        status: 'SUCCESS',
        message: "Message deleted."
    } as ActionState;
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
