import { type NextRequest, NextResponse } from "next/server";
import { getLenderStats } from "@/lib/ardLs";

// In-memory cache for ARD results
// const ardCacheLS = new Map();
// const ARD_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCacheKey(startDate: any, endDate: any, options: any) {
    return JSON.stringify({ startDate, endDate, options });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Extract and validate required parameters
        const { startDate, endDate, options = {} } = body;

        // Validate required fields
        if (!startDate || !endDate) {
            return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD format" }, { status: 400 });
        }

        // Validate date range
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: "Invalid date values" }, { status: 400 });
        }

        if (start >= end) {
            return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
        }

        // Extract and validate options
        const { fresh = false, beta = false, selectedLenders = null, perday = false } = options;

        // Validate selectedLenders if provided
        if (selectedLenders && (!Array.isArray(selectedLenders) || selectedLenders.length === 0)) {
            return NextResponse.json(
                { error: "selectedLenders must be a non-empty array if provided" },
                { status: 400 },
            );
        }

        // Special validation for perday mode
        if (perday && (!selectedLenders || selectedLenders.length !== 1)) {
            return NextResponse.json(
                { error: "perday mode requires exactly one lender in selectedLenders" },
                { status: 400 },
            );
        }

        // Caching logic
        const cacheKey = getCacheKey(startDate, endDate, { fresh, beta, selectedLenders, perday });
        const now = Date.now();
        // // Purge expired cache entries
        // for (const [key, entry] of ardCacheLS.entries()) {
        //     if (now - entry.timestamp > ARD_CACHE_TTL_MS) {
        //         ardCacheLS.delete(key);
        //     }
        // }
        // // Check cache
        // if (ardCacheLS.has(cacheKey)) {
        //     const entry = ardCacheLS.get(cacheKey);
        //     if (now - entry.timestamp <= ARD_CACHE_TTL_MS) {
        //         return NextResponse.json({
        //             success: true,
        //             data: entry.data,
        //             cached: true,
        //         });
        //     }
        // }
        // Cache miss: run aggregation
        const statsData = await getLenderStats(startDate, endDate, {
            fresh,
            beta,
            selectedLenders,
            perday,
        });
        // ardCacheLS.set(cacheKey, { data: statsData, timestamp: now });
        // Return successful response
        return NextResponse.json({
            success: true,
            data: statsData,
            cached: false,
        });
    } catch (error) {
        console.error("Lender Stats API Error:", error);

        // Handle specific error types
        if (error instanceof Error) {
            return NextResponse.json(
                {
                    error: "Internal server error",
                    message: error.message,
                    details: process.env.NODE_ENV === "development" ? error.stack : undefined,
                },
                { status: 500 },
            );
        }

        return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
}
