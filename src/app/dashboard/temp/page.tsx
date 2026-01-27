"use client";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function TempPage() {
    return (
        <main>
            <div className="font-semibold flex gap-4 items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button id="date" variant="outline" className={cn("justify-start text-left font-normal")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="range" />
                    </PopoverContent>
                </Popover>
                <Button variant="outline"></Button>
            </div>
        </main>
    );
}
