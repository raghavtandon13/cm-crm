"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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

interface Assignment {
    assignmentId: string;
    userPhone: string;
    userEmail: string;
    userName: string;
    assignedAt: string;
    status: string;
    subStatus: string;
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

    const [searchPhone, setSearchPhone] = useState("");
    const [searchResult, setSearchResult] = useState("");
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() + 1)),
    });
    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    const queryClient = useQueryClient();
    const {
        data: agentsData,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["assignments"],
        queryFn: async () => {
            const response = await fromAPI.get(`/agents/tl_assignments?start=${startDate}&end=${endDate}`);
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

    const deleteMutation = useMutation({
        mutationFn: async ({ assignmentId }: { assignmentId: string }) => {
            await fromAPI.post("/agents/assignments/delete", { assignmentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"], exact: true });
            toast.success("Assignment deleted successfully");
            refetch();
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ assignmentId, status, subStatus }: { assignmentId: string; status: string; subStatus: string }) => {
            await fromAPI.post("/agents/assignments/change", {
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

    const handleStatusChangeLocal = (e: React.ChangeEvent<HTMLSelectElement>, type: "status" | "subStatus", lead: Assignment) => {
        const value = e.target.value;
        if (type === "status") {
            statusMutation.mutate({ assignmentId: lead.assignmentId, status: value, subStatus: lead.subStatus });
        } else {
            statusMutation.mutate({ assignmentId: lead.assignmentId, status: lead.status, subStatus: value });
        }
    };

    const handleTransfer = (assignmentId: string, newAgentId: string) => transferMutation.mutate({ assignmentId, newAgentId });
    const handleDelete = (assignmentId: string) => deleteMutation.mutate({ assignmentId });

    const agentsMapValue = agentsMap();
    const allAssignmentsValue = allAssignments();

    const filteredAssignments = allAssignmentsValue.filter((asg) => asg.userPhone.includes(searchPhone));
    return (
        <>
            <div className="mb-4 w-full flex items-center justify-between">
                <div className="font-semibold flex gap-4 mb-2 items-center">
                    <div className="w-[150px]">
                        Total Leads:
                        {filteredAssignments.length}
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "yyyy-MM-dd")} - {format(date.to, "yyyy-MM-dd")}
                                        </>
                                    ) : (
                                        format(date.from, "yyyy-MM-dd")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => refetch()} variant="outline">
                        {isFetching ? (
                            <div className="animate-spin h-4 w-4 border-2 border-black-500 rounded-full border-t-transparent"></div>
                        ) : (
                            <Search className="w-4" />
                        )}
                    </Button>
                </div>
                {!qa && (
                    <Input
                        type="text"
                        placeholder="Search by phone TL"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        className="mb-2 p-2 border rounded"
                    />
                )}
                {qa && (
                    <div className="flex">
                        <Input
                            className="w-4 bg-white"
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
                            // className="mb-2 p-2 border rounded"
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
                                {/* <TableCell className="text-slate-600 text-center">Email</TableCell> */}
                                <TableCell className="text-slate-600 text-left">Name</TableCell>
                                <TableCell className="text-slate-600 text-center">Date</TableCell>
                                <TableCell className="text-slate-600 text-left">Status</TableCell>
                                <TableCell className="text-slate-600 text-left">SubStatus</TableCell>
                                <TableCell className="text-slate-600 text-right">Agent</TableCell>
                                <TableCell className="text-slate-600 text-left">Transfer</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableBody>
                            {filteredAssignments.map((asg) => (
                                <TableRow key={asg.assignmentId}>
                                    <TableCell className="text-center border-r border-gray-200">{asg.userPhone}</TableCell>
                                    {/* <TableCell className="text-center">{asg.userEmail}</TableCell> */}
                                    <TableCell className="text-left border-r border-gray-200">{asg.userName}</TableCell>
                                    <TableCell className="text-left border-r border-gray-200">{formatDate(asg.assignedAt)}</TableCell>
                                    <TableCell className="text-left border-r border-gray-200 pointer">
                                        <select onChange={(e) => handleStatusChangeLocal(e, "status", asg)} defaultValue={asg.status}>
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
                                    <TableCell className="text-left border-r border-gray-200 pointer">
                                        <select onChange={(e) => handleStatusChangeLocal(e, "subStatus", asg)} defaultValue={asg.subStatus}>
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
                                    <TableCell className="text-right border-r border-gray-200">{asg.agentName}</TableCell>
                                    <TableCell className="text-left border-r border-gray-200">
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
                                    <TableCell className="text-left" onClick={() => handleDelete(asg.assignmentId)}>
                                        <Button variant="ghost">
                                            <Trash2 strokeWidth={1} className="w-4" />
                                        </Button>
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
