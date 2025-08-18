import { useStaticInputs } from "@/context/global-context";
import { ActionState } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";
import DwellioSelect from "@/ui/shared/select";

const PropertyTypeInput = ({ actionState }: { actionState: ActionState}) => {
    const { propertyTypes } = useStaticInputs();
    
    return (
        <div className="mb-4">
            <label
                id="type"
                className="block font-bold text-gray-700"
            >
                Property Type
            </label>
            <DwellioSelect
                options={propertyTypes}
                placeholder="Select a property type"
                name='type'
                id='type'
                aria-describedby='type-error'
                aria-labelledby="type"
            />
            {actionState.formErrorMap?.type &&
                <FormErrors
                    errors={actionState.formErrorMap.type}
                    id="type"
                />
            }
        </div>
    )
} 
export default PropertyTypeInput;