import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";

export async function GET(_req: NextRequest, props: { params: Promise<{ cmid: string }> }) {
    const params = await props.params;
    await connectToMongoDB();
    try {
        const cmid = params.cmid;

        if (!cmid) {
            return NextResponse.json({ error: "CMID is required" }, { status: 400 });
        }

        const user = await User.findOne({ _id: cmid });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
