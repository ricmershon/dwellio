"use client";

import { PropertyDocument } from "@/models";
import { ActionState } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpecsSchema, SpecsType } from "@/schemas/property-schema";
import { useEffect } from "react";

interface SpecsProps {
    actionState: ActionState;
    property?: PropertyDocument;
}

const Specs = ({ actionState, property }: SpecsProps) => {
    const getNumberValue = (value: unknown, fallback?: number): number | undefined => {
        if (value && typeof value === 'string' && value.trim() !== '') {
            const num = Number(value);
            return isNaN(num) ? fallback : num;
        }
        return fallback;
    };

    const {
        register,
        watch,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(SpecsSchema),
        mode: "onChange" as const,
        defaultValues: {
            beds: getNumberValue(actionState.formData?.get("beds"), property?.beds) || 0,
            baths: getNumberValue(actionState.formData?.get("baths"), property?.baths) || 0,
            squareFeet: getNumberValue(actionState.formData?.get("squareFeet"), property?.squareFeet) || 0,
        }
    });

    // Watch form values to trigger validation on change
    const watchedValues = watch();

    // Sync with server-side form data if it changes
    useEffect(() => {
        if (actionState.formData) {
            const beds = getNumberValue(actionState.formData.get("beds"));
            const baths = getNumberValue(actionState.formData.get("baths"));
            const squareFeet = getNumberValue(actionState.formData.get("squareFeet"));
            
            if (beds !== undefined) setValue("beds", beds);
            if (baths !== undefined) setValue("baths", baths);
            if (squareFeet !== undefined) setValue("squareFeet", squareFeet);
        }
    }, [actionState.formData, setValue]);

    return (
        <div className="mb-4">
            <h2 className="block text-gray-700 font-bold mb-1">
                Specs
            </h2>
            <div className="flex flex-wrap">
                <div className="w-full sm:w-1/3 sm:pr-2 mb-2 sm:mb-0">
                    <label
                        htmlFor="beds"
                        className="block text-sm text-gray-500 medium"
                    >
                        Beds
                    </label>
                    <input
                        {...register("beds")}
                        type="number"
                        id="beds"
                        className={`w-full rounded-md border py-2 px-3 text-sm placeholder:text-gray-500 bg-white ${
                            errors.beds ? "border-red-500" : "border-gray-300"
                        }`}
                        aria-describedby="beds-error"
                    />
                    {errors.beds && (
                        <FormErrors
                            errors={[errors.beds.message as string]}
                            id="beds-error"
                        />
                    )}
                    {/* Fallback to server-side errors if no client-side errors */}
                    {!errors.beds && actionState.formErrorMap?.beds && (
                        <FormErrors
                            errors={actionState.formErrorMap.beds}
                            id="beds-error"
                        />
                    )}
                </div>
                <div className="w-full sm:w-1/3 sm:px-2 mb-2 sm:mb-0">
                    <label
                        htmlFor="baths" 
                        className="block text-sm text-gray-500 medium"
                    >
                        Baths
                    </label>
                    <input
                        {...register("baths")}
                        type="number"
                        id="baths"
                        className={`w-full rounded-md border py-2 px-3 text-sm placeholder:text-gray-500 bg-white ${
                            errors.baths ? "border-red-500" : "border-gray-300"
                        }`}
                        aria-describedby="baths-error"
                    />
                    {errors.baths && (
                        <FormErrors
                            errors={[errors.baths.message as string]}
                            id="baths-error"
                        />
                    )}
                    {/* Fallback to server-side errors if no client-side errors */}
                    {!errors.baths && actionState.formErrorMap?.baths && (
                        <FormErrors
                            errors={actionState.formErrorMap.baths}
                            id="baths-error"
                        />
                    )}
                </div>
                <div className="w-full sm:w-1/3 sm:pl-2">
                    <label
                        htmlFor="squareFeet"
                        className="block text-sm text-gray-500 medium"
                    >
                        Square Feet
                    </label>
                    <input
                        {...register("squareFeet")}
                        type="number"
                        id="squareFeet"
                        className={`w-full rounded-md border py-2 px-3 text-sm placeholder:text-gray-500 bg-white ${
                            errors.squareFeet ? "border-red-500" : "border-gray-300"
                        }`}
                        aria-describedby="squareFeet-error"
                    />
                    {errors.squareFeet && (
                        <FormErrors
                            errors={[errors.squareFeet.message as string]}
                            id="squareFeet-error"
                        />
                    )}
                    {/* Fallback to server-side errors if no client-side errors */}
                    {!errors.squareFeet && actionState.formErrorMap?.squareFeet && (
                        <FormErrors
                            errors={actionState.formErrorMap.squareFeet}
                            id="squareFeet-error"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Specs;