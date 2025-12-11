"use client";
import { DataTable } from "@/components/dataTable";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import fromAPI from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Clock, Copy, RefreshCcw, Users } from "lucide-react";
import Link from "next/link";
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
    {
        accessorKey: "status",
        header: () => <div>Status</div>,
        cell: ({ row }) => {
            const s = row.getValue("status") as string;
            const p = row.original?.user?.phone;
            return s === "PENDING" ? (
                <Link href={`/dashboard/partner_search?accountsOnly=true&phone=${p}`}>VIEW&rarr;</Link>
            ) : (
                <div>{s}</div>
            );
        },
    },
];

export default function PartnerLeadsTable() {
    const limit = 20;
    const [page, setPage] = useState(1);
    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["users", { page }],
        queryFn: async () => {
            const response = await fromAPI.get(`/partner/getLeads?page=${page}&limit=${limit}`);
            return response.data;
        },
    });

    if (isPending) return <h1>Loading...</h1>;
    if (isError) return <h1>Error</h1>;
    // if (data === null || data.length === 0) return <h1>No data available</h1>;

    return (
        <>
            <div className="my-2">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                    <Card className="relative overflow-hidden bg-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {data.partnerARD.reduce((sum:any, entry:any) => sum + entry._count.status, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">All leads in the system</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-yellow-500/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {data.partnerARD.find((entry:any) => entry.status === "PENDING")?._count.status || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-green-500/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Accepted Leads</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {data.partnerARD.find((entry:any) => entry.status === "ACCEPTED")?._count.status || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Successfully converted</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-red-500/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Duplicate Leads</CardTitle>
                            <Copy className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {data.partnerARD.find((entry:any) => entry.status === "DUPLICATE")?._count.status || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Marked as duplicates</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h1 className={`${buttonVariants({ variant: "card" })} font-semibold`}>Partner Leads</h1>

                    {/* this changes page */}
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
                <DataTable columns={columns} data={data.data} />
            </div>
        </>
    );
}
