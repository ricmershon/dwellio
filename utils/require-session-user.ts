import { redirect } from "next/navigation";

import { getSessionUser } from "@/utils/get-session-user";

export const requireSessionUser = async () => {
    const user = await getSessionUser();
    if (!user || !user.id){
        redirect("/authRequired=true");
    }
    return user;
};
