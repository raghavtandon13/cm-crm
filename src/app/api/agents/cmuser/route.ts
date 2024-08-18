import jwt from "jsonwebtoken";
import { db } from "../../../../../lib/db";
import { NextResponse, NextRequest } from "next/server";
import { CMUser, Lead } from "@/lib/types";
import User from "@/lib/users";

const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    const token = await req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });

    const { id } = jwt.verify(token, secret) as { id: string };

    const agent = await db.agent.findUnique({
        where: { id },
        include: { role: true },
    });

    if (!agent) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 403 });

    try {
        const data: Lead = await req.json();
        const newUser = new User<Partial<CMUser>>({
            name: data.firstName + " " + data.lastName,
            phone: data.phone,
            email: data.email,
            dob: data.dob,
            gender: data.gender,
            addr: data.address,
            pincode: data.pincode,
            city: data.city,
            state: data.state,
            employment: data.empType,
            company_name: data.company,
        });
        const user = await newUser.save();

        if (!user)
            return NextResponse.json({ status: "failure", message: "Could not create new user" }, { status: 500 });

        const assignment = await db.assignment.create({ data: { cmUserId: user._id as string, agentId: agent.id } });
	console.log(user)
	console.log(assignment)

        if (!assignment)
            return NextResponse.json({ status: "failure", message: "Could not create Assignment" }, { status: 500 });

        return NextResponse.json({ status: "success", message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error creating new agent:", error);
        return NextResponse.json({ status: "failure", message: "Internal server error" }, { status: 500 });
    }
}
