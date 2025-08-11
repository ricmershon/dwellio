import { ActionState } from "@/types/types";

export const toActionState = (
    message: string,
    status: "SUCCESS" | "ERROR",
    isFavorite?: boolean,
    isRead?: boolean,
    formData?: FormData
): ActionState => ({ message, status, isFavorite, isRead, formData });
