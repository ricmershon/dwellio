import { ZodError } from "zod";
import { FormErrorsType } from "@/types/types";

/**
 * Builds a structured form error map from Zod validation issues
 * @param issues - Array of Zod validation issues
 * @returns Structured form error map organized by field groups
 */
export const buildFormErrorMap = (issues: ZodError["issues"]) => {
    // Input validation
    if (!issues) {
        console.warn('buildFormErrorMap: issues parameter is null or undefined');
        return structureErrors({});
    }
    
    if (!Array.isArray(issues)) {
        console.warn('buildFormErrorMap: issues parameter is not an array');
        return structureErrors({});
    }
    
    const errorMap: Record<string, string[]> = {};

    try {
        for (const issue of issues) {
            // Validate issue structure
            if (!issue || typeof issue !== 'object') {
                console.warn('buildFormErrorMap: skipping invalid issue object');
                continue;
            }
            
            // Validate path exists and is an array
            if (!issue.path || !Array.isArray(issue.path)) {
                console.warn('buildFormErrorMap: issue missing valid path array');
                continue;
            }
            
            // Validate message exists
            if (!issue.message || typeof issue.message !== 'string') {
                console.warn('buildFormErrorMap: issue missing valid message string');
                continue;
            }
            
            try {
                const path = issue.path.join(".");
                if (!errorMap[path]) {
                    errorMap[path] = [];
                }
                errorMap[path].push(issue.message);
            } catch (pathError) {
                console.warn('buildFormErrorMap: error processing issue path:', pathError);
                continue;
            }
        }
    } catch (error) {
        console.error('buildFormErrorMap: error processing issues:', error);
        // Return empty structured errors on processing failure
        return structureErrors({});
    }

    return structureErrors(errorMap);
};

type ErrorMap = Record<string, string[]>;

export interface StructuredFormErrorMap {
    location?: Record<string, string[]>;
    rates?: Record<string, string[]>;
    sellerInfo?: Record<string, string[]>;
    [key: string]: FormErrorsType | undefined;
}

function structureErrors(flatErrors: ErrorMap): StructuredFormErrorMap {
    // Input validation
    if (!flatErrors || typeof flatErrors !== 'object') {
        console.warn('structureErrors: flatErrors parameter is not a valid object');
        return {};
    }

    const structured: StructuredFormErrorMap = {};

    try {
        for (const [key, messages] of Object.entries(flatErrors)) {
            // Validate key and messages
            if (!key || typeof key !== 'string') {
                console.warn('structureErrors: skipping invalid key');
                continue;
            }
            
            if (!messages || !Array.isArray(messages)) {
                console.warn('structureErrors: skipping invalid messages array for key:', key);
                continue;
            }

            try {
                if (key.startsWith("location.")) {
                    structured.location = structured.location || {};
                    const field = key.split(".")[1];
                    if (field) {
                        structured.location[field] = messages;
                    }
                } else if (key.startsWith("rates.")) {
                    structured.rates = structured.rates || {};
                    const field = key.split(".")[1];
                    if (field) {
                        structured.rates[field] = messages;
                    }
                } else if (key.startsWith("sellerInfo.")) {
                    structured.sellerInfo = structured.sellerInfo || {};
                    const field = key.split(".")[1];
                    if (field) {
                        structured.sellerInfo[field] = messages;
                    }
                } else {
                    structured[key] = messages;
                }
            } catch (fieldError) {
                console.warn('structureErrors: error processing field for key:', key, fieldError);
                continue;
            }
        }
    } catch (error) {
        console.error('structureErrors: error processing flatErrors:', error);
        return {};
    }

    return structured;
};