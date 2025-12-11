// getting partner leads
import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { db, connectToMongoDB } from "../../../../../lib/db";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET as string;

export async function GET(req: NextRequest) {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    try {
        // Getting Agent
        if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 });
        const { id } = jwt.verify(token, secret) as { id: string };

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        console.log(page, limit);

        const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });
        const partnerRole = partner?.role?.title;
        let leadsRes: any, groupRes: any, countRes: any;

        if (partnerRole !== "DSA") {
            [leadsRes, groupRes, countRes] = await Promise.allSettled([
                db.partnerLeads.findMany({
                    where: { partnerId: partner?.id },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { assignedAt: "desc" },
                }),
                db.partnerLeads.groupBy({
                    by: ["status"],
                    where: { partnerId: partner?.id },
                    _count: { status: true },
                }),
                db.partnerLeads.count({ where: { partnerId: partner?.id } }),
            ]);
        } else {
            const subDsas = await db.partner
                .findMany({ where: { parentId: partner?.id }, select: { id: true } })
                .then((dsas) => dsas.map((dsa) => dsa.id));

            [leadsRes, groupRes, countRes] = await Promise.allSettled([
                db.partnerLeads.findMany({
                    where: { partnerId: { in: subDsas } },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { assignedAt: "desc" },
                }),
                db.partnerLeads.groupBy({
                    by: ["status"],
                    where: { partnerId: { in: subDsas } },
                    _count: { status: true },
                }),
                db.partnerLeads.count({ where: { partnerId: { in: subDsas } } }),
            ]);
        }

        const partnerLeads = leadsRes.status === "fulfilled" ? leadsRes.value : [];
        const partnerARD = groupRes.status === "fulfilled" ? groupRes.value : [];
        const totalPartnerLeads = countRes.status === "fulfilled" ? countRes.value : 0;

        const totalPages = Math.ceil(totalPartnerLeads / limit);

        await connectToMongoDB();

        // Find users for each cmUserId in partnerLeads
        const users = await Promise.all(
            partnerLeads.map(async (lead: any) => {
                const user = await User.findById(lead.cmUserId).select("name email phone");
                return { ...lead, user };
            }),
        );

        // Response
        const response = NextResponse.json({
            status: "success",
            totalPages,
            partnerARD,
            data: users,
        });

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
