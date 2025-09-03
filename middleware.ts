import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Intercepts the typical provider flow to see if user is trying to access a protected page.
export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("authRequired", "true");
        url.searchParams.set("returnTo", `${req.nextUrl.pathname}${req.nextUrl.search}`);
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/properties/add", "/properties/edit", "/profile", "/properties/favorites", "/messages"],
};