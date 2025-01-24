import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";

export async function POST(req: NextRequest) {
    try {
        const { agentid, date, atype, comment } = await req.json();

        // Getting Agent
        const agent = await db.agent.findUnique({ where: { id: agentid } });
        if (!agent) {
            return NextResponse.json({ status: "failure", message: "agent not found" }, { status: 404 });
        }

        await db.agentAttendance.create({
            data: {
                agentId: agent.id,
                date: new Date(date),
                type: atype,
                comment: comment,
            },
        });

        // Response
        const response = NextResponse.json({
            status: "success",
            message: `${agent.name} ${atype} on ${date}`,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "failure", error });
    }
}

export async function GET(req: NextRequest) {
    try {
        const agentid = req.nextUrl.searchParams.get("agentid");
        const full = (await req.nextUrl.searchParams.get("full")) === "true";
        const startDate = req.nextUrl.searchParams.get("startDate");
        const endDate = req.nextUrl.searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json(
                { status: "failure", message: "startDate or endDate not provided" },
                { status: 400 },
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ status: "failure", message: "Invalid date format" }, { status: 400 });
        }

        let agents;

        if (agentid) {
            const agent = await db.agent.findUnique({ where: { id: agentid } });
            if (!agent) {
                return NextResponse.json({ status: "failure", message: "agent not found" }, { status: 404 });
            }
            agents = [agent];
        } else if (full) {
            agents = await db.agent.findMany();
        } else {
            return NextResponse.json(
                { status: "failure", message: "Provide either 'agentid' or 'full=true'" },
                { status: 400 },
            );
        }

        const attendanceData = await db.agentAttendance.findMany({
            where: { date: { gte: start, lte: end } },
        });

        const attendanceByAgent = agents.map((agent) => {
            const attendanceRecords = attendanceData.filter((record) => record.agentId === agent.id);

            // Map attendance to { date: status }
            const attendance = {};
            for (const record of attendanceRecords) {
                attendance[record.date.toISOString().split("T")[0]] = record.type;
            }

            return {
                agentid: agent.id,
                agentName: agent.name,
                attendance,
            };
        });

        return NextResponse.json({ status: "success", data: attendanceByAgent });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "failure", error });
    }
}
