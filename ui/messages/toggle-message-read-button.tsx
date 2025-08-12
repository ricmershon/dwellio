'use client';

import { useState } from "react";
import { toast } from "react-toastify";

import { useGlobalContext } from "@/context/global-context";
import { toggleMessageRead } from "@/lib/actions/message-actions";
import { ActionStatus } from "@/types/types";

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
            if (result.status === ActionStatus.SUCCESS) {
                setIsRead(result.isRead!);
                setUnreadCount((prevCount) => (result.isRead ? prevCount - 1 : prevCount + 1));
            } else if (result.status === ActionStatus.ERROR) {
                toast.error(result.message);
            }
        }
    }
    
    return (
        <form action={toggleMessageReadAction} className="inline-block">
            <button
                className="btn btn-primary mt-4 mr-2"
                type="submit"
            >
                {isRead ? 'Mark as Unread' : 'Mark as Read'}
            </button>
        </form>
    );
}
 
export default ToggleMessageReadButton;