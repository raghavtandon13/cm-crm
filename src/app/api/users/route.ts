import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";

export async function GET(req: NextRequest) {
    try {
        const pageParam = req.nextUrl.searchParams.get("page") as string;
        let page = parseInt(pageParam) || 1;
        const limit = 10;

        if (isNaN(page) || page < 1) page = 1;

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
