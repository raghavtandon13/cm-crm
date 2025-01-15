// app/api/db/queries/save/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../../lib/db";
import { connectToMongoDB } from "../../../../../../lib/db";

export async function POST(_req: NextRequest) {
    await connectToMongoDB();
    try {
        const { name, query } = await _req.json();

        // Validate the query
        let aggregationPipeline;
        try {
            aggregationPipeline = JSON.parse(query);
        } catch (error) {
            return NextResponse.json({ error: "Invalid query format" }, { status: 400 });
        }

        // Validate that the pipeline is an array
        if (!Array.isArray(aggregationPipeline)) {
            return NextResponse.json(
                { error: "Invalid aggregation pipeline format. Must be an array." },
                { status: 400 },
            );
        }

        // Save the query
        const savedQuery = await db.query.create({
            data: {
                name,
                query: JSON.stringify(aggregationPipeline),
                date: new Date(),
            },
        });

        return NextResponse.json(savedQuery, { status: 201 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
