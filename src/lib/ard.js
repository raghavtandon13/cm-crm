import mongoose from "mongoose";
import Table from "cli-table3";
import User from "./users.ts";
import { connectToMongoDB, connectToLS } from "../../lib/db.ts";
const DEBUG = false;

function formatNumberIndianStyle(number) {
    const x = number.toString().split(".");
    let lastThree = x[0].substring(x[0].length - 3);
    const otherNumbers = x[0].substring(0, x[0].length - 3);
    if (otherNumbers !== "") lastThree = "," + lastThree;
    const result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return x.length > 1 ? result + "." + x[1] : result;
}

// prettier-ignore
export const lenderConditions = {
    creditlinks: [
        { case: { $eq: ["$message", "Not eligible"] }, then: "Rejected" },
        { case: { $eq: ["$message", "The lead is already created."] }, then: "Deduped" },
        { case: { $and: [{ $ne: ["$leadId", null] }, { $or: [{ $eq: ["$message", null] }, { $not: ["$message"] }] }] }, then: "Accepted" },
        { case: { $eq: ["$message", "Eligible"] }, then: "Accepted" },
        { case: { $eq: ["$message", "Lead created successfully."] }, then: "Accepted" },
    ],

    fatakpay: [
        // { case: { $eq: ["$status", "Eligible"] }, then: "Accepted" },
        { case: { $eq: ["$status", "Ineligible"] }, then: "Rejected" },
        { case: { $eq: ["$status", "Deduped"] }, then: "Deduped" },
	{ case: { $ne: ["$max_eligibility_amount", null] }, then: "Accepted" },
    ],

    fatakpay_pl: [
        { case: { $eq: ["$status", "Eligible"] }, then: "Accepted" },
        { case: { $eq: ["$status", "Ineligible"] }, then: "Rejected" },
        { case: { $eq: ["$status", "Deduped"] }, then: "Deduped" },
    ],

    kamakshi: [
        { case: { $eq: ["$msg", "Lead created successfully."] }, then: "Accepted" },
        { case: { $eq: ["$status", "Ineligible"] }, then: "Rejected" },
        { case: { $regexMatch: { input: "$status", regex: /(required)/i } }, then: "Rejected" },
        { case: { $regexMatch: { input: "$status", regex: /(Issue)/i } }, then: "Rejected" },
        { case: { $regexMatch: { input: "$status", regex: /(Unexpected data)/i } }, then: "Rejected" },
        { case: { $eq: ["$status", "Trailing data"] }, then: "Errors" },
        { case: { $eq: ["$status", "Gateway Time-out"] }, then: "Errors" },
        { case: { $eq: ["$status", "Not enough data available to satisfy format"] }, then: "Errors" },
        { case: { $eq: ["$status", "Bad Gateway"] }, then: "Errors" },
        { case: { $eq: ["$status", "Date is Incorrect."] }, then: "Errors" },
        { case: { $eq: ["$status", "Too Many Attempts."] }, then: "Errors" },
        { case: { $regexMatch: { input: "$status", regex: /(SQLSTATE)/i } }, then: "Errors" },
        { case: { $eq: ["$status", "Dedupe"] }, then: "Deduped" },
    ],

    lendenclub: [
        { case: { $eq: ["$is_duplicate", true] }, then: "Deduped" },
        { case: { $eq: ["$is_duplicate", false] }, then: "Accepted" },
        { case: { $regexMatch: { input: "$status", regex: /(required)/i } }, then: "Rejected" },
        { case: { $regexMatch: { input: "$status", regex: /(Issue)/i } }, then: "Rejected" },
        { case: { $regexMatch: { input: "$status", regex: /(Unexpected data)/i } }, then: "Rejected" },
        { case: { $regexMatch: { input: "$error", regex: /(Mandatory)/i } }, then: "Errors" },
        { case: { $regexMatch: { input: "$error", regex: /(Invalid)/i } }, then: "Errors" },
        { case: { $eq: ["$error", "Decryption Failed"] }, then: "Errors" },
        { case: { $eq: ["$error", "An unexpected error occurred"] }, then: "Errors" },
        { case: { $eq: ["$error", "Unable to process the request"] }, then: "Errors" },
    ],

    loantap: [
        { case: { $eq: ["$message", "Application created successfully"] }, then: "Accepted" },
        { case: { $eq: ["$message", "Application created successfully."] }, then: "Accepted" },
    ],

    moneyview: [
        { case: { $gt: [{ $cond: { if: { $isArray: "$offerObjects" }, then: { $size: "$offerObjects" }, else: 0 } }, 0] }, then: "Accepted" },
        { case: { $eq: ["$message", "Duplicate lead found in MV"] }, then: "Deduped" },
        { case: { $eq: ["$message", "dedupe found"] }, then: "Deduped" },
        { case: { $eq: ["$message", "Lead has been expired."] }, then: "Rejected" },
        { case: { $eq: ["$message", "Lead has been rejected."] }, then: "Rejected" },
        { case: { $eq: ["$message", "No dedupe found"] }, then: "Errors" }, // repunch
        { case: { $eq: ["$message", "Invalid employment type"] }, then: "Errors" }, 
        { case: { $eq: ["$message", "Invalid Age"] }, then: "Errors" },
        { case: { $eq: ["$message", "Invalid PAN"] }, then: "Errors" },
        { case: { $eq: ["$message", "Invalid or Missing phone number"] }, then: "Errors" },
        { case: { $eq: ["$message", "Invalid education level"] }, then: "Errors" },
        { case: { $eq: ["$message", "Invalid data to get offer for lead"] }, then: "Errors" },
        { case: { $eq: ["$message", "Server call failed. Please try again."] }, then: "Errors" }, // repunch
        { case: { $eq: ["$message", "Error while verification of lead"] }, then: "Errors" }, // repunch
        { case: { $eq: ["$message", "Loan Application status is invalid."] }, then: "Errors" },
        { case: { $eq: ["$message", "Error in fetching offers"] }, then: "Errors" }, // repunch
    ],

    mpocket: [
        { case: { $eq: ["$message", "User Eligible for Loan"] }, then: "Accepted" },
        { case: { $eq: ["$message", "New User"] }, then: "Accepted" },
        { case: { $eq: ["$message", "Data Accepted Successfully"] }, then: "Accepted" },
        { case: { $eq: ["$message", "User Profile Rejected on System"] }, then: "Rejected" },
        { case: { $eq: ["$message", "User Not Eligible for Loan"] }, then: "Rejected" },
        { case: { $or: [{ $eq: ["$message", null] }, { $not: ["$message"] }] }, then: "Rejected" },
        { case: { $eq: ["$message", "Bad Request"] }, then: "Errors" },
        { case: { $eq: ["$message", "socket hang up"] }, then: "Errors" },
    ],

    ramfin: [
        { case: { $eq: ["$dedupe", "Success"] }, then: "Accepted" },
        { case: { $and: [{ $eq: ["$msg", "Success"] }, { $ne: ["$updated_status.message", "This customer is not associated with you."] }] }, then: "Accepted" },
        { case: { $eq: ["$status", "Dedupe"] }, then: "Deduped" },
        { case: { $and: [{ $eq: ["$msg", "Success"] }, { $eq: ["$updated_status.message", "This customer is not associated with you."] }] }, then: "Rejected" },
        { case: { $regexMatch: { input: "$message", regex: /Issue/i } }, then: "Rejected" },
        { case: { $eq: ["$message", "The pancard field is required."] }, then: "Rejected" },
        { case: { $eq: ["$message", "Too Many Attempts."] }, then: "Errors" },
        { case: { $regexMatch: { input: "$message", regex: /(SQLSTATE)/i } }, then: "Errors" },
        { case: { $regexMatch: { input: "$message", regex: /(errno)/i } }, then: "Errors" },
    ],

    smartcoin: [
        { case: { $eq: ["$isDuplicateLead", "true"] }, then: "Deduped" },
        { case: { $eq: ["$message", "duplicate found and partner can reject this lead"] }, then: "Deduped" },
        { case: { $eq: ["$isDuplicateLead", "false"] }, then: "Accepted" },
        { case: { $eq: ["$message", "Lead created successfully"] }, then: "Accepted" },
        { case: { $eq: ["$status", "failure"] }, then: "Rejected" },
        { case: { $eq: ["$message", "unauthorised client id "] }, then: "Rejected" },
        { case: { $eq: ["$message", "socket hang up"] }, then: "Errors" },
        { case: { $eq: ["$message", "read ECONNRESET"] }, then: "Errors" },
        { case: { $eq: ["$message", "Client network socket disconnected before secure TLS connection was established"] }, then: "Errors" },
        { case: { $eq: ["$message", "write ETIMEDOUT"] }, then: "Errors" },
        { case: { $eq: ["$message", "write EPIPE"] }, then: "Errors" },
        { case: { $regexMatch: { input: "$message", regex: /(Request failed)/i } }, then: "Errors" },
    ],

    sot: [
        { case: { $eq: ["$Message", "Lead generated successfully."] }, then: "Accepted" },
        { case: { $eq: ["$Message", "Eligibility Failed"] }, then: "Rejected" },
        { case: { $eq: ["$Message", "Monthly income is not eligible for the loan."] }, then: "Rejected" },
        { case: { $eq: ["$Message", "You are not eligible for the loan as there is an active loan with the same PAN number."] }, then: "Deduped" },
    ],

    zype: [
        { case: { $eq: ["$status", "ACCEPT"] }, then: "Accepted" },
        { case: { $eq: ["$message", "PRE_APPROVAL_OFFER_ALREADY_GENERATED"] }, then: "Accepted" },
        { case: { $eq: ["$status", "REJECT"] }, then: "Rejected" },
        { case: { $eq: ["$message", "DOB_OUT_OF_RANGE"] }, then: "Rejected" },
        { case: { $eq: ["$message", "DOB_INVALID"] }, then: "Rejected" },
        { case: { $eq: ["$status", "Dedupe"] }, then: "Deduped" },
        { case: { $eq: ["$status", "Deduped"] }, then: "Deduped" },
        { case: { $eq: ["$message", "SUCCESS_DEDUPE_NOT_FOUND"] }, then: "Deduped" },
        { case: { $eq: ["$message", "DEDUPE_IN_PROGRESS"] }, then: "Deduped" },
        { case: { $eq: ["$message", "APPLICATION_ALREADY_EXISTS"] }, then: "Deduped" },
    ],
};

// prettier-ignore
const lenderAIPConfig = [
    { name: "CreditLinks", minAge: 22, maxAge: 55, minSalary: 15_000, active: true, employment: "Both", pincodeType: "N" },
    { name: "FatakPay", minAge: 21, maxAge: 55, minSalary: 21_000, active: true, employment: "Salaried", pincodeType: "B", pincodeName: "Fatak" },
    { name: "MPocket", minAge: 18, maxAge: 60, minSalary: 15_000, active: true, employment: "Both", pincodeType: "N" },
    { name: "RamFin", minAge: 21, maxAge: 58, minSalary: 18_000, active: true, employment: "Both", pincodeType: "N" },
    { name: "SmartCoin", minAge: 21, maxAge: 45, minSalary: 18_000, active: true, employment: "Both", pincodeType: "R", pincodeName: "SmartCoin" },
    { name: "Zype", minAge: 21, maxAge: 45, minSalary: 17_000, active: true, employment: "Salaried", pincodeType: "B", pincodeName: "Zype" },
];

// Core function to get lender stats
export async function getLenderStats(startDateStr, endDateStr, options = {}) {
    const { fresh = false, beta = false, selectedLenders = null, perday = false } = options;
    const startTime = Date.now();

    // Ensure mongoose is connected
    await connectToMongoDB();

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    DEBUG && console.log(startDate, endDate);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const accountCollections = collections.map((c) => c.name).filter((name) => name.endsWith("-accounts"));

    const freshRelevantLenders = new Set([
        "zype",
        "fatakpay",
        "mpocket",
        "smartcoin",
        "ramfin",
        "creditlinks",
        "moneyview",
    ]);
    let freshLeads = [];

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (fresh) {
        const freshLeadsDocs = await User.find(
            { latestPartnerDate: { $gte: startDate, $lt: endDate } },
            { phone: 1, _id: 0 },
        );

        freshLeads = freshLeadsDocs.map((doc) => doc.phone);
    }

    const aggPipeline = (lender) => {
        const branches = lenderConditions[lender] || [];
        const matchStage = { resp_date: { $gte: startDate, $lt: endDate }, latest: true };
        if (fresh) matchStage.phone = { $in: freshLeads };

        return [
            { $match: matchStage },
            { $addFields: { lenderStatus: { $switch: { branches: branches, default: "Rest" } } } },
            { $group: { _id: "$lenderStatus", count: { $sum: 1 } } },
        ];
    };

    const aggPipelinePerDay = (lender) => {
        const branches = lenderConditions[lender] || [];
        const matchStage = { resp_date: { $gte: startDate, $lt: endDate }, latest: true };
        if (fresh) matchStage.phone = { $in: freshLeads };

        return [
            { $match: matchStage },
            {
                $addFields: {
                    lenderStatus: { $switch: { branches: branches, default: "Rest" } },
                    respDateStr: { $dateToString: { format: "%Y-%m-%d", date: "$resp_date" } },
                },
            },
            { $group: { _id: { date: "$respDateStr", status: "$lenderStatus" }, count: { $sum: 1 } } },
            { $group: { _id: "$_id.date", statuses: { $push: { status: "$_id.status", count: "$count" } } } },
            { $sort: { _id: 1 } },
        ];
    };

    if (perday) {
        if (!selectedLenders || selectedLenders.length !== 1) {
            throw new Error("--perday requires exactly ONE lender");
        }

        const lender = selectedLenders[0];
        const collName = lender + "-accounts";

        const data = await db.collection(collName).aggregate(aggPipelinePerDay(lender)).toArray();

        const results = data.map((row) => {
            const counts = { Accepted: 0, Rejected: 0, Deduped: 0, Errors: 0, Rest: 0 };
            row.statuses.forEach((s) => (counts[s.status] = s.count));
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            return { date: row._id, ...counts, total };
        });

        return {
            mode: "perday",
            dateRange: { start: startDateStr, end: endDateStr },
            options: { fresh, selectedLenders, perday, freshLeadsCount: fresh ? freshLeads.length : null },
            perdayData: results,
            meta: { executionTime: ((Date.now() - startTime) / 1000).toFixed(2) },
        };
    }

    const results = await Promise.all(
        accountCollections
            .filter((collName) => {
                const lender = collName.replace(/-?accounts$/, "");
                if (!lenderConditions[lender]) {
                    DEBUG && console.log(`⚠️  Skipping '${lender}': config not available`);
                    return false;
                }
                if (selectedLenders && !selectedLenders.includes(lender)) return false;
                return true;
            })
            .map(async (collName) => {
                const lender = collName.replace(/-?accounts$/, "");

                let aipEligible = null;
                const config = lenderAIPConfig.find((config) => config.name.toLowerCase() === lender);
                if (fresh && config) {
                    let aipQuery;
                    if (config.pincodeName) {
                        aipQuery = await buildAIPMatchQuery(
                            config.minAge,
                            config.maxAge,
                            config.minIncome,
                            config.pincodeName,
                            config.pincodeType,
                        );
                    } else {
                        aipQuery = await buildAIPMatchQuery(config.minAge, config.maxAge, config.minIncome);
                    }
                    aipEligible = await User.aggregate([
                        {
                            $match: {
                                $and: [
                                    { phone: { $in: freshLeads } },
                                    {
                                        ...(config.employment.toLowerCase() !== "both"
                                            ? { employment: config.employment }
                                            : {}),
                                    },
                                    ...aipQuery,
                                ],
                            },
                        },
                        { $count: "total" },
                    ]);
                }

                const data = await db.collection(collName).aggregate(aggPipeline(lender)).toArray();

                const counts = { Accepted: 0, Rejected: 0, Deduped: 0, Errors: 0, Rest: 0 };
                data.forEach((row) => (counts[row._id] = row.count));
                const total = counts.Accepted + counts.Rejected + counts.Deduped + counts.Errors + counts.Rest;

                return {
                    lender,
                    ...counts,
                    total,
                    isFreshRelevant: fresh && freshRelevantLenders.has(lender),
                    aipEligible,
                };
            }),
    );

    const endTime = Date.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(2);

    return {
        dateRange: { start: startDateStr, end: endDateStr },
        options: { fresh, selectedLenders, freshLeadsCount: fresh ? freshLeads.length : null },
        lenders: results,
        meta: {
            executionTime: parseFloat(executionTime),
            totalLenders: results.length,
            timestamp: new Date().toISOString(),
        },
    };
}

// CLI-specific display function
function displayResults(statsData) {
    if (statsData.mode === "perday") {
        const table = new Table({
            head: ["Date", "Total", "Accepted", "Rejected", "Deduped", "Errors", "Rest", "AipEligible"],
        });

        statsData.perdayData.forEach((r) => {
            table.push([
                r.date,
                formatNumberIndianStyle(r.total),
                formatNumberIndianStyle(r.Accepted),
                formatNumberIndianStyle(r.Rejected),
                formatNumberIndianStyle(r.Deduped),
                formatNumberIndianStyle(r.Errors),
                formatNumberIndianStyle(r.Rest),
                "", // optional: no aipEligible here (or add if needed)
            ]);
        });

        DEBUG && console.log("\n" + table.toString());
        DEBUG && console.log(`Total time taken: ${statsData.meta.executionTime} seconds`);
        return;
    }

    const table = new Table({
        head: ["Lender", "Total", "Accepted", "Rejected", "Deduped", "Errors", "Rest", "AipEligible"],
    });

    DEBUG && console.log("\n📅 Date range:", statsData.dateRange.start, "→", statsData.dateRange.end);

    if (statsData.options.fresh) {
        DEBUG &&
            console.log(
                `🔄 Fresh mode is ON – using partnerHistory to filter users. ${statsData.options.beta ? "(beta)" : ""}`,
            );
        DEBUG && console.log(`⭐ Total Fresh Leads: ${formatNumberIndianStyle(statsData.options.freshLeadsCount)}`);
    }

    if (statsData.options.selectedLenders) {
        DEBUG && console.log("🏦 Lenders selected:", statsData.options.selectedLenders.join(", "));
    }

    statsData.lenders.forEach((r) => {
        const tick = r.isFreshRelevant ? " ⭐" : "";
        table.push([
            r.lender + tick,
            formatNumberIndianStyle(r.total),
            formatNumberIndianStyle(r.Accepted),
            formatNumberIndianStyle(r.Rejected),
            formatNumberIndianStyle(r.Deduped),
            formatNumberIndianStyle(r.Errors),
            formatNumberIndianStyle(r.Rest),
            r.aipEligible !== null ? r.aipEligible[0]?.total : "",
        ]);
    });

    DEBUG && console.log("\n" + table.toString());
    DEBUG && console.log(`Total time taken: ${statsData.meta.executionTime} seconds`);
}

export async function buildAIPMatchQuery(minAge, maxAge, minIncome, pincodeCollection, pincodeMatching = "R") {
    const siblingDb = mongoose.connection.useDb("Pincode_Master");
    const validPincodes = pincodeCollection ? await siblingDb.collection(pincodeCollection).distinct("pincode") : [];

    const conditions = [];

    // Age filter via DOB
    if (minAge != null && maxAge != null) {
        conditions.push({
            $expr: {
                $and: [
                    { $ne: ["$dob", null] },
                    { $ne: ["$dob", ""] },
                    { $regexMatch: { input: "$dob", regex: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" } },
                    {
                        $and: [
                            {
                                $gte: [
                                    {
                                        $dateDiff: {
                                            startDate: { $toDate: "$dob" },
                                            endDate: "$$NOW",
                                            unit: "year",
                                        },
                                    },
                                    minAge,
                                ],
                            },
                            {
                                $lte: [
                                    {
                                        $dateDiff: {
                                            startDate: { $toDate: "$dob" },
                                            endDate: "$$NOW",
                                            unit: "year",
                                        },
                                    },
                                    maxAge,
                                ],
                            },
                        ],
                    },
                ],
            },
        });
    }

    // Income check
    if (minIncome != null) {
        conditions.push({
            $expr: {
                $and: [
                    { $ne: ["$income", null] },
                    { $ne: ["$income", ""] },
                    { $regexMatch: { input: "$income", regex: "^[0-9]{4,6}$" } },
                    { $gte: [{ $toInt: "$income" }, minIncome] },
                ],
            },
        });
    }

    // Pincode inclusion check
    if (pincodeCollection) {
        conditions.push({ pincode: { [pincodeMatching === "R" ? "$in" : "$nin"]: validPincodes } });
    }

    return conditions;
}

// CLI interface
async function runCLI() {
    const args = process.argv.slice(2);

    // --help flag
    if (args.includes("--help") || args.length < 2) {
        DEBUG &&
            console.log(`
📊 Lender Aggregation Script

Usage:
  node script.js <startDate> <endDate> [lender1,lender2,...] [--fresh=true|false] [--json]

Positional Arguments:
  1. <startDate>         Required. Start date in format YYYY-MM-DD
  2. <endDate>           Required. End date in format YYYY-MM-DD
  3. [lenders]           Optional. Comma-separated lenders to filter (e.g. zype,fatakpay)

Flags:
  --fresh=true|false     Optional. If true, only users with partnerHistory in this range are included.
  --json                 Optional. Output results as JSON instead of table format.
  --beta                 Optional. Include new experimental fresh calculations.

Examples:
  node script.js 2025-07-01 2025-07-03 --fresh=true
  node script.js 2025-07-01 2025-07-03 zype,fatakpay --fresh=false
  node script.js 2025-07-01 2025-07-03 --json
`);
        process.exit(0);
    }

    const startDate = args[0];
    const endDate = args[1];
    const selectedLendersArg = args[2] && !args[2].startsWith("--") ? args[2] : null;
    const selectedLenders = selectedLendersArg
        ? selectedLendersArg.split(",").map((l) => l.trim().toLowerCase())
        : null;

    const freshArg = args.find((arg) => arg.startsWith("--fresh="));
    const fresh = freshArg ? freshArg.split("=")[1] === "true" : false;
    const jsonOutput = args.includes("--json");
    const beta = args.includes("--beta");

    const perday = args.includes("--perday");

    try {
        const statsData = await getLenderStats(startDate, endDate, { fresh, beta, selectedLenders, perday });

        if (jsonOutput) DEBUG && console.log(JSON.stringify(statsData, null, 2));
        else displayResults(statsData);

        process.exit(0);
    } catch (error) {
        // console.error("Error:", error);
        console.error("Error:", error.message);
        process.exit(1);
    }
}

// Run CLI if this file is executed directly
const currentFileName = import.meta.url.split("/").pop();
const executedFileName = process.argv[1].split(/[/\\]/).pop();

if (currentFileName === executedFileName) {
    runCLI().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
