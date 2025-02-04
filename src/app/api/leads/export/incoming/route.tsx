import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";

export async function POST(_req: NextRequest) {
    try {
        const { dates, day, month, partner, overall } = await _req.json();
        await connectToMongoDB();

        const matchConditions: any = {};
        if (overall) {
            matchConditions.createdAt = {
                $gte: new Date(dates.from),
                $lt: new Date(dates.to),
            };
        } else if (partner && month && day) {
            const [monthName, year] = month.split(" ");
            const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

            // Create a date for the specified day in UTC
            const startDate = new Date(Date.UTC(year, monthIndex, parseInt(day, 10)));

            // Calculate the next day's start time in UTC
            const endDate = new Date(Date.UTC(year, monthIndex, parseInt(day, 10) + 1));

            // Add the range to match conditions
            matchConditions.createdAt = {
                $gte: startDate,
                $lt: endDate,
            };
            matchConditions.partner = partner;
        } else if (partner && month) {
            const [monthName, year] = month.split(" ");
            const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
            const firstDay = new Date(year, monthIndex, 1);
            const lastDay = new Date(year, monthIndex + 1, 0);
            matchConditions.createdAt = {
                $gte: firstDay,
                $lt: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1), // Midnight of the next day
            };
            matchConditions.partner = partner;
        } else if (partner) {
            matchConditions.createdAt = {
                $gte: new Date(dates.from),
                $lt: new Date(dates.to),
            };
            matchConditions.partner = partner;
        }

        const users = await User.find(matchConditions).select("phone partner").lean();

        // Create CSV with header
        const csv = [
            "phone,partner", // CSV header
            ...users.map((user) => `${user.phone},${user.partner}`),
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
