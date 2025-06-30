'use client';

import { useState } from "react";
import { toast } from "react-toastify";

import { useGlobalContext } from "@/app/context/global-context";
import { toggleMessageRead } from "@/app/lib/actions/message-actions";

interface ToggleMessageReadButtonProps {
    messageId: string,
    read: boolean
}

const ToggleMessageReadButton = ({ messageId, read }: ToggleMessageReadButtonProps ) => {
    const [isRead, setIsRead] = useState(read);

    const { setUnreadCount } = useGlobalContext();
    
    const toggleMessageReadAction = async () => {
        const result = await toggleMessageRead(messageId);

        if (result.message) {
            if (result.status === 'SUCCESS') {
                setIsRead(result.isRead!);
                setUnreadCount((prevCount) => (result.isRead ? prevCount - 1 : prevCount + 1))
                toast.success(result.message);
            } else if (result.status === 'ERROR') {
                toast.error(result.message);
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