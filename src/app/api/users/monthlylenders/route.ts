import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";

async function getPartnerDataForLast3Months() {
    await connectToMongoDB();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
    const targetPartners = ["MoneyTap", "Zype_LS"];

    const result = await User.aggregate([
        { $match: { createdAt: { $gte: threeMonthsAgo }, partner: { $in: targetPartners } } },
        { $group: { _id: { partner: "$partner", month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $group: { _id: "$_id.partner", monthlyCounts: { $push: { month: "$_id.month", year: "$_id.year", count: "$count" } } } },
        { $project: { partner: "$_id", monthlyCounts: { $arrayToObject: { $map: { input: "$monthlyCounts", as: "item", in: { k: { $concat: [ { $arrayElemAt: [ [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ], { $subtract: [ "$$item.month", 1 ] } ] }, " ", { $toString: "$$item.year" } ] }, v: "$$item.count" } } } } } },
        { $project: { _id: 0, partner: 1, monthlyCounts: 1 } },
    ]);

    return result.reduce((acc, { partner, monthlyCounts }) => {
        acc[partner] = monthlyCounts;
        return acc;
    }, {});
}

export async function GET(_req: NextRequest) {
    try {
        await connectToMongoDB();
        const res = await getPartnerDataForLast3Months();
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
