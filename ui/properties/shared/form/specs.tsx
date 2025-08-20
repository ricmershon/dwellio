import { PropertyDocument } from "@/models";
import { ActionState } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";

interface SpecsProps {
    actionState: ActionState;
    property?: PropertyDocument;
}

const Specs = ({ actionState, property }: SpecsProps) => (
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
                    type="number"
                    id="beds"
                    name="beds"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                    defaultValue={
                        (actionState.formData?.get("beds") || (
                            property ? property.beds : ""
                        )) as string
                    }
                    aria-describedby="beds-error"
                />
                {actionState.formErrorMap?.beds &&
                    <FormErrors
                        errors={actionState.formErrorMap.beds}
                        id="beds"
                    />
                }
            </div>
            <div className="w-full sm:w-1/3 sm:px-2 mb-2 sm:mb-0">
                <label
                    htmlFor="baths" 
                    className="block text-sm text-gray-500 medium"
                >
                    Baths
                </label>
                <input
                    type="number"
                    id="baths"
                    name="baths"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                    defaultValue={
                        (actionState.formData?.get("baths") || (
                            property ? property.baths : ""
                        )) as string
                    }
                    aria-describedby="bath-error"
                />
                {actionState.formErrorMap?.baths &&
                    <FormErrors
                        errors={actionState.formErrorMap.baths}
                        id="baths"
                    />
                }
            </div>
            <div className="w-full sm:w-1/3 sm:pl-2">
                <label
                    htmlFor="squareFeet"
                    className="block text-sm text-gray-500 medium"
                >
                    Square Feet
                </label>
                <input
                    type="number"
                    id="squareFeet"
                    name="squareFeet"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                    defaultValue={
                        (actionState.formData?.get("squareFeet") || (
                            property ? property.squareFeet : ""
                        )) as string
                    }
                    aria-describedby="squareFeet-error"
                />
                {actionState.formErrorMap?.squareFeet &&
                    <FormErrors
                        errors={actionState.formErrorMap.squareFeet}
                        id="squareFeet"
                    />
                }
            </div>
        </div>
    </div>
);
 
export default Specs;