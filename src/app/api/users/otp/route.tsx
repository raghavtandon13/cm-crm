import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../lib/db";
import axios from "axios";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
        return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // const otp = "123456";
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    console.log(otp);

    try {
        // await axios.get("https://www.fast2sms.com/dev/bulkV2", {
        //     params: {
        //         authorization: "kuM9ZYAPpRt0hFqVW71UbOxygli64dDrQzew3JLojN5HTfaIvskCR4bYSDAznIa6VxGmuq0ytT72LZ5f",
        //         variables_values: otp,
        //         route: "otp",
        //         numbers: phone,
        //     },
        // });

        // Save OTP and expiration time to the user's record in the database
        await connectToMongoDB();
        await User.updateOne({ phone }, { phoneOtp: otp, phoneOtpExpire: otpExpire }, { upsert: true });

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
        return NextResponse.json({ error: "Phone number and OTP are required" }, { status: 400 });
    }

    try {
        await connectToMongoDB();
        const user = await User.findOne({ phone, phoneOtp: otp });

        if (!user) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // Check if OTP is expired
        if (user.phoneOtpExpire && user.phoneOtpExpire < new Date()) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        // OTP is valid, proceed with further actions (e.g., authentication)
        return NextResponse.json({ message: "OTP verified successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
    }
}
