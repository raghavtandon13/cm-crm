import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

async function count(start: string, end: string, group: string, lender: string, partner: string, datetype: string) {
    const matchConditions: any = {};
    const dt = datetype === "resp" ? "accounts.resp_date" : "createdAt";
    matchConditions[dt] = { $gte: new Date(start), $lte: new Date(end) };
    if (lender) matchConditions["accounts.name"] = lender;
    if (partner) matchConditions["partner"] = partner;
    console.log(matchConditions);
    await connectToMongoDB();

    const pipeline: any[] = [
        { $match: matchConditions },
        { $unwind: "$accounts" },
        { $match: matchConditions },
        {
            $addFields: {
                lenderStatus: {
                    $switch: {
                        branches: [
                            // FIBE CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        { $eq: ["$accounts.res.reason", "customer lead created"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        { $eq: ["$accounts.res.reason", "customer lead updated"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        {
                                            $regexMatch: {
                                                input: "$accounts.res.reason",
                                                regex: /(salary|pincode|Pan|Age|Invalid)/i,
                                            },
                                        },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        { $eq: ["$accounts.res.reason", "customer already exists"] },
                                    ],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        { $eq: ["$accounts.res.reason", "Duplicate request"] },
                                    ],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        { $ne: ["$accounts.res.errorMessage", null] },
                                    ],
                                },
                                then: "Errors",
                            },
                            // RAMFIN CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "RamFin"] },
                                        { $eq: ["$accounts.msg", "Lead created successfully."] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "RamFin"] },
                                        { $eq: ["$accounts.res.message", "Lead created successfully."] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "RamFin"] },
                                        { $eq: ["$accounts.status", "Ineligible"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "RamFin"] },
                                        { $eq: ["$accounts.status", "Dedupe"] },
                                    ],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "RamFin"] },
                                        { $ne: ["$accounts.lead_status", null] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            // FATAKPAY CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "FatakPay"] },
                                        { $eq: ["$accounts.status", "Eligible"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "FatakPay"] },
                                        { $eq: ["$accounts.status", "Ineligible"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "FatakPay"] },
                                        { $eq: ["$accounts.status", "Deduped"] },
                                    ],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "FatakPay"] },
                                        { $ne: ["$accounts.stage_name", null] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            // SMARTCOIN CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "SmartCoin"] },
                                        { $eq: ["$accounts.isDuplicateLead", "true"] },
                                    ],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "SmartCoin"] },
                                        { $eq: ["$accounts.isDuplicateLead", "false"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "SmartCoin"] },
                                        { $eq: ["$accounts.message", "Lead created successfully"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "SmartCoin"] },
                                        { $regexMatch: { input: "$accounts.message", regex: /(mandatory)/i } },
                                    ],
                                },
                                then: "Errors",
                            },
                            // ZYPE CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Zype"] },
                                        { $eq: ["$accounts.status", "ACCEPT"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Zype"] },
                                        { $eq: ["$accounts.message", "REJECT"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Zype"] },
                                        { $eq: ["$accounts.status", "REJECT"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            // CASHE CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Cashe"] },
                                        { $eq: ["$accounts.status", "pre_approved"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Cashe"] },
                                        { $eq: ["$accounts.status", "pre_qualified_low"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Cashe"] },
                                        { $eq: ["$accounts.status", "rejected"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Cashe"] },
                                        { $regexMatch: { input: "$accounts.res.status", regex: /(ERROR)/i } },
                                    ],
                                },
                                then: "Errors",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Cashe"] },
                                        { $eq: ["$accounts.res.payload.status", "rejected"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            // MPOCKET CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Mpocket"] },
                                        { $eq: ["$accounts.message", "User Eligible for Loan"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Mpocket"] },
                                        { $eq: ["$accounts.message", "New User"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Mpocket"] },
                                        { $eq: ["$accounts.message", "Data Accepted Successfully"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Mpocket"] },
                                        { $eq: ["$accounts.message", "User Profile Rejected on System"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Mpocket"] },
                                        { $eq: ["$accounts.message", "User Not Eligible for Loan"] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Mpocket"] },
                                        {
                                            $or: [
                                                { $eq: ["$accounts.message", null] },
                                                { $not: ["$accounts.message"] },
                                            ],
                                        },
                                    ],
                                },
                                then: "Rejected",
                            },
                            // MONEYVIEW CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "MoneyView"] },
                                        {
                                            $or: [
                                                { $eq: ["$accounts.message", null] },
                                                { $not: ["$accounts.message"] },
                                            ],
                                        },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "MoneyView"] },
                                        { $eq: ["$accounts.message", "Lead has been rejected."] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "MoneyView"] },
                                        { $regexMatch: { input: "$accounts.message", regex: /(nvalid)/i } },
                                    ],
                                },
                                then: "Errors",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "MoneyView"] },
                                        { $eq: ["$accounts.message", "Lead has been expired."] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "MoneyView"] },
                                        { $eq: ["$accounts.message", "success"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                            // LOANTAP CONDITIONS
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "LoanTap"] },
                                        { $eq: ["$accounts.message", "Application created successfully"] },
                                    ],
                                },
                                then: "Accepted",
                            },
                        ],
                        default: "Rest",
                    },
                },
            },
        },
    ];

    if (group) {
        pipeline.push(
            {
                $addFields: {
                    age: {
                        $cond: {
                            if: { $eq: [group, "age"] },
                            then: {
                                $subtract: [
                                    { $year: new Date() },
                                    { $year: { $dateFromString: { dateString: "$dob", onError: null } } },
                                ],
                            },
                            else: null,
                        },
                    },
                    ageGroup: {
                        $cond: {
                            if: { $eq: [group, "age"] },
                            then: {
                                $concat: [
                                    {
                                        $toString: {
                                            $subtract: [
                                                {
                                                    $subtract: [
                                                        { $year: new Date() },
                                                        {
                                                            $year: {
                                                                $dateFromString: { dateString: "$dob", onError: null },
                                                            },
                                                        },
                                                    ],
                                                },
                                                {
                                                    $mod: [
                                                        {
                                                            $subtract: [
                                                                { $year: new Date() },
                                                                {
                                                                    $year: {
                                                                        $dateFromString: {
                                                                            dateString: "$dob",
                                                                            onError: null,
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                        5,
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    "-",
                                    {
                                        $toString: {
                                            $add: [
                                                {
                                                    $subtract: [
                                                        {
                                                            $subtract: [
                                                                { $year: new Date() },
                                                                {
                                                                    $year: {
                                                                        $dateFromString: {
                                                                            dateString: "$dob",
                                                                            onError: null,
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            $mod: [
                                                                {
                                                                    $subtract: [
                                                                        { $year: new Date() },
                                                                        {
                                                                            $year: {
                                                                                $dateFromString: {
                                                                                    dateString: "$dob",
                                                                                    onError: null,
                                                                                },
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                                5,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                5,
                                            ],
                                        },
                                    },
                                ],
                            },
                            else: null,
                        },
                    },
                },
            },
            {
                $group: {
                    _id: {
                        lender: lender ? "$accounts.name" : null,
                        status: "$lenderStatus",
                        group: {
                            $cond: {
                                if: { $eq: [group, "age"] },
                                then: "$ageGroup",
                                else: {
                                    $cond: { if: { $eq: [group, "employment"] }, then: "$employment", else: "$gender" },
                                },
                            },
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: { lender: "$_id.lender", group: "$_id.group" },
                    counts: { $push: { status: "$_id.status", count: "$count" } },
                },
            },
            {
                $group: {
                    _id: "$_id.lender",
                    groupCounts: { $push: { group: "$_id.group", counts: "$counts" } },
                },
            },
            {
                $project: {
                    _id: 0,
                    lender: "$_id",
                    groupCounts: 1,
                },
            },
        );
    } else {
        pipeline.push(
            {
                $group: {
                    _id: {
                        lender: lender ? "$accounts.name" : null,
                        status: "$lenderStatus",
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.lender",
                    counts: { $push: { status: "$_id.status", count: "$count" } },
                },
            },
            {
                $project: {
                    _id: 0,
                    lender: "$_id",
                    counts: 1,
                },
            },
        );
    }

    const result = await User.aggregate(pipeline);
    return result;
}

export async function POST(req: NextRequest) {
    try {
        const { startDate, endDate, forceRefresh, group, lender, partner, datetype } = await req.json();
        const cacheKey = `${startDate}-${endDate}-${group || ""}-${lender || ""}-${partner || ""}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult && !forceRefresh) return NextResponse.json(cachedResult, { status: 200 });
        await connectToMongoDB();
        const res = await count(startDate, endDate, group, lender, partner, datetype);
        cache.set(cacheKey, res);

        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
