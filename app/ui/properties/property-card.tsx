import Image from 'next/image';
import Link from 'next/link';
import {
    FaBed,
    FaBath,
    FaRulerCombined,
    FaMoneyBill,
    // FaMapMarkerAlt,
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
            {/* Don't display favorite button if user logged in and not current user */}
            {sessionUser && sessionUser.id !== property.owner.toString() && (
                <PropertyCardFavoriteButton
                    propertyId={serializedProperty._id}
                />
            )}
            <Link href={`/properties/${property._id}`}>
                <Image
                    src={property.imagesData![0].secureUrl}
                    alt={property.name}
                    width='0'
                    height='0'
                    sizes='100vw'
                    className='w-full h-auto rounded-t-md'
                />
                <div className='p-4 text-gray-500 text-xs md:text-sm'>
                    <h3 className='absolute top-[10px] left-[10px] bg-white px-1 py-[2px] rounded-md text-gray-500 text-left md:text-center lg:text-right'>
                        {getRateDisplay(property.rates)}
                    </h3>
                    <div className='flex justify-center gap-2 mb-2'>
                        <p>
                            {property.beds}{' '}
                            <span><FaBed className='inline' /></span>
                            
                        </p>
                        <p>
                            {property.baths}{' '}
                            <span><FaBath className='inline' /></span>
                        </p>
                                            <p>
                            {property.squareFeet}{' '}
                            <span><FaRulerCombined className='inline' /></span>
                        </p>

                    </div>
                    <div className='flex justify-center gap-4'>
                        <p>
                            <FaMoneyBill className='text-green-900 inline' /> Weekly
                        </p>
                        <p>
                            <FaMoneyBill className='text-green-900 inline' /> Monthly
                        </p>
                    </div>

                    <div className='border border-gray-100 my-4'></div>
                    <p className='font-semibold text-gray-700 text-center'>{property.type} in {property.location.city}</p>
                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;