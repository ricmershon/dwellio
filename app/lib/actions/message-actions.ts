'use server';

import { revalidatePath } from "next/cache";

import dbConnect from "@/app/config/database-config";
import { Message, MessageDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
import { toActionState } from "@/app/utils/to-action-state";
import { ActionState } from "@/app/types/definitions";
import { MessageInput } from "@/app/schemas/message-schema";
import { buildFormErrorMap } from "@/app/utils/build-form-error-map";

/**
 * Creates a message to the owner of a property.
 * 
 * @param {ActionState} _prevState - required by useActionState 
 * @param {FormData }formData 
 * @returns Promise<ActionState> - ActionState may include form data in order to
 * repopulate the form if there's an error.
 */
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

/**
 * Toggles state of a messages `read` status.
 * 
 * @param {string} messageId - id of message whose status is to change.
 * @returns Promise<ActionState>
 */
export const toggleMessageRead = async (messageId: string) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    /**
     * Confirm message's existence and verify ownership.
     */
    let message: MessageDocument | null;
    try {
        dbConnect();
        message = await Message.findById(messageId);
    } catch (error) {
        console.error(`>>> Database error finding message: ${error}`);
        return toActionState(`Error finding message: ${error}`, 'ERROR');
    }

    if (!message) {
        return toActionState('Message not found.', 'ERROR');
    }

    if (message.recipient.toString() !== sessionUser.id) {
        return toActionState('Not authorized to change message.', 'ERROR');
    }

    message.read = !message.read;

    try {
        await message.save();
    } catch (error) {
        console.error(`>>> Database error changing message: ${error}`);

        return {
            status: 'ERROR',
            message: `Failed to change message: ${error}`
        } as ActionState;
    }

    revalidatePath('/messages');
    return {
        message: `Message marked ${message.read ? 'read.' : 'new.'}`,
        status: 'SUCCESS',
        isRead: message.read
    } as ActionState;
}

/**
 * Deletes a message.
 * 
 * @param {string} messageId - id of message to be deleted.
 * @returns Promise<ActionState>
 */
export const deleteMessage = async (messageId: string) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }

    /**
     * Confirm message's existence and verify ownership.
     */
    let message: MessageDocument | null;
    try {
        dbConnect();
        message = await Message.findById(messageId);
    } catch (error) {
        console.error(`>>> Database error finding message: ${error}`);
        return toActionState(`Error finding message: ${error}`, 'ERROR');
    }

    if (!message) {
        return toActionState('Message not found.', 'ERROR');
    }

    if (message.recipient.toString() !== sessionUser.id) {
        return toActionState('Not authorized to change message.', 'ERROR');
    }

    try {
        await message.deleteOne();
    } catch (error) {
        console.error(`>>> Database error deleting message: ${error}`);

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

/**
 * Gets count of unread messages.
 * 
 * @returns Promise<{unreadCount: number}> 
 */
export const getUnreadMessageCount = async () => {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
        throw new Error('User ID is required.')
    }
    
    try {
        await dbConnect();
        const unreadCount = await Message.countDocuments({
            recipient: sessionUser.id,
            read: false
        });
        return { unreadCount }
    } catch (error) {
        console.error(`>>> Database error getting unread message count: ${error}`);
        throw new Error(`Failed to fetch unread message count: ${error}`);
    }
}