import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import UserSearch from "@/components/userSearch";
import User from "@/lib/users";
// import Image from "next/image";
import Link from "next/link";
import { CMUser } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { NewWebUsersTable } from "@/components/displays/newWebUsers";
import LenderStatus from "@/components/displays/lenderStatus";

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
        return res;
    } catch (error) {
        console.log("Error:", error);
        return "Error Occurred";
    }
}

export default async function Phone(props: { searchParams: Promise<{ phone: string; accountsOnly: string }> }) {
    const searchParams = await props.searchParams;
    let phone = "";
    let accountsOnly = false;

    if (searchParams.phone === undefined) {
        return (
            <main className="flex flex-col items-stretch md:p-8 ">
                <UserSearch phone={phone} />

                <NewWebUsersTable />
                {/* <div className="flex justify-center py-10">
                    <Image src="/search.svg" alt="" width={400} height={400} className="mix-blend-multiply"></Image>
                </div> */}
            </main>
        );
    }

    if (searchParams.phone) {
        phone = searchParams.phone.toString();
    }

    if (searchParams.accountsOnly) {
        accountsOnly = searchParams.accountsOnly === "true";
    }
    const res = await getData(phone);

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
