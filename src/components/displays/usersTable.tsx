"use client";
import { DataTable } from "@/components/dataTable";
import { Button, buttonVariants } from "@/components/ui/button";
import fromAPI from "@/lib/api";
import { CMUser } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

export const columns: ColumnDef<CMUser>[] = [
    { accessorKey: "name", header: () => <div className=" text-left">Name</div> },
    {
        accessorKey: "createdAt",
        header: () => <div className=" text-center">CreatedAt</div>,
        cell: ({ row }) => {
            const data = row.getValue("createdAt") as string;
            return <div className="min-w-max text-center">{data.split("T")[0]}</div>;
        },
    },
    {
        accessorKey: "createdAt",
        header: () => <div className="text-center">Time</div>,
        cell: ({ row }) => {
            const data = row.getValue("createdAt") as string;
            return <div className="text-center">{convertToIST(data)}</div>;
        },
    },
    {
        accessorKey: "phone",
        header: () => <div className=" text-center">Phone</div>,
        cell: ({ row }) => <div className="min-w-max text-right">{row.getValue("phone")}</div>,
    },
    {
        accessorKey: "pan",
        header: () => <div className=" text-center">PAN</div>,
        cell: ({ row }) => <div className="min-w-max text-right">{row.getValue("pan")}</div>,
    },
    {
        accessorKey: "dob",
        header: () => <div className=" text-center">DOB</div>,
        cell: ({ row }) => <div className="min-w-max text-right">{row.getValue("dob")}</div>,
    },
    {
        accessorKey: "email",
        header: () => <div className=" text-right">Email</div>,
        cell: ({ row }) => <div className="min-w-max text-right">{row.getValue("email")}</div>,
    },
];

function convertToIST(gmtDate: string): string {
    const date = new Date(gmtDate);
    return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
    });
}

export function UsersTable() {
    const [page, setPage] = useState(1);
    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["users", { page }],
        queryFn: async () => {
            const response = await fromAPI.get(`/users?page=${page}`);
            return response.data as CMUser[];
        },
    });

    if (isPending) return <h1>Loading...</h1>;
    if (isError) return <h1>Error</h1>;
    if (data === null || data.length === 0) return <h1>No data available</h1>;

    return (
        <>
            <div className="my-2">
                <div className="flex justify-between items-center mb-4">
                    <h1 className={`${buttonVariants({ variant: "card" })} font-semibold`}>New Users</h1>
                    <div className={`${buttonVariants({ variant: "card" })} font-semibold`}>
                        <Button disabled={page === 1} variant={"link"} onClick={() => setPage(page - 1)}>
                            {"<"}
                        </Button>
                        {page}
                        <Button variant={"link"} onClick={() => setPage(page + 1)}>
                            {">"}
                        </Button>
                    </div>
                    <Button onClick={() => refetch()} variant="outline">
                        {isFetching ? (
                            "Refetching..."
                        ) : (
                            <>
                                <RefreshCcw className="w-4 h-5 mr-2" />
                                <span>Refetch</span>
                            </>
                        )}
                    </Button>
                </div>
                <DataTable columns={columns} data={data} />
            </div>
        </>
    );
}
