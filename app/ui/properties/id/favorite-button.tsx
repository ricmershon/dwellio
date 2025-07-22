'use client';

import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";

import { favoriteProperty } from "@/app/lib/actions/property-actions";
import { getFavoriteStatus } from "@/app/lib/actions/property-actions";
import { ActionState } from "@/app/lib/definitions";

const FavoritePropertyButton = ({ propertyId }: { propertyId: string }) => {
    const [isFavorite, setIsFavorite] = useState<boolean | undefined>(false);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        getFavoriteStatus(propertyId).then((response) => {
            if (response.status === 'SUCCESS') {
                if (response.isFavorite) {
                    setIsFavorite(true);
                } else {
                    setIsFavorite(false);
                }
                setIsPending(false);
            } else {
                toast.error(response.message);
            }
        })
        .catch((error) => {
            throw new Error(`Error getting favorite status: ${error}`)
        })
    }, [propertyId])

    const favoritePropertyAction = async () => {
        try {
            const result: ActionState = await favoriteProperty(propertyId);
            setIsFavorite(result.isFavorite);
            if (result.message) {
                if (result.status === 'SUCCESS') {
                    toast.success(result.message);
                } else if (result.status === 'ERROR') {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            throw new Error(`Error getting favorite status: ${error}`)
        }
    }

    return (
        <>
            {isPending ? (
                <p className="text-center">Loading favorite status...</p>
            ) : (
                <form action={favoritePropertyAction}>
                    {isFavorite ? (
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"
                        >
                            <FaHeart className="mr-2" />
                            Remove from Favorites
                        </button>

                    ) : (
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"
                        >
                            <FaHeart className="mr-2" />
                            Add to Favorites
                        </button>
                    )}
                </form>
            )}
        </>
    );
}
 
export default FavoritePropertyButton;