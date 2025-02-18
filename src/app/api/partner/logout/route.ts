import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };
        const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });

        const response = NextResponse.json({ status: "success", message: "Partner logged out successfully" });
        response.cookies.delete("cm-token");
        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
