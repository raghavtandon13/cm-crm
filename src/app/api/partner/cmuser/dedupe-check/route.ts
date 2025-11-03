import User from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../lib/db";

// const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    await connectToMongoDB();
    // const token = await req.headers.get("Authorization")?.split(" ")[1];
    // if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });

    // const { id } = jwt.verify(token, secret) as { id: string };
    // const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });
    // if (!partner) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 403 });

    try {
        const data = (await req.json()) as { phone: string };
        let user = await User.findOne({ phone: data.phone });
        if (!user) return NextResponse.json({ status: "success", message: "new lead" }, { status: 201 });
        return NextResponse.json({ status: "failure", message: "duplicate lead" }, { status: 201 });
    } catch (error) {
        console.error("Error checking dedupe:", error);
        return NextResponse.json({ status: "failure", message: "Internal server error" }, { status: 500 });
    }
}
