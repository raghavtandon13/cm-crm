"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Filters = {
    minAge: number;
    maxAge: number;
    minIncome: number;
    pincodeCollection: string;
    pincodeMatching: "R" | "B";
    employment: "Salaried" | "Self-employed";
    startDate: Date | null;
    endDate: Date | null;
    limit: number;
};

type ApiResponse = {
    pincode: string[];
    presets: {
        _id: string;
        label: string;
        minAge?: number;
        maxAge?: number;
        minIncome?: number;
        pincodeCollection?: string;
        pincodeMatching?: "R" | "B";
        employment?: "Salaried" | "Self-employed";
    }[];
};

export default function ExportPage() {
    const [filters, setFilters] = useState<Filters>({
        minAge: 21,
        maxAge: 45,
        minIncome: 15000,
        pincodeCollection: "",
        pincodeMatching: "R",
        employment: "Salaried",
        startDate: null,
        endDate: null,
        limit: 100,
    });

    const { data, isLoading, isError } = useQuery<ApiResponse>({
        queryKey: ["aip-export-options"],
        queryFn: async () => {
            const res = await fetch("/api/leads/export/aip-export");
            if (!res.ok) throw new Error("Failed to fetch AIP export config");
            return res.json();
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const handleExport = async () => {
        try {
            const res = await fetch("/api/leads/export/aip-export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...filters,
                    minAge: String(filters.minAge),
                    maxAge: String(filters.maxAge),
                    minIncome: String(filters.minIncome),
                    startDate: filters.startDate?.toISOString(),
                    endDate: filters.endDate?.toISOString(),
                }),
            });

            if (!res.ok) {
                toast.error("Export failed");
                return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "aip-export.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();

            toast.success("CSV downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        }
    };

    const applyPreset = (preset: Partial<Filters>) => {
        setFilters((prev) => ({ ...prev, ...preset }));
        toast.success("Applied preset");
    };

    return (
        <div className="max-w-xl mx-auto mt-10 space-y-6 p-6 bg-white rounded-2xl shadow-lg">
            <h1 className="text-xl font-semibold text-center">Export Filtered Users (AIP)</h1>

            {/* Preset Dropdown */}
            <div className="space-y-2">
                <Label>Presets</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full bg-white text-left font-normal">
                            Select Preset
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Choose a preset</DropdownMenuLabel>
                        {isLoading && <DropdownMenuItem disabled>Loading...</DropdownMenuItem>}
                        {isError && <DropdownMenuItem disabled>Error loading presets</DropdownMenuItem>}
                        {data?.presets.map((preset) => (
                            <DropdownMenuItem key={preset._id} onClick={() => applyPreset(preset)}>
                                {preset.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Filter Inputs */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 items-end">
                <Label className="space-y-2">
                    <span>Min Age</span>
                    <Input
                        name="minAge"
                        value={filters.minAge}
                        onChange={handleChange}
                        type="number"
                        className="bg-white"
                    />
                </Label>

                <Label className="space-y-2">
                    <span>Max Age</span>
                    <Input
                        name="maxAge"
                        value={filters.maxAge}
                        onChange={handleChange}
                        type="number"
                        className="bg-white"
                    />
                </Label>

                <Label className="space-y-2">
                    <span>Min Income</span>
                    <Input
                        name="minIncome"
                        value={filters.minIncome}
                        onChange={handleChange}
                        type="number"
                        className="bg-white"
                    />
                </Label>

                <div className="space-y-2">
                    <Label>Employment</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full bg-white text-left font-normal">
                                {filters.employment}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            {["Salaried", "Self-employed"].map((type) => (
                                <DropdownMenuItem
                                    key={type}
                                    onClick={() =>
                                        setFilters((prev) => ({ ...prev, employment: type as Filters["employment"] }))
                                    }
                                >
                                    {type}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Label className="space-y-2">
                    <span>Limit</span>
                    <Input
                        name="limit"
                        value={filters.limit}
                        onChange={handleChange}
                        type="number"
                        className="bg-white"
                    />
                </Label>

                <div className="space-y-2">
                    <Label>Pincode Collection</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full bg-white text-left font-normal">
                                {filters.pincodeCollection || "Select Collection"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuLabel>Select Pincode Collection</DropdownMenuLabel>
                            {isLoading && <DropdownMenuItem disabled>Loading...</DropdownMenuItem>}
                            {isError && <DropdownMenuItem disabled>Error loading</DropdownMenuItem>}
                            {data?.pincode.map((col) => (
                                <DropdownMenuItem
                                    key={col}
                                    onClick={() => setFilters((prev) => ({ ...prev, pincodeCollection: col }))}
                                >
                                    {col}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                                onClick={() => setFilters((prev) => ({ ...prev, pincodeCollection: "" }))}
                            >
                                None
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {filters.pincodeCollection && (
                    <div className="space-y-2 col-span-2">
                        <Label>Pincode Matching</Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full bg-white text-left font-normal">
                                    {filters.pincodeMatching === "R" ? "Include (R)" : "Exclude (B)"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                <DropdownMenuItem
                                    onClick={() => setFilters((prev) => ({ ...prev, pincodeMatching: "R" }))}
                                >
                                    Include (R)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilters((prev) => ({ ...prev, pincodeMatching: "B" }))}
                                >
                                    Exclude (B)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full bg-white text-left font-normal">
                                {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.startDate || undefined}
                                onSelect={(date) => setFilters((prev) => ({ ...prev, startDate: date ?? null }))}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full bg-white text-left font-normal">
                                {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.endDate || undefined}
                                onSelect={(date) => setFilters((prev) => ({ ...prev, startDate: date ?? null }))}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <Button onClick={handleExport} className="mt-6 w-full text-white bg-black hover:bg-gray-800">
                Export CSV
            </Button>
        </div>
    );
}
