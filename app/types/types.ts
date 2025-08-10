import { StructuredFormErrorMap } from "@/app/utils/build-form-error-map";

export interface Rates {
    nightly?: number;
    weekly?: number;
    monthly?: number
}

export type ActionState = {
    message?: string | null;
    status?: 'SUCCESS' | 'ERROR' | null,
    isFavorite?: boolean,
    isRead?: boolean,
    formData?: FormData,
    formErrorMap?: StructuredFormErrorMap
}

export interface PropertiesQuery {
    $or: [
        { name: RegExp },
        { description: RegExp },
        { amenities: RegExp },
        { type: RegExp },
        { 'location.street': RegExp },
        { 'location.city': RegExp },
        { 'location.state': RegExp },
        { 'location.zip': RegExp }
    ]
}

export interface PropertyImageData {
    secureUrl: string;
    publicId: string;
}

export type FormErrorsType = Record<string, string[]> | string[];

export const MAX_ITEMS_PER_PAGE = 6;