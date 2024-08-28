import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import { startOfDay } from "date-fns";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    try {
        // Getting Agent
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };
        const agent = await db.agent.findUnique({ where: { id }, include: { role: true } });

        // Attendance
        if (agent) {
            const confirmLogout = req.nextUrl.searchParams.get("confirmLogout") === "true";
            const today = startOfDay(new Date());
            const existingAttendance = await db.agentAttendance.findFirst({
                where: { agentId: agent.id, date: today },
            });
            if (confirmLogout && existingAttendance) {
                await db.agentAttendance.update({
                    where: { id: existingAttendance.id },
                    data: { logoutTime: new Date() },
                });
            }
        }

        // Response
        const response = NextResponse.json({ status: "success", message: "Agent logged out successfully" });
        response.cookies.delete("cm-token");
        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
