"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import Input from "@/ui/shared/input";

const PropertySearchForm = () => {
    const [query, setQuery] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPending, startTransition] = useTransition();

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        startTransition(() => {
            if (query === "") {
                router.push("/properties");
            } else {
                const queryParams = new URLSearchParams(searchParams);
                queryParams.set("page", "1");
                queryParams.set("query", query);

                router.push(`/properties?${queryParams.toString()}`)
            }
        });
    }

    return (
        <form 
            className="w-full mt-4 flex items-center justify-between gap-2 md:mt-8"
            onSubmit={handleSubmit}
        >
            <div className="w-full md:mb-0">
                <Input
                    inputType="input"
                    id="location"
                    placeholder="Name, description, location or amenity"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                    noClasses={true}
                />
            </div>
            <button
                type="submit"
                className="flex items-center md:mt-0 md:w-auto px-4 h-[37px] btn btn-primary"
            >
                <span className="hidden md:block">Search</span>{' '}
                <MagnifyingGlassIcon className="h-5 md:ml-4" />
            </button>
        </form>
    );
}
 
export default PropertySearchForm;