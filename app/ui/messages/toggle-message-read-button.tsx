'use client';

import { useState } from "react";
import { toast } from "react-toastify";

import { toggleMessageRead } from "@/app/lib/actions/message-actions";

interface ToggleMessageReadButtonProps {
    messageId: string,
    read: boolean
}

const ToggleMessageReadButton = ({ messageId, read }: ToggleMessageReadButtonProps ) => {
    const [isRead, setIsRead] = useState(read);
    
    const toggleMessageReadAction = async () => {
        const result = await toggleMessageRead(messageId);

        setIsRead(result.isRead!);

        if (result.message) {
            if (result.status === 'SUCCESS') {
                toast.success(result.message, { position: 'bottom-right' });
            } else if (result.status === 'ERROR') {
                toast.error(result.message, { position: 'bottom-right' });
            }
        }
    }
    
    return (
        <form action={toggleMessageReadAction} className="inline-block">
            <button
                className="mt-4 mr-3 bg-blue-500 text-white py-1 px-3 rounded-md"
                type="submit"
            >
                {isRead ? 'Mark as Unread' : 'Mark as Read'}
            </button>
        </form>
    );
}
 
export default ToggleMessageReadButton;