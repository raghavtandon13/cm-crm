import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../../../../lib/db";
import { NextResponse, NextRequest } from "next/server";

const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });

    const { id } = jwt.verify(token, secret) as { id: string };
    const user = await db.agent.findUnique({
        where: { id },
        include: { role: true },
    });

    if (!user) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 401 });
    if (user.role.title !== "BOSS") return NextResponse.json({ status: "failure", message: "Not Authorized" }, { status: 401 });

    try {
        const { email, firstName, lastName, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAgent = await db.agent.create({
            data: {
                email: email,
                name: firstName + " " + lastName,
                password: hashedPassword,
                roleId: "66b1f154acdf2c3f9384f59c", // AGENT
            },
            include: { role: true },
        });

        const token = jwt.sign({ id: newAgent.id, email: newAgent.email }, secret, { expiresIn: "10h" });
        const response = NextResponse.json({ status: "success", message: "Agent created successfully" });
        return response;
    } catch (error) {
        console.error("Error creating new agent:", error);
        return NextResponse.json(error);
    }
}
