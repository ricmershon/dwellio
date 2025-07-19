'use client';

import { useEffect, useState } from "react";
import { FaBookmark } from "react-icons/fa";
import { toast } from "react-toastify";

import { bookmarkProperty } from "@/app/lib/actions/property-actions";
import { getBookmarkStatus } from "@/app/lib/actions/property-actions";
import { ActionState } from "@/app/lib/definitions";

const BookmarkPropertyButton = ({ propertyId }: { propertyId: string }) => {
    const [isBookmarked, setIsBookmarked] = useState<boolean | undefined>(false);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        const getStatus = async () => {
            try {
                const response: ActionState = await getBookmarkStatus(propertyId)
                if (response.status === 'SUCCESS') {
                    if (response.isBookmarked) {
                        setIsBookmarked(true);
                    } else {
                        setIsBookmarked(false);
                    }
                    setIsPending(false);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                throw new Error(`Error getting bookmark status: ${error}`)
            }
        }

        getStatus();
    }, [propertyId])

    const bookmarkPropertyById = bookmarkProperty.bind(null, propertyId);

    const bookmarkPropertyAction = async () => {
        try {
            const result: ActionState = await bookmarkPropertyById();
            setIsBookmarked(result.isBookmarked);
            if (result.message) {
                if (result.status === 'SUCCESS') {
                    toast.success(result.message);
                } else if (result.status === 'ERROR') {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            throw new Error(`Error getting bookmark status: ${error}`)
        }
    }

    return (
        <>
            {isPending ? (
                <p className="text-center">Loading bookmark status...</p>
            ) : (
                <form action={bookmarkPropertyAction}>
                    {isBookmarked ? (
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"
                        >
                            <FaBookmark className="mr-2" />
                            Remove Bookmark
                        </button>

                    ) : (
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"
                        >
                            <FaBookmark className="mr-2" />
                            Bookmark Property
                        </button>
                    )}
                </form>
            )}
        </>
    );
}
 
export default BookmarkPropertyButton;