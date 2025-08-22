"use client";

import { ChangeEvent, FormEvent, useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { OptionType } from "@/types/types";
import DwellioSelect from "@/ui/shared/select";
import Input from "@/ui/shared/input";
import { useStaticInputs } from "@/context/global-context";

const PropertySearchForm = () => {
    const [propertyType, setPropertyType] = useState<OptionType>();
    const [query, setQuery] = useState("");

    const { propertyTypes } = useStaticInputs();
    
    const propertyTypeOptions = useMemo(() => [
        ...propertyTypes,
        { label: "All", value: "All" },
    ], [propertyTypes]);

    const router = useRouter();
    const searchParams = useSearchParams();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPending, startTransition] = useTransition();

    const handlePropertyTypeChange = (selectedOption: OptionType | null) => {
        if (selectedOption) {
            setPropertyType(selectedOption);
        }
    };

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        startTransition(() => {
            if (query === "" && propertyType && propertyType.value === "All") {
                router.push("/properties");
            } else {
                const queryParams = new URLSearchParams(searchParams);
                queryParams.set("query", query);
                if (propertyType) {
                    queryParams.set("propertyType", propertyType.value);
                }

                router.push(`/properties/search/?${queryParams.toString()}`)
            }
        });
    }


    return (
        <form 
            className="mt-3 mx-auto w-full flex flex-col md:flex-row items-center"
            onSubmit={handleSubmit}
        >
            <div className="w-full md:w-3/5 md:pr-2 mb-4 md:mb-0">
                <Input
                    inputType="input"
                    id="location"
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