"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, eachDayOfInterval } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useUser } from "@/context/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function UserAttendance() {
    const user = useUser();
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [leaveDate, setLeaveDate] = useState<DateRange | undefined>();
    const [leaveReason, setLeaveReason] = useState("");

    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["attendance", startDate, endDate],
        queryFn: async () => {
            const response = await fromAPI.get(
                `/agents/attendance?startDate=${startDate}&endDate=${endDate}&agentid=${user?.id}`,
            );
            return response.data.data; // Access the `data` array directly
        },
    });

    const {
        data: leaveData,
        isError: isLeaveError,
        isPending: isLeavePending,
        refetch: refetchLeave,
    } = useQuery({
        queryKey: ["leaveRequests"],
        queryFn: async () => {
            const response = await fromAPI.get(`/agents/attendance/leave-requests?agentid=${user?.id}`);
            return response.data.data; // Access the `data` array directly
        },
    });

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            await fromAPI.post("/agents/attendance/leave-requests", payload);
        },
        onSuccess: () => {
            setDialogOpen(false);
            setLeaveDate(undefined);
            setLeaveReason("");
            refetch();
            refetchLeave();
        },
    });

    const submitLeaveRequest = () => {
        if (!leaveDate || !leaveReason) return;

        const leaveStartDate = leaveDate.from ? format(leaveDate.from, "yyyy-MM-dd") : "";
        const leaveEndDate = leaveDate.to ? format(leaveDate.to, "yyyy-MM-dd") : leaveStartDate;

        mutation.mutate({
            agentid: user?.id,
            startDate: leaveStartDate,
            endDate: leaveEndDate,
            reason: leaveReason,
        });
    };

    if (isPending || isLeavePending) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                <small>Fetching data...</small>
            </div>
        );
    }

    if (isError || isLeaveError) {
        return (
            <div className="flex items-center justify-center h-96">
                Error loading data.{" "}
                <button
                    onClick={() => {
                        refetch();
                        refetchLeave();
                    }}
                    className="ml-2 text-blue-500 hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    const dates = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
    }).map((date) => format(date, "yyyy-MM-dd"));

    const filteredData = data.filter((agent: any) => Object.keys(agent.attendance || {}).length >= 0);

    const formattedData = filteredData.map((agent: any) => {
        const attendance = dates.reduce((acc: any, date) => {
            acc[date] = agent.attendance[date] || ""; // Leave empty if no data
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
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("date")}</div>,
        },
        {
            accessorKey: "attendance",
            header: "Attendance",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("attendance")}</div>,
        },
    ];

    const verticalData = dates.map((date) => {
        const attendance = formattedData[0]?.[date] || "";
        return {
            date,
            attendance,
        };
    });

    const leaveColumns: ColumnDef<any>[] = [
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => (
                <div className="min-w-[100px] text-left">
                    {format(new Date(row.getValue("startDate")), "yyyy-MM-dd")}
                </div>
            ),
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => (
                <div className="min-w-[100px] text-left">{format(new Date(row.getValue("endDate")), "yyyy-MM-dd")}</div>
            ),
        },
        {
            accessorKey: "reason",
            header: "Reason",
            cell: ({ row }) => <div className="min-w-[200px] text-left">{row.getValue("reason")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <div className="min-w-[200px] text-left">{row.getValue("status")}</div>,
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
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                    Ask for leave
                </Button>
            </div>
            {verticalData.length > 0 ? (
                <DataTable columns={columns} data={verticalData} name="attendanceData" />
            ) : (
                <div className="text-center mt-8">No attendance data available for the selected date range.</div>
            )}
            <div className="mt-8">
                <h2 className="font-semibold mb-2">Leave Requests</h2>
                {leaveData.length > 0 ? (
                    <DataTable columns={leaveColumns} data={leaveData} name="leaveRequestsData" />
                ) : (
                    <div className="text-center mt-8">No leave requests available.</div>
                )}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="min-w-max">
                    <DialogHeader>
                        <DialogTitle>Request Leave</DialogTitle>
                    </DialogHeader>
                    <Calendar mode="range" selected={leaveDate} onSelect={setLeaveDate} numberOfMonths={2} />
                    <Textarea
                        placeholder="Reason for leave"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="mt-4"
                    />
                    <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={submitLeaveRequest} disabled={!leaveDate || !leaveReason}>
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
