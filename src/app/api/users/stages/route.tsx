import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { connectToMongoDB } from "../../../../../lib/db";

export async function GET() {
    await connectToMongoDB();
    if (!mongoose.connection.db) return NextResponse.json({ message: "Internal server error" }, { status: 500 });

    const otpUsers = await mongoose.connection.db
        .collection("stages")
        .aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
                        $lte: new Date(new Date().setDate(new Date().getDate() + 1)),
                    },
                },
            },
            { $lookup: { from: "users", localField: "phone", foreignField: "phone", as: "user" } },
            { $unwind: "$user" },
            {
                $project: {
                    date: 1,
                    phone: 1,
                    stage: 1,
                    ref: 1,
                    name: "$user.name",
                    email: "$user.email",
                    income: "$user.income",
                },
            },
        ])
        .sort({ date: -1 })
        .toArray();

    // Convert to CSV - Papa Parse is simpler!
    const csv = Papa.unparse(otpUsers, {
        columns: ["date", "phone", "stage", "ref", "name", "email", "income"],
    });

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=stages_${new Date().toISOString().split("T")[0]}.csv`,
        },
    });
}
