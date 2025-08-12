import { ActionState } from "@/types/types";

export const toActionState = (actionState: ActionState): ActionState => {
    const { status, message, isFavorite, isRead, formData, formErrorMap } = actionState;
    return (
        { status, message, isFavorite, isRead, formData, formErrorMap }
    )
};
