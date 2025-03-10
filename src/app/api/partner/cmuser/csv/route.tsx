import { CMUser, Lead } from "@/lib/types";
import User from "@/lib/users";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB, db } from "../../../../../../lib/db";
import csv from "csv-parser";
import { Readable } from "stream";

const secret = process.env.JWT_SECRET as string;

const requiredHeaders = [
    "firstName",
    "lastName",
    "phone",
    "email",
    "dob",
    "gender",
    "address",
    "pincode",
    "city",
    "state",
    "empType",
    "company",
];

export async function POST(req: NextRequest) {
    await connectToMongoDB();
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ status: "failure", message: "No token provided" }, { status: 401 });

    const { id } = jwt.verify(token, secret) as { id: string };
    const partner = await db.partner.findUnique({ where: { id }, include: { role: true } });
    if (!partner) return NextResponse.json({ status: "failure", message: "Invalid token provided" }, { status: 403 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return NextResponse.json({ status: "failure", message: "No file provided" }, { status: 400 });

        const fileStream = Readable.from(Buffer.from(await file.arrayBuffer()));
        const results: Lead[] = [];
        let headersValid = true;

        fileStream
            .pipe(csv())
            .on("headers", (headers) => {
                headersValid = requiredHeaders.every((header) => headers.includes(header));
                if (!headersValid) {
                    fileStream.destroy();
                    return NextResponse.json({ status: "failure", message: "Invalid CSV headers" }, { status: 400 });
                }
            })
            .on("data", (data) => results.push(data))
            .on("end", async () => {
                if (!headersValid) return;
                console.log(results);
                for (const data of results) {
                    let user = await User.findOne({ phone: data.phone });
                    console.log("user", user);
                    let dedupeStatus: boolean;
                    if (user) {
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
                                        name: partner.cmId,
                                        date: Date.now(),
                                        type: "dedupe",
                                    },
                                },
                            },
                            { new: true },
                        );
                        dedupeStatus = false;
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
                            partner: partner.cmId,
                            partnerHistory: {
                                name: partner.cmId,
                                date: new Date(),
                                type: "new",
                            },
                        });
                        user = await newUser.save();
                        dedupeStatus = true;
                    }

                    if (!user) continue;

                    await db.partnerLeads.create({
                        data: { cmUserId: user._id as string, partnerId: partner.id, status: dedupeStatus ? "PENDING" : "DUPLICATE" },
                    });
                }

                return NextResponse.json({ status: "success", message: "CSV processed successfully" }, { status: 201 });
            })
            .on("error", (error) => {
                console.error("Error processing CSV:", error);
                return NextResponse.json({ status: "failure", message: "Error processing CSV" }, { status: 500 });
            });

        return NextResponse.json({ status: "success", message: "CSV processed successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ status: "failure", message: "Internal server error" }, { status: 500 });
    }
}
