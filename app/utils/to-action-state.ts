import { ActionState } from "@/app/lib/definitions";

export const toActionState = (
    message: string,
    status: "SUCCESS" | "ERROR"
): ActionState => ({ message, status });
