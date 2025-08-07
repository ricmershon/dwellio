import { FaTimes, FaCheck, FaMapMarkerAlt } from "react-icons/fa";

import { PropertyDocument } from "@/app/models";
// import PropertyMap from "./PropertyMap";

const PropertyDetails = ({ property }: { property: PropertyDocument }) => {
    const { street, city, state, zipcode } = property.location;
    const { rates } = property;
    
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

            {/* Property description */}
            <p className="pb-4 mb-4 border-b border-gray-200">{property.description}</p>


            {/* Amenities */}
            <div className="pb-4 mb-4 border-b border-gray-200">
                <h3>Amenities</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-xs list-none">
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

            {/* <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                <FaMapMarkerAlt className="text-orange-700 mr-1 mt-1" />
                <p className="text-orange-700">
                    {street} {city}, {state} {zipcode}
                </p>
            </div> */}

            {/* Property rates and options */}
            <div className='pb-4 border-b border-gray-200'>
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
            {/* <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <PropertyMap property={property} />
            </div> */}
        </div>
    );
 }
export default PropertyDetails;