"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export function LenderCharts({ data, title }) {
    const [visibleLenders, setVisibleLenders] = useState({});

    const toggleLenderVisibility = (lender) => {
        setVisibleLenders((prev) => ({
            ...prev,
            [lender]: !prev[lender],
        }));
    };

    const chartData = [];
    const lenders = {};

    data.forEach((lenderData) => {
        const lender = lenderData.lender;
        let hasAccepted = false;
        Object.entries(lenderData?.weeks).forEach(([week, data]) => {
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
    chartData.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
    const filteredChartData = chartData.slice(-10);

    const chartConfig = Object.keys(lenders).reduce((config, lender, index) => {
        config[lender] = {
            label: lender,
            color: `hsl(${index * 40}, 70%, 50%)`, // Assign distinct colors
        };
        return config;
    }, {});

    return (
        <>
            <h1 className={cn(buttonVariants({ variant: "card" }), "font-semibold w-full mb-1")}>{title} &#8628;</h1>
            <Card className="max-w-full">
                <CardHeader className="p-4">
                    <CardTitle className="text-sm">{title}</CardTitle>
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
