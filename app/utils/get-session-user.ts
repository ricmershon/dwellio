import { getServerSession } from "next-auth/next";
import { authConfig } from "@/app/utils/auth-config";

export const getSessionUser = async () => {
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
        return null;
    }
    return session.user
}