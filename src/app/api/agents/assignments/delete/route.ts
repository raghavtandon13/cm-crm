import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    const { assignmentId, agentId } = await req.json();
    try {
        // Getting Agent
        // if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        // const { id } = jwt.verify(token, secret) as { id: string };
        // const agent = await db.assignment.findUnique({ where: { id }, include: { agent: true } });
        // if (!agent) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Assignments
        const assignment = await db.assignment.delete({ where: { id: assignmentId } });
        if (!assignment) return NextResponse.json({ message: "Assignment not found" }, { status: 404 });

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "Assignment deleted successfully",
            data: assignment,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
