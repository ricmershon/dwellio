import { useStaticInputs } from "@/context/global-context";
import { PropertyDocument } from "@/models";
import { ActionState } from "@/types";
import FormErrors from "@/ui/shared/form-errors";
import DwellioSelect from "@/ui/shared/select";

interface PropertyInfoProps {
    actionState: ActionState;
    property?: PropertyDocument
}
const PropertyInfo = ({ actionState, property }: PropertyInfoProps) => {
    const { propertyTypes } = useStaticInputs();
    
    return (
        <div className="mb-4">
            <h2 className="form-section-label mb-1">
                Property Information
            </h2>
            <div className="flex flex-wrap mb-2">
                <div className="w-full sm:w-1/2 mb-2 sm:mb-0 sm:pr-2">
                    <label
                        htmlFor="name"
                        className="sub-input-label"
                    >
                        Name
                    </label>
                    <input
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500"
                        type="text"
                        id="name"
                        name="name"
                        placeholder="e.g., Beautiful Apartment in Miami"
                        defaultValue={
                            (actionState.formData?.get("name") || (
                                property ? property.name : ""
                            )) as string}
                        aria-describedby="name-error"
                    />
                    {actionState.formErrorMap?.name &&
                        <FormErrors
                            errors={actionState.formErrorMap?.name}
                            id="name-error"
                        />
                    }
                </div>
                <div className="w-full sm:w-1/2 sm:pl-2">
                    <label
                        htmlFor="type"
                        className="sub-input-label"
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
                    />
                    {actionState.formErrorMap?.type &&
                        <FormErrors
                            errors={actionState.formErrorMap.type}
                            id="type"
                        />
                    }
                </div>
            </div>
            <div>
                <label
                    htmlFor="description"
                    className="sub-input-label"
                >
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500"
                    placeholder="Add a description of your property"
                    rows={4}
                    defaultValue={
                        (actionState.formData?.get("description") || (
                            property ? property.description : ""
                        )) as string
                    }                    
                    aria-describedby="description-error"
                />
                {actionState.formErrorMap?.description &&
                    <FormErrors
                        errors={actionState.formErrorMap?.description}
                        id="description-error"
                    />
                }
            </div>
        </div>
    );
}
 
export default PropertyInfo;