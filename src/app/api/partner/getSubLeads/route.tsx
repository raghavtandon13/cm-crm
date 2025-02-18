// getting partner leads
import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    try {
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };

        const partner = await db.partner.findUnique({
            where: { id },
            include: { role: true, subPartners: { select: { id: true } } },
        });
        if (partner?.role.title !== "DSA") return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

        const subPartnerIds = partner?.subPartners.map((subPartner) => subPartner.id);
        const partnerLeads = await db.partnerLeads.findMany({ where: { partnerId: { in: subPartnerIds } } });

        // Response
        const response = NextResponse.json({
            status: "success",
            data: partnerLeads,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
