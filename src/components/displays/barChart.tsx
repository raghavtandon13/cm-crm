"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Expand, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface BarChartProps {
    data: any[];
    title: string;
    description?: string;
    config: ChartConfig;
    size?: "sm" | "lg";
    loading: boolean;
    multi?: boolean;
}

export function BarChartComponent({
    data,
    title,
    description,
    config,
    size = "sm",
    loading,
    multi = true,
}: BarChartProps) {
    const [chartSize, setChartSize] = useState(size);
    const toggleSize = () => setChartSize((prevSize) => (prevSize === "sm" ? "lg" : "sm"));

    const renderSkeletonBars = () => {
        const bars = [];
        for (let i = 0; i < 5; i++) {
            bars.push(
                <Skeleton
                    key={i}
                    className="h-full w-1/6 mx-1 animate-blink"
                    style={{ height: `${Math.random() * 100 + 50}px` }}
                />,
            );
        }
        return bars;
    };

    return (
        <Card className={chartSize === "sm" ? "sm:w-min" : "h-full w-full"}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{title}</CardTitle>
                    <button onClick={toggleSize} className="ml-2">
                        {chartSize === "sm" ? <Expand /> : <Minimize2 />}
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div
                        className={
                            chartSize === "sm" ? "h-[250px] w-[350px] flex items-end" : "h-full w-full flex items-end"
                        }
                    >
                        {renderSkeletonBars()}
                    </div>
                ) : (
                    <>
                        {multi ? (
                            <ChartContainer
                                className={chartSize === "sm" ? "w-full sm:h-[250px] sm:w-[350px] " : "h-full w-full"}
                                config={config}
                            >
                                <BarChart data={data}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="group" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                    {Object.keys(config).map((key) => (
                                        <Bar key={key} dataKey={key} fill={config[key].color} radius={4} />
                                    ))}
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <ChartContainer
                                className={chartSize === "sm" ? "w-full sm:h-[250px] sm:w-[350px] " : "h-full w-full"}
                                config={config}
                            >
                                <BarChart data={data}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="group" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                    {/* <Bar dataKey="count" radius={4} /> */}
                                    <Bar dataKey="count" fill={"#274754"} radius={4} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
