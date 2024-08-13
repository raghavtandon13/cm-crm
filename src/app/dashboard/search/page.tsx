import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import UserSearch from "@/components/userSearch";
import User from "@/lib/users";
import Image from "next/image";
import Link from "next/link";
import { CMUser } from "@/lib/types";

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

export default async function Phone({ searchParams }: { searchParams: { phone: string } }) {
    let phone = "";

    if (searchParams.phone === undefined) {
        return (
            <main className="flex flex-col items-stretch md:p-8 ">
                <UserSearch phone={phone} />
                <div className="flex justify-center py-10">
                    <Image src="/search.svg" alt="" width={400} height={400} className="mix-blend-multiply"></Image>
                </div>
            </main>
        );
    }

    if (searchParams.phone) {
        phone = searchParams.phone.toString();
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

    return (
        <main className="flex flex-col items-stretch md:p-8 ">
            <UserSearch phone={phone} />
            {res.accounts && res.details ? (
                <>
                    <div className="items-center justify-center">
                        <h1 className="py-10 font-bold">Personal Details</h1>
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
                                            ].includes(key),
                                    )
                                    .map(
                                        ([key, value]: any) =>
                                            value && (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">{key}</TableCell>
                                                    <TableCell className="text-right">{value.toString()}</TableCell>
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
                                        .filter(([key]) => !["res", "req", "sent", "name"].includes(key))
                                        .map(([key, value]: any) =>
                                            value ? (
                                                <TableRow key={key}>
                                                    <TableCell className="font-medium">{key}</TableCell>
                                                    <TableCell className="max-w-xs truncate text-right">
                                                        {value.toString()}
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
