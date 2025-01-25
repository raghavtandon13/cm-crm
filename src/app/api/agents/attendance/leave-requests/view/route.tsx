import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../../../lib/db";

export async function GET(req: NextRequest) {
    try {
        const leaveRequests = await db.leaveRequest.findMany({
            orderBy: { createdAt: "desc" },
        });

        const leaveRequestsWithAgentNames = await Promise.all(
            leaveRequests.map(async (leaveRequest) => {
                const agent = await db.agent.findUnique({
                    where: { id: leaveRequest.agentId },
                });
                return {
                    ...leaveRequest,
                    agentName: agent?.name || "Unknown",
                };
            }),
        );

        return NextResponse.json({ status: "success", data: leaveRequestsWithAgentNames }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ status: "failure", error });
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    const { leaveReqId, decision } = await req.json();

    if (!leaveReqId || !decision) {
        return NextResponse.json({ status: "failure", messgae: "leaveReqId and decision are required." });
    }

    try {
        // if startDate and endDate is same then leave is only for one day but if they are different then leave is for multiple days
        const updatedLeaveRequest = await db.leaveRequest.update({
            where: { id: leaveReqId },
            data: { status: decision },
        });
        if (decision === "APPROVED") {
            const startDate = new Date(updatedLeaveRequest.startDate);
            const endDate = new Date(updatedLeaveRequest.endDate);
            const dates = [];

            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }

            await Promise.all(
                dates.map(async (date) => {
                    await db.agentAttendance.create({
                        data: {
                            agentId: updatedLeaveRequest.agentId,
                            date: date,
                            type: "LEAVE",
                            comment: updatedLeaveRequest.reason,
                            mutable: false,
                        },
                    });
                }),
            );
        }
        return NextResponse.json({ status: "success", data: updatedLeaveRequest });
    } catch (error) {
        return NextResponse.json({ status: "failure", message: "Error updating leave request" });
    }
}
