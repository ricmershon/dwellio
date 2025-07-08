export type ActionState = {
    message?: string | null;
    status?: 'SUCCESS' | 'ERROR' | null,
    isBookmarked?: boolean,
    isRead?: boolean,
    formData?: FormData
}

export interface PropertiesQuery {
    $or: [
        { name: RegExp },
        { description: RegExp},
        { 'location.street': RegExp },
        { 'location.city': RegExp },
        { 'location.state': RegExp },
        { 'location.zip': RegExp }
    ]
}

export interface ImageData {
    secureUrl: string;
    publicId: string;
}

export const MAX_ITEMS_PER_PAGE = 6;