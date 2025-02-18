import type { NextRequest } from "next/server";
import axios from "axios";

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("cm-token")?.value;

    if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/login", request.url));
    }

    if (currentUser) {
        const response = await axios.get("http:/localhost:3000/api/auth/get", {
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
                "/dashboard/register",
                "/dashboard/database",
                "/dashboard/attendance",
            ],
            OE: ["/dashboard/create", "/dashboard/myleads", "/dashboard/search", "/dashboard/agent_attendance"],
            TE: ["/dashboard/agent_attendance"],
            TL: ["/dashboard/agent_attendance", "/dashboard/attendance", "/dashboard/team_leads"],
            HR: ["/dashboard/register", "/dashboard/attendance", "/dashboard/agent_attendance"],
            INDIV: ["/dashboard/partner_create", "/dashboard/partner_leads"],
        };

        const allowedRoutes = roleRoutes[role] || [];

        const defaultRedirects = {
            BOSS: "/dashboard/reports",
            HR: "/dashboard/attendance",
            INDIV: "/dashboard/partner_create",
            OE: "/dashboard/create",
            TE: "/dashboard/agent_attendance",
            TL: "/dashboard/team_leads",
        };

        if (pathname === "/dashboard" && defaultRedirects[role]) {
            return Response.redirect(new URL(defaultRedirects[role], request.url));
        }

        if (!allowedRoutes.includes(pathname)) {
            return Response.redirect(new URL(defaultRedirects[role], request.url));
        }
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.svg).*)"],
};
