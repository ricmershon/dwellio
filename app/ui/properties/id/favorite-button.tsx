'use client';

import { useEffect, useState } from "react";
import { HeartIcon } from '@heroicons/react/24/solid';
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";

import { favoriteProperty } from "@/app/lib/actions/property-actions";
import { getFavoriteStatus } from "@/app/lib/actions/property-actions";
import { ActionState } from "@/app/types/types";

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
    }, [propertyId]);

    const favoritePropertyAction = async () => {
        try {
            const result: ActionState = await favoriteProperty(propertyId);
            setIsFavorite(result.isFavorite);
            if (result.status && result.status === 'ERROR') {
                toast.error(result.message);
            }
        } catch (error) {
            throw new Error(`Error getting favorite status: ${error}`)
        }
    }

    return (
        <form action={favoritePropertyAction}>
            <button
                className={`btn ${isFavorite ? 'btn-danger' : 'btn-primary'} flex items-center justify-center w-full`}
            >
                {isPending ? (
                    <LuRefreshCw className='btn-pending-icon icon-spin'/>
                ) : (
                    <HeartIcon className="mr-2 size-5" />
                )}
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
        </form>
    );
}
 
export default FavoritePropertyButton;