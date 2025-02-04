"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../dataTableExpand";
import { ColumnDef } from "@tanstack/react-table";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, startOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { CsvExportModal } from "../exportModal";

export function IncomingLeadsTable() {
    const [page, _] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

    const startDay = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDay = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    const columns: ColumnDef<any>[] = [
        { id: "expander", header: () => null, cell: () => null },
        {
            id: "day",
            header: "Day",
            cell: ({ row }) => {
                if (row.original.day) {
                    return row.original.day;
                }
                return null;
            },
        },
        {
            id: "month",
            header: "Month",
            cell: ({ row }) => {
                if (row.original.month) {
                    return row.original.month;
                }
                return null;
            },
        },
        {
            id: "totalLeads",
            header: "Total Leads",
            cell: ({ row }) => {
                const cellValue = row.original.count || row.original.total || row.original.overallTotal;
                const location = {
                    dates: date,
                    day: row.original.day || null,
                    month: row.original.month || null,
                    partner: row.original.partner || null,
                    overall: !!row.original.overallTotal,
                };
                if (!cellValue) return null;
                const handleClick = () => setShowModal(true);
                return (
                    <>
                        <div className="cursor-pointer text-blue-500 hover:underline" onClick={handleClick}>
                            {cellValue.toLocaleString()}
                        </div>
                        {showModal && <CsvExportModal cellValue={cellValue} location={location} usage="incoming" onClose={() => {}} />}
                    </>
                );
            },
        },
        {
            id: "partner",
            header: "Partner",
            cell: ({ row }) => {
                if (row.original.partner) {
                    return <div className="font-medium">{row.original.partner}</div>;
                }
                if (!row.original.overallTotal) {
                    return null;
                }
                return "All Partners";
            },
        },
    ];

    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["users", { page }],
        queryFn: async () => {
            const response = await fromAPI.post(`/leads/incoming`, {
                startDay,
                endDay,
            });
            return response.data;
        },
    });

    if (isPending) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
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

    const transformedData = [
        {
            overallTotal: data[0].overallTotal,
            partnerData: data[0].partnerData,
        },
    ];

    return (
        <div className="space-y-4 flex flex-col">
            <h1 className={cn(buttonVariants({ variant: "card" }), "font-semibold")}>Incoming Lead Count &#8628;</h1>

            <div className={cn(buttonVariants({ variant: "card" }), "font-semibold flex gap-4 items-center")}>
                {/* Date selector */}
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
                        "Run"
                    )}
                </Button>
            </div>
            <DataTable columns={columns} data={transformedData} name="incomingLeads" />
        </div>
    );
}
