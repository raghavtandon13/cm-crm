// stats daywise
import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

async function count(
    start: string = "2025-03-01",
    end: string = "2025-03-05",
    lender: string = "",
    partner: string = "MoneyTap",
    datetype: string = "resp",
    combined: boolean = false,
) {
    const matchConditions: any = {};
    const dt = datetype === "resp" ? "accounts.resp_date" : "createdAt";
    matchConditions[dt] = { $gte: new Date(start), $lte: new Date(end) };
    if (lender) matchConditions["accounts.name"] = lender;
    if (partner) matchConditions["partner"] = partner;

    const pipeline: any[] = [
        { $match: matchConditions },
        { $unwind: "$accounts" },
        { $match: matchConditions },

        // Add a new field partnerStatus to get "new" or "dedupe"
        {
            $addFields: {
                partnerStatus: {
                    $let: {
                        vars: {
                            filteredHistory: {
                                $cond: {
                                    if: { $isArray: "$partnerHistory" },
                                    then: {
                                        $filter: {
                                            input: "$partnerHistory",
                                            as: "history",
                                            cond: { $lte: ["$$history.date", "$accounts.resp_date"] },
                                        },
                                    },
                                    else: [],
                                },
                            },
                        },
                        in: {
                            $cond: [
                                { $gt: [{ $size: "$$filteredHistory" }, 0] },
                                {
                                    $arrayElemAt: [
                                        {
                                            $map: {
                                                input: {
                                                    $slice: [{ $sortArray: { input: "$$filteredHistory", sortBy: { date: -1 } } }, 1],
                                                },
                                                as: "item",
                                                in: "$$item.type",
                                            },
                                        },
                                        0,
                                    ],
                                },
                                "new",
                            ],
                        },
                    },
                },
            },
        },

        // Add a new field 'lenderStatus' based on various conditions
        {
            $addFields: {
                lenderStatus: {
                    $switch: {
                        branches: [
                            // Conditions for Fibe
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Fibe"] }, { $eq: ["$accounts.res.reason", "customer lead created"] }],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Fibe"] }, { $eq: ["$accounts.res.reason", "customer lead updated"] }],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "Fibe"] },
                                        { $regexMatch: { input: "$accounts.res.reason", regex: /(salary|pincode|Pan|Age|Invalid)/i } },
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
                                    $and: [{ $eq: ["$accounts.name", "Fibe"] }, { $eq: ["$accounts.res.reason", "Duplicate request"] }],
                                },
                                then: "Deduped",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Fibe"] }, { $ne: ["$accounts.res.errorMessage", null] }] },
                                then: "Errors",
                            },
                            // Conditions for RamFin
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $eq: ["$accounts.msg", "Lead created successfully."] }],
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
                                case: { $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $eq: ["$accounts.status", "Ineligible"] }] },
                                then: "Rejected",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $eq: ["$accounts.status", "Dedupe"] }] },
                                then: "Deduped",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $ne: ["$accounts.lead_status", null] }] },
                                then: "Accepted",
                            },
                            // Conditions for FatakPay
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $eq: ["$accounts.status", "Eligible"] }] },
                                then: "Accepted",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $eq: ["$accounts.status", "Ineligible"] }] },
                                then: "Rejected",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $eq: ["$accounts.status", "Deduped"] }] },
                                then: "Deduped",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $ne: ["$accounts.stage_name", null] }] },
                                then: "Accepted",
                            },
                            // Conditions for SmartCoin
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "SmartCoin"] }, { $eq: ["$accounts.isDuplicateLead", "true"] }] },
                                then: "Deduped",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "SmartCoin"] }, { $eq: ["$accounts.isDuplicateLead", "false"] }] },
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
                            // Conditions for Zype
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Zype"] }, { $eq: ["$accounts.status", "ACCEPT"] }] },
                                then: "Accepted",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Zype"] }, { $eq: ["$accounts.message", "REJECT"] }] },
                                then: "Rejected",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Zype"] }, { $eq: ["$accounts.status", "REJECT"] }] },
                                then: "Rejected",
                            },
                            // Conditions for Cashe
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "pre_approved"] }] },
                                then: "Accepted",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "pre_qualified_low"] }] },
                                then: "Accepted",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "rejected"] }] },
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
                                    $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.res.payload.status", "rejected"] }],
                                },
                                then: "Rejected",
                            },
                            // Conditions for Mpocket
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
                                case: { $and: [{ $eq: ["$accounts.name", "Mpocket"] }, { $eq: ["$accounts.message", "New User"] }] },
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
                                        { $or: [{ $eq: ["$accounts.message", null] }, { $not: ["$accounts.message"] }] },
                                    ],
                                },
                                then: "Rejected",
                            },
                            // Conditions for MoneyView
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "MoneyView"] },
                                        { $or: [{ $eq: ["$accounts.message", null] }, { $not: ["$accounts.message"] }] },
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
                                case: { $and: [{ $eq: ["$accounts.name", "MoneyView"] }, { $eq: ["$accounts.message", "success"] }] },
                                then: "Accepted",
                            },
                            // Conditions for LoanTap
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "LoanTap"] },
                                        { $eq: ["$accounts.message", "Application created successfully"] },
                                    ],
                                },
                                then: "Accepted",
                            },

                            // CreditLinks CONDITIONS
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "CreditLinks"] }, { $eq: ["$accounts.message", "Not eligible"] }],
                                },
                                then: "Rejected",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "CreditLinks"] }, { $ne: ["$accounts.leadId", null] }] },
                                then: "Accepted",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "CreditLinks"] }, { $eq: ["$accounts.message", "Eligible"] }] },
                                then: "Accepted",
                            },

                            // lendenclub CONDITIONS
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "LenDenClub"] }, { $eq: ["$accounts.is_duplicate", true] }] },
                                then: "Deduped",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "LenDenClub"] }, { $eq: ["$accounts.is_duplicate", false] }] },
                                then: "Accepted",
                            },

                            // LendingPlate CONDITIONS
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "LendingPlate"] }, { $eq: ["$accounts.message", "Success"] }] },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "LendingPlate"] }, { $eq: ["$accounts.message", "Existing user"] }],
                                },
                                then: "Deduped",
                            },
                            {
                                case: { $and: [{ $eq: ["$accounts.name", "LendingPlate"] }, { $eq: ["$accounts.message", "INELIGIBLE"] }] },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [
                                        { $eq: ["$accounts.name", "LendingPlate"] },
                                        {
                                            $or: [
                                                { $eq: ["$accounts.message", "Error"] },
                                                { $eq: ["$accounts.message", "Fail"] },
                                                { $regexMatch: { input: "$accounts.message", regex: "failed", options: "i" } },
                                            ],
                                        },
                                    ],
                                },
                                then: "Errors",
                            },
                        ],
                        default: "Rest",
                    },
                },
            },
        },
    ];

    pipeline.push(
        {
            $group: {
                _id: {
                    lender: combined ? (lender ? "$accounts.name" : null) : "$accounts.name",
                    status: "$lenderStatus",
                    partnerStatus: "$partnerStatus",
                    resp_date: { $dateToString: { format: "%Y-%m-%d", date: "$accounts.resp_date" } },
                },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: { lender: "$_id.lender", status: "$_id.status", partnerStatus: "$_id.partnerStatus" },
                count: { $sum: "$count" },
                dates: { $push: { k: "$_id.resp_date", v: "$count" } },
            },
        },
        {
            $project: {
                _id: 0,
                lender: "$_id.lender",
                status: "$_id.status",
                partnerStatus: "$_id.partnerStatus",
                count: 1,
                dates: { $arrayToObject: "$dates" },
            },
        },
        {
            $group: {
                _id: { lender: "$lender", partnerStatus: "$partnerStatus" },
                counts: { $push: { status: "$status", count: "$count", dates: "$dates" } },
            },
        },
        { $group: { _id: "$_id.lender", partnerStatuses: { $push: { partnerStatus: "$_id.partnerStatus", counts: "$counts" } } } },
        { $project: { _id: 0, lender: "$_id", partnerStatuses: 1 } },
    );
    return await User.aggregate(pipeline);
}

export async function POST(req: NextRequest) {
    try {
        const { startDate, endDate, lender, partner, datetype, combined, forceRefresh } = await req.json();
        const cacheKey = `${startDate}-${endDate}-${lender}-${partner}-${datetype}-${combined}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult && !forceRefresh) {
            return NextResponse.json(cachedResult, { status: 200 });
        }
        await connectToMongoDB();
        const res = await count(startDate, endDate, lender, partner, datetype, combined);
        cache.set(cacheKey, res);

        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
