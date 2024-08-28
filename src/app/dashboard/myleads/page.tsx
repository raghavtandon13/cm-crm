"use client";
import fromAPI from "@/lib/api";
import { Assignment, CMUser } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

function formatDate(utcDateStr: any) {
    const utcDate = new Date(utcDateStr);
    return utcDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

function Lead({ lead }: { lead: Assignment }) {
    const { data: cmuser } = useQuery({
        queryKey: ["cmuser"],
        queryFn: async () => {
            const response = await fromAPI.get(`/users/id/${lead.cmUserId}`);
            return response.data as CMUser;
        },
    });
    return (
        cmuser && (
            <>
                <div className="rounded-xl border bg-white px-4 py-2 shadow">
                    <Table>
                        <TableBody>
                            <TableRow onClick={() => window.open(`/dashboard/search?phone=${cmuser.phone}`)}>
                                <TableCell className="font-medium">Lead Phone</TableCell>
                                <TableCell className="text-right">{cmuser.phone}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Lead Assigned At</TableCell>
                                <TableCell className="text-right">{formatDate(lead.assignedAt)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Lead Status</TableCell>
                                <TableCell className="text-right">{lead.status}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <hr className="my-4" />
            </>
        )
    );
}

export default function MyLeads() {
    const { data: asgs } = useQuery({
        queryKey: ["assignments"],
        queryFn: async () => {
            const response = await fromAPI.get("/agents/assignments");
            return response.data.data as Assignment[];
        },
    });
    return (
        <>
            <div className="mb-4 w-[150px] rounded-xl border bg-white px-2 shadow">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Total Leads</TableCell>
                            <TableCell className="text-right">{asgs?.length}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            {asgs?.map((asg) => <Lead key={asg.id} lead={asg} />)}
        </>
    );
}
