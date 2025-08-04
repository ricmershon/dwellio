import Image from 'next/image';
import Link from 'next/link';
import {
    FaBed,
    FaBath,
    FaMapMarkerAlt,
} from 'react-icons/fa';

import { PropertyDocument } from '@/app/models';
import { getRateDisplay } from '@/app/utils/get-rate-display';
import PropertyCardFavoriteButton from '@/app/ui/properties/property-card-favorite-button';
import { getSessionUser } from '@/app/utils/get-session-user';
import { toSerializedOjbect } from '@/app/utils/to-serialized-object';

const PropertyCard = async ({ property }: { property: PropertyDocument }) => {
    const sessionUser = await getSessionUser();
    const serializedProperty = toSerializedOjbect(property);

    return (
        <div className='rounded-md shadow-md relative'>

            <Link href={`/properties/${property._id}`}>
                <Image
                    src={property.imagesData![0].secureUrl}
                    alt={property.name}
                    width='0'
                    height='0'
                    sizes='100vw'
                    className='w-full h-auto rounded-t-md'
                />
            </Link>
            <div>
                <div className='text-xs md:text-sm p-[10px]'>
                    <div className="flex justify-between items-center mb-2">
                        <p className='text-gray-700 mr-3'>{property.name}</p>

                        {/* Display favorite button if not owned by user */}
                        {sessionUser && sessionUser.id !== property.owner.toString() && (
                            <PropertyCardFavoriteButton
                                propertyId={serializedProperty._id}
                            />
                        )}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <div className='text-gray-700 text-base'>
                            {getRateDisplay(property.rates)}
                        </div>
                        <div>Rating</div>
                    </div>
                    <Link href={`/properties/${property._id}`}>
                        <div className="flex justify-between items-center text-blue-800 text-[11px]">
                            <div className="flex justify-center items-center gap-1">
                                <FaMapMarkerAlt className='inline text-sm' />
                                <p>{property.location.city}</p>
                            </div>
                            <div className='flex justify-center items-center gap-3'>
                                <p>
                                    <span><FaBed className='inline text-base' /> </span>
                                    {property.beds}
                                    
                                </p>
                                <p>
                                    <span><FaBath className='inline text-base' /> </span>
                                    {property.baths}
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default PropertyCard;