'use client';

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import DwellioSelect, { OptionType } from "@/app/ui/shared/select";
import { PropertyTypes } from "@/app/data/data";
import Input from "../../shared/input";

const PropertySearchForm = () => {
    const [location, setLocation] = useState('');
    const [propertyType, setPropertyType] = useState<OptionType>();

    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePropertyTypeChange = (selectedOption: OptionType | null) => {
        if (selectedOption) {
            setPropertyType(selectedOption);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (propertyType) {
            if (location === '' && propertyType.value === 'All') {
                router.push('/properties')
            } else {
                const queryParams = new URLSearchParams(searchParams);
                queryParams.set('location', location);
                queryParams.set('propertyType', propertyType.value);
        
                router.push(`/properties/search/?${queryParams.toString()}`)
            }
        }
    }

    return (
        <form 
            className="mt-3 mx-auto max-w-2xl w-full flex flex-col md:flex-row items-center"
            onSubmit={handleSubmit}
        >
            <div className="w-full md:w-3/5 md:pr-2 mb-4 md:mb-0">
                <Input
                    inputType="input"
                    id='location'
                    placeholder="Location (City, State or Zip)"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setLocation(event.target.value)}
                    noClasses={true}
                />
            </div>
            <div className="w-full md:w-2/5 md:pl-2">
                <label htmlFor="property-type" className="sr-only">Property Type</label>
                <DwellioSelect
                    options={[
                        { label: 'All', value: 'All' },
                        ...PropertyTypes
                    ]}
                    id="property-type"
                    value={propertyType}
                    placeholder="Property Type"
                    onChange={(selectedOption) => handlePropertyTypeChange(selectedOption)}
                />
            </div>
            <button
                type="submit"
                className="md:ml-4 mt-4 md:mt-0 w-full md:w-auto px-6 h-10 btn btn-primary"
            >
                Search
            </button>
        </form>
    );
}
 
export default PropertySearchForm;