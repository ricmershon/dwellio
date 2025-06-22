export type ActionState = {
    message?: string | null;
    status?: 'SUCCESS' | 'ERROR' | null,
    isBookmarked?: boolean
}