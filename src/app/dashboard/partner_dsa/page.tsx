import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "../../../../lib/db";
import NewSubDsa from "./newSubDsa";

const secret = process.env.JWT_SECRET as string;

export default async function DsaHome() {
    const { id } = jwt.verify((await (await cookies()).get("cm-token")?.value) ?? "", secret) as { id: string };
    if (!id) redirect("/dashboard/partner_create");

    const dsas = await db.partner.findMany({
        where: { parentId: id },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">Sub DSAs</h1>
            <NewSubDsa />

            <Table>
                {/* <TableCaption>List of all sub-DSAs under this parent</TableCaption> */}
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dsas.map((dsa) => (
                        <TableRow key={dsa.id}>
                            <TableCell>{dsa.name || "-"}</TableCell>
                            <TableCell>{dsa.email}</TableCell>
                            <TableCell>{new Date(dsa.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
