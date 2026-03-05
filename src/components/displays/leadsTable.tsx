"use client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import fromAPI from "@/lib/api";
import { cn } from "@/lib/utils";

// export const fetchcache = 'force-no-store';
export function LeadsTable() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });
    const [partner, setPartner] = useState("");
    const [name, setName] = useState("");

    // Format dates in YYYY-MM-DD format for API
    const startDay = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDay = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const [period, setPeriod] = useState("daily");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["leads", { startDay, endDay, period, partner, name }],
        queryFn: async () => {
            const response = await fromAPI.post(`/leads/perday`, {
                startDay,
                endDay,
                period,
                filters: {
                    partner: partner,
                    "accounts.name": name,
                },
            });
            return response.data;
        },
        enabled: Boolean(startDay && endDay),
    });

    return (
        <div className="space-y-4 flex flex-col">
            <h1 className={cn(buttonVariants({ variant: "card" }), "font-semibold")}>Sent Lead Count &#8628;</h1>

            <div className={cn(buttonVariants({ variant: "card" }), "font-semibold flex gap-4 items-center")}>
                {/* Date selector */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")} id="date" variant="outline">
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
                    <PopoverContent align="start" className="w-auto p-0">
                        <Calendar defaultMonth={date?.from} initialFocus mode="range" numberOfMonths={2} onSelect={setDate} selected={date} />
                    </PopoverContent>
                </Popover>

                {/* Partner selector */}
                <Select onValueChange={setPartner} value={partner}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Partner" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MoneyTap">MoneyTap</SelectItem>
                        <SelectItem value="Zype_LS">Zype_LS</SelectItem>
                    </SelectContent>
                </Select>

                {/* Name (Lender) selector */}
                <Select onValueChange={setName} value={name}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Lender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Fibe">Fibe</SelectItem>
                        <SelectItem value="Cashe">Cashe</SelectItem>
                        <SelectItem value="SmartCoin">SmartCoin</SelectItem>
                    </SelectContent>
                </Select>

                {/* Period selector */}
                <Select onValueChange={setPeriod} value={period}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isError ? (
                <div className="text-red-500 p-4">Error loading data. Please try again.</div>
            ) : isLoading ? (
                <div className="text-center py-4">Loading...</div>
            ) : data ? (
                <Table>
                    <TableBody>
                        {data.map((item: any, index: any) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.date}</TableCell>
                                <TableCell className="text-right">{item.totalAccounts.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : null}
        </div>
    );
}
