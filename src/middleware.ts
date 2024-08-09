import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("cm-token")?.value;

    if (currentUser && !request.nextUrl.pathname.startsWith("/dashboard")) {
        return Response.redirect(new URL("/dashboard/create", request.url));
    }

    if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.svg).*)"],
};
