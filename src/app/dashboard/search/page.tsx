import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import UserSearch from "@/components/userSearch";
import User from "@/lib/users";
// import Image from "next/image";
import Link from "next/link";
import { CMUser } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { History, Pencil } from "lucide-react";
import LenderStatus from "@/components/displays/lenderStatus";
import { StagesTable } from "@/components/stagesTable";
import { getARDStatus } from "@/lib/lenderConfigArd";

interface UserData {
    accounts: Record<string, any>[];
    details: Omit<CMUser, "accounts">;
}

async function getData(phone: string): Promise<UserData | string> {
    try {
        const user1 = await User.find({ phone: phone }).lean();
        let res: any = {};
        if (user1[0] && user1[0].accounts) {
            const { accounts, ...details } = user1[0];
            if (accounts !== undefined && details !== undefined) {
                res.accounts = accounts;
                res.details = details;
            }
        }

        const collections = await User.db.listCollections();
        const accColls = collections.filter((coll) => coll.name.endsWith("-accounts"));
        res.accounts = [];
        // works till here
        for (const coll of accColls) {
            const collData = await User.db.collection(coll.name).findOne({ phone: phone, latest: true });
            if (collData) {
                res.accounts.push(collData);
                console.log(res.accounts);
            }
        }

        return res;
    } catch (error) {
        console.log("Error:", error);
        return "Error Occurred";
    }
}

async function getDataPerAcc(phone: string, acc: string) {
    return {
        accounts: await User.db
            .collection(acc.toLowerCase() + "-accounts")
            .find({ phone: phone })
            .toArray(),
    };
}

async function ARDComponent({ account }: { account: any }) {
    const status = getARDStatus(account);
    const statusColors: Record<string, string> = {
        Accepted: "text-green-600 bg-green-100",
        Rejected: "text-red-600 bg-red-100",
        Deduped: "text-orange-600 bg-orange-100",
        Errors: "text-purple-600 bg-purple-100",
    };
    const defaultColor = "text-gray-700 bg-gray-200";
    const colorClass = statusColors[status] ?? defaultColor;
    return <div className={`px-2 rounded ml-2 font-semibold ${colorClass}`}>{status}</div>;
}

export default async function Phone(props: {
    searchParams: Promise<{ phone: string; accountsOnly: string; account: string }>;
}) {
    const searchParams = await props.searchParams;
    let phone = "";
    let accountsOnly = false;
    let account = "";

    if (searchParams.phone === undefined) {
        return (
            <main className="flex flex-col items-stretch md:p-8 ">
                <UserSearch phone={phone} />
                <StagesTable />
            </main>
        );
    }
    if (searchParams.phone) phone = searchParams.phone.toString();
    if (searchParams.accountsOnly) accountsOnly = searchParams.accountsOnly === "true";
    if (searchParams.account) {
        account = searchParams.account;
        accountsOnly = true;
    }

    const res = account ? await getDataPerAcc(phone, account) : await getData(phone);
    console.log(res);

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
                        .map(([key, value]: any, entryIndex, arr) => {
                            if (!value) return null;
                            const displayValue = Array.isArray(value) && value.length > 0 ? value[0] : value;
                            return (
                                <div key={key}>
                                    <div className="flex justify-between">
                                        <p className="flex-[1]">{key}:</p>
                                        <pre className="flex-[4] w-full">{JSON.stringify(displayValue, null, 1)}</pre>
                                    </div>

                                    {entryIndex < arr.length - 1 && <hr />}
                                </div>
                            );
                        })}
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
                            <Button variant="card" className="text-l w-full text-center font-semibold">
                                <div className="flex w-full items-center justify-between">
                                    {account.name}
                                    <ARDComponent account={account} />
                                    <Link
                                        href={`/dashboard/search?phone=${phone}&account=${account.name}`}
                                        className="ml-2"
                                        title={`View ${account.name} History`}
                                    >
                                        <History className="h-4 w-4" />
                                    </Link>
                                </div>
                            </Button>
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
