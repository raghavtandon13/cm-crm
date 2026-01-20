import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    try {
        const { email, pass } = await req.json();

        // Getting Agent
        const user = await db.agent.findUnique({ where: { email } });
        if (!user)
            return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch)
            return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });

        const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "10h" });

        // Response
        const response = NextResponse.json({
            status: "success",
            message: "User logged in successfully",
        });

        response.cookies.set("cm-token", token);

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "failure", error });
    }
}
