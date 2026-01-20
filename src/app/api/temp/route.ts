import csv from "csv-parser";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { connectToMongoDB } from "../../../../lib/db";
import { Parser } from "json2csv";

export async function POST(request: NextRequest) {
    try {
        await connectToMongoDB();

        if (!mongoose.connection.db) {
            return NextResponse.json({ message: "DB not connected" }, { status: 500 });
        }

        const aggType = request.headers.get("x-agg-type"); // sm | mv

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const ids: string[] = await new Promise((resolve, reject) => {
            const extractedIds: string[] = [];
            let hasIdsColumn = false;

            Readable.from([buffer])
                .pipe(csv())
                .on("data", (row) => {
                    if ("ids" in row) {
                        hasIdsColumn = true;
                        if (row.ids) extractedIds.push(String(row.ids).trim());
                    }
                })
                .on("end", () => {
                    if (!hasIdsColumn) {
                        reject(new Error("CSV must contain an 'ids' column"));
                        return;
                    }
                    resolve(extractedIds);
                })
                .on("error", reject);
        });

        if (!ids.length) {
            return NextResponse.json({ message: "No IDs found in CSV" }, { status: 400 });
        }

        let aggregationResults: any[];

        switch (aggType) {
            case "moneyview":
                aggregationResults = await mvAgg(ids);
                break;
            case "smartcoin":
                aggregationResults = await smAgg(ids);
                break;

            case "phone":
                aggregationResults = await phoneAgg(ids);
                break;
            default:
                aggregationResults = [];
        }

        // Convert result → CSV
        const parser = new Parser();
        const csvData = parser.parse(aggregationResults);

        return new NextResponse(csvData, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "agg-count": `${aggregationResults.length}/${ids.length}`,
                "Content-Disposition": `attachment; filename="${aggType ?? "result"}-output.csv"`,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Internal error" },
            { status: 500 },
        );
    }
}

async function smAgg(ids: string[]) {
    return mongoose.connection
        .db!.collection("smartcoin-accounts")
        .aggregate([
            { $match: { leadId: { $in: ids } } },
            { $lookup: { from: "users", localField: "phone", foreignField: "phone", as: "user" } },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    leadId: 1,
                    phone: "$user.phone",
                    name: "$user.name",
                    pincode: "$user.pincode",
                    dob: "$user.dob",
                    income: "$user.income",
                    email: "$user.email",
                    message: 1,
                    resp_date: "$resp_date",
                },
            },
        ])
        .toArray();
}

async function mvAgg(ids: string[]) {
    return mongoose.connection
        .db!.collection("moneyview-accounts")
        .aggregate([
            { $match: { leadId: { $in: ids } } },
            { $lookup: { from: "users", localField: "phone", foreignField: "phone", as: "user" } },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    leadId: 1,
                    phone: "$user.phone",
                    name: "$user.name",
                    pincode: "$user.pincode",
                    dob: "$user.dob",
                    income: "$user.income",
                    email: "$user.email",
                    resp_date: "$resp_date",
                    offer: { $arrayElemAt: ["$offerObjects", 0] },
                },
            },
        ])
        .toArray();
}

async function phoneAgg(ids: string[]) {
    return mongoose.connection
        .db!.collection("users")
        .aggregate([
            { $match: { phone: { $in: ids } } },
            {
                $project: {
                    _id: 0,
                    phone: 1,
                    name: 1,
                    pincode: 1,
                    dob: 1,
                    income: 1,
                    email: 1,
                },
            },
        ])
        .toArray();
}
