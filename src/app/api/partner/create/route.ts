/*
API to create partner.
Boss can create  DSA or indiv. then role id should be  1 for dsa and 2 for  indiv
DSA can create  subDSA. then role id should be 3 for subdsa
*/

/*
IMPORTANT: Change roleIds !!!
*/

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../../../../lib/db";
import { NextResponse, NextRequest } from "next/server";

const secret = process.env.JWT_SECRET as string;

export async function POST(req: NextRequest) {
    // const token = req.headers.get("Authorization")?.split(" ")[1];
    // if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });

    // const { id } = jwt.verify(token, secret) as { id: string };
    // const dsa = await db.partner.findUnique({ where: { id }, include: { role: true } });
    // const boss = await db.agent.findUnique({ where: { id }, include: { role: true } });
    // if (!dsa && !boss) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 401 });
    // if (!!boss && boss.role.title !== "BOSS") return NextResponse.json({ status: "failure", message: "Not Authorized" }, { status: 401 });
    // if (!!dsa && dsa.role.title !== "DSA") return NextResponse.json({ status: "failure", message: "Not Authorized" }, { status: 401 });

    // testing
    const boss = true;
    const dsa = false;

    try {
        const body = await req.json();
        const hashedPassword = await bcrypt.hash(body.password, 10);

        let roleId: any;
        if (boss) {
            if (body.role === "DSA") roleId = "67ac9654da766fc55757ef5a";
            else if (body.role === "INDIV") roleId = "67ac965bda766fc55757ef5b";
            else return NextResponse.json({ status: "failure", message: "Invalid role provided" }, { status: 400 });
        } else if (dsa) {
            if (body.role === "SUBDSA") roleId = "67ac9663da766fc55757ef5c";
            else return NextResponse.json({ status: "failure", message: "Invalid role provided" }, { status: 400 });
        }

        const newPartner = await db.partner.create({
            "data": {
                "email": body.email,
                "name": body.firstName + " " + body.lastName,
                "password": hashedPassword,
                // "pancard": body.pancard,
                // "aadhar": body.aadhar,
                // "address": body.address,
                // "pincode": body.pincode,
                // "alt_mob": body.alt_mob,
                // "bank_ac": body.bank_ac,
                // "bank_ifsc": body.bank_ifsc,
                // "bank_acc_name": body.bank_acc_name,
                // "bank_name": body.bank_name,
                "roleId": roleId,
            },
            include: { role: true },
        });

        const token = jwt.sign({ id: newPartner.id, email: newPartner.email }, secret, { expiresIn: "10h" });
        const response = NextResponse.json({ status: "success", message: "Partner created successfully" });
        return response;
    } catch (error) {
        console.error("Error creating new partner:", error);
        return NextResponse.json(error);
    }
}
