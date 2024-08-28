"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export default function DateSearch({ dates }: any) {
    const initialStartDate = dates.start === "1970-01-01" ? "" : dates.start;
    const initialEndDate = dates.end === "2030-01-01" ? "" : dates.end;

    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        window.location.href = `?start=${startDate}&end=${endDate}`;
    };

    return (
        <form className="mx-2 w-full items-center justify-center" onSubmit={handleSubmit}>
            <div className="flex flex-col justify-start gap-2 sm:flex-row">
                <div className="flex  flex-col gap-2 sm:flex-row">
                    <Input
                        type="date"
                        className="bg-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        name="start"
                    />
                    <Input
                        type="date"
                        className="bg-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        name="end"
                    />
                </div>
                <Button className="bg-white" variant="outline">
                    <Search className="w-4" />
                </Button>
            </div>
        </form>
    );
}
