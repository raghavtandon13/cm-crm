"use client";
import fromAPI from "@/lib/api";
import { BarChartComponent as BarChart } from "@/components/displays/barChart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { format, startOfMonth } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Graphs() {
    const [lender, setLender] = useState("SmartCoin");
    const [partner, setPartner] = useState("Zype_LS");
    const [date, setDate] = useState<DateRange | undefined>({ from: startOfMonth(new Date("2025-01-01")), to: new Date() });

    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";

    const fetchGraphData = async (group: string) => {
        const response = await fromAPI.post("/leads/graphs", {
            startDate,
            endDate,
            lender: lender === "None" ? undefined : lender,
            partner: partner === "None" ? undefined : partner,
            group,
        });
        return response.data;
    };

    const {
        data: ageData,
        isFetching: isFetchingAge,
        refetch: refetchAge,
    } = useQuery({
        queryKey: ["ageData", { startDate, endDate, lender, partner }],
        queryFn: () => fetchGraphData("age"),
        enabled: !!startDate && !!endDate,
    });

    const {
        data: employmentData,
        isFetching: isFetchingEmployment,
        refetch: refetchEmployment,
    } = useQuery({
        queryKey: ["employmentData", { startDate, endDate, lender, partner }],
        queryFn: () => fetchGraphData("employment"),
        enabled: !!startDate && !!endDate,
    });

    const {
        data: genderData,
        isFetching: isFetchingGender,
        refetch: refetchGender,
    } = useQuery({
        queryKey: ["genderData", { startDate, endDate, lender, partner }],
        queryFn: () => fetchGraphData("gender"),
        enabled: !!startDate && !!endDate,
    });

    const transformData = (data: any) => {
        return data
            .map((item: any) => {
                const transformedCounts = item.groupCounts.map((groupCount: any) => {
                    const transformedGroup = { group: groupCount.group };
                    groupCount.counts.forEach((count: any) => {
                        transformedGroup[count.status] = count.count;
                    });
                    return transformedGroup;
                });
                return transformedCounts;
            })
            .flat();
    };

    const transformedAgeData = transformData(ageData || []);
    const transformedEmploymentData = transformData(employmentData || []);
    const transformedGenderData = transformData(genderData || []);

    const ageConfig = { Accepted: { color: "#8884d8" }, Deduped: { color: "#82ca9d" }, Errors: { color: "#ffc658" } };
    const employmentConfig = { Accepted: { color: "#8884d8" }, Deduped: { color: "#82ca9d" }, Errors: { color: "#ffc658" } };
    const genderConfig = { Accepted: { color: "#8884d8" }, Deduped: { color: "#82ca9d" }, Errors: { color: "#ffc658" } };

    const refetchAll = () => {
        refetchAge();
        refetchEmployment();
        refetchGender();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Select value={lender} onValueChange={(v) => setLender(v)}>
                    <SelectTrigger className="bg-white w-[350px]">
                        <SelectValue placeholder="Select Lender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Cashe">Cashe</SelectItem>
                        <SelectItem value="CreditSaison">CreditSaison</SelectItem>
                        <SelectItem value="Faircent">Faircent</SelectItem>
                        <SelectItem value="FatakPay">FatakPay</SelectItem>
                        <SelectItem value="Fibe">Fibe</SelectItem>
                        <SelectItem value="LendingKart">LendingKart</SelectItem>
                        <SelectItem value="LoanTap">LoanTap</SelectItem>
                        <SelectItem value="MoneyTap">MoneyTap</SelectItem>
                        <SelectItem value="MoneyView">MoneyView</SelectItem>
                        <SelectItem value="Mpocket">Mpocket</SelectItem>
                        <SelectItem value="Payme">Payme</SelectItem>
                        <SelectItem value="Prefr">Prefr</SelectItem>
                        <SelectItem value="RamFin">RamFin</SelectItem>
                        <SelectItem value="SmartCoin">SmartCoin</SelectItem>
                        <SelectItem value="Upwards MarketPlace">Upwards MarketPlace</SelectItem>
                        <SelectItem value="Upwards">Upwards</SelectItem>
                        <SelectItem value="Zype">Zype</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={partner} onValueChange={(v) => setPartner(v)}>
                    <SelectTrigger className="bg-white w-[350px]">
                        <SelectValue placeholder="Select Partner" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Zype_LS">Zype_LS</SelectItem>
                        <SelectItem value="MoneyTap">MoneyTap</SelectItem>
                    </SelectContent>
                </Select>
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
                <Button onClick={refetchAll} variant="outline">
                    {isFetchingAge || isFetchingEmployment || isFetchingGender ? (
                        <div className="animate-spin h-4 w-4 border-2 border-black-500 rounded-full border-t-transparent"></div>
                    ) : (
                        "Run"
                    )}
                </Button>
            </div>
            <div className="flex flex-wrap gap-4">
                <BarChart data={transformedAgeData} title="Age Distribution" config={ageConfig} loading={isFetchingAge} />
                <BarChart
                    data={transformedEmploymentData}
                    title="Employment Distribution"
                    config={employmentConfig}
                    loading={isFetchingEmployment}
                />
                <BarChart data={transformedGenderData} title="Gender Distribution" config={genderConfig} loading={isFetchingGender} />
            </div>
        </div>
    );
}
