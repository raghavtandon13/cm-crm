"use client";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
// import { Table1 } from "@/components/displays/table1";
import { UsersTable } from "@/components/displays/usersTable";
// import MonthlyLenders from "@/components/monthlyLenders";
import { LeadsTable } from "@/components/displays/leadsTable";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LenderCharts } from "@/components/displays/lenderChart";
// import { RealtimeStats } from "@/components/realtime";

const chartData = [
    { count: 466, date: "2024-04-06" },
    { count: 5270, date: "2024-04-07" },
    { count: 6357, date: "2024-04-08" },
    { count: 10435, date: "2024-04-09" },
    { count: 13488, date: "2024-04-10" },
    { count: 12419, date: "2024-04-11" },
    { count: 11903, date: "2024-04-12" },
    { count: 10982, date: "2024-04-13" },
    { count: 4977, date: "2024-04-14" },
    { count: 1507, date: "2024-04-15" },
    { count: 12769, date: "2024-04-17" },
    { count: 7749, date: "2024-04-18" },
    { count: 7119, date: "2024-04-19" },
    { count: 14235, date: "2024-04-20" },
    { count: 3804, date: "2024-04-21" },
    { count: 10303, date: "2024-04-22" },
    { count: 1594, date: "2024-04-23" },
    { count: 11041, date: "2024-04-24" },
    { count: 10469, date: "2024-04-25" },
    { count: 5319, date: "2024-04-26" },
    { count: 4312, date: "2024-04-27" },
    { count: 3910, date: "2024-04-28" },
    { count: 5883, date: "2024-04-29" },
    { count: 7543, date: "2024-04-30" },
    { count: 11506, date: "2024-05-01" },
    { count: 12720, date: "2024-05-02" },
    { count: 11357, date: "2024-05-03" },
    { count: 7909, date: "2024-05-04" },
    { count: 6390, date: "2024-05-05" },
    { count: 9003, date: "2024-05-06" },
    { count: 9231, date: "2024-05-07" },
    { count: 8960, date: "2024-05-08" },
    { count: 9540, date: "2024-05-09" },
    { count: 15639, date: "2024-05-11" },
    { count: 17997, date: "2024-05-12" },
    { count: 16119, date: "2024-05-13" },
    { count: 16619, date: "2024-05-14" },
    { count: 16681, date: "2024-05-15" },
    { count: 15543, date: "2024-05-16" },
    { count: 16105, date: "2024-05-17" },
    { count: 13299, date: "2024-05-18" },
    { count: 14308, date: "2024-05-19" },
    { count: 15624, date: "2024-05-20" },
    { count: 17761, date: "2024-05-21" },
    { count: 14710, date: "2024-05-22" },
    { count: 14095, date: "2024-05-23" },
    { count: 18438, date: "2024-05-24" },
    { count: 18294, date: "2024-05-25" },
    { count: 18908, date: "2024-05-26" },
    { count: 18712, date: "2024-05-27" },
    { count: 20223, date: "2024-05-28" },
    { count: 8615, date: "2024-05-29" },
    { count: 8112, date: "2024-05-30" },
    { count: 8942, date: "2024-05-31" },
    { count: 7336, date: "2024-06-01" },
    { count: 7246, date: "2024-06-02" },
    { count: 15866, date: "2024-06-03" },
    { count: 15782, date: "2024-06-04" },
    { count: 19975, date: "2024-06-05" },
    { count: 17798, date: "2024-06-06" },
    { count: 7174, date: "2024-06-07" },
    { count: 10405, date: "2024-06-08" },
    { count: 8080, date: "2024-06-09" },
    { count: 11385, date: "2024-06-10" },
    { count: 10513, date: "2024-06-11" },
    { count: 4963, date: "2024-06-12" },
    { count: 13560, date: "2024-06-14" },
    { count: 27321, date: "2024-06-15" },
    { count: 28764, date: "2024-06-16" },
    { count: 21868, date: "2024-06-17" },
    { count: 27060, date: "2024-06-18" },
    { count: 28979, date: "2024-06-19" },
    { count: 28264, date: "2024-06-20" },
    { count: 23567, date: "2024-06-21" },
    { count: 27728, date: "2024-06-22" },
    { count: 32279, date: "2024-06-23" },
    { count: 15216, date: "2024-06-24" },
    { count: 4398, date: "2024-06-25" },
    { count: 4056, date: "2024-06-26" },
    { count: 3180, date: "2024-06-27" },
    { count: 2560, date: "2024-06-28" },
    { count: 1781, date: "2024-06-29" },
    { count: 1919, date: "2024-06-30" },
    { count: 4944, date: "2024-07-01" },
    { count: 4048, date: "2024-07-02" },
    { count: 3835, date: "2024-07-03" },
    { count: 4208, date: "2024-07-04" },
    { count: 4279, date: "2024-07-05" },
    { count: 2700, date: "2024-07-06" },
    { count: 2969, date: "2024-07-07" },
    { count: 7816, date: "2024-07-08" },
    { count: 4668, date: "2024-07-09" },
    { count: 14354, date: "2024-07-10" },
    { count: 19762, date: "2024-07-11" },
    { count: 19625, date: "2024-07-12" },
    { count: 13768, date: "2024-07-13" },
    { count: 16024, date: "2024-07-14" },
    { count: 33662, date: "2024-07-15" },
    { count: 32590, date: "2024-07-16" },
    { count: 28740, date: "2024-07-17" },
    { count: 31681, date: "2024-07-18" },
    { count: 26647, date: "2024-07-19" },
    { count: 15952, date: "2024-07-20" },
    { count: 16930, date: "2024-07-21" },
    { count: 19481, date: "2024-07-22" },
    { count: 9703, date: "2024-07-23" },
    { count: 25139, date: "2024-07-24" },
    { count: 20958, date: "2024-07-25" },
    { count: 31201, date: "2024-07-26" },
    { count: 9244, date: "2024-07-27" },
    { count: 3932, date: "2024-07-29" },
    { count: 39024, date: "2024-07-30" },
    { count: 25311, date: "2024-07-31" },
    { count: 23057, date: "2024-08-01" },
    { count: 48921, date: "2024-08-02" },
    { count: 45257, date: "2024-08-03" },
    { count: 42205, date: "2024-08-04" },
    { count: 32919, date: "2024-08-05" },
    { count: 45490, date: "2024-08-06" },
    { count: 55726, date: "2024-08-07" },
    { count: 37204, date: "2024-08-08" },
];

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
