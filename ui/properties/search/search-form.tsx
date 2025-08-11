'use client';

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import DwellioSelect, { OptionType } from "@/ui/shared/select";
import { PropertyTypes } from "@/data/data";
import Input from "@/ui/shared/input";

const PropertySearchForm = () => {
    const [propertyType, setPropertyType] = useState<OptionType>();
    const [query, setQuery] = useState('');
    
    const propertyTypeOptions = [
        ...PropertyTypes,
        { label: 'All', value: 'All' },
    ];

    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePropertyTypeChange = (selectedOption: OptionType | null) => {
        if (selectedOption) {
            setPropertyType(selectedOption);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (query === '' && propertyType && propertyType.value === 'All') {
            router.push('/properties');
        } else {
            const queryParams = new URLSearchParams(searchParams);
            queryParams.set('query', query);
            if (propertyType) {
                queryParams.set('propertyType', propertyType.value);
            }

            router.push(`/properties/search/?${queryParams.toString()}`)
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
                    placeholder="Name, description, location or amenity"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                    noClasses={true}
                />
            </div>
            <div className="w-full md:w-2/5 md:pl-2">
                <label htmlFor="property-type" className="sr-only">Property Type</label>
                <DwellioSelect
                    options={propertyTypeOptions}
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