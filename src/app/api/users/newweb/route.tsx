import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    await connectToMongoDB();
    try {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        date.setHours(0, 0, 0, 0);
        const phones = await User.find({ phoneOtpExpire: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) } })
            .sort({ phoneOtpExpire: -1 })
            .select({ name: 1, phoneOtpExpire: 1, phone: 1, _id: 0 });

        return NextResponse.json(phones);
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
