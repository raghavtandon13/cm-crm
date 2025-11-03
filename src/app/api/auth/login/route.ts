import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    try {
        const { email, pass } = await req.json();

        const partner = await db.partner.findUnique({ where: { email }, include: { role: true } });
        const agent = await db.agent.findUnique({ where: { email }, include: { role: true } });
        if (!partner && !agent)
            return NextResponse.json({ status: "failure", message: "Invalid credentials provided" }, { status: 401 });

        const user = partner || agent;
        if (!user?.role?.title)
            return NextResponse.json({ status: "failure", message: "Invalid credentials provided" }, { status: 401 });
        const role = user.role.title;

        // Check password
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch)
            return NextResponse.json({ status: "failure", message: "Invalid email or password" }, { status: 401 });

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email, role }, secret, { expiresIn: "10h" });

        // Response
        const response = NextResponse.json({
            status: "success",
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully`,
        });

        response.cookies.set("cm-token", token);

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ status: "failure", error });
    }
}
