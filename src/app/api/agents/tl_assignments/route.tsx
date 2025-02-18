import { NextResponse, NextRequest } from "next/server";
import { db, connectToMongoDB } from "../../../../../lib/db";
import User from "@/lib/users";
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
        const responseData = await Promise.all(
            agents.map(async (agent) => {
                if (agent.Assignment.length > 0 && agent.active === true) {
                    const simplifiedAssignments = await Promise.all(
                        agent.Assignment.map(async (assignment) => {
                            const user = await User.findById(assignment.cmUserId).select("name email phone");
                            return {
                                assignmentId: assignment.id,
                                agentId: assignment.agentId,
                                cmUserId: assignment.cmUserId,
                                assignedAt: assignment.assignedAt,
                                status: assignment.status,
                                userPhone: user?.phone,
                                userEmail: user?.email,
                                userName: user?.name,
                            };
                        }),
                    );

                    return {
                        agentId: agent.id,
                        agentName: agent.name,
                        assignments: simplifiedAssignments,
                    };
                }
                return null;
            }),
        );

        // Filter out null values
        const filteredResponseData = responseData.filter((agent) => agent !== null);

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "Assignments fetched successfully",
            data: filteredResponseData,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
