// db queries route

import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import { Query } from "@prisma/client";

export async function GET(_req: NextRequest) {
    try {
        const res = await db.query.findMany();
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        const res = await db.query.create({
            data: {
                name: query.name,
                query: query.query,
                date: new Date(query.date),
            },
        });
        return NextResponse.json(res, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
