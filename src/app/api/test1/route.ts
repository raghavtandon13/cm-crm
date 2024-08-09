import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../lib/db";

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();

        const agent = await db.agent.findFirst({
            where: { name: name },
        });

        return NextResponse.json(agent);
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
