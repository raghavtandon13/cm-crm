import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../lib/db";
import mongoose from "mongoose";
import { Parser } from "json2csv";

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

    // Convert to CSV
    const fields = ["date", "phone", "stage", "ref", "name", "email", "income"];
    const parser = new Parser({ fields });
    const csv = parser.parse(otpUsers);

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=stages_${new Date().toISOString().split("T")[0]}.csv`,
        },
    });
}
