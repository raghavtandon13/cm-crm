import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";

export async function GET(_req: NextRequest) {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection("realtimecounts");
        const res = await collection.findOne({ lender: "RamFin" });

        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
