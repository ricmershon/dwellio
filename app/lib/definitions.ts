export type ActionState = {
    message?: string | null;
    status?: 'SUCCESS' | 'ERROR' | null,
    isBookmarked?: boolean,
    isRead?: boolean,
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