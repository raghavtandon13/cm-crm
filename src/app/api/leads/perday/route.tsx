import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";

async function perDay(startDay: string, endDay: string, period: string = "monthly", filters: any = {}) {
    await connectToMongoDB();
    const dateFormat = period === "monthly" ? "%Y-%m" : "%Y-%m-%d";
    const matchConditions: any = { createdAt: { $gte: new Date(startDay), $lt: new Date(endDay) } };
    if (filters.partner) matchConditions.partner = filters.partner;
    if (filters["accounts.name"]) matchConditions["accounts.name"] = filters["accounts.name"];
    const result = await User.aggregate([
        { $unwind: "$accounts" },
        { $match: matchConditions },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                    accountName: "$accounts.name",
                },
                count: { $sum: 2 },
            },
        },
        { $group: { _id: "$_id.date", totalAccounts: { $sum: "$count" } } },
        { $project: { date: "$_id", totalAccounts: 1, _id: 0 } },
    ]);
    return result;
}
export async function POST(_req: NextRequest) {
    try {
        const { startDay, endDay, period, filters } = await _req.json();
        // Set default values
        const startDate =
            startDay || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        const endDate = endDay || new Date().toISOString().split("T")[0];

        await connectToMongoDB();
        const res = await perDay(startDate, endDate, period, filters);
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
