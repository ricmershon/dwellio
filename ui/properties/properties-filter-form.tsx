'use client';

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from 'use-debounce';

import Input from "@/ui/shared/input";

const PropertyFilterForm = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((searchTerm: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');

        if (searchTerm) {
            params.set('query', searchTerm);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`)
    }, 500);    // Half second debounce

    return (
        <div className="mb-6">
            <label htmlFor="property-filter" className="sr-only">
                Search
            </label>
            <Input
                id="property-filter"
                inputType="input"
                type='text'
                placeholder="Search by name, description, location or amenity"
                onChange={(event: { target: { value: string; }; }) => handleSearch(event.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
            />
        </div>
    )
}

export default PropertyFilterForm;