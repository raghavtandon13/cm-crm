import mongoose from "mongoose";
import { connectToMongoDB } from "../../lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { FileDown } from "lucide-react";
import ExportStagesButton from "./ExportStagesButton";

async function getData() {
    await connectToMongoDB();
    try {
        const otpUsers = await mongoose.connection.db
            .collection("stages")
            .find({
                date: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
                    $lte: new Date(new Date().setDate(new Date().getDate() + 1)),
                },
            })
            .sort({ date: -1 })
            .toArray();
        return otpUsers;
    } catch (error) {
        console.error("Error fetching data:", error);
        return "Error Occurred: " + error.message;
    }
}

export async function StagesTable() {
    const otpUsers = await getData();
    if (typeof otpUsers === "string") {
        return <div className="justify-center py-10 text-center text-red-600">{otpUsers}</div>;
    }
    if (!otpUsers || otpUsers.length === 0) {
        return (
            <div className="justify-center py-10 text-center text-gray-500">No data found for the last 24 hours.</div>
        );
    }
    return (
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold mb-4">Stages (Last 24 Hours)</h2>
                {/*lets make this export button work*/}
                {/*use export data function and donwload csv on click*/}
		<ExportStagesButton/>
                {/* <Button variant="ghost" className="flex items-center justify-center hover:bg-slate-200"> */}
                {/*     <FileDown strokeWidth={1.25} className="w-4" /> */}
                {/* </Button> */}
            </div>
            <Table className="w-full border rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">-</TableHead>
                        <TableHead className="w-[200px]">Date</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Ref</TableHead>
                        <TableHead>ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otpUsers.map((user, idx) => (
                        <TableRow key={user._id.toString()}>
                            <TableCell className="text-xs text-gray-500">{idx}</TableCell>
                            <TableCell>
                                {new Date(user.date).toLocaleString("en-IN", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                })}
                            </TableCell>
                            <TableCell>
                                <Link className="hover:text-sky-600" href={`/dashboard/search?phone=${user.phone}`}>
                                    {user.phone}
                                </Link>
                            </TableCell>
                            <TableCell>{user.stage}</TableCell>
                            <TableCell>{user.ref ?? "-"}</TableCell>
                            <TableCell className="text-xs text-gray-500">{user._id.toString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
