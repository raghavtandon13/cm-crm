import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

const secret = process.env.JWT_SECRET as string;
export const dynamic = "force-dynamic";
const _IST_TIMEZONE = "Asia/Kolkata"; // Timezone for IST

export async function GET(req: NextRequest) {
    try {
        // Getting Agent
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };
        const _agent = await db.agent.findUnique({ where: { id }, include: { role: true } });

        // Attendance
        //    if (agent) {
        //        const confirmLogout = req.nextUrl.searchParams.get("confirmLogout") === "true";
        //        const today = startOfDay(new Date());
        //        const existingAttendance = await db.agentAttendance.findFirst({
        //            where: { agentId: agent.id, date: today },
        //        });
        //
        //        const now = new Date();
        //        const todayIST = toZonedTime(now, IST_TIMEZONE); // Convert to IST
        //        const todayDateString = format(todayIST, "yyyy-MM-dd"); // Date as "2024-10-21"
        //        const loginTimeString = format(todayIST, "h:mma"); // Time as "4:40PM"
        // const todayStartIST = startOfDay(todayIST);  // This is a Date object
        //
        //        if (confirmLogout && existingAttendance) {
        //            await db.agentAttendance.update({
        //                where: { id: existingAttendance.id },
        //                data: { logoutTime: loginTimeString },
        //            });
        //        }
        //    }

        // Response
        const response = NextResponse.json({ status: "success", message: "Agent logged out successfully" });
        response.cookies.delete("cm-token");
        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
