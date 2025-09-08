 "use client";

import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { ActionState, ActionStatus } from "@/types";
import type { PropertyDocument } from "@/models";
import { updateProperty } from "@/lib/actions/property-actions";
import InputErrors from "@/ui/shared/input-errors";
import PropertyInfo from "@/ui/properties/shared/form/property-info";
import Location from "@/ui/properties/shared/form/location";
import Specs from "@/ui/properties/shared/form/specs";
import Amenities from "@/ui/properties/shared/form/amenities";
import Rates from "@/ui/properties/shared/form/rates";
import HostInfo from "@/ui/properties/shared/form/host-info";
import PropertyFormButtons from "@/ui/properties/shared/form/buttons";


const EditPropertyForm = ({ property }: { property: PropertyDocument }) => {
    const updatePropertyById = updateProperty.bind(null, (property._id as string).toString());
    const [actionState, formAction, isPending] = useActionState(updatePropertyById, {} as ActionState);

    /**
     * Display error message if the `updateProperty` returns an `ERROR` status.
     */
    useEffect(() => {
        if (actionState.status === ActionStatus.ERROR) {
            toast.error(actionState.message);
        }
    }, [actionState]);
    return (
        <form action={formAction}>
            <div className="p-4 md:p-6 border border-gray-200 rounded-md">

                <PropertyInfo
                    actionState={actionState}
                    property={property}
                />
                <Location
                    actionState={actionState}
                    property={property}
                />
                <Specs
                    actionState={actionState}
                    property={property}
                />
                <Amenities
                    actionState={actionState}
                    selectedAmenities={property.amenities}
                />
                <Rates
                    actionState={actionState}
                    property={property}
                />
                <HostInfo
                    actionState={actionState}
                    property={property}
                />

                {Object.keys(actionState).length > 0 && <InputErrors />}

                <PropertyFormButtons
                    cancelButtonHref="/profile"
                    isPending={isPending}
                    primaryButtonText="Updated Property"
                />
            </div>
        </form>
    );
}
 
export default EditPropertyForm;