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
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

export default function Overview() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(),
    });

    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    const { data, isFetching } = useQuery({
        queryKey: ["attendance", startDate, endDate],
        queryFn: async () => {
            const response = await fromAPI.get(
                `/agents/attendance?startDate=${startDate}&endDate=${endDate}&overview=true`,
            );
            return response.data.data;
        },
    });

    // Dynamically generate columns from keys
    const summaryColumns: ColumnDef<any>[] = useMemo(() => {
        if (!data || data.length === 0) return [];

        const sample = data[0];
        const ignoreKeys = new Set(["agentId", "active", "WEEK OFF", "HOLIDAY"]);
        const keys = Object.keys(sample).filter((key) => !ignoreKeys.has(key));

        return keys.map((key) => ({
            accessorKey: key,
            header: key === "agentName" ? "Agent Name" : key,
            cell: ({ row }: any) => <div className="min-w-[80px] text-left">{row.getValue(key)}</div>,
        }));
    }, [data]);

    function getSummaryRow(data: any[]) {
        if (!data || data.length === 0) return {};

        const ignoreKeys = new Set(["agentId", "active", "agentName", "WEEK OFF", "HOLIDAY"]);

        const totals: any = { agentName: "Total" };

        for (const agent of data) {
            for (const key in agent) {
                if (ignoreKeys.has(key)) continue;

                const value = Number(agent[key]);
                if (!isNaN(value)) {
                    totals[key] = (totals[key] || 0) + value;
                }
            }
        }

        return totals;
    }

    return (
        <>
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
            </div>

            {isFetching ? (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    <p className="ml-4">Fetching agent attendance data...</p>
                </div>
            ) : (
                <DataTable
                    columns={summaryColumns}
                    data={[...data, getSummaryRow(data)]}
                    name="attendanceSummaryTable"
                />
            )}
        </>
    );
}
