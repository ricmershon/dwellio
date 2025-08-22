import { useEffect, useState } from "react";

import { fetchPlacesAutocomplete } from "@/lib/places-autocomplete";
import { AutocompleteFetchOptions, AutocompletePrediction } from "@/types/types";

export function usePlacesAutocomplete(query: string) {
    const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);

    useEffect(() => {
        if (!query) {
            setPredictions([]);
            return;
        }

        const abortController = new AbortController();

        fetchPlacesAutocomplete(query, {
            signal: abortController.signal,
            includeDetails: true,
            maxDetails: 5,
            regionCode: "US",
            includedPrimaryTypes: ["street_address"],
        } as AutocompleteFetchOptions)
            .then((response) => {
                if (!abortController.signal.aborted) {
                    setPredictions(response)
                }
            })
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    console.error("Google Maps Places Autocomplete error:", error);
                    setPredictions([]);
                }
            });

        return () => abortController.abort();
    }, [query]);

    return { predictions };
}
