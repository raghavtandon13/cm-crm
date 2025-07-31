const startDate = "2025-03-01";
const endDate = "2025-03-04";
const group = "";
const lender = "";
const partner = "MoneyTap";
const datetype = "resp";
const combined = false;

import User from "@/lib/users";
import { connectToMongoDB } from "../lib/db";

// Main function to count users based on various conditions
async function count(start: string, end: string, group: string, lender: string, partner: string, datetype: string) {
    const matchConditions: any = {};
    const dt = datetype === "resp" ? "accounts.resp_date" : "createdAt";

    // Set the date range condition
    matchConditions[dt] = { $gte: new Date(start), $lte: new Date(end) };

    // Set the lender name if provided
    if (lender) matchConditions["accounts.name"] = lender;

    // Set the partner name if provided
    if (partner) matchConditions["partner"] = partner;

    console.log(matchConditions);

    // Connect to MongoDB
    await connectToMongoDB();

    // Define the aggregation pipeline
    const pipeline: any[] = [
        { $match: matchConditions },
        { $unwind: "$accounts" },
        { $match: matchConditions },

        // new field partnerStatus
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
                            // Conditions for Fibe lender
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
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Fibe"] }, { $ne: ["$accounts.res.errorMessage", null] }],
                                },
                                then: "Errors",
                            },
                            // Conditions for RamFin lender
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
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $eq: ["$accounts.status", "Ineligible"] }],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $eq: ["$accounts.status", "Dedupe"] }],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "RamFin"] }, { $ne: ["$accounts.lead_status", null] }],
                                },
                                then: "Accepted",
                            },
                            // Conditions for FatakPay lender
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $eq: ["$accounts.status", "Eligible"] }],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $eq: ["$accounts.status", "Ineligible"] }],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $eq: ["$accounts.status", "Deduped"] }],
                                },
                                then: "Deduped",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "FatakPay"] }, { $ne: ["$accounts.stage_name", null] }],
                                },
                                then: "Accepted",
                            },
                            // Conditions for SmartCoin lender
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
                            // Conditions for Zype lender
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Zype"] }, { $eq: ["$accounts.status", "ACCEPT"] }],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Zype"] }, { $eq: ["$accounts.message", "REJECT"] }],
                                },
                                then: "Rejected",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Zype"] }, { $eq: ["$accounts.status", "REJECT"] }],
                                },
                                then: "Rejected",
                            },
                            // Conditions for Cashe lender
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "pre_approved"] }],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "pre_qualified_low"] }],
                                },
                                then: "Accepted",
                            },
                            {
                                case: {
                                    $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.status", "rejected"] }],
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
                                    $and: [{ $eq: ["$accounts.name", "Cashe"] }, { $eq: ["$accounts.res.payload.status", "rejected"] }],
                                },
                                then: "Rejected",
                            },
                            // Conditions for Mpocket lender
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
                            // Conditions for MoneyView lender
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
                            // Conditions for LoanTap lender
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

    // If grouping is specified, add additional stages to the pipeline
    if (group) {
        pipeline.push(
            // Add fields for age and ageGroup if grouping by age
            {
                $addFields: {
                    age: {
                        $cond: {
                            if: { $eq: [group, "age"] },
                            then: {
                                $subtract: [{ $year: new Date() }, { $year: { $dateFromString: { dateString: "$dob", onError: null } } }],
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
                                                        { $year: { $dateFromString: { dateString: "$dob", onError: null } } },
                                                    ],
                                                },
                                                {
                                                    $mod: [
                                                        {
                                                            $subtract: [
                                                                { $year: new Date() },
                                                                { $year: { $dateFromString: { dateString: "$dob", onError: null } } },
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
                                                                { $year: { $dateFromString: { dateString: "$dob", onError: null } } },
                                                            ],
                                                        },
                                                        {
                                                            $mod: [
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
            // Group by lender, status, and the specified group (age, employment, or gender)
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
            // Group by lender and group, and push the counts for each status
            {
                $group: {
                    _id: { lender: "$_id.lender", group: "$_id.group" },
                    counts: { $push: { status: "$_id.status", count: "$count" } },
                },
            },
            // Group by lender and push the group counts
            {
                $group: {
                    _id: "$_id.lender",
                    groupCounts: { $push: { group: "$_id.group", counts: "$counts" } },
                },
            },
            // Project the final result
            {
                $project: {
                    _id: 0,
                    lender: "$_id",
                    groupCounts: 1,
                },
            },
        );
    } else {
        // If no grouping is specified, group by lender and status
        // pipeline.push(
        //     {
        //         $group: {
        //             _id: {
        //                 lender: lender ? "$accounts.name" : null,
        //                 status: "$lenderStatus",
        //             },
        //             count: { $sum: 1 },
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: "$_id.lender",
        //             counts: { $push: { status: "$_id.status", count: "$count" } },
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             lender: "$_id",
        //             counts: 1,
        //         },
        //     },
        // );

        // pipeline.push(
        //     {
        //         $group: {
        //             _id: {
        //                 lender: combined ? (lender ? "$accounts.name" : null) : "$accounts.name",
        //                 status: "$lenderStatus",
        //                 resp_date: { $dateToString: { format: "%Y-%m-%d", date: "$accounts.resp_date" } },
        //             },
        //             count: { $sum: 1 },
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: { lender: "$_id.lender", status: "$_id.status" },
        //             count: { $sum: "$count" },
        //             dates: { $push: { k: "$_id.resp_date", v: "$count" } },
        //         },
        //     },
        //     { $project: { _id: 0, lender: "$_id.lender", status: "$_id.status", count: 1, dates: { $arrayToObject: "$dates" } } },
        //     { $group: { _id: "$lender", counts: { $push: { status: "$status", count: "$count", dates: "$dates" } } } },
        //     { $project: { _id: 0, lender: "$_id", counts: 1 } },
        // );

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
    }

    // Execute the aggregation pipeline
    console.log("agg..");
    const result = await User.aggregate(pipeline);
    console.dir(result, { depth: null });
    process.exit(0);
}

// Call the count function with the specified parameters
count(startDate, endDate, group, lender, partner, datetype);
