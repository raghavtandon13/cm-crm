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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type LenderData = {
    lender: string | null;
    partnerStatuses: {
        partnerStatus: string;
        counts: { status: string; count: number; dates: Record<string, number> }[];
    }[];
};

export function StatsDaywiseTable() {
    const [date, setDate] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: new Date() });
    const [aggregationType, setAggregationType] = useState<"total" | "manual">("total");
    const [partnerStatusFilter, setPartnerStatusFilter] = useState<"new" | "dedupe" | "all">("all");
    const [manualStartDate, setManualStartDate] = useState<Date | undefined>(undefined);
    const [manualEndDate, setManualEndDate] = useState<Date | undefined>(undefined);
    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const [modalData, setModalData] = useState<{ cellValue: number; location: any } | null>(null);

    const { data, isError, isPending, refetch, isFetching } = useQuery({
        queryKey: ["stats", startDate, endDate],
        queryFn: async () => {
            const response = await fromAPI.post(`/leads/stats/daywise`, { startDate, endDate });
            return response.data;
        },
    });

    const filterData = (data: LenderData[], partnerStatus: "new" | "dedupe" | "all") => {
        if (partnerStatus === "all") return data;
        return data.map((lenderData) => ({
            ...lenderData,
            partnerStatuses: lenderData.partnerStatuses.filter((ps) => ps.partnerStatus === partnerStatus),
        }));
    };

    const aggregateData = (data: LenderData[], type: "total" | "manual") => {
        if (type === "total") {
            return data.map((lenderData) => {
                const statusMap: any = { Accepted: 0, Rejected: 0, Deduped: 0, Rest: 0 };
                lenderData.partnerStatuses.forEach((ps) => {
                    ps.counts.forEach(({ status, count }) => {
                        statusMap[status] += count;
                    });
                });
                return { lender: lenderData.lender || "N/A", ...statusMap };
            });
        } else if (type === "manual" && manualStartDate && manualEndDate) {
            return data.map((lenderData) => {
                const manualCounts: Record<
                    string,
                    { Accepted: number; Rejected: number; Deduped: number; Rest: number }
                > = {};
                lenderData.partnerStatuses.forEach((ps) => {
                    ps.counts.forEach(({ status, dates }) => {
                        const s = status as "Accepted" | "Rejected" | "Deduped" | "Rest";
                        Object.entries(dates).forEach(([date, count]) => {
                            const currentDate = new Date(date);
                            if (currentDate >= manualStartDate && currentDate <= manualEndDate) {
                                if (!manualCounts[date]) {
                                    manualCounts[date] = { Accepted: 0, Rejected: 0, Deduped: 0, Rest: 0 };
                                }
                                manualCounts[date][s] += count;
                            }
                        });
                    });
                });
                const totalCounts = { Accepted: 0, Rejected: 0, Deduped: 0, Rest: 0 };
                Object.values(manualCounts).forEach((counts) => {
                    totalCounts.Accepted += counts.Accepted;
                    totalCounts.Rejected += counts.Rejected;
                    totalCounts.Deduped += counts.Deduped;
                    totalCounts.Rest += counts.Rest;
                });
                return { lender: lenderData.lender || "N/A", ...totalCounts };
            });
        }
        return [];
    };

    const filteredData = data ? filterData(data, partnerStatusFilter) : [];
    const formattedData = filteredData ? aggregateData(filteredData, aggregationType) : [];

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
                    DAYWISE DEMO !!! Accepted Rejected Dedupe Lender Stats &#8628;
                </h1>
                <div className="font-semibold flex gap-4 ">
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
                    <Select
                        onValueChange={(value) => setAggregationType(value as "total" | "manual")}
                        defaultValue="total"
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Select aggregation type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="total">Total</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                    </Select>
                    {aggregationType === "manual" && (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="manualDateRange"
                                        variant="outline"
                                        className={cn(
                                            "w-[300px] justify-start text-left font-normal",
                                            !manualStartDate && !manualEndDate && "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {manualStartDate && manualEndDate ? (
                                            <>
                                                {format(manualStartDate, "yyyy-MM-dd")} -{" "}
                                                {format(manualEndDate, "yyyy-MM-dd")}
                                            </>
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={manualStartDate}
                                        selected={{ from: manualStartDate, to: manualEndDate }}
                                        onSelect={(range) => {
                                            setManualStartDate(range?.from);
                                            setManualEndDate(range?.to);
                                        }}
                                        disabled={(date) => date < new Date(startDate) || date > new Date(endDate)}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </>
                    )}
                    <Select
                        onValueChange={(value) => setPartnerStatusFilter(value as "new" | "dedupe" | "all")}
                        defaultValue="all"
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Select partner status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Partner All</SelectItem>
                            <SelectItem value="new">Partner New</SelectItem>
                            <SelectItem value="dedupe">Partner Dedupe</SelectItem>
                        </SelectContent>
                    </Select>
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
