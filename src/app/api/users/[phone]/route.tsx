import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { phone: string } }) {
    await connectToMongoDB();
    try {
        const phone = params.phone;

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        const user = await User.findOne({ phone: phone });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
