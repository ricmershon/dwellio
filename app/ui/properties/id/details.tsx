import { FaTimes, FaBed, FaBath, FaRulerCombined, FaCheck, FaMapMarkerAlt } from "react-icons/fa";

import { PropertyInterface } from "@/app/models";
// import PropertyMap from "./PropertyMap";

const PropertyDetails = ({ property }: { property: PropertyInterface }) => {
    const { street, city, state, zipcode } = property.location;
    const { rates } = property;
    
    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">

                {/* Property type, name and location */}
                <div className="text-gray-500 mb-4">{property.type}</div>
                <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                    <FaMapMarkerAlt className="text-orange-700 mr-1 mt-1" />
                    <p className="text-orange-700">
                        {street} {city}, {state} {zipcode}
                    </p>
                </div>

                {/* Property rates and options */}
                <h3 className="text-lg font-bold my-6 bg-gray-800 text-white p-2">
                    Rates & Options
                </h3>
                <div className="flex flex-col md:flex-row justify-around">
                    <div className="flex items-center justify-center mb-4 border-b border-gray-200 md:border-b-0 pb-4 md:pb-0">
                        <div className="text-gray-500 mr-2 font-bold">Nightly</div>
                        <div className="text-2xl font-bold text-blue-500">
                            {rates.nightly ? (
                                `$${rates.nightly.toLocaleString()}`
                            ) : (
                                <FaTimes className="text-red-700"/>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-4 border-b border-gray-200 md:border-b-0 pb-4 md:pb-0">
                        <div className="text-gray-500 mr-2 font-bold">Weekly</div>
                        <div className="text-2xl font-bold text-blue-500">
                            {rates.weekly ? (
                                `$${rates.weekly.toLocaleString()}`
                            ) : (
                                <FaTimes className="text-red-700"/>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-4 pb-4 md:pb-0">
                        <div className="text-gray-500 mr-2 font-bold">Monthly</div>
                        <div className="text-2xl font-bold text-blue-500">
                            {rates.monthly ? (
                                `$${rates.monthly.toLocaleString()}`
                            ) : (
                                <FaTimes className="text-red-700"/>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description and details */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-lg font-bold mb-6">Description & Details</h3>
                <div className="flex justify-center gap-4 text-blue-500 mb-4 text-xl space-x-9">
                    <p>
                        <FaBed className="inline-block mr-2" />
                        {property.beds}{' '}
                        <span className="hidden sm:inline">Beds</span>
                    </p>
                    <p>
                        <FaBath className="inline-block mr-2" />
                        {property.baths}{' '}
                        <span className="hidden sm:inline">Baths</span>
                    </p>
                    <p>
                        <FaRulerCombined className="inline-block mr-2" />
                        {property.square_feet}{' '}
                        <span className="hidden sm:inline">sqft</span>
                    </p>
                </div>
                <p className="text-gray-500 mb-4">
                    {property.description}
                </p>
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-lg font-bold mb-6">Amenities</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 list-none">
                    {property.amenities && (
                        property.amenities.map((amenity) => (
                            <li key={amenity}>
                                <FaCheck className="inline-block text-green-600 mr-2" />
                                <span>{amenity}</span>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Map */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <PropertyMap property={property} />
            </div> */}
        </div>
    );
 }
export default PropertyDetails;