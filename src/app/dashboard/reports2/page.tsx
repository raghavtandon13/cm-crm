"use client";

import { useMutation } from "@tanstack/react-query";
import { addDays, format, parseISO, subMonths } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import fromAPI from "@/lib/api"; // axios instance
import { cn } from "@/lib/utils";

// Format number with Indian-style commas
function formatNumberIndianStyle(number: number | string) {
    const x = number.toString().split(".");
    let lastThree = x[0].substring(x[0].length - 3);
    const otherNumbers = x[0].substring(0, x[0].length - 3);
    if (otherNumbers !== "") lastThree = "," + lastThree;
    const result = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return x.length > 1 ? result + "." + x[1] : result;
}

// ARD report page: Only runs on button press, not automatically
export default function Reports() {
    const [activeTab, setActiveTab] = useState<"total" | "fresh">("total");
    const [dateRange, setDateRange] = useState<DateRange>({
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(),
    });

    const [result, setResult] = useState<any>(null);
    const ardMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
                endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
                options: undefined,
            };
            if (activeTab === "fresh") payload.options = { fresh: true };
            const response = await fromAPI.post(`/leads/ard`, payload);
            return response.data.data;
        },
        onSuccess: (data) => setResult(data),
    });

    const today = new Date();
    const twoMonthsAgo = subMonths(today, 2);

    const renderLoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-8" />
            ))}
        </div>
    );

    const renderLenderTable = (lenders: any[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Lender</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Deduped</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Rest</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {lenders
                    .sort((a, b) => a.lender.localeCompare(b.lender))
                    .filter((l) => !["creditlinks", "moneyview2", "lendenclub", "ramfin"].includes(l.lender))
                    .map((lender) => (
                        <TableRow key={lender.lender}>
                            <TableCell>{lender.lender}</TableCell>
                            <TableCell>{formatNumberIndianStyle(lender.total)}</TableCell>
                            <TableCell>{formatNumberIndianStyle(lender.Accepted)}</TableCell>
                            <TableCell>{formatNumberIndianStyle(lender.Rejected)}</TableCell>
                            <TableCell>{formatNumberIndianStyle(lender.Deduped)}</TableCell>
                            <TableCell>{formatNumberIndianStyle(lender.Errors)}</TableCell>
                            <TableCell>{formatNumberIndianStyle(lender.Rest)}</TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    );

    // UI states for mutation
    const { isPending, isError, error, data: mutationData } = ardMutation;
    const lenders = result?.lenders ?? [];
    const computedTime = result?.meta?.timestamp ? format(parseISO(result.meta.timestamp), "hh:mm a") : null;

    return (
        <div className="space-y-4 mt-2">
            <div className="flex flex-col gap-2">
                <div className="font-semibold flex gap-4 items-center">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !dateRange.from && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from && dateRange.to
                                    ? `${format(dateRange.from, "yyyy MMM dd")} → ${format(
                                          dateRange.to,
                                          "yyyy MMM dd",
                                      )}`
                                    : "Pick date range"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={(range) =>
                                    setDateRange(range ?? { from: new Date(), to: addDays(new Date(), 1) })
                                }
                                fromDate={twoMonthsAgo}
                                toDate={today}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => ardMutation.mutate()} disabled={isPending} variant="outline">
                        {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        {isPending ? "Running" : "Run"}
                    </Button>

                    {computedTime && !isPending && (
                        <div className="ml-auto pr-4 text-sm text-muted-foreground mt-1">
                            Report fetched at {computedTime}
                        </div>
                    )}
                </div>
            </div>

            {isError && <div className="text-red-500">Failed to load report: {error?.message || "Unknown error"}</div>}

            <Card>
                <CardHeader>
                    <CardTitle>Lender Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "total" | "fresh")}>
                        <div className="flex flex-row items-center">
                            <TabsList>
                                <TabsTrigger value="total">Total</TabsTrigger>
                                <TabsTrigger value="fresh">Fresh</TabsTrigger>
                            </TabsList>
                            {activeTab === "fresh" && (
                                <span className="text-muted-foreground text-sm ml-2">
                                    Total Fresh Leads: {formatNumberIndianStyle(result.options.freshLeadsCount)}
                                </span>
                            )}
                        </div>

                        <TabsContent value="total">
                            {isPending ? (
                                renderLoadingSkeleton()
                            ) : result ? (
                                renderLenderTable(lenders)
                            ) : (
                                <div className="text-muted-foreground">Run the report to see data.</div>
                            )}
                        </TabsContent>
                        <TabsContent value="fresh">
                            {isPending ? (
                                renderLoadingSkeleton()
                            ) : result ? (
                                renderLenderTable(lenders.filter((l: any) => true))
                            ) : (
                                <div className="text-muted-foreground">Run the report to see data.</div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
