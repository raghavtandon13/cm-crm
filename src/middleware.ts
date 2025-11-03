import type { NextRequest } from "next/server";
import { DASHBOARD_ROUTES, DEFAULT_REDIRECTS } from "@/lib/roles";
import { http } from "./lib/api";

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("cm-token")?.value;

    if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/login", request.url));
    }

    if (currentUser) {
        const response = await http.get("http://localhost:3000/api/auth/get", {
            headers: { Authorization: `Bearer ${currentUser}` },
        });
        const role = response.data.role.title;
        const pathname = request.nextUrl.pathname;
        const allowedRoutes = DASHBOARD_ROUTES.filter((route) => route.roles.includes(role)).map((route) => route.path);

        if (pathname === "/dashboard" && DEFAULT_REDIRECTS[role]) {
            return Response.redirect(new URL(DEFAULT_REDIRECTS[role], request.url));
        }

        const isAllowed = allowedRoutes.some((route) => pathname === route);
        if (!isAllowed) {
            return Response.redirect(new URL(DEFAULT_REDIRECTS[role], request.url));
        }
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.svg).*)"],
};
