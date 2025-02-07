"use client";
import fromAPI from "@/lib/api";
import { Assignment, CMUser } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useMemo } from "react";

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
        queryKey: ["cmuser", lead.cmUserId],
        queryFn: async () => {
            const response = await fromAPI.get(`/users/id/${lead.cmUserId}`);
            return response.data as CMUser;
        },
    });

    return (
        cmuser && (
            <TableRow className="pointer" onClick={() => window.open(`https://cred-db.vercel.app/mv/${cmuser.phone}`)}>
                <TableCell className="text-center">{cmuser.phone}</TableCell>
                <TableCell className="text-center">{formatDate(lead.assignedAt)}</TableCell>
                <TableCell className="text-left pointer">Status &rarr;</TableCell>
            </TableRow>
        )
    );
}

interface AgentData {
    name: string;
    assignments: Assignment[];
}

function AgentAssignments({ agentId, agentName, assignments }: { agentId: string; agentName: string; assignments: Assignment[] }) {
    return (
        <div key={agentId} className="mb-4 rounded-xl border bg-white px-2 shadow">
            <h2 className="text-lg font-bold">{agentName}</h2>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className="text-slate-600 text-center">Phone</TableCell>
                        <TableCell className="text-slate-600 text-center">Date</TableCell>
                        <TableCell className="text-slate-600 text-left">Status</TableCell>
                    </TableRow>
                </TableBody>
                <TableBody>
                    {assignments.map((asg) => (
                        <Lead key={asg.id} lead={asg} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function MyLeads() {
    const { data: agentsData } = useQuery({
        queryKey: ["assignments"],
        queryFn: async () => {
            const response = await fromAPI.get("/agents/tl_assignments");
            return response.data.data as Record<string, AgentData>;
        },
    });

    const totalLeads = useMemo(() => {
        return Object.values(agentsData || {}).reduce((acc, agent) => acc + agent.assignments.length, 0);
    }, [agentsData]);

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
            {agentsData &&
                Object.entries(agentsData).map(([agentId, agentData]) => (
                    <AgentAssignments key={agentId} agentId={agentId} agentName={agentData.name} assignments={agentData.assignments} />
                ))}
        </>
    );
}
