import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Intercepts the typical provider flow
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("authRequired", "true");
        url.searchParams.set("returnTo", req.nextUrl.pathname + req.nextUrl.search); // optional
        return NextResponse.redirect(url);
    }

    // Auth OK
    return NextResponse.next();
}

export const config = {
  matcher: ["/properties/add", "/profile", "/properties/favorites", "/messages"],
};
