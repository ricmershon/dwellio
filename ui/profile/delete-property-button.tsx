"use client";

import { toast } from "react-toastify";

import { deleteProperty } from "@/lib/actions/property-actions";

const DeletePropertyButton = ({ propertyId }: { propertyId: string }) => {
    const deletePropertyById = deleteProperty.bind(null, propertyId);
    
    const deletePropertyAction = async () => {
        const result = await deletePropertyById();
        if (result.message && result.status) {
            toast[result.status](result.message);
        }
    }
    
    return (
        <form action={deletePropertyAction} className="inline-block">
            <button
                className="btn btn-danger"
                type="submit"
            >
                Delete
            </button>
        </form>
    );
}
 
export default DeletePropertyButton;