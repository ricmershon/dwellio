import { useStaticInputs } from "@/context/global-context";
import { ActionState } from "@/types/types";
import FormErrors from "@/ui/shared/form-errors";

interface AmenitiesProps {
    actionState: ActionState;
    selectedAmenities?: string[];
}
const Amenities = ({ actionState, selectedAmenities = [] }: AmenitiesProps) => {
    const { amenities } = useStaticInputs();

    return (
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
                            className="mr-2"
                            defaultChecked={actionState.formData?.getAll("amenities").includes(amenity.value)
                                || selectedAmenities?.includes(amenity.value)
                            }
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
            {actionState.formErrorMap?.amenities &&
                <FormErrors
                    errors={actionState.formErrorMap.amenities}
                    id="amenities"
                />
            }
        </div>
    );
}
 
export default Amenities;