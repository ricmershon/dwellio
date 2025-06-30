'use client';

import { toast } from "react-toastify";

import { deleteMessage } from "@/app/lib/actions/message-actions";

const DeleteMessageButton = ({ messageId }: { messageId: string } ) => {
    
    const deleteMessageAction = async () => {
        const result = await deleteMessage(messageId);
        if (result.message) {
            if (result.status === 'SUCCESS') {
                toast.success(result.message);
            } else if (result.status === 'ERROR') {
                toast.error(result.message);
            }
        }
    }
    
    return (
        <form action={deleteMessageAction} className="inline-block">
            <button
                className="mt-4 mr-3 bg-red-500 text-white py-1 px-3 rounded-md"
                type="submit"
            >
                Delete
            </button>
        </form>
    );
}
 
export default DeleteMessageButton;