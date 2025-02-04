"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../dataTable";
import { ColumnDef } from "@tanstack/react-table";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { format, startOfMonth } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { CsvExportModal } from "../exportModal";

export type LenderData = {
    lender: string | null;
    counts: {
        status: string;
        count: number;
    }[];
};

export function StatsTable() {
    const [date, setDate] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: new Date() });
    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const [modalData, setModalData] = useState<{ cellValue: number; location: any } | null>(null);

    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            const response = await fromAPI.post(`/leads/stats`, {
                startDate,
                endDate,
            });
            return response.data;
        },
    });

    const formattedData = data
        ? data
              .map(({ lender, counts }) => {
                  const statusMap = { Accepted: 0, Rejected: 0, Deduped: 0, Rest: 0 };
                  counts.forEach(({ status, count }) => (statusMap[status] = count));
                  return { lender: lender || "N/A", ...statusMap };
              })
              .filter(({ Accepted, Rejected, Deduped }) => Accepted !== 0 || Rejected !== 0 || Deduped !== 0)
        : [];

    const columns: ColumnDef<(typeof formattedData)[0]>[] = [
        {
            accessorKey: "lender",
            header: () => <div className="w-36 text-left">Lenders</div>,
            cell: ({ row }) => <div className="text-left">{row.getValue("lender")}</div>,
        },
        {
            accessorKey: "Accepted",
            header: () => <div className="text-left">Accepted</div>,
            cell: ({ row }) => {
                const cellValue = row.original["Accepted"];
                const location = {
                    dates: date,
                    lender: row.original.lender,
                    type: "Accepted",
                };
                if (!cellValue) return null;
                const handleClick = () => {
                    setModalData({ cellValue, location });
                };
                return (
                    <div className="cursor-pointer text-blue-500 hover:underline" onClick={handleClick}>
                        {cellValue.toLocaleString()}
                    </div>
                );
            },
        },
        {
            accessorKey: "Rejected",
            header: () => <div className="text-left">Rejected</div>,
            cell: ({ row }) => <div className="text-left">{row.getValue("Rejected")}</div>,
        },
        {
            accessorKey: "Deduped",
            header: () => <div className="text-left">Deduped</div>,
            cell: ({ row }) => <div className="text-left">{row.getValue("Deduped")}</div>,
        },
    ];

    return (
        <>
            <div className="my-2">
                <h1 className={cn(buttonVariants({ variant: "card" }), "font-semibold w-full mb-1")}>
                    Accepted Rejected Dedupe Lender Stats &#8628;
                </h1>
                <div className="font-semibold flex gap-4 ">
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
                {isPending ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                        <small>This process may take up to 5 minutes.</small>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-96">
                        Error loading data.{" "}
                        <button onClick={() => refetch()} className="ml-2 text-blue-500 hover:underline">
                            Retry
                        </button>
                    </div>
                ) : (
                    <DataTable columns={columns} data={formattedData} name="lenderARER" />
                )}
            </div>
            {modalData && (
                <CsvExportModal
                    usage="statsTable"
                    cellValue={modalData.cellValue}
                    location={modalData.location}
                    onClose={() => {
                        setModalData(null);
                    }}
                />
            )}
        </>
    );
}
