import { useEffect, useState } from "react";

import FormErrors from "@/ui/shared/form-errors";
import AddressSearch from "@/ui/properties/shared/form/address-search";
import { ActionState } from "@/types/types";
import { PropertyDocument } from "@/models";

interface LocationProps {
    actionState: ActionState;
    property?: PropertyDocument;
}
const Location = ({ actionState, property }: LocationProps) => {
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipcode, setZipcode] = useState('');

    
    useEffect(() => {
        if (property) {
            setCity(property.location.city);
            setState(property.location.state);
            setZipcode(property.location.zipcode)
        }
    }, [])
    
    return (
        <div className="mb-4">
            <h2 className="block text-gray-700 font-bold mb-1">
                Location
            </h2>
            <AddressSearch
                actionState={actionState}
                street={property?.location.street}
                setCity={setCity}
                setState={setState}
                setZipcode={setZipcode}
            />
            <div className="flex flex-wrap mb-2 sm:mb-0">
                <div className="w-full sm:w-1/3 mb-2 sm:mb-0 sm:pr-2">
                    <label
                        htmlFor="city" 
                        className="block text-sm text-gray-500 font-medium"
                    >
                        City
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="location.city"
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                        value={(actionState.formData?.get("location.city") || city || "") as string}
                        onChange={(event) => setCity(event.target.value)}
                        aria-describedby="city-error"
                    />
                    {actionState.formErrorMap?.location?.city &&
                        <FormErrors
                        errors={actionState.formErrorMap?.location?.city}
                            id='city'
                        />
                    }
                </div>
                <div className="w-full sm:w-1/3 mb-2 sm:mb-0 sm:px-2">
                    <label
                        htmlFor="state" 
                        className="block text-sm text-gray-500 font-medium"
                    >
                        State
                    </label>
                    <input
                        type="text"
                        id="state"
                        name="location.state"
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                        value={(actionState.formData?.get("location.state") || state || "") as string}
                        onChange={(event) => setState(event.target.value)}
                        aria-describedby="state-error"
                    />
                    {actionState.formErrorMap?.location?.state &&
                        <FormErrors
                            errors={actionState.formErrorMap?.location?.state}
                            id='state'
                        />
                    }
                </div>
                <div className="w-full sm:w-1/3 sm:pl-2">
                    <label
                        htmlFor="zipcode"
                        className="block text-sm text-gray-500 font-medium"
                    >
                        Zip Code
                    </label>
                    <input
                        type="text"
                        id="zipcode"
                        name="location.zipcode"
                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-500 bg-white"
                        value={(actionState.formData?.get("location.zipcode") || zipcode || "") as string}
                        onChange={(event) => setZipcode(event.target.value)}
                        aria-describedby="zipcode-error"
                    />
                    {actionState.formErrorMap?.location?.zipcode &&
                        <FormErrors
                            errors={actionState.formErrorMap.location?.zipcode}
                            id="zipcode"
                        />
                    }
                </div>
            </div>
        </div>
    );
}
 
export default Location;