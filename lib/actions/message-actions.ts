'use server';

import { revalidatePath } from "next/cache";

import dbConnect from "@/config/database-config";
import { Message, MessageDocument } from "@/models";
import { toActionState } from "@/utils/to-action-state";
import { ActionState, ActionStatus } from "@/types/types";
import { MessageInput } from "@/schemas/message-schema";
import { buildFormErrorMap } from "@/utils/build-form-error-map";
import { requireSessionUser } from "@/utils/require-session-user";

/**
 * Creates a message to the owner of a property.
 * 
 * @param {ActionState} _prevState - required by useActionState 
 * @param {FormData }formData 
 * @returns Promise<ActionState> - ActionState may include form data in order to
 * repopulate the form if there's an error.
 */
export const createMessage = async (_prevState: ActionState, formData: FormData) => {
    const sessionUser = await requireSessionUser();

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
        return toActionState ({
            formData: formData,
            formErrorMap: formErrorMap
        })
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
        return toActionState({
            status: ActionStatus.SUCCESS,
            message: 'Message sent.'
        });

    } catch (error) {
        console.error(`>>> Database error sending a message: ${error}`);

        /**
         * Return form data so the form can be repopulated and the user does
         * not have to re-enter info.
         */
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Failed to send message: ${error}`,
            formData: formData
        });
    }
}

/**
 * Toggles state of a messages `read` status.
 * 
 * @param {string} messageId - id of message whose status is to change.
 * @returns Promise<ActionState>
 */
export const toggleMessageRead = async (messageId: string) => {
    const sessionUser = await requireSessionUser();

    /**
     * Confirm message's existence and verify ownership.
     */
    let message: MessageDocument | null;
    try {
        dbConnect();
        message = await Message.findById(messageId);
    } catch (error) {
        console.error(`>>> Database error finding message: ${error}`);
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Error finding message: ${error}`
        });
    }

    if (!message) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: 'Message not found.'
        });
    }

    if (message.recipient.toString() !== sessionUser.id) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: 'Not authorized to change message.'
        });
    }

    message.read = !message.read;

    try {
        await message.save();
    } catch (error) {
        console.error(`>>> Database error changing message: ${error}`);

        return toActionState({
            status: ActionStatus.ERROR,
            message: `Failed to change message: ${error}`
        });
    }

    revalidatePath('/messages');
    return toActionState({
        status: ActionStatus.SUCCESS,
        message: `Message marked ${message.read ? 'read.' : 'new.'}`,
        isRead: message.read
    });
}

/**
 * Deletes a message.
 * 
 * @param {string} messageId - id of message to be deleted.
 * @returns Promise<ActionState>
 */
export const deleteMessage = async (messageId: string) => {
    const sessionUser = await requireSessionUser();

    /**
     * Confirm message's existence and verify ownership.
     */
    let message: MessageDocument | null;
    try {
        dbConnect();
        message = await Message.findById(messageId);
    } catch (error) {
        console.error(`>>> Database error finding message: ${error}`);
        return toActionState({
            status: ActionStatus.ERROR,
            message: `Error finding message: ${error}`
        });
    }

    if (!message) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: 'Message not found.'
        });
    }

    if (message.recipient.toString() !== sessionUser.id) {
        return toActionState({
            status: ActionStatus.ERROR,
            message: 'Not authorized to change message.'
        });
    }

    try {
        await message.deleteOne();
    } catch (error) {
        console.error(`>>> Database error deleting message: ${error}`);

        return toActionState({
            status: ActionStatus.ERROR,
            message: `Failed to delete message: ${error}`
        })
    }

    revalidatePath('/messages');
    return toActionState({
        status: ActionStatus.SUCCESS,
        message: "Message deleted."
    });;
}

/**
 * Gets count of unread messages.
 * 
 * @returns Promise<{unreadCount: number}> 
 */
export const getUnreadMessageCount = async () => {
    const sessionUser = await requireSessionUser();
    
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