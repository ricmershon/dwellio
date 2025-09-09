import { Dispatch, SetStateAction, useState } from "react";
import { useDebounce } from "use-debounce";
import clsx from "clsx";

import { usePlacesAutocomplete } from "@/hooks/use-google-places-autocomplete";
import { ActionState, AutocompletePrediction } from "@/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FormErrors from "@/ui/shared/form-errors";

interface AddressSearchProps {
    actionState: ActionState;
    street?: string | null;
    setCity: Dispatch<SetStateAction<string>>;
    setState: Dispatch<SetStateAction<string>>;
    setZipcode: Dispatch<SetStateAction<string>>;
}

// FIXME: can't edit street when editing a property.
const AddressSearch = ({ actionState, street = null, setCity, setState, setZipcode }: AddressSearchProps) => {
    const [placeQuery, setPlaceQuery] = useState("");
    const [isPlaceSelected, setIsPlaceSelected] = useState(false);
    const [debouncedQuery] = useDebounce(placeQuery, 500);

    const { predictions } = usePlacesAutocomplete(debouncedQuery);

    const handlePlaceQueryChange = (value: string) => {
        setPlaceQuery(value);

        // Reset search
        if (value === "") {
            setIsPlaceSelected(false);
        }
    }

    const handlePredictionClick = (prediction: AutocompletePrediction) => {
        setPlaceQuery(prediction.street ??
            (prediction.structuredFormat?.mainText?.text ?? prediction.text)
        );

        setCity(prediction.city ?? "")
        setState(prediction.state ?? "")
        setZipcode(prediction.zipcode ?? "")
        
        setIsPlaceSelected(true);
    };
    
    return (
        <div className="relative mb-2">
            <label
                htmlFor="street"
                className="block text-sm text-gray-500 font-medium"
            >
                Address
            </label>
            <div>
                <div className="relative flex flex-1 flex-shrink-0">
                    <input
                        id="street"
                        type="text"
                        name="location.street"
                        value={(actionState.formData?.get("location.street") || (street ? street : placeQuery) || "") as string}
                        onChange={(event) => handlePlaceQueryChange(event.target.value)}
                        onClick={() => setIsPlaceSelected(false)}
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 px-3 text-sm placeholder:text-gray-500 bg-white"
                        placeholder="Search address"
                        aria-describedby="street-error"
                        />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
                {actionState.formErrorMap?.location?.street &&
                    <FormErrors
                        errors={actionState.formErrorMap?.location?.street}
                        id="street"
                    />
                }
            </div>
            <ul
                className={clsx(
                    "list-none p-3 mt-2 border border-gray-200 rounded text-sm space-y-3 cursor-pointer bg-white z-10 absolute top-14 left-0",
                    {
                        "hidden": predictions.length === 0 || isPlaceSelected
                    }
                )}
            >
                {predictions.map((prediction) => (
                    <li
                        key={prediction.placeId}
                        onClick={() => handlePredictionClick(prediction)}
                    >
                        {!isPlaceSelected && (
                            <>
                                {prediction.structuredFormat?.mainText?.text ?? prediction.text}
                                {" "}
                                {prediction.structuredFormat?.secondaryText?.text && (
                                    <span>
                                        {prediction.structuredFormat.secondaryText.text}
                                    </span>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
 
export default AddressSearch;