import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

async function count(startDate: string, endDate: string) {
    const dateRangeCondition = {
        $and: [
            { $gte: ["$$account.resp_date", new Date(startDate)] },
            { $lt: ["$$account.resp_date", new Date(endDate)] },
        ],
    };

    const fibedateRangeCondition = {
        $and: [
            { $gte: [{ $dateFromString: { dateString: "$$account.res.responseDate" } }, new Date(startDate)] },
            { $lt: [{ $dateFromString: { dateString: "$$account.res.responseDate" } }, new Date(endDate)] },
        ],
    };
    await connectToMongoDB();
    const result = await User.aggregate([
        {
            $addFields: {
                lenderStatuses: {
                    $map: {
                        input: "$accounts",
                        as: "account",
                        in: {
                            lender: "$$account.name",
                            status: {
                                $switch: {
                                    branches: [
                                        // FIBE CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Fibe"] },
                                                    { $eq: ["$$account.res.reason", "customer lead created"] },
                                                    fibedateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Fibe"] },
                                                    { $eq: ["$$account.res.reason", "customer lead updated"] },
                                                    fibedateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Fibe"] },
                                                    {
                                                        $regexMatch: {
                                                            input: "$$account.res.reason",
                                                            regex: /(salary|pincode|Pan|Age|Invalid)/i,
                                                        },
                                                    },
                                                    fibedateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Fibe"] },
                                                    { $eq: ["$$account.res.reason", "customer already exists"] },
                                                    fibedateRangeCondition,
                                                ],
                                            },
                                            then: "Deduped",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Fibe"] },
                                                    { $eq: ["$$account.res.reason", "Duplicate request"] },
                                                    fibedateRangeCondition,
                                                ],
                                            },
                                            then: "Deduped",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Fibe"] },
                                                    { $ne: ["$$account.res.errorMessage", null] },
                                                    fibedateRangeCondition,
                                                ],
                                            },
                                            then: "Errors",
                                        },
                                        // RAMFIN CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "RamFin"] },
                                                    { $eq: ["$$account.msg", "Lead created successfully."] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "RamFin"] },
                                                    { $eq: ["$$account.res.message", "Lead created successfully."] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "RamFin"] },
                                                    { $eq: ["$$account.status", "Ineligible"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "RamFin"] },
                                                    { $eq: ["$$account.status", "Dedupe"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Deduped",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "RamFin"] },
                                                    { $ne: ["$$account.lead_status", null] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        // FATAKPAY CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "FatakPay"] },
                                                    { $eq: ["$$account.status", "Eligible"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "FatakPay"] },
                                                    { $eq: ["$$account.status", "Ineligible"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "FatakPay"] },
                                                    { $eq: ["$$account.status", "Deduped"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Deduped",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "FatakPay"] },
                                                    { $ne: ["$$account.stage_name", null] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        // SMARTCOIN CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "SmartCoin"] },
                                                    { $eq: ["$$account.isDuplicateLead", "true"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Deduped",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "SmartCoin"] },
                                                    { $eq: ["$$account.isDuplicateLead", "false"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "SmartCoin"] },
                                                    { $eq: ["$$account.message", "Lead created successfully"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "SmartCoin"] },
                                                    {
                                                        $regexMatch: {
                                                            input: "$$account.message",
                                                            regex: /(mandatory)/i,
                                                        },
                                                    },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Errors",
                                        },
                                        // ZYPE CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Zype"] },
                                                    { $eq: ["$$account.status", "ACCEPT"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Zype"] },
                                                    { $eq: ["$$account.message", "REJECT"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Zype"] },
                                                    { $eq: ["$$account.status", "REJECT"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        // CASHE CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Cashe"] },
                                                    { $eq: ["$$account.status", "pre_approved"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Cashe"] },
                                                    { $eq: ["$$account.status", "pre_qualified_low"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Cashe"] },
                                                    { $eq: ["$$account.status", "rejected"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Cashe"] },
                                                    {
                                                        $regexMatch: {
                                                            input: "$$account.res.status",
                                                            regex: /(ERROR)/i,
                                                        },
                                                    },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Erros",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Cashe"] },
                                                    { $eq: ["$$account.res.payload.status", "rejected"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        // MPOCKET CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Mpocket"] },
                                                    { $eq: ["$$account.message", "User Eligible for Loan"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Mpocket"] },
                                                    { $eq: ["$$account.message", "New User"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Mpocket"] },
                                                    { $eq: ["$$account.message", "Data Accepted Successfully"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Accepted",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Mpocket"] },
                                                    { $eq: ["$$account.message", "User Profile Rejected on System"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Mpocket"] },
                                                    { $eq: ["$$account.message", "User Not Eligible for Loan"] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "Mpocket"] },
                                                    {
                                                        $or: [
                                                            { $eq: ["$$account.message", null] },
                                                            { $not: ["$$account.message"] },
                                                        ],
                                                    },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        // MONEYVIEW CONDITIONS
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "MoneyView"] },
                                                    {
                                                        $or: [
                                                            { $eq: ["$$account.message", null] },
                                                            { $not: ["$$account.message"] },
                                                        ],
                                                    },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "MoneyView"] },
                                                    { $eq: ["$$account.message", "Lead has been rejected."] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "MoneyView"] },
                                                    { $regexMatch: { input: "$$account.message", regex: /(nvalid)/i } },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Erros",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "MoneyView"] },
                                                    { $eq: ["$$account.message", "Lead has been expired."] },
                                                    dateRangeCondition,
                                                ],
                                            },
                                            then: "Rejected",
                                        },
                                        {
                                            case: {
                                                $and: [
                                                    { $eq: ["$$account.name", "MoneyView"] },
                                                    { $eq: ["$$account.message", "success"] },
                                                    dateRangeCondition,
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
                },
            },
        },
        { $unwind: "$lenderStatuses" },
        { $group: { _id: { lender: "$lenderStatuses.lender", status: "$lenderStatuses.status" }, count: { $sum: 1 } } },
        { $group: { _id: "$_id.lender", counts: { $push: { status: "$_id.status", count: "$count" } } } },
        { $project: { _id: 0, lender: "$_id", counts: 1 } },
    ]);
    return result;
}
export async function POST(req: NextRequest) {
    try {
        const { startDate, endDate } = await req.json();
        const cacheKey = `${startDate}-${endDate}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return NextResponse.json(cachedResult, { status: 200 });
        }
        await connectToMongoDB();
        const res = await count(startDate, endDate);
        cache.set(cacheKey, res);

        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
