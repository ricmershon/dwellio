import type { AutocompleteFetchOptions, AutocompletePrediction, AutocompleteResponse } from "@/types";

type AddressComponent = {
    types?: string[];
    longText?: string;
    shortText?: string;
};

type PlaceDetailsResponse = {
    addressComponents?: AddressComponent[];
};

/**
 * Fetches autocomplete places.
 * 
 * @param {string} query
 * @param {AutocompleteFetchOptions} options 
 * @returns Promise<AutocompletePrediction[]> - array of predictions
 */
export const fetchPlacesAutocomplete = async (
    query: string,
    options: AutocompleteFetchOptions = {}
) => {
    const {
        signal,
        includeDetails = false,
        maxDetails = 5,
        regionCode = "US",
        includedPrimaryTypes = ["street_address"],
    } = options;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");

    const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        signal,
        headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId," +
            "suggestions.placePrediction.text," +
            "suggestions.placePrediction.structuredFormat",
        } as Record<string, string>,
        body: JSON.stringify({
            input: query,
            includedPrimaryTypes,
            regionCode,
        }),
    });

    if (!resp.ok) {
        const message = await resp.text().catch(() => String(resp.status));
        throw new Error(`Autocomplete ${resp.status}: ${message}`);
    }

    const data = (await resp.json()) as AutocompleteResponse;
    const list = data.suggestions ?? [];

    // Base prediction
    const basePredictions: AutocompletePrediction[] = list.map((suggestion) => ({
        placeId: suggestion.placePrediction.placeId,
        text: suggestion.placePrediction.text?.text ?? "",
        structuredFormat: suggestion.placePrediction.structuredFormat,
        street: undefined,
        city: undefined,
        state: undefined,
        zipcode: undefined,
    }));

    if (!includeDetails || basePredictions.length === 0) {
        return basePredictions;
    }

    // Enrich top N with Place Details (addressComponents)
    const detailsCap = Math.min(basePredictions.length, Math.max(maxDetails));
    await Promise.allSettled(
        basePredictions.slice(0, detailsCap).map(async (prediction, index) => {
            const parts = await fetchPlaceDetails(prediction.placeId, apiKey, signal);

            basePredictions[index].street = parts.street;
            basePredictions[index].city = parts.city;
            basePredictions[index].state = parts.state;
            basePredictions[index].zipcode = parts.zipcode;
        })
    );

    return basePredictions;
};

/**
 * Fethes details for a place prediction.
 * 
 * @param {string} placeId 
 * @param {string} apiKey 
 * @param {AbortSignal} signal 
 * @returns Promise<Omit<AutocompletePrediction, "structuredFormat" | "placeId" | "text">>
 * - an autocomplete prediction.
 */
const fetchPlaceDetails = async (
    placeId: string,
    apiKey: string,
    signal?: AbortSignal
): Promise<Omit<AutocompletePrediction, "placeId" | "text" | "structuredFormat">> => {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
        method: "GET",
        signal,
        headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "addressComponents",
        } as Record<string, string>,
    });

    if (!response.ok) {
        return { street: null, city: null, state: null, zipcode: null };
    }

    const data = (await response.json()) as PlaceDetailsResponse;
    return extractAddressParts(data.addressComponents);
}

/**
 * Extracts address parts from an address component.
 * 
 * @param {AddressComponent[] }addressComponents 
 * @returns object containing extracted address parts.
 */
function extractAddressParts(addressComponents?: AddressComponent[]) {
    const getComponent = (type: string) =>
        addressComponents?.find((addressComponent) => addressComponent.types?.includes(type));

    const streetNumber = getComponent("street_number")?.longText?.trim() || null;
    const route = getComponent("route")?.longText?.trim() || null;
    const city = getComponent("locality")?.longText?.trim()
        || getComponent("postal_town")?.longText?.trim()
        || getComponent("sublocality")?.longText?.trim()
        || null;
    const state = getComponent("administrative_area_level_1")?.shortText?.trim()
        || getComponent("administrative_area_level_1")?.longText?.trim()
        || null;
    const zipcode = getComponent("postal_code")?.longText?.trim() || null;

    const street = [streetNumber, route].filter(Boolean).join(" ") || null;

    return { street, city, state, zipcode };
}