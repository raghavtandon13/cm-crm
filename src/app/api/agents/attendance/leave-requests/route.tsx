import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../../lib/db";

export async function GET(req: NextRequest, res: NextResponse) {
    const agentid = req.nextUrl.searchParams.get("agentid");

    if (!agentid) {
        return NextResponse.json({ status: "failure", message: "Agent ID is required" }, { status: 400 });
    }

    try {
        const leaveRequests = await db.leaveRequest.findMany({
            where: { agentId: String(agentid) },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ status: "success", data: leaveRequests }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ status: "failure", error });
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    const { agentid, startDate, endDate, reason } = await req.json();

    if (!agentid || !startDate || !endDate || !reason) {
        return NextResponse.json({ status: "failure", messgae: "All fields are required." });
    }

    try {
        const newLeaveRequest = await db.leaveRequest.create({
            data: {
                agentId: agentid,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
            },
        });
        return NextResponse.json({ status: "success", data: newLeaveRequest });
    } catch (error) {
        return NextResponse.json({ status: "failure", message: "Error creating leave request" });
    }
}
