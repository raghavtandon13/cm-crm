"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { format, eachDayOfInterval } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function Attendance() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(),
    });
    const [dialogData, setDialogData] = useState<any>({ open: false, agentid: "", date: "", atype: "", comment: "" });

    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["attendance", startDate, endDate],
        queryFn: async () => {
            const response = await fromAPI.get(
                `/agents/attendance?startDate=${startDate}&endDate=${endDate}&full=true`,
            );
            return response.data.data;
        },
    });

    const leaveRequestsQuery = useQuery({
        queryKey: ["leaveRequests"],
        queryFn: async () => {
            const response = await fromAPI.get(`/agents/attendance/leave-requests/view/`);
            return response.data.data; // Access the `data` array directly
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            await fromAPI.post("/agents/attendance/", payload);
        },
        onSuccess: () => {
            setDialogData({ open: false });
            refetch();
        },
    });

    const leaveRequestMutation = useMutation({
        mutationFn: async (payload: any) => {
            await fromAPI.post("/agents/attendance/leave-requests/view/", payload);
        },
        onSuccess: () => {
            leaveRequestsQuery.refetch();
        },
    });

    const openDialog = (agentid: string, date: string, currentType: string = "") => {
        setDialogData({
            open: true,
            agentid,
            date,
            atype: currentType,
            comment: "",
        });
    };

    const closeDialog = () => setDialogData({ open: false });

    const saveAttendance = () => {
        mutation.mutate({
            agentid: dialogData.agentid, // Corrected
            date: dialogData.date,
            atype: dialogData.atype,
            comment: dialogData.comment,
        });
    };

    const handleLeaveRequestDecision = (leaveReqId: string, decision: string) => {
        leaveRequestMutation.mutate({
            leaveReqId,
            decision,
        });
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                <p className="ml-4">Fetching leave requests...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-96">
                Error loading data.{" "}
                <button onClick={() => refetch()} className="ml-2 text-blue-500 hover:underline">
                    Retry
                </button>
            </div>
        );
    }

    const dates = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
    }).map((date) => format(date, "yyyy-MM-dd"));

    const filteredData = data.filter(
        (agent: any) => agent.active === true && Object.keys(agent.attendance || {}).length >= 0,
    );

    const formattedData = filteredData.map((agent: any) => {
        const attendance = dates.reduce((acc: any, date) => {
            acc[date] = agent.attendance[date] || "";
            return acc;
        }, {});

        return {
            agentid: agent.agentid,
            agentName: agent.agentName,
            ...attendance,
        };
    });

    const columns: ColumnDef<(typeof formattedData)[0]>[] = [
        {
            accessorKey: "agentName",
            header: "Agent Name",

            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("agentName")}</div>,
        },
        ...dates.map((date) => ({
            accessorKey: date,
            header: () => <div className="min-w-[100px] text-center">{date}</div>,
            cell: ({ row }) => {
                const agentid = row.original.agentid;
                const currentType = row.getValue(date) || "";
                const comment = row.original.comments?.[date] || ""; // Fetch comment for the date

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className={cn({
                                "bg-red-100 text-red-500 border-red-500": currentType === "ABSENT",
                                "bg-orange-100 text-orange-500 border-orange-500": currentType === "UPL",
                                "bg-yellow-100 text-yellow-500 border-yellow-500": currentType === "WEEK_OFF",
                                "bg-gray-100 text-gray-500 border-gray-500": currentType === "HALF_DAY",
                            })}
                            size="sm"
                            onClick={() => openDialog(agentid, date, currentType)}
                        >
                            {currentType || "+"}
                        </Button>
                        {comment && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    setDialogData({
                                        open: true,
                                        agentid,
                                        date,
                                        atype: currentType,
                                        comment,
                                    })
                                }
                                title="View Comment"
                            >
                                💬
                            </Button>
                        )}
                    </div>
                );
            },
        })),
    ];

    const leaveRequestColumns: ColumnDef<any>[] = [
        {
            accessorKey: "agentName",
            header: "Agent Name",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("agentName")}</div>,
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("reason")}</div>,
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => {
                const startDate = String(row.getValue("startDate")).split("T")[0];
                return <div className="min-w-[100px] text-left">{startDate}</div>;
            },
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => {
                const startDate = String(row.getValue("startDate")).split("T")[0];
                const endDate = String(row.getValue("endDate")).split("T")[0];
                return <div className="min-w-[100px] text-left">{startDate === endDate ? "" : endDate}</div>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("status")}</div>,
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const leaveReqId = row.original.id;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveRequestDecision(leaveReqId, "APPROVED")}
                            disabled={row.original.status !== "PENDING"}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveRequestDecision(leaveReqId, "REJECTED")}
                            disabled={row.original.status !== "PENDING"}
                        >
                            Reject
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="my-2 ">
            <div className="font-semibold flex gap-4 mb-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant="outline"
                            className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                            )}
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
                <Link
                    className={cn(buttonVariants({ variant: "card" }), "font-semibold mb-1")}
                    href="/dashboard/attendance/overview"
                >
                    Overview -{">"}{" "}
                </Link>
            </div>
            {formattedData.length > 0 ? (
                <DataTable columns={columns} data={formattedData} name="attendanceData" />
            ) : (
                <div className="text-center mt-8">No attendance data available for the selected date range.</div>
            )}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>
                {leaveRequestsQuery.isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                        <p className="ml-4">Fetching leave requests...</p>
                    </div>
                ) : leaveRequestsQuery.isError ? (
                    <div className="flex items-center justify-center h-96">
                        Error loading leave requests.{" "}
                        <button
                            onClick={() => leaveRequestsQuery.refetch()}
                            className="ml-2 text-blue-500 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : leaveRequestsQuery.data.length > 0 ? (
                    <DataTable columns={leaveRequestColumns} data={leaveRequestsQuery.data} name="leaveRequestsData" />
                ) : (
                    <div className="text-center mt-8">No leave requests available.</div>
                )}
            </div>
            <Dialog open={dialogData.open} onOpenChange={closeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Attendance: {dialogData.date}</DialogTitle>
                    </DialogHeader>
                    <Select
                        onValueChange={(value) => setDialogData((prev: any) => ({ ...prev, atype: value }))}
                        defaultValue={dialogData.atype || ""}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Attendance Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ABSENT">Absent</SelectItem>
                            <SelectItem value="PRESENT">Present</SelectItem>
                            <SelectItem value="WEEK_OFF">Week Off</SelectItem>
                            <SelectItem value="WORK_FROM_HOME">Work From Home</SelectItem>
                            <SelectItem value="UPL">UPL</SelectItem>
                            <SelectItem value="HOLIDAY">Holiday</SelectItem>
                            <SelectItem value="LEAVE">Leave</SelectItem>
                            <SelectItem value="HALF_DAY">Half Day</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea
                        placeholder="Optional Comment"
                        value={dialogData.comment}
                        onChange={(e) => setDialogData((prev: any) => ({ ...prev, comment: e.target.value }))}
                        className="mt-4"
                    />
                    <DialogFooter>
                        <Button onClick={closeDialog} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={saveAttendance} disabled={!dialogData.atype}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
