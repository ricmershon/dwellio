import { StructuredFormErrorMap } from "@/utils/build-form-error-map";

export const ActionStatus = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
} as const;

type ActionStatus = (typeof ActionStatus)[keyof typeof ActionStatus];

export type ActionState = {
  message?: string | null;
  status?: ActionStatus | null;
  isFavorite?: boolean;
  isRead?: boolean;
  formData?: FormData;
  formErrorMap?: StructuredFormErrorMap;
};

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
    width: number;
    height: number;
}

export interface Rates {
    nightly?: number;
    weekly?: number;
    monthly?: number
}

export interface Amenity {
    id: string,
    value: string
}

export interface OptionType {
    value: string;
    label: string;
}

export type FormErrorsType = Record<string, string[]> | string[];

export const VIEWPORT_WIDTH_COOKIE_NAME = 'viewport_width';