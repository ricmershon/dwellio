"use client";

import { useActionState, useEffect  } from "react";
import { toast } from "react-toastify";

import { ActionState, ActionStatus } from "@/types/types";
import { createProperty } from "@/lib/actions/property-actions"
import InputErrors from "@/ui/shared/input-errors";
import Location from "@/ui/properties/shared/form/location";
import ImagePicker from "@/ui/properties/shared/form/image-picker";
import Specs from "@/ui/properties/shared/form/specs";
import Amenities from "@/ui/properties/shared/form/amenities";
import Rates from "@/ui/properties/shared/form/rates";
import HostInfo from "@/ui/properties/shared/form/host-info";
import PropertyFormButtons from "@/ui/properties/shared/form/buttons";
import PropertyInfo from "@/ui/properties/shared/form/property-info";

const AddPropertyForm = () => {
    const [actionState, formAction, isPending] = useActionState(createProperty, {} as ActionState);

    /**
     * Display error message if `createProperty` returns an `ERROR` status.
     */
    useEffect(() => {
        if (actionState.status === ActionStatus.ERROR) {
            toast.error(actionState.message);
        }
    }, [actionState]);

    return (
        <form action={formAction}>
            <div className="p-4 md:p-6 border border-gray-200 rounded-md">
                <PropertyInfo actionState={actionState} />
                <Location actionState={actionState} />
                <Specs actionState={actionState} />
                <Amenities actionState={actionState} />
                <Rates actionState={actionState} />
                <HostInfo actionState={actionState} />
                <ImagePicker actionState={actionState} />

                {Object.keys(actionState).length > 0 && <InputErrors />}

                <PropertyFormButtons
                    cancelButtonHref="/properties"
                    isPending={isPending}
                    primaryButtonText="Save Property"
                />
            </div>
        </form>
    );
}
 
export default AddPropertyForm;