import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;
import { startOfDay } from "date-fns";


export async function POST(req: NextRequest) {
    try {
        const { email, pass } = await req.json();

        // Getting Agent
        const user = await db.agent.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "10h" });

        // Attendance
        const today = startOfDay(new Date());
        const existingAttendance = await db.agentAttendance.findFirst({ where: { agentId: user.id, date: today } });
        if (!existingAttendance) {
            await db.agentAttendance.create({ data: { agentId: user.id, date: today, loginTime: new Date() } });
        }

        // Response
        const response = NextResponse.json({ status: "success", message: "User logged in successfully" });
        response.cookies.set("cm-token", token);

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
