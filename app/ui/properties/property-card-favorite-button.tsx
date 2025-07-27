'use client';

import { useEffect, useState } from "react";
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { toast } from "react-toastify";

import { favoriteProperty } from "@/app/lib/actions/property-actions";
import { getFavoriteStatus } from "@/app/lib/actions/property-actions";
import { ActionState } from "@/app/types/types";

const PropertyCardFavoriteButton = ({ propertyId }: { propertyId: string }) => {
    const [isFavorite, setIsFavorite] = useState<boolean | undefined>(false);

    useEffect(() => {
        getFavoriteStatus(propertyId as string).then((response) => {
            if (response.status === 'SUCCESS') {
                if (response.isFavorite) {
                    setIsFavorite(true);
                } else {
                    setIsFavorite(false);
                }
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
        } catch (error) {
            throw new Error(`Error getting favorite status: ${error}`)
        }
    }

    return (
        <>
            <form action={favoritePropertyAction}>
                <button className="absolute top-[10px] right-[10px] size-6 hover:cursor-pointer">
                    {isFavorite ? (
                        <HeartSolidIcon className='text-red-600' />
                    ) : (
                        <HeartOutlineIcon className='text-white heroicon-opacity' />
                    )}
                </button>
            </form>
        </>
    );
}
 
export default PropertyCardFavoriteButton;