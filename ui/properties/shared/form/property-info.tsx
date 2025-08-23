"use client";

import { useStaticInputs } from "@/context/global-context";
import { PropertyDocument } from "@/models";
import { ActionState } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";
import DwellioSelect from "@/ui/shared/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyInfoSchema, PropertyInfoType } from "@/schemas/property-schema";
import { useEffect } from "react";

interface PropertyInfoProps {
    actionState: ActionState;
    property?: PropertyDocument
}
const PropertyInfo = ({ actionState, property }: PropertyInfoProps) => {
    const { propertyTypes } = useStaticInputs();
    
    const {
        register,
        watch,
        formState: { errors },
        setValue,
        trigger
    } = useForm<PropertyInfoType>({
        resolver: zodResolver(PropertyInfoSchema),
        mode: "onChange",
        defaultValues: {
            name: (actionState.formData?.get("name") as string) || property?.name || "",
            type: (actionState.formData?.get("type") as any) || property?.type || undefined,
            description: (actionState.formData?.get("description") as string) || property?.description || "",
        }
    });

    // Watch form values to trigger validation on change
    const watchedValues = watch();

    // Sync with server-side form data if it changes
    useEffect(() => {
        if (actionState.formData) {
            const name = actionState.formData.get("name") as string;
            const type = actionState.formData.get("type") as string;
            const description = actionState.formData.get("description") as string;
            
            if (name) setValue("name", name);
            if (type) setValue("type", type as any);
            if (description) setValue("description", description);
        }
    }, [actionState.formData, setValue]);
    
    return (
        <div className="mb-4">
            <h2 className="block text-gray-700 font-bold mb-1">
                Property Information
            </h2>
            <div className="flex flex-wrap mb-2">
                <div className="w-full sm:w-1/2 mb-2 sm:mb-0 sm:pr-2">
                    <label
                        htmlFor="name"
                        className="block text-sm text-gray-500 medium"
                    >
                        Name
                    </label>
                    <input
                        {...register("name")}
                        className={`w-full rounded-md border py-2 px-3 text-sm placeholder:text-gray-500 bg-white ${
                            errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        type="text"
                        id="name"
                        placeholder="e.g., Beautiful Apartment in Miami"
                        aria-describedby="name-error"
                    />
                    {errors.name && (
                        <FormErrors
                            errors={[errors.name.message as string]}
                            id="name-error"
                        />
                    )}
                    {/* Fallback to server-side errors if no client-side errors */}
                    {!errors.name && actionState.formErrorMap?.name && (
                        <FormErrors
                            errors={actionState.formErrorMap?.name}
                            id="name-error"
                        />
                    )}
                </div>
                <div className="w-full sm:w-1/2 sm:pl-2">
                    <label
                        htmlFor="type"
                        className="block text-sm text-gray-500 medium"
                    >
                        PropertyType
                    </label>
                    <DwellioSelect
                        options={propertyTypes}
                        placeholder="Select a property type"
                        name="type"
                        id="type"
                        aria-describedby="type-error"
                        aria-labelledby="type"
                        defaultValue={property && {
                            label: property.type,
                            value: property.type
                        }}
                        onChange={(selectedOption) => {
                            setValue("type", selectedOption?.value as any);
                            trigger("type");
                        }}
                    />
                    {errors.type && (
                        <FormErrors
                            errors={[errors.type.message as string]}
                            id="type-error"
                        />
                    )}
                    {/* Fallback to server-side errors if no client-side errors */}
                    {!errors.type && actionState.formErrorMap?.type && (
                        <FormErrors
                            errors={actionState.formErrorMap.type}
                            id="type-error"
                        />
                    )}
                </div>
            </div>
            <div>
                <label
                    htmlFor="description"
                    className="block text-sm text-gray-500 medium"
                >
                    Description
                </label>
                <textarea
                    {...register("description")}
                    id="description"
                    className={`block w-full rounded-md border py-2 px-3 text-sm placeholder:text-gray-500 bg-white ${
                        errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Add a description of your property"
                    rows={4}
                    aria-describedby="description-error"
                />
                {errors.description && (
                    <FormErrors
                        errors={[errors.description.message as string]}
                        id="description-error"
                    />
                )}
                {/* Fallback to server-side errors if no client-side errors */}
                {!errors.description && actionState.formErrorMap?.description && (
                    <FormErrors
                        errors={actionState.formErrorMap?.description}
                        id="description-error"
                    />
                )}
            </div>
        </div>
    );
}

export default PropertyInfo;