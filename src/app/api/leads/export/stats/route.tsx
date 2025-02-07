import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";

export async function POST(_req: NextRequest) {
    try {
        const { dates, lender, type } = await _req.json();
        await connectToMongoDB();

        const startDate = new Date(dates.from);
        const endDate = new Date(dates.to);

        // Define the aggregation pipeline
        const pipeline = [
            { $match: { "accounts.resp_date": { $gte: startDate, $lt: endDate } } },
            { $unwind: "$accounts" },
            { $match: { "accounts.resp_date": { $gte: startDate, $lte: endDate } } },
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
                                // FATAKPAY CONDITIONS
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
                                // SMARTCOIN CONDITIONS
                                {
                                    case: {
                                        $and: [{ $eq: ["$accounts.name", "SmartCoin"] }, { $eq: ["$accounts.isDuplicateLead", "true"] }],
                                    },
                                    then: "Deduped",
                                },
                                {
                                    case: {
                                        $and: [{ $eq: ["$accounts.name", "SmartCoin"] }, { $eq: ["$accounts.isDuplicateLead", "false"] }],
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
                                // CASHE CONDITIONS
                                {
                                    case: { $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "pre_approved"] }] },
                                    then: "Accepted",
                                },
                                {
                                    case: {
                                        $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "pre_qualified_low"] }],
                                    },
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
                                        $and: [{ $eq: ["$accounts.name", "Mpocket"] }, { $eq: ["$accounts.message", "New User"] }],
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
                                                $or: [{ $eq: ["$accounts.message", null] }, { $not: ["$accounts.message"] }],
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
                                                $or: [{ $eq: ["$accounts.message", null] }, { $not: ["$accounts.message"] }],
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
                                        $and: [{ $eq: ["$accounts.name", "MoneyView"] }, { $eq: ["$accounts.message", "success"] }],
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
            {
                $match: {
                    lenderStatus: type,
                    "accounts.name": lender,
                },
            },
            {
                $project: {
                    phone: 1,
                    partner: 1,
                    name: 1,
                    pincode: 1,
                    dob: 1,
                },
            },
        ];

        const users = await User.aggregate(pipeline);

        // Create CSV with header
        const csv = [
            "phone,partner,name,pincode,dob", // CSV header
            ...users.map((user) => `${user.phone},${user.partner},${user.name},${user.pincode},${user.dob}`),
        ].join("\n");

        // Convert string to Uint8Array
        const csvBuffer = Buffer.from(csv, "utf-8");

        return new NextResponse(csvBuffer, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=leads.csv",
            },
        });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
