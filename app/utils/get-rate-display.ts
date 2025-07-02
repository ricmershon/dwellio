import { Rates } from "@/app/models/property-model";

export const getRateDisplay = (rates: Rates) => {
    if (rates.monthly) {
        return `$${rates.monthly.toLocaleString()}/mo`;
    } else if (rates.weekly) {
        return `$${rates.weekly.toLocaleString()}/wk`;
    } else if (rates.nightly) {
        return `$${rates.nightly.toLocaleString()}/night`;
    }
};