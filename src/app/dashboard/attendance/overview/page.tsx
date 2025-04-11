"use client";

import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function Overview() {
    // States and dates
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(),
    });
    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    // query to fetch attendance data
    const { data, isFetching } = useQuery({
        queryKey: ["attendance", startDate, endDate],
        queryFn: async () => {
            const response = await fromAPI.get(`/agents/attendance?startDate=${startDate}&endDate=${endDate}&full=true`);
            return response.data.data;
        },
    });

    // remove inactive agents and transform data
    function transformData(data: any) {
        const activeAgents = data.filter((agent: any) => agent.active === true);
        const attendanceSummary = activeAgents.reduce((summary: any, agent: any) => {
            Object.values(agent.attendance).forEach((status: string) => {
                if (!summary[status]) summary[status] = 0;
                summary[status]++;
            });
            return summary;
        }, {});
        return Object.entries(attendanceSummary).map(([status, count]) => ({ status: status.replace(/_/g, " "), count }));
    }

    // Define columns for attendance data table
    const summaryColumns: ColumnDef<any>[] = [
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("status")}</div>,
        },
        {
            accessorKey: "count",
            header: "Count",
            cell: ({ row }) => <div className="min-w-[100px] text-left">{row.getValue("count")}</div>,
        },
    ];

    return (
        <>
            {/* Header */}
            <div className="font-semibold flex gap-4 mb-2">
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
            </div>
            {/* Table */}
            {isFetching ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    <p className="ml-4">Fetching agent attendance data...</p>
                </div>
            ) : (
                <>
                    <DataTable columns={summaryColumns} data={transformData(data)} name="leaveRequestsData" />
                </>
            )}
        </>
    );
}
