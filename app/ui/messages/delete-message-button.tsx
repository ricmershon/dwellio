'use client';

import { toast } from "react-toastify";

import { useGlobalContext } from "@/app/context/global-context";
import { deleteMessage } from "@/app/lib/actions/message-actions";

const DeleteMessageButton = ({ messageId }: { messageId: string } ) => {
    const { setUnreadCount } = useGlobalContext();
    
    const deleteMessageAction = async () => {
        const result = await deleteMessage(messageId);
        if (result.message) {
            if (result.status === 'SUCCESS') {
                toast.success(result.message);
                setUnreadCount((prevCount) => prevCount - 1);
            } else if (result.status === 'ERROR') {
                toast.error(result.message);
            }
        }
    }
    
    return (
        <form action={deleteMessageAction} className="inline-block">
            <button
                className='flex gap-1 py-[6px] px-3 rounded-md bg-red-500 text-sm text-white transition-colors hover:bg-red-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600 hover:cursor-pointer'
                type="submit"
            >
                Delete
            </button>
        </form>
    );
}
 
export default DeleteMessageButton;