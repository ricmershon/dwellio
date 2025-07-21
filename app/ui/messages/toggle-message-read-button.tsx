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
                className="flex gap-1 py-[6px] px-3 mt-4 mr-3 rounded-md bg-blue-500 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 hover:cursor-pointer"
                type="submit"
            >
                {isRead ? 'Mark as Unread' : 'Mark as Read'}
            </button>
        </form>
    );
}
 
export default ToggleMessageReadButton;