import type { NextRequest } from "next/server";
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

        const roleRoutes = {
            BOSS: [
                "/dashboard/create",
                "/dashboard/myleads",
                "/dashboard/team_leads",
                "/dashboard/search",
                "/dashboard/reports",
                "/dashboard/reports2",
                "/dashboard/register",
                "/dashboard/database",
                "/dashboard/attendance",
                "/dashboard/export",
            ],
            DSA: [
                "/dashboard/partner_create",
                "/dashboard/partner_leads",
                "/dashboard/partner_search",
                "/dashboard/partner_dsa",
            ],
            HR: ["/dashboard/register", "/dashboard/attendance", "/dashboard/agent_attendance"],
            INDIV: ["/dashboard/partner_create", "/dashboard/partner_leads", "/dashboard/partner_search"],
            OE: ["/dashboard/create", "/dashboard/myleads", "/dashboard/search", "/dashboard/agent_attendance"],
            SUBDSA: ["/dashboard/partner_create", "/dashboard/partner_leads", "/dashboard/partner_search"],
            TE: ["/dashboard/agent_attendance"],
            TL: [
                "/dashboard/create",
                "/dashboard/myleads",
                "/dashboard/search",
                "/dashboard/agent_attendance",
                "/dashboard/attendance",
                "/dashboard/team_leads",
                "/dashboard/export",
            ],
        };

        const allowedRoutes = roleRoutes[role] || [];

        const defaultRedirects = {
            BOSS: "/dashboard/reports",
            DSA: "/dashboard/partner_create",
            HR: "/dashboard/attendance",
            INDIV: "/dashboard/partner_create",
            OE: "/dashboard/create",
            SUBDSA: "/dashboard/partner_create",
            TE: "/dashboard/agent_attendance",
            TL: "/dashboard/team_leads",
        };

        if (pathname === "/dashboard" && defaultRedirects[role]) {
            return Response.redirect(new URL(defaultRedirects[role], request.url));
        }

        const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

        if (!isAllowed) {
            return Response.redirect(new URL(defaultRedirects[role], request.url));
        }
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.svg).*)"],
};
