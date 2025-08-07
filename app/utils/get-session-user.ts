import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/config/auth-options";

export const getSessionUser = async () => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return null;
    }
    return session.user;
}