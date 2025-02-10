import type { NextRequest } from "next/server";
import axios from "axios";

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("cm-token")?.value;

    if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/login", request.url));
    }

    if (currentUser) {
        const response = await axios.get("http://13.201.83.62/api/agents/get", {
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
        };

        const allowedRoutes = roleRoutes[role] || [];

        if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
            return Response.redirect(new URL("/dashboard/agent_attendance", request.url));
        }

        if (role === "BOSS" && pathname === "/dashboard") {
            return Response.redirect(new URL("/dashboard/reports", request.url));
        }

        if (role === "HR" && pathname === "/dashboard") {
            return Response.redirect(new URL("/dashboard/attendance", request.url));
        }
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.svg).*)"],
};
