'use client';

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ChangeEvent } from "react";

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
        <div className="mb-6 relative flex flex-1 flex-shrink-0">
            <label htmlFor="property-filter" className="sr-only">
                Search
            </label>
            <input
                id="property-filter"
                type='text'
                placeholder="Search by name, description, location or amenity"
                onChange={(event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 px-3 text-sm placeholder:text-gray-500 bg-white"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
        </div>
    )
}

export default PropertyFilterForm;