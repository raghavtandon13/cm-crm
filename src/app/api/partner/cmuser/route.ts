import { CMUser, Lead } from "@/lib/types";
import User from "@/lib/users";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB, db } from "../../../../../lib/db";
import fromAPI from "@/lib/api";

const secret = process.env.JWT_SECRET as string;
const injectUri = process.env.INJECT_URI as string;

export async function POST(req: NextRequest) {
    await connectToMongoDB();
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });

    const { id } = jwt.verify(token, secret) as { id: string };
    const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });
    if (!partner) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 403 });

    try {
        const data = (await req.json()) as Lead & { inject?: boolean };
        const inject = data.inject === true ? true : false;
        // const inject = false;

        let user = await User.findOne({ phone: data.phone });

        let extraMsg = null;
        if (user) {
            // check for assignment
            const prevLead = await db.partnerLeads.findFirst({
                where: { cmUserId: user._id.toString() },
                include: { partner: true },
            });

            if (prevLead) extraMsg = `Lead already associated with us.}`;

            // Update existing user
            user = await User.findOneAndUpdate(
                { phone: data.phone },
                {
                    $set: {
                        name: data.firstName + " " + data.lastName,
                        email: data.email,
                        dob: data.dob,
                        gender: data.gender,
                        addr: data.address,
                        pincode: data.pincode,
                        city: data.city,
                        state: data.state,
                        employment: data.empType,
                        company_name: data.company,
                    },
                    $push: {
                        partnerHistory: {
                            name: partner.id,
                            date: Date.now(),
                            type: "new",
                        },
                    },
                },
                { new: true }, // Return the updated document
            );
        } else {
            // Create new user if not found
            const newUser = new User<Partial<CMUser>>({
                name: data.firstName + " " + data.lastName,
                phone: data.phone,
                email: data.email,
                dob: data.dob,
                gender: data.gender,
                addr: data.address,
                pincode: data.pincode,
                city: data.city,
                state: data.state,
                employment: data.empType,
                company_name: data.company,
                partner: partner.id,
                partnerHistory: {
                    name: partner.id,
                    date: new Date(),
                    type: "new",
                },
            });
            user = await newUser.save();
        }

        if (!user)
            return NextResponse.json({ status: "failure", message: "Could not create new user" }, { status: 500 });

        let injectRes = { data: {} };
        console.log("inject:", inject);
        if (inject) {
            injectRes = await fromAPI.post(
                `https://credmantra.com/api/v1/leads/${injectUri}`,
                { lead: data },
                { headers: { "x-api-key": "vs65Cu06K1GB2qSdJejP", "Content-Type": "application/json" } },
            );
        }

        let partnerLead = null;
        if (!extraMsg) {
            partnerLead = await db.partnerLeads.create({
                data: { cmUserId: user._id.toString(), partnerId: partner.id },
            });
        }

        if (!partnerLead)
            return NextResponse.json(
                { status: "failure", message: extraMsg || "Could not create Assignment" },
                { status: 500 },
            );

        return NextResponse.json(
            { status: "success", message: "User created successfully", inject: injectRes.data },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error injecting:", error);
        return NextResponse.json({ status: "failure", message: "Internal server error" }, { status: 500 });
    }
}
