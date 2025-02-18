import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    try {
        const { email, pass } = await req.json();

        // Getting Partner
        const partner = await db.partner.findUnique({ where: { email } });
        if (!partner) return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });

        const isMatch = await bcrypt.compare(pass, partner.password);
        if (!isMatch) return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });

        const token = jwt.sign({ id: partner.id, email: partner.email }, secret, { expiresIn: "10h" });

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "Partner logged in successfully",
            // token: token,
        });

        response.cookies.set("cm-token", token);

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "failure", error });
    }
}
