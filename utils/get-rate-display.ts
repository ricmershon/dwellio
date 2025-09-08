import { Rates } from "@/types";

/**
 * Formats rate display string with priority: monthly > weekly > nightly
 * @param rates - Rates object containing rate values
 * @returns Formatted rate string or undefined if no valid rates
 */
export const getRateDisplay = (rates: Rates) => {
    // Input validation
    if (!rates) {
        console.warn('getRateDisplay: rates parameter is null or undefined');
        return undefined;
    }
    
    if (typeof rates !== 'object') {
        console.warn('getRateDisplay: rates parameter is not an object');
        return undefined;
    }
    
    try {
        // Check monthly rate first (highest priority)
        if (rates.monthly !== undefined && rates.monthly !== null) {
            if (typeof rates.monthly === 'number' && rates.monthly >= 0 && Number.isFinite(rates.monthly)) {
                try {
                    return `$${rates.monthly.toLocaleString()}/mo`;
                } catch (localeError) {
                    console.warn('getRateDisplay: error formatting monthly rate:', localeError);
                    return `$${rates.monthly}/mo`;
                }
            } else {
                console.warn('getRateDisplay: monthly rate is not a valid positive number');
            }
        }
        
        // Check weekly rate second
        if (rates.weekly !== undefined && rates.weekly !== null) {
            if (typeof rates.weekly === 'number' && rates.weekly >= 0 && Number.isFinite(rates.weekly)) {
                try {
                    return `$${rates.weekly.toLocaleString()}/wk`;
                } catch (localeError) {
                    console.warn('getRateDisplay: error formatting weekly rate:', localeError);
                    return `$${rates.weekly}/wk`;
                }
            } else {
                console.warn('getRateDisplay: weekly rate is not a valid positive number');
            }
        }
        
        // Check nightly rate last (lowest priority)
        if (rates.nightly !== undefined && rates.nightly !== null) {
            if (typeof rates.nightly === 'number' && rates.nightly >= 0 && Number.isFinite(rates.nightly)) {
                try {
                    return `$${rates.nightly.toLocaleString()}/night`;
                } catch (localeError) {
                    console.warn('getRateDisplay: error formatting nightly rate:', localeError);
                    return `$${rates.nightly}/night`;
                }
            } else {
                console.warn('getRateDisplay: nightly rate is not a valid positive number');
            }
        }
        
        // No valid rates found
        return undefined;
    } catch (error) {
        console.error('getRateDisplay: error processing rates:', error);
        return undefined;
    }
};