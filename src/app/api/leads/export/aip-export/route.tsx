import mongoose from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";

async function buildAIPMatchQuery({
    minAge,
    maxAge,
    minIncome,
    pincodeCollection,
    pincodeMatching = "R",
}: {
    minAge: number;
    maxAge: number;
    minIncome: number;
    pincodeCollection: string;
    pincodeMatching: string;
}) {
    console.log(minAge, maxAge, minIncome, pincodeCollection, pincodeMatching);
    console.log(typeof minAge, typeof maxAge, typeof minIncome);
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
                                            startDate: {
                                                $convert: { input: "$dob", to: "date", onError: null, onNull: null },
                                            },
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
                                            startDate: {
                                                $convert: { input: "$dob", to: "date", onError: null, onNull: null },
                                            },
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            minAge,
            maxAge,
            minIncome,
            pincodeCollection,
            pincodeMatching = "R",
            employment = "Salaried",
            startDate,
            endDate,
            limit,
        } = body;

        await connectToMongoDB();

        const aipMatch = await buildAIPMatchQuery({
            minAge: parseInt(minAge),
            maxAge: parseInt(maxAge),
            minIncome: parseInt(minIncome),
            pincodeCollection,
            pincodeMatching,
        });

        const pipeline = [
            {
                $match: {
                    $and: [
                        { createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) } },
                        ...(employment === "Salaried" || employment === "Self-employed" ? [{ employment }] : []),
                        ...aipMatch,
                    ],
                },
            },
            { $project: { phone: 1, pan: 1, email: 1, name: 1, dob: 1, income: 1, empName: 1 } },
            { $limit: limit },
        ];

        const users = await User.aggregate(pipeline);

        // Convert to CSV
        const csv = Papa.unparse(users);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=aip-export.csv`,
            },
        });
    } catch (err) {
        console.error("Export failed:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET(_req: NextRequest) {
    try {
        await connectToMongoDB();
        const siblingDb = mongoose.connection.useDb("Pincode_Master");
        const pcoll = await siblingDb.listCollections();
        const pincodes = pcoll.map((c) => c.name);

        const siblingDb2 = mongoose.connection.useDb("new");
        const presets = await siblingDb2.collection("AipPresets").find({}).toArray();

        console.log(pincodes);

        return NextResponse.json({ pincode: pincodes, presets: presets }, { status: 200 });
    } catch (err) {
        console.error("Export failed:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
