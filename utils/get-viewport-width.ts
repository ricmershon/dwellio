import { cookies } from "next/headers";

import { VIEWPORT_WIDTH_COOKIE_NAME } from "@/types/types";

export const getViewportWidth = async () => {
    const cookieStore = await cookies();
    const viewportCookie = cookieStore.get(VIEWPORT_WIDTH_COOKIE_NAME)?.value;

    return viewportCookie ? Number(viewportCookie) : 0;
}