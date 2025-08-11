import { FaCheck } from "react-icons/fa";

import { PropertyDocument } from "@/app/models";
import { getSessionUser } from "@/app/utils/get-session-user";
// import PropertyMap from "@/app/ui/properties/id/map";

const PropertyDetails = async ({ property }: { property: PropertyDocument }) => {
    const { rates } = property;
    const sessionUser = await getSessionUser();

    const sessionUserId: string | null = sessionUser && sessionUser.id
        ? sessionUser.id.toString()
        : null;
    
    return (
        <div>
            {/* Property name, city, beds, baths and sqft */}
            <h1 className="text-xl">{property.name} in {property.location.city}</h1>
            <p className="text-sm mb-4">
                {property.beds} beds
                <span className="text-[10px]"> • </span>
                {property.baths} baths
                <span className="text-[10px]"> • </span>
                {property.squareFeet} square feet
            </p>

            {/* Property description and host/owner */}
            <p className="mb-4">{property.description}</p>
            <p className="pb-4 mb-4 border-b border-gray-200 font-bold">
                {`${property.owner.toString() === sessionUserId
                    ? "You own this property"
                    : `Hosted by ${property.sellerInfo.name}`
                }`}
            </p>


            {/* Amenities */}
            <div className="pb-4 mb-4 border-b border-gray-200">
                <h3>Amenities</h3>
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 text-xs list-none">
                    {property.amenities && (
                        property.amenities.map((amenity) => (
                            <li className='mt-2' key={amenity}>
                                <FaCheck className="inline-block text-green-600 mr-2 mb-2" />
                                <span>{amenity}</span>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Property rates and options */}
            <div className='pb-4 mb-4 border-b border-gray-200'>
                <h3 className="mb-2">Rates</h3>
                <div className="flex flex-col md:flex-row justify-start items-start">
                    {rates.nightly && (
                        <div className="flex items-center justify-center mb-2 md:pb-0 md:mr-4">
                            <div className="mr-1 text-sm">{`$${rates.nightly.toLocaleString()}`}</div>
                            <div className="text-gray-500 text-xs">nightly</div>
                        </div>
                    )}

                    {rates.weekly && (
                        <div className="flex items-center justify-center mb-2 md:pb-0 md:mr-4">
                            <div className="mr-1 text-sm">{`$${rates.weekly.toLocaleString()}`}</div>
                            <div className="text-gray-500 text-xs">weekly</div>
                        </div>
                    )}

                    {rates.monthly && (
                        <div className="flex items-center justify-center mb-2 md:pb-0">
                            <div className="mr-1 text-sm">{`$${rates.monthly.toLocaleString()}`}</div>
                            <div className="text-gray-500 text-xs">monthly</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            {/* <div className="bg-white p-4 rounded-md shadow-md">
                <PropertyMap property={property} />
            </div> */}
        </div>
    );
 }
export default PropertyDetails;