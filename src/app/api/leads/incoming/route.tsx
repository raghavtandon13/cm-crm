import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";

async function incoming(startDay: string, endDay: string, filters: any = {}) {
    await connectToMongoDB();
    const targetPartners = ["MoneyTap", "Zype_LS"];
    const matchConditions: any = { createdAt: { $gte: new Date(startDay), $lt: new Date(endDay) } };
    if (filters.partner) matchConditions.partner = filters.partner;
    const result = await User.aggregate([
        { $match: { partner: { $in: targetPartners }, ...matchConditions } },
        {
            $group: {
                _id: {
                    partner: "$partner",
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        {
            $group: {
                _id: { partner: "$_id.partner", month: "$_id.month", year: "$_id.year" },
                dailyCounts: { $push: { day: "$_id.day", count: "$count" } },
                monthlyTotal: { $sum: "$count" },
            },
        },
        {
            $group: {
                _id: "$_id.partner",
                monthlyCounts: {
                    $push: {
                        month: "$_id.month",
                        year: "$_id.year",
                        dailyCounts: {
                            $arrayToObject: {
                                $map: {
                                    input: "$dailyCounts",
                                    as: "item",
                                    in: { k: { $toString: "$$item.day" }, v: "$$item.count" },
                                },
                            },
                        },
                        total: "$monthlyTotal",
                    },
                },
                lenderTotal: { $sum: "$monthlyTotal" },
            },
        },
        {
            $group: {
                _id: null,
                partnerData: { $push: { partner: "$_id", monthlyCounts: "$monthlyCounts", total: "$lenderTotal" } },
                overallTotal: { $sum: "$lenderTotal" },
            },
        },
        {
            $project: {
                _id: 0,
                partnerData: {
                    $map: {
                        input: "$partnerData",
                        as: "partner",
                        in: {
                            partner: "$$partner.partner",
                            monthlyCounts: {
                                $arrayToObject: {
                                    $map: {
                                        input: "$$partner.monthlyCounts",
                                        as: "item",
                                        in: {
                                            k: {
                                                $concat: [
                                                    {
                                                        $arrayElemAt: [
                                                            [
                                                                "Jan",
                                                                "Feb",
                                                                "Mar",
                                                                "Apr",
                                                                "May",
                                                                "Jun",
                                                                "Jul",
                                                                "Aug",
                                                                "Sept",
                                                                "Oct",
                                                                "Nov",
                                                                "Dec",
                                                            ],
                                                            { $subtract: ["$$item.month", 1] },
                                                        ],
                                                    },
                                                    " ",
                                                    { $toString: "$$item.year" },
                                                ],
                                            },
                                            v: { dailyCounts: "$$item.dailyCounts", total: "$$item.total" },
                                        },
                                    },
                                },
                            },
                            total: "$$partner.total",
                        },
                    },
                },
                overallTotal: 1,
            },
        },
    ]);
    return result;
}
export async function POST(_req: NextRequest) {
    try {
        const { startDay, endDay } = await _req.json();
        // Set default values
        const startDate = startDay || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
        const endDate = endDay || new Date().toISOString().split("T")[0];

        await connectToMongoDB();
        const res = await incoming(startDate, endDate);
        // const res = [ { overallTotal: 209636, partnerData: [ { partner: "MoneyTap", monthlyCounts: { "Oct 2024": { dailyCounts: { "31": 4345 }, total: 4345 }, "Nov 2024": { dailyCounts: { "1": 4893, "2": 4863, "3": 4656, "4": 7717, "5": 8677, "6": 9171, "7": 6642, "8": 8997, "9": 7292, "10": 7268, "11": 13568, "12": 12656, "13": 12094, "14": 12198, "15": 9624, "16": 6625 }, total: 136941 } }, total: 141286 }, { partner: "Zype_LS", monthlyCounts: { "Nov 2024": { dailyCounts: { "8": 17090, "9": 40380, "10": 10880 }, total: 68350 } }, total: 68350 } ] } ];
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
