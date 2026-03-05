import { type NextRequest, NextResponse } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    await connectToMongoDB();
    try {
        const pageParam = req.nextUrl.searchParams.get("page") as string;
        let page = parseInt(pageParam, 10) || 1;
        const limit = 10;

        if (Number.isNaN(page) || page < 1) page = 1;

        const users = await User.find({})
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
