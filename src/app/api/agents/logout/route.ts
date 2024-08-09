import { NextResponse, NextRequest } from "next/server";
// import { db } from "../../../../../lib/db";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// const secret = process.env.JWT_SECRET as string;

//  NOTE: Should save logoout time.
//  TODO: get cm-token from req to get agent from db

export async function GET(_req: NextRequest) {
    try {
        const response = NextResponse.json({ status: "success", message: "User logged out successfully" });
        response.cookies.delete("cm-token");

        return response;
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(error);
    }
}
