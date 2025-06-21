/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useActionState } from "react";

import { Amenities } from "../data/data";

import { ActionState, PropertyInterfaceWithId } from "@/app/lib/definitions";
import { updateProperty } from "@/app/lib/actions";


const EditPropertyForm = ({ property }: { property: PropertyInterfaceWithId }) => {
    const initialState: ActionState = { message: null, status: null };
    const updatePropertyById = updateProperty.bind(null, property._id.toString());
    const [_state, formAction] = useActionState(updatePropertyById, initialState);

    const { street, city, state, zipcode } = property.location;
    const { weekly, monthly, nightly } = property.rates;
    const { name, email, phone } = property.seller_info;

    return (
        <form action={formAction}>
            <h2 className="text-3xl text-center font-semibold mb-6">
                Edit Property
            </h2>

            {/* Property type */}
            <div className="mb-4">
                <label
                    htmlFor="type"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Property Type
                </label>
                <select
                    id="type"
                    name="type"
                    className="border rounded w-full py-2 px-3"
                    defaultValue={property.type}
                    required
                >
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="House">House</option>
                    <option value="CabinOrCottage">Cabin or Cottage</option>
                    <option value="Room">Room</option>
                    <option value="Studio">Studio</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Listing name */}
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Listing Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="border rounded w-full py-2 px-3 mb-2"
                    placeholder="eg. Beautiful Apartment In Miami"
                    defaultValue={property.name}
                    required
                />
            </div>

            {/* Description */}
            <div className="mb-4">
                <label
                    htmlFor="description"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    className="border rounded w-full py-2 px-3"
                    rows={4}
                    placeholder="Add an optional description of your property"
                    defaultValue={property.description}
                />
            </div>

            {/* Location */}
            <div className="mb-4 bg-blue-50 p-4">
                <label className="block text-gray-700 font-bold mb-2">Location</label>
                <input
                    type="text"
                    id="street"
                    name="location.street"
                    className="border rounded w-full py-2 px-3 mb-2"
                    placeholder="Street"
                    defaultValue={street}
                />
                <input
                    type="text"
                    id="city"
                    name="location.city"
                    className="border rounded w-full py-2 px-3 mb-2"
                    placeholder="City"
                    defaultValue={city}
                    required
                />
                <input
                    type="text"
                    id="state"
                    name="location.state"
                    className="border rounded w-full py-2 px-3 mb-2"
                    placeholder="State"
                    defaultValue={state}
                    required
                />
                <input
                    type="text"
                    id="zipcode"
                    name="location.zipcode"
                    className="border rounded w-full py-2 px-3 mb-2"
                    defaultValue={zipcode}
                    placeholder="Zipcode"
                />
            </div>

            {/* Number of beds and baths, and square feet */}
            <div className="mb-4 flex flex-wrap">
                <div className="w-full sm:w-1/3 pr-2">
                    <label
                        htmlFor="beds"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Beds
                    </label>
                    <input
                        type="number"
                        id="beds"
                        name="beds"
                        className="border rounded w-full py-2 px-3"
                        defaultValue={property.beds}
                        required
                    />
                </div>
                <div className="w-full sm:w-1/3 px-2">
                    <label
                        htmlFor="baths"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Baths
                    </label>
                        <input
                        type="number"
                        id="baths"
                        name="baths"
                        className="border rounded w-full py-2 px-3"
                        defaultValue={property.baths}
                        required
                        />
                    </div>
                <div className="w-full sm:w-1/3 pl-2">
                    <label
                        htmlFor="square_feet"
                        className="block text-gray-700 font-bold mb-2"
                    >
                        Square Feet
                    </label>
                    <input
                        type="number"
                        id="square_feet"
                        name="square_feet"
                        className="border rounded w-full py-2 px-3"
                        defaultValue={property.square_feet}
                        required
                    />
                </div>
            </div>

            {/* Amenitites */}
            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                    Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Amenities.map((amenity) => (
                        <div key={amenity.id}>
                            <input
                                type="checkbox"
                                id={`amenity_${amenity.id}`}
                                name="amenities"
                                value={amenity.value}
                                className='mr-2'
                                defaultChecked={property.amenities?.includes(amenity.value)}
                            />
                            <label htmlFor={`amenity_${amenity.id}`}>{amenity.value}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rates */}
            <div className="mb-4 bg-blue-50 p-4">
                <label className="block text-gray-700 font-bold mb-2">
                    Rates (Leave blank if not applicable)
                </label>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                        <label htmlFor="weekly_rate" className="mr-2">Weekly</label>
                        <input
                            type="number"
                            id="weekly_rate"
                            name="rates.weekly"
                            className="border rounded w-full py-2 px-3"
                            defaultValue={weekly}
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="monthly_rate" className="mr-2">Monthly</label>
                        <input
                            type="number"
                            id="monthly_rate"
                            name="rates.monthly"
                            className="border rounded w-full py-2 px-3"
                            defaultValue={monthly}
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="nightly_rate" className="mr-2">Nightly</label>
                        <input
                            type="number"
                            id="nightly_rate"
                            name="rates.nightly"
                            className="border rounded w-full py-2 px-3"
                            defaultValue={nightly}
                        />
                    </div>
                </div>
            </div>

            {/* Renter info */}
            <div className="mb-4">
                <label
                    htmlFor="seller_name"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Renter Name
                </label>
                <input
                    type="text"
                    id="seller_name"
                    name="seller_info.name"
                    className="border rounded w-full py-2 px-3"
                    placeholder="Name"
                    defaultValue={name}
                />
            </div>
            <div className="mb-4">
                <label
                    htmlFor="seller_email"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Renter Email
                </label>
                <input
                    type="email"
                    id="seller_email"
                    name="seller_info.email"
                    className="border rounded w-full py-2 px-3"
                    placeholder="Email address"
                    defaultValue={email}
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    htmlFor="seller_phone"
                    className="block text-gray-700 font-bold mb-2"
                >
                    Renter Phone
                </label>
                <input
                    type="tel"
                    id="seller_phone"
                    name="seller_info.phone"
                    className="border rounded w-full py-2 px-3"
                    pattern='[0-9]{10}'
                    placeholder="1234567890"
                    defaultValue={phone}
                />
            </div>

            {/* Add property button */}
            <div>
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline cursor-pointer"
                    type="submit"
                >
                    Update Property
                </button>
            </div>
        </form>
    );
}
 
export default EditPropertyForm;