'use client';

import { useActionState, useEffect, useRef, MouseEvent, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";

import { useStaticInputs } from "@/context/global-context";
import { createProperty } from "@/lib/actions/property-actions"
import Input from "@/ui/shared/input";
import FormErrors from "@/ui/shared/form-errors";
import { ActionState, ActionStatus } from "@/types/types";
import InputErrors from "@/ui/shared/input-errors";
import PropertyTypeInput from "@/ui/properties/shared/property-type-input";
import AddressInput from "@/ui/properties/shared/address-input";

const AddPropertyForm = () => {
    const [selectedImages, setSelectedImages] = useState('');
    const [actionState, formAction, isPending] = useActionState(createProperty, {} as ActionState);
    const { data: session } = useSession();
    const { amenities } = useStaticInputs();

    const imagePickerRef = useRef<HTMLInputElement>(null);

    /**
     * Display error message if the `createProperty` returns an `ERROR` status.
     */
    useEffect(() => {
        if (actionState.status === ActionStatus.ERROR) {
            toast.error(actionState.message);
        }
    }, [actionState]);

    const handleOpenImagePicker = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (imagePickerRef.current) {
            imagePickerRef.current.click();
        }
    }

    const handlePickImages = (event: React.ChangeEvent<HTMLInputElement>) => {
        const imageFiles = event.target.files;
        if (imageFiles && imageFiles.length > 0) {
            setSelectedImages(Array.from(imageFiles).map(file => file.name).join(', '));
        }
    }

    return (
        <form action={formAction}>
            <div className="px-4 py-6 md:p-6 border border-gray-200 rounded-md">
                <PropertyTypeInput actionState={actionState} />

                {/* Listing name and description*/}
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
                    placeholder="Add a description of your property"
                    defaultValue={(actionState.formData?.get("description") || "") as string}
                    errors={actionState.formErrorMap?.description}
                />

                <AddressInput actionState={actionState} />

                {/* Number of beds and baths, and square feet */}
                <div className="mb-4 flex flex-wrap">
                    <div className="w-full sm:w-1/3 sm:pr-2 mb-2 sm:mb-0">
                        <label
                            htmlFor="beds"
                            className="block text-gray-700 font-bold"
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
                            className="block text-gray-700 font-bold"
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
                            className="block text-gray-700 font-bold"
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
                    <label className="block text-gray-700 font-bold">
                        Amenities
                    </label>
                    <div
                        className="grid grid-cols-2 md:grid-cols-3 gap-2"
                        aria-describedby="amenities-error"
                    >
                        {amenities.map((amenity) => (
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
                    <h2 className="block text-gray-700 font-bold mb-1">
                        Rates (enter at least one)
                    </h2>
                    <div
                        className="flex flex-wrap mb-2 sm:mb-0"
                        aria-describedby="rates-error"
                    >
                        <div className="w-full sm:w-1/3 sm:pr-2">
                            <label htmlFor="nightly_rate" className="block text-sm text-gray-500 font-medium">Nightly</label>
                            <input
                                type="number"
                                id="nightly_rate"
                                name="rates.nightly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.nightly") || "") as string}
                                aria-describedby="nightly_rate-error"
                            />
                            {actionState.formErrorMap?.rates?.nightly && <FormErrors
                                errors={actionState.formErrorMap.rates.nightly}
                                id="nightly_rate"
                            />}
                        </div>
                        <div className="w-full sm:w-1/3 sm:px-2">
                            <label htmlFor="weekly_rate" className="block text-sm text-gray-500 font-medium">Weekly</label>
                            <input
                                type="number"
                                id="weekly_rate"
                                name="rates.weekly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.weekly") || "") as string}
                                aria-describedby="weekly_rate-error"
                            />
                            {actionState.formErrorMap?.rates?.weekly && <FormErrors
                                errors={actionState.formErrorMap.rates.weekly}
                                id="weekly_rate"
                            />}
                        </div>
                        <div className="w-full sm:w-1/3 sm:pl-2">
                            <label htmlFor="monthly_rate" className="block text-sm text-gray-500 font-medium">Monthly</label>
                            <input
                                type="number"
                                id="monthly_rate"
                                name="rates.monthly"
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                defaultValue={(actionState.formData?.get("rates.monthly") || "") as string}
                                aria-describedby="monthly_rate-error"
                            />
                            {actionState.formErrorMap?.rates?.monthly && <FormErrors
                                errors={actionState.formErrorMap.rates.monthly}
                                id="monthly_rate"
                            />}
                        </div>
                    </div>
                    {actionState.formErrorMap?.rates && <FormErrors
                        errors={actionState.formErrorMap.rates}
                        id='rates'
                    />}
                </div>

                <div className="mb-4">
                    <h2 className="block text-gray-700 font-bold mb-1">
                        Host Information
                    </h2>
                    <div className="mb-3">
                        <label
                            htmlFor="seller_name"
                            className="block text-sm text-gray-500 medium"
                        >
                            Name
                        </label>
                        <input
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                            type="text"
                            id='seller_name'
                            name="sellerInfo.name"
                            placeholder="Name"
                            defaultValue={(actionState.formData?.get("sellerInfo.name") || session?.user.name) as string}
                            aria-describedby="seller_name-error"
                        />
                        {actionState.formErrorMap?.sellerInfo?.name &&
                            <FormErrors
                                errors={actionState.formErrorMap?.sellerInfo?.name}
                                id='seller_name'
                            />
                        }
                    </div>
                    <div className="flex flex-wrap mb-2 sm-mb-0">
                        <div className="w-full sm:w-1/2 sm:pr-2">
                            <label
                                htmlFor="seller_email"
                                className="block text-sm text-gray-500 medium"
                            >
                                Email
                            </label>
                            <input
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                type="email"
                                id='seller_email'
                                name="sellerInfo.email"
                                placeholder="Email"
                                defaultValue={(actionState.formData?.get("sellerInfo.email") || session?.user.email) as string}
                                aria-describedby="seller_email-error"
                            />
                            {actionState.formErrorMap?.sellerInfo?.email &&
                                <FormErrors
                                    errors={actionState.formErrorMap?.sellerInfo?.email}
                                    id='seller_email'
                                />
                            }
                        </div>
                        <div className="w-full sm:w-1/2 sm:pl-2">
                            <label
                                htmlFor="seller_phone"
                                className="block text-sm text-gray-500 medium"
                            >
                                Phone
                            </label>
                            <input
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                                type="tel"
                                id='seller_phone'
                                name="sellerInfo.phone"
                                defaultValue={(actionState.formData?.get("sellerInfo.phone") || "") as string}
                                aria-describedby="seller_phone-error"
                            />
                            {actionState.formErrorMap?.sellerInfo?.phone &&
                                <FormErrors
                                    errors={actionState.formErrorMap?.sellerInfo?.phone}
                                    id='seller_phone'
                                />
                            }
                        </div>
                    </div>
                </div>

                {/* Select images */}
                <div>
                    <label htmlFor="images" className="mb-2 block font-medium text-gray-700">
                        Images (minimum 5)
                    </label>
                    <div className="relative flex flex-1 flex-shrink-0">
                        <input
                            type="file"
                            id="images"
                            name="images"
                            className=" w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white text-white"
                            accept="image/*"
                            multiple
                            aria-describedby="images-error"
                            ref={imagePickerRef}
                            onChange={handlePickImages}
                        />
                        <button
                            id="images-button"
                            className="btn btn-primary text-sm rounded-sm py-1 px-5 absolute left-[6px] top-1/2 -translate-y-1/2"
                            onClick={handleOpenImagePicker}
                        >
                            Select Images
                        </button>
                        <span className="text-sm absolute left-37  top-1/2 -translate-y-1/2">
                            {selectedImages ? selectedImages : 'First image selected is main photo'}
                        </span>
                    </div>
                    {actionState.formErrorMap?.imagesData &&
                        <FormErrors
                            errors={actionState.formErrorMap.imagesData}
                            id='images'
                        />
                    }
                </div>
                {Object.keys(actionState).length > 0 && <InputErrors />}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex justify-end gap-4">
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