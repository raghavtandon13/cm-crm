import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { format, startOfDay } from "date-fns";
// import { toZonedTime } from "date-fns-tz";

const secret = process.env.JWT_SECRET as string;
// const IST_TIMEZONE = 'Asia/Kolkata';  // Timezone for IST

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
        // const now = new Date();
        // const todayIST = toZonedTime(now, IST_TIMEZONE);  // Convert to IST
        // const todayDateString = format(todayIST, 'yyyy-MM-dd');  // Date as "2024-10-21"
        // const loginTimeString = format(todayIST, 'h:mma');  // Time as "4:40PM"
        //
        // const todayStartIST = startOfDay(todayIST);  // This is a Date object
        // const existingAttendance = await db.agentAttendance.findFirst({
        //     where: {
        //         agentId: user.id,
        //         date: todayStartIST,  // Use the Date object here
        //     },
        // });
        //
        // if (!existingAttendance) {
        //     await db.agentAttendance.create({
        //         data: {
        //             agentId: user.id,
        //             date: todayIST,  // Use Date object for `date` in create
        //             loginTime: loginTimeString,  // Store time as string
        //         },
        //     });
        // }

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "User logged in successfully",
            // date: todayDateString,  // Send date as string in the response
            // loginTime: loginTimeString,  // Send time as string in the response
        });

        response.cookies.set("cm-token", token);

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "failure", error });
    }
}
