import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    try {
        // Getting Agent
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };
        const agent = await db.agent.findUnique({ where: { id }, include: { role: true } });
	console.log("here is agent")
	console.log(agent)

        // Assignments
        const assignments = await db.assignment.findMany({ where: { agentId: agent?.id } });

	console.log("here is assignments")
	console.log(assignments)

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "User logged in successfully",
            data: assignments,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
