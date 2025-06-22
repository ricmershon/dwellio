'use client';

import { FaBookmark } from "react-icons/fa";
import { toast } from "react-toastify";

import { bookmarkProperty } from "@/app/lib/actions";

const BookmarkPropertyButton = ({ propertyId }: { propertyId: string }) => {
    const bookmarkPropertyById = bookmarkProperty.bind(null, propertyId);

    const bookmarkPropertyAction = async () => {
        const result = await bookmarkPropertyById();
        if (result.message) {
            if (result.status === 'SUCCESS') {
                toast.success(result.message, { position: 'bottom-right' });
            } else if (result.status === 'ERROR') {
                toast.error(result.message, { position: 'bottom-right' });
            }
        }
    }

    return (
        <form action={bookmarkPropertyAction}>
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"
            >
                <FaBookmark className="mr-2" />Bookmark Property
            </button>
        </form>
    );
}
 
export default BookmarkPropertyButton;