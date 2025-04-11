// db queries route

import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../lib/db";

export async function POST(req: NextRequest, res) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No files received." }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(" ", "_");
    console.log(filename);

    try {
        await writeFile(path.join(process.cwd(), "public/assets/" + filename), buffer);
        return NextResponse.json({ Message: "Success", status: 201 });
    } catch (error) {
        console.log("Error occurred ", error);
        return NextResponse.json({ Message: "Failed", status: 500 });
    }
}
