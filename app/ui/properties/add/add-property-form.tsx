'use client';

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";

import { createProperty } from "@/app/lib/actions/property-actions"
import { Amenities, PropertyTypes } from "@/app/data/data";
import Input from "@/app/ui/shared/input";
import FormErrors from "@/app/ui/shared/form-errors";
import DwellioSelect from "@/app/ui/shared/select";
import { ActionState } from "@/app/types/definitions";

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
            <div className="rounded-md bg-gray-50 p-4 md:p-6">

                {/* Property type */}
                <div className="mb-4">
                    <label
                        id="type"
                        className="mb-2 block font-medium text-gray-700"
                    >
                        Property Type
                    </label>
                    <DwellioSelect
                        options={PropertyTypes}
                        placeholder="Select a property type"
                        name='type'
                        id='type'
                        aria-describedby='type-error'
                        aria-labelledby="type"
                    />
                    {actionState.formErrorMap?.type && <FormErrors
                        errors={actionState.formErrorMap.type}
                        id="type"
                    />}
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
                    errors={actionState.formErrorMap?.name}
                />

                {/* Description */}
                <Input
                    inputType="textarea"
                    id='description'
                    name="description"
                    label="Description"
                    placeholder="Add an optional description of your property"
                    defaultValue={(actionState.formData?.get("description") || "") as string}
                    errors={actionState.formErrorMap?.description}
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
                    errors={actionState.formErrorMap?.location?.street}
                />
                <Input
                    inputType="input"
                    id='city'
                    name="location.city"
                    type='text'
                    placeholder="City"
                    isInGroup={true}
                    defaultValue={(actionState.formData?.get("location.city") || "") as string}
                    errors={actionState.formErrorMap?.location?.city}
                />
                <Input
                    inputType="input"
                    id='state'
                    name="location.state"
                    type='text'
                    placeholder="State"
                    isInGroup={true}
                    defaultValue={(actionState.formData?.get("location.state") || "") as string}
                    errors={actionState.formErrorMap?.location?.state}
                />
                <Input
                    inputType="input"
                    id='zipcode'
                    name="location.zipcode"
                    type='text'
                    placeholder="Zip Code"
                    defaultValue={(actionState.formData?.get("location.zipcode") || "") as string}
                    errors={actionState.formErrorMap?.location?.zipcode}
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
                            aria-describedby="beds-error"
                        />
                        {actionState.formErrorMap?.beds && <FormErrors
                            errors={actionState.formErrorMap.beds}
                            id="beds"
                        />}
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
                            aria-describedby="bath-error"
                        />
                        {actionState.formErrorMap?.baths && <FormErrors
                            errors={actionState.formErrorMap.baths}
                            id='baths'
                        />}
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
                            aria-describedby="squareFeet-error"
                        />
                        {actionState.formErrorMap?.squareFeet && <FormErrors
                            errors={actionState.formErrorMap.squareFeet}
                            id="squareFeet"
                        />}
                    </div>
                </div>

                {/* Amenitites */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Amenities
                    </label>
                    <div
                        className="grid grid-cols-2 md:grid-cols-3 gap-2"
                        aria-describedby="amenities-error"
                    >
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
                    {actionState.formErrorMap?.amenities && <FormErrors
                        errors={actionState.formErrorMap.amenities}
                        id='amenities'
                    />}
                </div>

                {/* Rates */}
                <div className="mb-4">
                    <label className="mb-2 block font-medium text-gray-700">
                        Rates (Select at least one)
                    </label>
                    <div
                        className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
                        aria-describedby="rates-error"
                    >
                        <div className="flex items-center">
                            <label htmlFor="nightly_rate" className="text-sm font-medium text-gray-700 mr-2">Nightly</label>
                            <input
                                type="number"
                                id="nightly_rate"
                                name="rates.nightly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.nightly") || "") as string}
                                aria-describedby="nightly_rate-error"
                            />
                        </div>
                        {actionState.formErrorMap?.rates?.nightly && <FormErrors
                            errors={actionState.formErrorMap.rates.nightly}
                            id="nightly_rate"
                        />}
                        <div className="flex items-center">
                            <label htmlFor="weekly_rate" className="text-sm font-medium text-gray-700 mr-2">Weekly</label>
                            <input
                                type="number"
                                id="weekly_rate"
                                name="rates.weekly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.weekly") || "") as string}
                                aria-describedby="weekly_rate-error"
                            />
                        </div>
                        {actionState.formErrorMap?.rates?.weekly && <FormErrors
                            errors={actionState.formErrorMap.rates.weekly}
                            id="weekly_rate"
                        />}
                        <div className="flex items-center">
                            <label htmlFor="monthly_rate" className="text-sm font-medium text-gray-700 mr-2">Monthly</label>
                            <input
                                type="number"
                                id="monthly_rate"
                                name="rates.monthly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.monthly") || "") as string}
                                aria-describedby="monthly_rate-error"
                            />
                        </div>
                        {actionState.formErrorMap?.rates?.monthly && <FormErrors
                            errors={actionState.formErrorMap.rates.monthly}
                            id="monthly_rate"
                        />}
                    </div>
                    {actionState.formErrorMap?.rates && <FormErrors
                        errors={actionState.formErrorMap.rates}
                        id='rates'
                    />}
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
                    errors={actionState.formErrorMap?.sellerInfo?.name}
                    
                />
               <Input
                    inputType="input"
                    id='seller_email'
                    name="sellerInfo.email"
                    type='email'
                    placeholder="Email address"
                    label="Renter Email"
                    defaultValue={(actionState.formData?.get("sellerInfo.email") || "") as string}
                    errors={actionState.formErrorMap?.sellerInfo?.email}
                />
               <Input
                    inputType="input"
                    id='seller_phone'
                    name="sellerInfo.phone"
                    type='tel'
                    label="Renter Phone"
                    placeholder='Phone'
                    defaultValue={(actionState.formData?.get("sellerInfo.phone") || "") as string}
                    errors={actionState.formErrorMap?.sellerInfo?.phone}
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
                        aria-describedby="images-error"
                    />
                    {actionState.formErrorMap?.imagesData && <FormErrors
                        errors={actionState.formErrorMap.imagesData}
                        id='images'
                    />}
                </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/properties"
                    className="flex btn btn-secondary"
                >
                    Cancel
                </Link>
                <button
                    className={`flex gap-1 btn btn-primary ${isPending ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'}`}
                    type="submit"
                    disabled={isPending}
                >
                    {isPending && <LuRefreshCw className='btn-pending-icon icon-spin'/>}
                    <span>Save Property</span>
                </button>
            </div>
        </form>
    );
}
 
export default AddPropertyForm;