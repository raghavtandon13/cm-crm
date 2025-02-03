import type { NextRequest } from "next/server";
import axios from "axios";

export async function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("cm-token")?.value;

    if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
        return Response.redirect(new URL("/login", request.url));
    }

    if (currentUser && !request.nextUrl.pathname.startsWith("/dashboard")) {
        const response = await axios.get("http://13.201.83.62//api/agents/get", {
            headers: { Authorization: `Bearer ${currentUser}` },
        });
        if (response.data.role.title === "BOSS") {
            return Response.redirect(new URL("/dashboard/reports", request.url));
        }
        if (response.data.role.title === "HR") {
            return Response.redirect(new URL("/dashboard/attendance", request.url));
        }
        return Response.redirect(new URL("/dashboard/create", request.url));
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.svg).*)"],
};
