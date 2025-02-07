import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    try {
        // Fetch all agents and their assignments
        const agents = await db.agent.findMany({
            include: {
                Assignment: true,
            },
        });

        // Structure the response
        const responseData = agents.reduce((acc, agent) => {
            if (agent.Assignment.length > 0 && agent.active === true) {
                acc[agent.id] = {
                    name: agent.name,
                    assignments: agent.Assignment,
                };
            }
            return acc;
        }, {});

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "Assignments fetched successfully",
            data: responseData,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
