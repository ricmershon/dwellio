import { FaCheck } from "react-icons/fa";

import { PropertyDocument } from "@/models";
import { getSessionUser } from "@/utils/get-session-user";
import PropertyMap from "@/ui/properties/id/map";
import { getViewportWidth } from "@/utils/get-viewport-width";

const PropertyDetails = async ({ property }: { property: PropertyDocument }) => {
    const { rates } = property;
    const sessionUser = await getSessionUser();

    const sessionUserId: string | null = sessionUser && sessionUser.id
        ? sessionUser.id.toString()
        : null;

    const viewportWidth = await getViewportWidth();
    
    return (
        <div>
            {/* Property name, city, beds, baths and sqft */}
            <h1 className="text-xl">{property.name} in {property.location.city}</h1>
            <p className="text-sm mb-4">
                {property.beds}
                {property.beds === 1 ? " bed": " beds"}
                <span className="text-[10px]"> • </span>
                {property.baths}
                {property.baths === 1 ? " bath": " baths"}
                <span className="text-[10px]"> • </span>
                {property.squareFeet} square feet
            </p>

            {/* Property description and host/owner */}
            <p className="mb-4">{property.description}</p>
            <div className="mb-4 pb-4 border-b border-gray-200">
                <h1 className="text-lg">
                    {`${property.owner.toString() === sessionUserId
                        ? "You own this property"
                        : `Hosted by ${property.sellerInfo.name}`
                    }`}
                </h1>
                {property.owner.toString() !== sessionUserId && (
                    <p className="text-sm">
                        {property.sellerInfo.email}
                        <span className="text-[10px]"> • </span>
                        {property.sellerInfo.phone}
                    </p>
                )}
            </div>


            {/* Amenities */}
            <div className="pb-4 mb-4 border-b border-gray-200">
                <h3>Amenities</h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 text-xs list-none">
                    {property.amenities && (
                        property.amenities.map((amenity) => (
                            <li className="mt-2" key={amenity}>
                                <FaCheck className="inline-block text-green-600 mr-2 mb-2" />
                                <span>{amenity}</span>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Property rates and options */}
            <div className="pb-4 mb-6 border-b border-gray-200">
                <h3 className="mb-2">Rates</h3>
                <div className="flex flex-col sm:flex-row justify-start items-start">
                    {rates.nightly && (
                        <div className="flex items-center justify-center mb-2 sm:mr-4">
                            <div className="mr-1 text-sm">{`$${rates.nightly.toLocaleString()}`}</div>
                            <div className="text-gray-500 text-xs">nightly</div>
                        </div>
                    )}

                    {rates.weekly && (
                        <div className="flex items-center justify-center mb-2 sm:mr-4">
                            <div className="mr-1 text-sm">{`$${rates.weekly.toLocaleString()}`}</div>
                            <div className="text-gray-500 text-xs">weekly</div>
                        </div>
                    )}

                    {rates.monthly && (
                        <div className="flex items-center justify-center">
                            <div className="mr-1 text-sm">{`$${rates.monthly.toLocaleString()}`}</div>
                            <div className="text-gray-500 text-xs">monthly</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="p-4 rounded-md shadow-md">
                <PropertyMap
                    property={property}
                    viewportWidth={viewportWidth}
                />
            </div>
        </div>
    );
 }
export default PropertyDetails;