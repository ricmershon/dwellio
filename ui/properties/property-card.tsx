import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt } from 'react-icons/fa';

import PropertyFavoriteButton from '@/ui/properties/shared/form/property-favorite-button';
import { PropertyDocument } from '@/models';
import { getRateDisplay } from '@/utils/get-rate-display';
import { getSessionUser } from '@/utils/get-session-user';
import { toSerializedOjbect } from '@/utils/to-serialized-object';
import { isWithinLastThreeDays } from '@/utils/is-within-last-three-days';

// FIXME: Make PropertyFavoriteButton accept initialIsFavorite and remove its mount-time fetch; lazy-load it.
const PropertyCard = async ({ property }: { property: PropertyDocument }) => {
    const sessionUser = await getSessionUser();
    const serializedProperty = toSerializedOjbect(property);

    const isCreatedWithinLastWeek = isWithinLastThreeDays(property.createdAt);
    const isUpdatedWithinLastWeek = !isCreatedWithinLastWeek
        && isWithinLastThreeDays(property.updatedAt);

    return (
        <div className='rounded-md shadow-md relative'>
            <Link href={`/properties/${property._id}`}>
                <div className="w-full aspect-[4/3] relative rounded-t-md overflow-hidden">
                    <Image
                        src={property.imagesData![0].secureUrl}
                        alt={property.name}
                        fill
                        sizes='100vw'
                        className="object-cover rounded-t-md"
                        priority
                    />
                </div>
                {/* Recently created or added */}
                {(isCreatedWithinLastWeek || isUpdatedWithinLastWeek) && (
                    <p className='absolute top-[6px] left-[6px] bg-white px-3 py-1 rounded-md text-gray-800 text-xs text-center'>
                        {isCreatedWithinLastWeek ? 'Recently Added' : 'Recently Updated'}
                    </p>
                )}
            </Link>

            <div className='text-xs md:text-sm p-[10px]'>
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/properties/${property._id}`}>
                        <p className='text-gray-700 mr-3'>{property.name}</p>
                    </Link>

                    {/* Display favorite button if logged in and not owned by user */}
                    {sessionUser && sessionUser.id !== property.owner.toString() && (
                        <PropertyFavoriteButton propertyId={serializedProperty._id} />
                    )}
                </div>
                <Link href={`/properties/${property._id}`}>
                <div className="flex justify-between items-center mb-2">
                    <div className='text-gray-700 text-base'>
                        {getRateDisplay(property.rates)}
                    </div>
                    {/* <div>Rating</div> */}
                </div>
                    <div className="flex justify-between items-center text-blue-800 text-[11px]">
                        <div className="flex justify-center items-center gap-1">
                            <FaMapMarkerAlt className='inline text-sm' />
                            <p>{property.location.city}</p>
                        </div>
                        <div className='flex justify-between items-center gap-3'>
                            <p>
                                <span className='mr-1'>
                                    {property.beds}
                                    {property.beds === 1 ? ' Bed': ' Beds'}
                                </span>
                                <span>
                                    {property.baths}
                                    {property.baths === 1 ? ' Bath': ' Baths'}
                                </span>
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;