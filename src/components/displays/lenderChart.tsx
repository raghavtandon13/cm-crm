"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

const rawData = [
    {
        lender: "CreditSaison",
        weeks: {
            "2024-12-16": {
                Rest: 1,
            },
            "2025-01-20": {
                Rest: 2,
            },
        },
    },
    {
        lender: "FatakPay",
        weeks: {
            "2025-01-20": {
                Rejected: 4626,
                Accepted: 1238,
                Deduped: 32431,
            },
            "2025-01-06": {
                Rejected: 9333,
                Deduped: 146712,
                Accepted: 4487,
            },
            "2024-12-23": {
                Rejected: 6116,
                Accepted: 13268,
                Deduped: 40130,
            },
            "2024-12-16": {
                Accepted: 10139,
                Rejected: 4636,
                Deduped: 70067,
            },
            "2025-01-27": {
                Accepted: 732,
                Deduped: 13084,
                Rejected: 1114,
            },
            "2024-11-25": {
                Rejected: 13807,
                Deduped: 32,
                Accepted: 3487,
            },
            "2024-11-11": {
                Rejected: 44,
                Deduped: 2,
                Accepted: 92,
            },
            "2024-12-30": {
                Deduped: 24927,
                Rejected: 3245,
                Accepted: 5734,
            },
            "2024-11-18": {
                Rejected: 12911,
                Deduped: 145,
                Accepted: 585,
            },
            "2024-12-02": {
                Accepted: 12650,
                Deduped: 85,
                Rejected: 339,
            },
            "2024-12-09": {
                Rejected: 8273,
                Deduped: 71,
                Accepted: 823,
            },
            "2025-01-13": {
                Rejected: 9137,
                Deduped: 127942,
                Accepted: 4835,
            },
        },
    },
    {
        lender: "Fibe",
        weeks: {
            "2024-04-08": {
                Accepted: 2,
                Rejected: 17,
            },
            "2024-10-28": {
                Deduped: 39,
                Rejected: 10,
                Accepted: 4,
            },
            "2024-05-06": {
                Deduped: 43,
                Accepted: 66,
                Rejected: 21,
            },
            "2024-07-15": {
                Deduped: 6,
                Rejected: 3,
                Accepted: 3,
            },
            "2024-03-18": {
                Rejected: 103,
                Deduped: 938,
                Accepted: 1227,
            },
            "2024-04-29": {
                Accepted: 8,
                Deduped: 1,
                Rejected: 15,
            },
            "2024-10-07": {
                Rejected: 5,
                Accepted: 7,
                Deduped: 28,
            },
            "2024-11-04": {
                Deduped: 51,
                Accepted: 19,
                Rejected: 23,
            },
            "2024-11-18": {
                Deduped: 125,
                Accepted: 24,
                Rejected: 218,
            },
            "2024-04-01": {
                Accepted: 7290,
                Deduped: 17361,
                Errors: 2,
                Rejected: 37456,
            },
            "2024-03-11": {
                Rejected: 382,
                Deduped: 1552,
                Accepted: 2049,
            },
            "2024-06-10": {
                Deduped: 4,
            },
            "2024-04-22": {
                Accepted: 17107,
                Rejected: 1912,
                Deduped: 35877,
            },
            "2024-03-25": {
                Accepted: 2,
                Rejected: 1,
            },
            "2024-11-11": {
                Accepted: 20,
                Deduped: 109,
                Rejected: 61,
            },
            "2024-10-21": {
                Deduped: 165,
                Accepted: 19,
                Rejected: 44,
            },
            "2024-11-25": {
                Deduped: 42,
                Rejected: 60,
                Accepted: 3,
            },
            "2024-10-14": {
                Rejected: 7,
                Accepted: 16,
                Deduped: 74,
            },
            "2024-09-30": {
                Deduped: 7,
                Rejected: 1,
                Accepted: 2,
            },
            "2024-03-04": {
                Deduped: 591,
                Rejected: 509,
                Accepted: 373,
            },
            "2024-04-15": {
                Rejected: 14,
                Accepted: 6,
            },
        },
    },
    {
        lender: "LoanTap",
        weeks: {
            "2025-01-20": {
                Rest: 621,
            },
            "2025-01-27": {
                Rest: 42020,
            },
        },
    },
    {
        lender: "Mpocket",
        weeks: {
            "2024-12-30": {
                Accepted: 38911,
                Rejected: 211,
            },
            "2025-01-06": {
                Rejected: 753,
                Accepted: 188888,
            },
            "2025-01-13": {
                Accepted: 180998,
                Rejected: 1306,
            },
            "2025-01-27": {
                Rejected: 335,
                Accepted: 15518,
            },
            "2024-12-02": {
                Rejected: 77564,
                Accepted: 87474,
            },
            "2024-12-09": {
                Accepted: 20898,
                Rejected: 25,
            },
            "2024-12-16": {
                Accepted: 113494,
                Rejected: 1823,
            },
            "2025-01-20": {
                Accepted: 46806,
                Rejected: 228,
            },
            "2024-12-23": {
                Rejected: 4354,
                Accepted: 78389,
            },
            "2024-11-25": {
                Rejected: 471,
                Accepted: 22675,
            },
        },
    },
    {
        lender: "RamFin",
        weeks: {
            "2025-01-06": {
                Deduped: 163367,
                Accepted: 13545,
                Rejected: 1275,
            },
            "2025-01-13": {
                Rejected: 2599,
                Accepted: 57201,
                Deduped: 166160,
            },
            "2024-12-16": {
                Deduped: 73787,
                Accepted: 38977,
                Rejected: 401,
            },
            "2025-01-20": {
                Deduped: 44969,
                Accepted: 985,
                Rejected: 382,
            },
            "2024-11-11": {
                Deduped: 1556,
                Accepted: 12172,
                Rejected: 403,
            },
            "2024-11-18": {
                Rejected: 3382,
                Accepted: 171188,
                Deduped: 5830,
            },
            "2024-11-25": {
                Rejected: 1530,
                Deduped: 36272,
                Accepted: 251674,
            },
            "2025-01-27": {
                Deduped: 15426,
                Accepted: 66,
                Rejected: 116,
            },
            "2024-12-23": {
                Accepted: 110201,
                Deduped: 297456,
                Rejected: 460,
            },
            "2024-12-02": {
                Deduped: 67666,
                Accepted: 104774,
                Rejected: 321,
            },
            "2024-12-09": {
                Accepted: 8288,
                Deduped: 73503,
                Rejected: 390,
            },
            "2024-12-30": {
                Accepted: 13521,
                Deduped: 22151,
                Rejected: 276,
            },
        },
    },
    {
        lender: "SmartCoin",
        weeks: {
            "2024-12-23": {
                Errors: 16,
                Accepted: 9488,
                Deduped: 32062,
            },
            "2024-12-16": {
                Deduped: 64682,
                Accepted: 24368,
                Errors: 22,
            },
            "2024-12-02": {
                Deduped: 88748,
                Errors: 61,
                Accepted: 9078,
            },
            "2024-10-28": {
                Errors: 18,
                Deduped: 27359,
                Accepted: 10475,
            },
            "2024-12-09": {
                Accepted: 4986,
                Errors: 63,
                Deduped: 77172,
            },
            "2024-11-04": {
                Deduped: 85141,
                Accepted: 20458,
                Errors: 30,
            },
            "2024-12-30": {
                Accepted: 3940,
                Errors: 8,
                Deduped: 21032,
            },
            "2025-01-20": {
                Errors: 23,
                Deduped: 29292,
                Accepted: 439,
            },
            "2024-11-25": {
                Accepted: 36129,
                Deduped: 185271,
                Errors: 193,
            },
            "2024-11-11": {
                Accepted: 5059,
                Deduped: 53777,
                Errors: 21,
            },
            "2025-01-06": {
                Accepted: 10974,
                Errors: 74,
                Deduped: 116946,
            },
            "2025-01-27": {
                Accepted: 22079,
                Deduped: 46641,
                Errors: 11,
            },
            "2024-11-18": {
                Errors: 338,
                Deduped: 352004,
                Accepted: 70390,
            },
            "2025-01-13": {
                Errors: 65,
                Deduped: 105903,
                Accepted: 8190,
            },
        },
    },
    {
        lender: "Zype",
        weeks: {
            "2025-01-27": {
                Rejected: 4953,
                Accepted: 56445,
            },
            "2025-01-13": {
                Rejected: 3636,
                Accepted: 3129,
            },
        },
    },
];

// Transform the data into a format suitable for the chart
const chartData = [];
const lenders = {};

rawData.forEach((lenderData) => {
    const lender = lenderData.lender;
    let hasAccepted = false;
    Object.entries(lenderData.weeks).forEach(([week, data]) => {
        if (data.Accepted) {
            hasAccepted = true;
            const existingWeekData = chartData.find((d) => d.week === week);
            if (existingWeekData) {
                existingWeekData[lender] = data.Accepted || 0;
            } else {
                chartData.push({ week, [lender]: data.Accepted || 0 });
            }
        }
    });
    if (hasAccepted) {
        lenders[lender] = true; // Initialize visibility state for each lender with accepted data
    }
});

// Sort chartData by week in ascending order and take the last 10 weeks
chartData.sort((a: { week: string }, b: { week: string }) => new Date(a.week).getTime() - new Date(b.week).getTime());
const filteredChartData = chartData.slice(-10);

const chartConfig = Object.keys(lenders).reduce((config, lender, index) => {
    config[lender] = {
        label: lender,
        color: `hsl(${index * 40}, 70%, 50%)`, // Assign distinct colors
    };
    return config;
}, {});

export function LenderCharts() {
    const [visibleLenders, setVisibleLenders] = useState(lenders);

    const toggleLenderVisibility = (lender) => {
        setVisibleLenders((prev) => ({
            ...prev,
            [lender]: !prev[lender],
        }));
    };

    return (
        <>
            <h1 className={cn(buttonVariants({ variant: "card" }), "font-semibold w-full mb-1")}>Accepted Leads per Lender &#8628;</h1>
            <Card className="max-w-full">
                <CardHeader className="p-4">
                    <CardTitle className="text-sm">Accepted Leads</CardTitle>
                    <CardDescription className="text-xs">Last 10 Weeks</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {Object.keys(lenders).map((lender) => (
                            <button
                                key={lender}
                                className={cn(buttonVariants({ variant: "outline" }), { "bg-gray-200": visibleLenders[lender] })}
                                onClick={() => toggleLenderVisibility(lender)}
                            >
                                {lender}
                            </button>
                        ))}

                        <button
                            className={cn(buttonVariants({ variant: "outline" }), {
                                "bg-gray-200": Object.values(visibleLenders).every(Boolean),
                            })}
                            onClick={() => {
                                const allVisible = Object.values(visibleLenders).every(Boolean);
                                const newVisibility = Object.keys(visibleLenders).reduce((acc, lender) => {
                                    acc[lender] = !allVisible;
                                    return acc;
                                }, {});
                                setVisibleLenders(newVisibility);
                            }}
                        >
                            {Object.values(visibleLenders).every(Boolean) ? "None" : "All"}
                        </button>
                    </div>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <LineChart
                            accessibilityLayer
                            data={filteredChartData}
                            margin={{
                                left: 8,
                                right: 8,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={4} tickFormatter={(value) => value} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            {Object.keys(visibleLenders).map(
                                (lender) =>
                                    visibleLenders[lender] && (
                                        <Line
                                            key={lender}
                                            dataKey={lender}
                                            type="natural"
                                            stroke={chartConfig[lender].color} // Use the assigned color
                                            strokeWidth={3}
                                            dot={true}
                                        />
                                    ),
                            )}
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </>
    );
}
