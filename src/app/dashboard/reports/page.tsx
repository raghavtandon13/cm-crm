"use client";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
// import { Table1 } from "@/components/displays/table1";
import { chartData } from "@/lib/good";
import { UsersTable } from "@/components/displays/usersTable";
// import MonthlyLenders from "@/components/monthlyLenders";
import { LeadsTable } from "@/components/displays/leadsTable";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LenderCharts } from "@/components/displays/lenderChart";
// import { RealtimeStats } from "@/components/realtime";

const chartConfig = {
    views: { label: "Leads Pushed" },
    count: { label: "Count", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export default function Reports() {
    const total = useMemo(() => ({ count: chartData.reduce((acc, curr) => acc + curr.count, 0) }), []);
    const formatted = new Intl.NumberFormat("en-IN").format(total.count);

    return (
        <>
            {/* <RealtimeStats /> */}
            <div>
                <Link
                    className={cn(buttonVariants({ variant: "card" }), "font-semibold mb-1")}
                    href="/dashboard/reports/incoming"
                >
                    Incoming Leads -{">"}{" "}
                </Link>
                <Link
                    className={cn(buttonVariants({ variant: "card" }), "font-semibold mb-1")}
                    href="/dashboard/reports/stats"
                >
                    ARD Lender Stats -{">"}{" "}
                </Link>
                <Link
                    className={cn(buttonVariants({ variant: "card" }), "font-semibold mb-1")}
                    href="/dashboard/reports/graphs"
                >
                    Grapshs -{">"}{" "}
                </Link>
            </div>
            {/* Total Leads Sent */}
            {/* <LeadsTable /> */}
            {/* <MonthlyLenders /> */}
            {/* New Users */}
            <LenderCharts />
            <UsersTable />
            {/* <Table1 /> */}
            <h1 className={cn(buttonVariants({ variant: "card" }), "font-semibold")}>Graph Demo</h1>
            <Card>
                <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 border-b px-6 py-5 sm:border-b-0 sm:py-6">
                        <CardTitle>Total leads pushed for the last 3 months</CardTitle>
                    </div>
                    <div className="flex">
                        <div className="flex flex-col justify-center gap-1 px-6 py-4 text-left even:border-l sm:border-l sm:px-8">
                            <span className="text-xs text-muted-foreground">Total Leads Pushed</span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">{formatted}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-2 sm:p-6">
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="views"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            });
                                        }}
                                    />
                                }
                            />
                            <Bar dataKey={"count"} fill={`var(--color-${"count"})`} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    );
}
