import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../../lib/db";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";
import { ObjectId } from "mongodb";
// import superjson from "superjson";

function convertSpecialOperators(query: any) {
    if (Array.isArray(query)) {
        return query.map(convertSpecialOperators);
    } else if (query && typeof query === "object") {
        const newQuery: any = {};
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                if (key === "$date") {
                    return new Date(query[key]);
                } else if (key === "$oid") {
                    return new ObjectId(query[key]);
                } else if (key === "$gte" && query[key].$date) {
                    newQuery[key] = new Date(query[key].$date);
                } else {
                    newQuery[key] = convertSpecialOperators(query[key]);
                }
            }
        }
        return newQuery;
    } else {
        return query;
    }
}

export async function POST(_req: NextRequest) {
    await connectToMongoDB();
    try {
        const { id, query } = await _req.json();

        let aggregationPipeline: any;

        if (id) {
            // If ID provided, fetch and use saved query
            const savedQuery = await db.query.findUnique({ where: { id: id } });
            if (!savedQuery) {
                return NextResponse.json({ error: "Query not found" }, { status: 404 });
            }
            aggregationPipeline = JSON.parse(savedQuery.query);
        } else if (query) {
            // Use direct query if provided
            try {
                aggregationPipeline = JSON.parse(query);
                aggregationPipeline = convertSpecialOperators(aggregationPipeline);
                // aggregationPipeline = superjson.parse(query);
                // aggregationPipeline = typeof aggregationPipeline === "string" ? JSON.parse(aggregationPipeline) : aggregationPipeline;
                console.log(aggregationPipeline);
            } catch (error) {
                console.error("Invalid query format:", error);
                return NextResponse.json({ error: "Invalid query format 2" }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: "No query provided" }, { status: 400 });
        }

        // Validate that the pipeline is an array
        if (!Array.isArray(aggregationPipeline)) {
            return NextResponse.json(
                { error: "Invalid aggregation pipeline format. Must be an array." },
                { status: 400 },
            );
        }

        // Execute the aggregation pipeline
        const result = await User.aggregate(aggregationPipeline);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error executing query:", error);

        // More specific error handling
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
        }

        // Handle Mongoose errors
        if (error.name === "MongoServerError") {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
