import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import { startOfDay } from "date-fns";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;
import bcrypt from "bcrypt";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        // Getting Agent
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };
        const partner = await db.partner.findUnique({ where: { id } });

        if (!partner) {
            return NextResponse.json({ status: "failure", message: "No partner found" }, { status: 404 });
        }

        if (partner) {
            const { password } = await req.json();
            const hashedPassword = await bcrypt.hash(password, 10);

            await db.partner.update({
                where: { id: id },
                data: {
                    password: hashedPassword,
                    passwordUpdated: true,
                },
            });

            return NextResponse.json({ status: "success", message: "Password updated successfully" });
        }

        return NextResponse.json({ status: "failure", message: "Internal server error" });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
