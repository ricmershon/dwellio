import { ZodError } from "zod";
import { FormErrorsType } from "@/types/types";

// TODO: document functions in this file.
export const buildFormErrorMap = (issues: ZodError['issues']) => {
    const errorMap: Record<string, string[]> = {};

    for (const issue of issues) {
        const path = issue.path.join('.');
        if (!errorMap[path]) {
            errorMap[path] = [];
        }
        errorMap[path].push(issue.message);
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
    const structured: StructuredFormErrorMap = {};

    for (const [key, messages] of Object.entries(flatErrors)) {
        if (key.startsWith("location.")) {
            structured.location = structured.location || {};
            const field = key.split(".")[1];
            structured.location[field] = messages;
        } else if (key.startsWith("rates.")) {
            structured.rates = structured.rates || {};
            const field = key.split(".")[1];
            structured.rates[field] = messages;
        } else if (key.startsWith("sellerInfo.")) {
            structured.sellerInfo = structured.sellerInfo || {};
            const field = key.split(".")[1];
            structured.sellerInfo[field] = messages;
        } else {
            structured[key] = messages;
        }
    }

    return structured;
};