'use client';

import { useEffect, useState } from "react";
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { toast } from "react-toastify";

import { favoriteProperty } from "@/lib/actions/property-actions";
import { getFavoriteStatus } from "@/lib/actions/property-actions";

const PropertyFavoriteButton = ({ propertyId }: { propertyId: string }) => {
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
            const result = await favoriteProperty(propertyId);
            setIsFavorite(result.isFavorite);
        } catch (error) {
            throw new Error(`Error getting favorite status: ${error}`)
        }
    }

    return (
        <>
            <form action={favoritePropertyAction} className="size-[18px]">
                <button className="size-4 hover:cursor-pointer">
                    {isFavorite ? (
                        <HeartSolidIcon className='text-red-600' />
                    ) : (
                        <HeartOutlineIcon className='text-gray-600' />
                    )}
                </button>
            </form>
        </>
    );
}
 
export default PropertyFavoriteButton;