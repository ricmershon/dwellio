'use client';

import { toast } from "react-toastify";

import { deleteProperty } from "@/app/lib/actions/property-actions";

const DeleteMessageButton = ({ messageId }: { messageId: string } ) => {
    const deleteMessageWithId = deleteProperty.bind(null, messageId);
    
    const deleteMessageAction = async () => {
        const result = await deleteMessageWithId();
        if (result.message) {
            if (result.status === 'SUCCESS') {
                toast.success(result.message, { position: 'bottom-right' });
            } else if (result.status === 'ERROR') {
                toast.error(result.message, { position: 'bottom-right' });
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