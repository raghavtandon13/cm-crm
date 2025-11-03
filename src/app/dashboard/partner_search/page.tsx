import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import UserSearch from "@/components/userSearch";
import User from "@/lib/users";
import Link from "next/link";
import { CMUser } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import LenderStatus from "@/components/displays/lenderStatus";
import { redirect } from "next/navigation";
import { db } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
const secret = process.env.JWT_SECRET as string;

interface UserData {
    accounts: Record<string, any>[];
    details: Omit<CMUser, "accounts">;
}

async function getData(phone: string, partnerId: string): Promise<UserData | string> {
    try {
        // getting cmUser from phone and subDSAs (if any) from partnerId
        const [user, subDsasRaw] = await Promise.all([
            User.findOne({ phone: phone }).lean(),
            db.partner.findMany({ where: { parentId: partnerId }, select: { id: true } }),
        ]);

        if (!user) return "Error Occurred";

        const userId = user._id?.toString();
        const subDsas = subDsasRaw.map((dsa) => dsa.id);

        // getting associations between cmUser and DSA or their subDSAs
        const [u, u2] = await Promise.all([
            db.partnerLeads.findFirst({ where: { partnerId: partnerId, cmUserId: userId } }),
            db.partnerLeads.findFirst({ where: { partnerId: { in: subDsas }, cmUserId: userId } }),
        ]);

        // if no association found, return "Error Occurred"
        if (!u && !u2) return "Error Occurred";

        let res: any = {};
        if (user.accounts) {
            const { accounts, ...details } = user;
            res.accounts = accounts;
            res.details = details;
        }

        return res;
    } catch (error) {
        console.log("Error:", error);
        return "Error Occurred";
    }
}

export default async function Phone(props: { searchParams: Promise<{ phone: string; accountsOnly: string }> }) {
    const searchParams = await props.searchParams;
    const { id } = jwt.verify(await (await cookies()).get("cm-token").value, secret) as { id: string };

    let phone = "";
    let accountsOnly = true;
    if (searchParams.phone === undefined || searchParams.phone === "" || /^\d{10}$/.test(searchParams.phone) === false)
        redirect("/dashboard/partner_create");
    if (searchParams.phone) phone = searchParams.phone.toString();
    if (searchParams.accountsOnly) {
        accountsOnly = searchParams.accountsOnly === "true";
        accountsOnly = true; // force true
    }

    const res = await getData(phone, id);

    if (typeof res === "string") {
        return (
            <div className="justify-center py-10 text-center">
                <h1 className="text-2xl font-bold">NOT FOUND</h1>
                <Link href={"/"} className="text-sm">
                    Create New Lead for{" "}
                    <span className=" text-cyan-500 underline decoration-wavy underline-offset-2">{phone}</span>
                </Link>
            </div>
        );
    }

    if (accountsOnly) {
        return res.accounts.map((account: any, index: any) => (
            <div key={index} className="mx-auto mb-4 items-center justify-center rounded-xl bg-white px-4 py-8 shadow">
                <div className="px-4">
                    <p className="mb-4 ml-[-8px] w-max rounded bg-slate-200 px-1 text-2xl font-semibold ">
                        {account.name}
                    </p>
                    {Object.entries(account)
                        .filter(([key]) => !["res", "req", "sent", "name", "status_code"].includes(key))
                        .map(([key, value]: any, entryIndex, arr) =>
                            value ? (
                                <div key={key}>
                                    <div className="flex justify-between">
                                        <p className="flex-[1]">{key.toUpperCase()}:</p>
                                        <pre className="flex-[4] w-full">{JSON.stringify(value, null, 1)}</pre>
                                    </div>
                                    {entryIndex < arr.length - 1 && <hr />}
                                </div>
                            ) : null,
                        )}
                </div>
            </div>
        ));
    }

    return (
        <main className="flex flex-col items-stretch md:p-8 ">
            <UserSearch phone={phone} />
            <LenderStatus phone={phone} />
            {res.accounts && res.details ? (
                <>
                    <div className="items-center justify-center">
                        <div className="flex justify-between py-10">
                            <h1 className="font-bold">Personal Details</h1>
                            <Link
                                className={`${buttonVariants({ variant: "outline" })}`}
                                href={`/dashboard/create?phone=${phone}`}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </div>
                        <Table>
                            <TableBody>
                                {Object.entries(res.details)
                                    .filter(
                                        ([key]) =>
                                            ![
                                                "eformFilled",
                                                "partner",
                                                "applications",
                                                "phoneOtpExpire",
                                                "phoneOtp",
                                                "__v",
                                                "detailsFilled",
                                                "role",
                                                "partnerHisory",
                                                "ref",
                                                "refArr",
                                                "consentHistory",
                                                "partnerHistory",
                                                "cm_status_updated",
                                            ].includes(key),
                                    )
                                    .map(
                                        ([key, value]: any) =>
                                            value && (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">{key}</TableCell>
                                                    <TableCell className="max-w-xs truncate text-right">
                                                        {typeof value === "object"
                                                            ? JSON.stringify(value, null, 1)
                                                            : value.toString()}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                    )}

                                <TableRow>
                                    <TableCell className="font-medium">Total Accounts</TableCell>
                                    <TableCell className="text-right">{res.accounts.length}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <h1 className="py-10 font-bold">Account Details</h1>
                    {res.accounts.map((account: any, index: any) => (
                        <div key={index} className="items-center justify-center pb-10">
                            <h1 className="text-l w-full text-center font-semibold">{account.name}</h1>
                            <Table>
                                <TableBody>
                                    {Object.entries(account)
                                        .filter(([key]) => !["res", "req", "sent", "name", "resp_data"].includes(key))
                                        .map(([key, value]: any) =>
                                            value ? (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">{key}</TableCell>
                                                    <TableCell className="max-w-xs truncate text-right">
                                                        {typeof value === "object" && !(value instanceof Date)
                                                            ? JSON.stringify(value, null, 1)
                                                            : value.toString()}
                                                    </TableCell>
                                                </TableRow>
                                            ) : null,
                                        )}
                                </TableBody>
                            </Table>
                            <hr />
                        </div>
                    ))}
                </>
            ) : (
                <div className="justify-center py-10 text-center">
                    <h1 className="text-2xl font-bold">NOT FOUND</h1>
                    <Link href={"/"} className="text-sm">
                        Create New Lead for{" "}
                        <span className=" text-cyan-500 underline decoration-wavy underline-offset-2">{phone}</span>
                    </Link>
                </div>
            )}
        </main>
    );
}
