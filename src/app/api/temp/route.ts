import { Readable } from "node:stream";
import { format } from "@fast-csv/format";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../lib/db";

export async function POST(request: NextRequest) {
    await connectToMongoDB();

    if (!mongoose.connection.db) return NextResponse.json({ message: "DB not connected" }, { status: 500 });

    const aggType = request.headers.get("x-agg-type");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) return NextResponse.json({ message: "No file uploaded" }, { status: 400 });

    // ---- Stream file → extract IDs ----
    const buffer = Buffer.from(await file.arrayBuffer());

    const ids: string[] = [];

    await new Promise<void>((resolve, reject) => {
        Readable.from(buffer)
            .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
            .on("data", (row) => {
                const id = row.ids?.toString().trim();
                if (id) ids.push(id);
            })
            .on("end", () => resolve())
            .on("error", reject);
    });

    if (!ids.length) {
        return NextResponse.json({ message: "CSV must contain a non-empty 'ids' column" }, { status: 400 });
    }

    // ---- Run aggregation ----
    let results: any[] = [];

    switch (aggType) {
        case "moneyview":
            results = await mvAgg(ids);
            break;
        case "smartcoin":
            results = await smAgg(ids);
            break;
        case "phone":
            results = await phoneAgg(ids);
            break;
        default:
            return NextResponse.json({ message: "Invalid or missing x-agg-type header" }, { status: 400 });
    }

    // ---- Stream JSON → CSV response ----
    const csvStream = format({ headers: true });
    const readable = Readable.from(results);

    const responseStream = readable.pipe(csvStream);

    return new NextResponse(responseStream as any, {
        headers: {
            "Content-Type": "text/csv",
            "agg-count": `${results.length}/${ids.length}`,
            "Content-Disposition": `attachment; filename="${aggType}-output.csv"`,
        },
    });
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
