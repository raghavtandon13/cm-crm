"use client";
import fromAPI from "@/lib/api";
import { Assignment, CMUser } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useMemo } from "react";
import { toast } from "sonner";

function formatDate(utcDateStr: any) {
    const utcDate = new Date(utcDateStr);
    return utcDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "short", day: "numeric" });
}

const statusMap = {
    CALLBACK: "CALLBACK",
    PTP: "PTP",
    DISBURSED: "DISBURSED",
    PENDING: "PENDING",
};

const subStatusMap = {
    NOT_REQUIRED: "NOT_REQUIRED",
    NOT_CONTACTED: "NOT_CONTACTED",
    REJECTED: "REJECTED",
    IN_PROGRESS: "IN_PROGRESS",
    DISBURSED: "DISBURSED",
};

function useHandleStatusChange() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ assignmentId, status, subStatus }: { assignmentId: string; status: string; subStatus: string }) => {
            await fromAPI.post("/assignments/change", {
                assignmentId,
                status,
                subStatus,
            });
        },
        onSuccess: () => {
            toast.success("Status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["assignments"], exact: true });
        },
        onError: () => {
            toast.error("Status update failed.");
            queryClient.invalidateQueries({ queryKey: ["assignments"], exact: true });
        },
    });
}

function Lead({ lead }: { lead: Assignment }) {
    const { data: cmuser } = useQuery({
        queryKey: ["cmuser", lead.cmUserId],
        queryFn: async () => {
            const response = await fromAPI.get(`/users/id/${lead.cmUserId}`);
            return response.data as CMUser;
        },
    });

    const handleStatusChange = useHandleStatusChange();

    const handleStatusChangeLocal = (e: React.ChangeEvent<HTMLSelectElement>, type: "status" | "subStatus") => {
        const value = e.target.value;
        if (type === "status") {
            handleStatusChange.mutate({ assignmentId: lead.id, status: value, subStatus: lead.subStatus });
        } else {
            handleStatusChange.mutate({ assignmentId: lead.id, status: lead.status, subStatus: value });
        }
    };

    return (
        cmuser && (
            <TableRow className="pointer">
                <TableCell className="text-center">{cmuser.phone}</TableCell>
                <TableCell className="text-center">{formatDate(lead.assignedAt)}</TableCell>
                <TableCell className="text-left pointer">
                    <select onChange={(e) => handleStatusChangeLocal(e, "status")} defaultValue={lead.status}>
                        <option value="" disabled>
                            Select Status
                        </option>
                        {Object.entries(statusMap).map(([status, value]) => (
                            <option key={status} value={value}>
                                {status}
                            </option>
                        ))}
                    </select>
                </TableCell>
                <TableCell className="text-left pointer">
                    <select onChange={(e) => handleStatusChangeLocal(e, "subStatus")} defaultValue={lead.subStatus}>
                        <option value="" disabled>
                            Select Sub Status
                        </option>
                        {Object.entries(subStatusMap).map(([subStatus, value]) => (
                            <option key={subStatus} value={value}>
                                {subStatus}
                            </option>
                        ))}
                    </select>
                </TableCell>
            </TableRow>
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

    const totalLeads = useMemo(() => asgs?.length || 0, [asgs]);

    return (
        <>
            <div className="mb-4 w-[150px] rounded-xl border bg-white px-2 shadow">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Total Leads</TableCell>
                            <TableCell className="text-left">{totalLeads}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className="mb-4 rounded-xl border bg-white px-2 shadow">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="text-slate-600 text-center">Phone</TableCell>
                            <TableCell className="text-slate-600 text-center">Date</TableCell>
                            <TableCell className="text-slate-600 text-left">Status</TableCell>
                            <TableCell className="text-slate-600 text-left">Sub Status</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableBody>{asgs?.map((asg) => <Lead key={asg.id} lead={asg} />)}</TableBody>
                </Table>
            </div>
        </>
    );
}
