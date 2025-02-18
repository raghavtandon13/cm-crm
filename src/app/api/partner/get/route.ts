//  WARN: DELETE THIS ROUTE, NOT NEEDED ANYMORE

import jwt from "jsonwebtoken";
import { db } from "../../../../../lib/db";
import { NextResponse, NextRequest } from "next/server";

const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    try {
        const { id } = jwt.verify(token, secret) as { id: string };

        const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });
        const agent = await db.agent.findUnique({ where: { id }, include: { role: true } });
        if (!partner && !agent) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 401 });
        const user = partner || agent;

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error: any) {
        return NextResponse.json({ message: error }, { status: 500 });
    }
}
