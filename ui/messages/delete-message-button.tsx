"use client";

import { toast } from "react-toastify";

import { useGlobalContext } from "@/context/global-context";
import { deleteMessage } from "@/lib/actions/message-actions";
import { ActionStatus } from "@/types";

const DeleteMessageButton = ({ messageId }: { messageId: string } ) => {
    const { setUnreadCount } = useGlobalContext();
    
    const deleteMessageAction = async () => {
        const result = await deleteMessage(messageId);
        if (result.message && result.status) {
            toast[result.status](result.message);
            if (result.status === ActionStatus.SUCCESS) {
                setUnreadCount((prevCount) => prevCount - 1);
            }
        }
    }
    
    return (
        <form action={deleteMessageAction} className="inline-block">
            <button
                className="btn btn-danger"
                type="submit"
            >
                Delete
            </button>
        </form>
    );
}
 
export default DeleteMessageButton;