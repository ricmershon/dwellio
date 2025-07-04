'use client';

import { toast } from "react-toastify";

import { deleteProperty } from "@/app/lib/actions/property-actions";

// TODO: bind required?
const DeletePropertyButton = ({ propertyId }: { propertyId: string }) => {
    const deletePropertyById = deleteProperty.bind(null, propertyId);
    
    const deletePropertyAction = async () => {
        const result = await deletePropertyById();
        if (result.message) {
            if (result.status === 'SUCCESS') {
                toast.success(result.message);
            } else if (result.status === 'ERROR') {
                toast.error(result.message);
            }
        }
    }
    
    return (
        <form action={deletePropertyAction} className="inline-block">
            <button
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 cursor-pointer"
                type="submit"
            >
                Delete
            </button>
        </form>
    );
}
 
export default DeletePropertyButton;