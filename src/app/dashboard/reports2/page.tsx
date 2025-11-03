"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, subMonths } from "date-fns";

const fakeApiFetch = (): Promise<{
    total: any[];
    fresh: any[];
    partnerHistory: any[];
    meta: { computedAt: string; date: string };
}> =>
    new Promise((res) =>
        setTimeout(() => {
            res({
                partnerHistory: [
                    { partner: "moneytap", total: 10252, new: 1252, deduped: 8458 },
                    { partner: "zype", total: 12252, new: 1452, deduped: 1458 },
                ],
                total: [
                    {
                        lender: "zype",
                        total: 111305,
                        Accepted: 5310,
                        Rejected: 1302,
                        Deduped: 104691,
                        Errors: 0,
                        Rest: 2,
                        aipEligible: null,
                    },
                    {
                        lender: "moneyview",
                        total: 31669,
                        Accepted: 5177,
                        Rejected: 8948,
                        Deduped: 16730,
                        Errors: 761,
                        Rest: 53,
                        aipEligible: null,
                    },
                    {
                        lender: "creditlinks",
                        total: 30922,
                        Accepted: 2599,
                        Rejected: 28007,
                        Deduped: 316,
                        Errors: 0,
                        Rest: 0,
                        aipEligible: null,
                    },
                    {
                        lender: "mpocket",
                        total: 33080,
                        Accepted: 395,
                        Rejected: 32685,
                        Deduped: 0,
                        Errors: 0,
                        Rest: 0,
                        aipEligible: null,
                    },
                ],
                fresh: [
                    {
                        lender: "zype",
                        total: 111000,
                        Accepted: 5000,
                        Rejected: 1200,
                        Deduped: 104000,
                        Errors: 0,
                        Rest: 2,
                        aipEligible: 100,
                    },
                    {
                        lender: "moneyview",
                        total: 31000,
                        Accepted: 5000,
                        Rejected: 8900,
                        Deduped: 16000,
                        Errors: 700,
                        Rest: 50,
                        aipEligible: 200,
                    },
                    {
                        lender: "creditlinks",
                        total: 30000,
                        Accepted: 2500,
                        Rejected: 27000,
                        Deduped: 300,
                        Errors: 0,
                        Rest: 0,
                        aipEligible: 150,
                    },
                    {
                        lender: "mpocket",
                        total: 32000,
                        Accepted: 350,
                        Rejected: 31500,
                        Deduped: 0,
                        Errors: 0,
                        Rest: 0,
                        aipEligible: 80,
                    },
                ],
                meta: {
                    computedAt: "2025-07-24T11:00:00.000Z",
                    date: "2025-07-24T00:00:00.000Z",
                },
            });
        }, 1500),
    );

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [partnerHistory, setPartnerHistory] = useState<any[]>([]);
    const [totalData, setTotalData] = useState<any[]>([]);
    const [freshData, setFreshData] = useState<any[]>([]);
    const [meta, setMeta] = useState<{ computedAt: string; date: string } | null>(null);
    const [activeTab, setActiveTab] = useState("total");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(new Date().setDate(new Date().getDate() - 1)),
    );

    useEffect(() => {
        fakeApiFetch().then((res) => {
            setPartnerHistory(res.partnerHistory);
            setTotalData(res.total);
            setFreshData(res.fresh);
            setMeta(res.meta);
            setLoading(false);
        });
    }, []);

    const renderLoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-8" />
            ))}
        </div>
    );

    const renderPartnerHistoryTable = () => {
        const totalNew = partnerHistory.reduce((sum, p) => sum + p.new, 0);
        const totalDeduped = partnerHistory.reduce((sum, p) => sum + p.deduped, 0);
        const totalTotal = partnerHistory.reduce((sum, p) => sum + p.total, 0);

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>New</TableHead>
                        <TableHead>Deduped</TableHead>
                        <TableHead>Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {partnerHistory.map((p) => (
                        <TableRow key={p.partner}>
                            <TableCell>{p.partner}</TableCell>
                            <TableCell>{p.new}</TableCell>
                            <TableCell>{p.deduped}</TableCell>
                            <TableCell>{p.total}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="font-semibold border-t">
                        <TableCell>Total</TableCell>
                        <TableCell>{totalNew}</TableCell>
                        <TableCell>{totalDeduped}</TableCell>
                        <TableCell>{totalTotal}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        );
    };

    const renderLenderTable = (data: any[]) => (
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
                    <TableHead>AIP Eligible</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((lender) => (
                    <TableRow key={lender.lender}>
                        <TableCell>{lender.lender}</TableCell>
                        <TableCell>{lender.total}</TableCell>
                        <TableCell>{lender.Accepted}</TableCell>
                        <TableCell>{lender.Rejected}</TableCell>
                        <TableCell>{lender.Deduped}</TableCell>
                        <TableCell>{lender.Errors}</TableCell>
                        <TableCell>{lender.Rest}</TableCell>
                        <TableCell>{lender.aipEligible ?? "—"}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const computedTime = meta?.computedAt ? format(parseISO(meta.computedAt), "hh:mm a") : null;
    const today = new Date();
    const twoMonthsAgo = subMonths(today, 2);

    return (
        <div className="space-y-4 mt-2">
            <div className="flex flex-col gap-2">
                <div className="font-semibold flex gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "yyyy MMM dd") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                fromDate={twoMonthsAgo}
                                toDate={today}
                                selected={selectedDate}
                                onSelect={(d) => setSelectedDate(d ?? undefined)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {computedTime && <div className="text-muted-foreground mt-2">Report fetched at {computedTime}</div>}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Incoming Counts (Partner Data)</CardTitle>
                </CardHeader>
                <CardContent>{loading ? renderLoadingSkeleton() : renderPartnerHistoryTable()}</CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lender Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-row items-center">
                            <TabsList>
                                <TabsTrigger value="total">Total</TabsTrigger>
                                <TabsTrigger value="fresh">Fresh</TabsTrigger>
                            </TabsList>
                            {activeTab === "fresh" && (
                                <span className="text-muted-foreground text-sm ml-2">
                                    Total Fresh Leads:{" "}
                                    {freshData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                                </span>
                            )}
                        </div>

                        <TabsContent value="total">
                            {loading ? renderLoadingSkeleton() : renderLenderTable(totalData)}
                        </TabsContent>
                        <TabsContent value="fresh">
                            {loading ? renderLoadingSkeleton() : renderLenderTable(freshData)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
