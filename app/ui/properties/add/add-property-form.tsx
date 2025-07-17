'use client';

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";

import { createProperty } from "@/app/lib/actions/property-actions"
import { Amenities, PropertyTypes } from "@/app/data/data";
import Input from "@/app/ui/shared/input";
import DwellioSelect from "@/app/ui/shared/select";
import { ActionState } from "@/app/lib/definitions";


// TODO: Google address component
const AddPropertyForm = () => {
    const [actionState, formAction, isPending] = useActionState(createProperty, {} as ActionState);

    /**
     * Display error message if the `createProperty` returns an `ERROR` status.
     */
    useEffect(() => {
        if (actionState.status === 'ERROR') {
            toast.error(actionState.message);
        }
    }, [actionState.message, actionState.status]);

    return (
        <form action={formAction}>
            <div className=" rounded-md bg-gray-50 p-4 md:p-6">

                {/* Property type */}
                <div className="mb-4">
                    <label
                        htmlFor="type"
                        className="mb-2 block font-medium text-gray-700"
                    >
                        Property Type
                    </label>
                    <DwellioSelect
                        options={PropertyTypes}
                        placeholder="Select a property type"
                        name='type'
                        id='type'
                    />
                </div>

                {/* Listing name */}
                <Input
                    inputType="input"
                    id='name'
                    name="name"
                    type='text'
                    label="Listing Name"
                    placeholder="e.g., Beautiful Apartment in Miami"
                    defaultValue={(actionState.formData?.get("name") || "") as string}
                />

                {/* Description */}
                <Input
                    inputType="textarea"
                    id='description'
                    name="description"
                    label="Description"
                    placeholder="Add an optional description of your property"
                    defaultValue={(actionState.formData?.get("description") || "") as string}
                />

                {/* Location */}
                <Input
                    inputType="input"
                    id='street'
                    name="location.street"
                    type='text'
                    label="Location"
                    placeholder="Street"
                    isInGroup={true}
                    defaultValue={(actionState.formData?.get("location.street") || "") as string}
                />
                <Input
                    inputType="input"
                    id='city'
                    name="location.city"
                    type='text'
                    placeholder="City"
                    isInGroup={true}
                    defaultValue={(actionState.formData?.get("location.city") || "") as string}
                />
                <Input
                    inputType="input"
                    id='state'
                    name="location.state"
                    type='text'
                    placeholder="State"
                    isInGroup={true}
                    defaultValue={(actionState.formData?.get("location.state") || "") as string}
                />
                <Input
                    inputType="input"
                    id='zipcode'
                    name="location.zipcode"
                    type='text'
                    placeholder="Zip Code"
                    defaultValue={(actionState.formData?.get("location.zipcode") || "") as string}
                />

                {/* Number of beds and baths, and square feet */}
                <div className="mb-4 flex flex-wrap">
                    <div className="w-full sm:w-1/3 sm:pr-2 mb-2 sm:mb-0">
                        <label
                            htmlFor="beds"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Beds
                        </label>
                        <input
                            type="number"
                            id="beds"
                            name="beds"
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                            defaultValue={(actionState.formData?.get("beds") || "") as string}
                            required
                        />
                    </div>
                    <div className="w-full sm:w-1/3 sm:px-2 mb-2 sm:mb-0">
                        <label
                            htmlFor="baths" 
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Baths
                        </label>
                            <input
                                type="number"
                                id="baths"
                                name="baths"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("baths") || "") as string}
                                required
                            />
                        </div>
                    <div className="w-full sm:w-1/3 sm:pl-2">
                        <label
                            htmlFor="squareFeet"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Square Feet
                        </label>
                        <input
                            type="number"
                            id="squareFeet"
                            name="squareFeet"
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                            defaultValue={(actionState.formData?.get("squareFeet") || "") as string}
                            required
                        />
                    </div>
                </div>

                {/* Amenitites */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
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
                                    defaultChecked={actionState.formData?.getAll('amenities').includes(amenity.value)}
                                />
                                <label
                                    htmlFor={`amenity_${amenity.id}`}
                                    className="text-sm font-medium text-gray-700"
                                >
                                    {amenity.value}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rates */}
                <div className="mb-4">
                    <label className="mb-2 block font-medium text-gray-700">
                        Rates (Leave blank if not applicable)
                    </label>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center">
                            <label htmlFor="weekly_rate" className="text-sm font-medium text-gray-700 mr-2">Weekly</label>
                            <input
                                type="number"
                                id="weekly_rate"
                                name="rates.weekly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.weekly") || "") as string}
                            />
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="monthly_rate" className="text-sm font-medium text-gray-700 mr-2">Monthly</label>
                            <input
                                type="number"
                                id="monthly_rate"
                                name="rates.monthly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.monthly") || "") as string}
                            />
                        </div>
                        <div className="flex items-center">
                            <label htmlFor="nightly_rate" className="text-sm font-medium text-gray-700 mr-2">Nightly</label>
                            <input
                                type="number"
                                id="nightly_rate"
                                name="rates.nightly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.nightly") || "") as string}
                            />
                        </div>
                    </div>
                </div>

                {/* Renter info */}
                <Input
                    inputType="input"
                    id='seller_name'
                    name="sellerInfo.name"
                    type='text'
                    placeholder="Name"
                    label="Renter Name"
                    defaultValue={(actionState.formData?.get("sellerInfo.name") || "") as string}
                />
               <Input
                    inputType="input"
                    id='seller_email'
                    name="sellerInfo.email"
                    type='email'
                    placeholder="Email address"
                    label="Renter Email"
                    defaultValue={(actionState.formData?.get("sellerInfo.email") || "") as string}
                />
               <Input
                    inputType="input"
                    id='seller_phone'
                    name="sellerInfo.phone"
                    type='tel'
                    label="Renter Phone"
                    placeholder='Phone'
                    defaultValue={(actionState.formData?.get("sellerInfo.phone") || "") as string}
                />

                {/* Select images */}
                <div>
                    <label htmlFor="images" className="mb-2 block font-medium text-gray-700">
                        Images (Select up to 4 images)
                    </label>
                    <input
                        type="file"
                        id="images"
                        name="images"
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                        accept="image/*"
                        multiple
                        required
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/properties"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <button
                    className="flex gap-1 h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 hover:cursor-pointer"
                    type="submit"
                >
                    {isPending && <LuRefreshCw className='text-lg icon-spin'/>}
                    <span>Save Property</span>
                </button>
            </div>
        </form>
    );
}
 
export default AddPropertyForm;