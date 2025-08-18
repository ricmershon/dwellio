'use client';

import { useActionState, useEffect  } from "react";
import Link from "next/link";
import clsx from 'clsx';
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";

import { ActionState, ActionStatus } from "@/types/types";
import { createProperty } from "@/lib/actions/property-actions"
import InputErrors from "@/ui/shared/input-errors";
import PropertyTypeInput from "@/ui/properties/shared/form/property-type-input";
import Address from "@/ui/properties/shared/form/address";
import ImagePicker from "@/ui/properties/shared/form/image-picker";
import BedsBathsAndSqft from "@/ui/properties/shared/form/beds-baths-sqft";
import Amenities from "@/ui/properties/shared/form/amenities";
import RatesInput from "@/ui/properties/shared/form/rates-input";
import ListingNameAndDescription from "@/ui/properties/shared/form/listing-name-and-description";
import HostInfo from "@/ui/properties/shared/form/host-info";

const AddPropertyForm = () => {
    const [actionState, formAction, isPending] = useActionState(createProperty, {} as ActionState);

    /**
     * Display error message if the `createProperty` returns an `ERROR` status.
     */
    useEffect(() => {
        if (actionState.status === ActionStatus.ERROR) {
            toast.error(actionState.message);
        }
    }, [actionState]);

    return (
        <form action={formAction}>
            <div className="px-4 py-6 md:p-6 border border-gray-200 rounded-md">
                <PropertyTypeInput actionState={actionState} />
                <ListingNameAndDescription actionState={actionState} />
                <Address actionState={actionState} />
                <BedsBathsAndSqft actionState={actionState} />
                <Amenities actionState={actionState} />
                <RatesInput actionState={actionState} />
                <HostInfo actionState={actionState} />
                <ImagePicker actionState={actionState} />

                {Object.keys(actionState).length > 0 && <InputErrors />}

                {/* Buttons */}
                <div className="mt-4 flex justify-end gap-4">
                    <Link
                        href="/properties"
                        className="flex btn btn-secondary"
                    >
                        Cancel
                    </Link>
                    <button
                        className={clsx(
                            'flex gap-1 btn btn-primary',
                            {
                                'hover:cursor-not-allowed': isPending,
                                'hover:cursor-pointer': !isPending
                            }
                        )}
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending && <LuRefreshCw className='btn-pending-icon icon-spin'/>}
                        <span>Save Property</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
 
export default AddPropertyForm;