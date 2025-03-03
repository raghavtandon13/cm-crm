"use client";
import fromAPI from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

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

interface Assignment {
    assignmentId: string;
    userPhone: string;
    userEmail: string;
    userName: string;
    assignedAt: string;
    status: string;
    agentId: string;
}

interface AgentData {
    agentId: string;
    agentName: string;
    assignments: Assignment[];
}

export default function MyLeads() {
    const user = useUser();
    let qa = user?.role.title === "QA";
    // qa = true;

    const [searchPhone, setSearchPhone] = useState("");
    const [searchResult, setSearchResult] = useState("");

    const queryClient = useQueryClient();
    const { data: agentsData, refetch } = useQuery({
        queryKey: ["assignments"],
        queryFn: async () => {
            const response = await fromAPI.get("/agents/tl_assignments");
            return response.data.data as Record<string, AgentData>;
        },
    });

    const agentsMap = () => {
        const map = new Map<string, string>();
        if (agentsData) {
            Object.entries(agentsData).forEach(([_, agentData]) => {
                map.set(agentData.agentId, agentData.agentName);
            });
        }
        return map;
    };

    const agentStats = () => {
        if (agentsData) {
            return Object.entries(agentsData).map(([_, agentData]) => ({
                agentName: agentData.agentName,
                assignmentsCount: agentData.assignments.length,
            }));
        }
        return [];
    };

    const allAssignments = () => {
        const assignments: any[] = [];
        if (agentsData) {
            Object.entries(agentsData).forEach(([agentId, agentData]) => {
                agentData.assignments.forEach((assignment) => {
                    assignments.push({ ...assignment, agentId, agentName: agentData.agentName });
                });
            });
        }
        return assignments.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
    };

    const transferMutation = useMutation({
        mutationFn: async ({ assignmentId, newAgentId }: { assignmentId: string; newAgentId: string }) => {
            await fromAPI.post("/agents/assignments/transfer", {
                assignmentId,
                agentId: newAgentId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"], exact: true });
            toast.success("Assignment transferred successfully");
            refetch();
        },
    });

    const handleTransfer = (assignmentId: string, newAgentId: string) => transferMutation.mutate({ assignmentId, newAgentId });

    const agentsMapValue = agentsMap();
    const allAssignmentsValue = allAssignments();

    const filteredAssignments = allAssignmentsValue.filter((asg) => asg.userPhone.includes(searchPhone));
    return (
        <>
            <div className="mb-4 w-full flex items-center justify-between">
                <div className="w-[150px]">
                    Total Leads:
                    {filteredAssignments.length}
                </div>

                {!qa && (
                    <input
                        type="text"
                        placeholder="Search by phone TL"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        className="mb-2 p-2 border rounded"
                    />
                )}
                {qa && (
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="Search by phone QA"
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && searchPhone.length === 10) {
                                    const result = allAssignmentsValue.find((asg) => asg.userPhone === String(searchPhone));
                                    if (result) setSearchResult(`${result.agentName}`);
                                    else setSearchResult("No results found");
                                }
                            }}
                            className="mb-2 p-2 border rounded"
                        />
                        <div className="mt-2 ml-2">{searchResult && <div>{searchResult}</div>}</div>
                    </div>
                )}
            </div>

            <div className="mb-4 rounded-xl border bg-white px-2 shadow">
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="text-slate-600 text-center">Agent Name</TableCell>
                            <TableCell className="text-slate-600 text-center">Assignments Count</TableCell>
                        </TableRow>
                    </TableBody>
                    <TableBody>
                        {agentStats().map((agent) => (
                            <TableRow key={agent.agentName}>
                                <TableCell className="text-center">{agent.agentName}</TableCell>
                                <TableCell className="text-center">{agent.assignmentsCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {!qa && (
                <div className="mb-4 rounded-xl border bg-white px-2 shadow">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-slate-600 text-center">Phone</TableCell>
                                <TableCell className="text-slate-600 text-center">Email</TableCell>
                                <TableCell className="text-slate-600 text-center">Name</TableCell>
                                <TableCell className="text-slate-600 text-center">Date</TableCell>
                                <TableCell className="text-slate-600 text-left">Status</TableCell>
                                <TableCell className="text-slate-600 text-left">Agent</TableCell>
                                <TableCell className="text-slate-600 text-left">Transfer</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableBody>
                            {filteredAssignments.map((asg) => (
                                <TableRow key={asg.assignmentId}>
                                    <TableCell className="text-center">{asg.userPhone}</TableCell>
                                    <TableCell className="text-center">{asg.userEmail}</TableCell>
                                    <TableCell className="text-center">{asg.userName}</TableCell>
                                    <TableCell className="text-center">{formatDate(asg.assignedAt)}</TableCell>
                                    <TableCell
                                        onClick={() => window.open(`https://cred-db.vercel.app/mv/${asg.userPhone}`)}
                                        className="text-left pointer"
                                    >
                                        {asg.status} &rarr;
                                    </TableCell>

                                    <TableCell className="text-center">{asg.agentName}</TableCell>
                                    <TableCell className="text-left">
                                        <select onChange={(e) => handleTransfer(asg.assignmentId, e.target.value)} defaultValue="">
                                            <option value="" disabled>
                                                Select Agent
                                            </option>
                                            {Array.from(agentsMapValue.entries()).map(([id, name]) => (
                                                <option key={id} value={id}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}
