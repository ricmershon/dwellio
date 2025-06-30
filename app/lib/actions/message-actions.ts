'use server';

import dbConnect from "@/app/config/database-config";
import { Message } from "@/app/models";
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