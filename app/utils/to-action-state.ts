import { ActionState } from "@/app/lib/definitions";

export const toActionState = (
    message: string,
    status: "SUCCESS" | "ERROR",
    isBookmarked?: boolean,
    isRead?: boolean,
): ActionState => ({ message, status, isBookmarked, isRead});
