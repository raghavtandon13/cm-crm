"use client";
import { DataTable } from "@/components/dataTable";
import { Button, buttonVariants } from "@/components/ui/button";
import fromAPI from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

const columns: ColumnDef<any>[] = [
    { accessorKey: "user.name", header: () => <div className=" text-left">Name</div> },
    {
        accessorKey: "assignedAt",
        header: () => <div className=" text-center">CreatedAt</div>,
        cell: ({ row }) => {
            const data = row.getValue("assignedAt") as string;
            return <div className="min-w-max text-center">{data.split("T")[0]}</div>;
        },
    },
    { accessorKey: "user.phone", header: () => <div>Phone</div> },
    { accessorKey: "user.email", header: () => <div>Email</div> },
    { accessorKey: "status", header: () => <div>Status</div> },
];

function _convertToIST(gmtDate: string): string {
    const date = new Date(gmtDate);
    return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
    });
}

export default function PartnerLeadsTable() {
    const [page, setPage] = useState(1);
    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["users", { page }],
        queryFn: async () => {
            // const response = await fromAPI.get(`/users?page=${page}`);
            const response = await fromAPI.get(`/partner/getLeads`);
            console.log(response.data.data);
            return response.data.data;
        },
    });

    if (isPending) return <h1>Loading...</h1>;
    if (isError) return <h1>Error</h1>;
    if (data === null || data.length === 0) return <h1>No data available</h1>;

    return (
        <>
            <div className="my-2">
                <div className="flex justify-between items-center mb-4">
                    <h1 className={`${buttonVariants({ variant: "card" })} font-semibold`}>Partner Leads</h1>
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
