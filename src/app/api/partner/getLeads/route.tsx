// getting partner leads
import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { db, connectToMongoDB } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    try {
        // Getting Agent
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };
        const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });

        // Assignments
        const partnerLeads = await db.partnerLeads.findMany({ where: { partnerId: partner?.id } });
        await connectToMongoDB();

        // Find users for each cmUserId in partnerLeads
        const users = await Promise.all(
            partnerLeads.map(async (lead) => {
                const user = await User.findById(lead.cmUserId).select("name email phone");
                return { ...lead, user };
            }),
        );

        // Response
        const response = NextResponse.json({
            status: "success",
            data: users,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
