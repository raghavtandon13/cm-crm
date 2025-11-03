"use client";

import { FileDown } from "lucide-react";
import { Button } from "./ui/button";

export default function ExportStagesButton() {
    const handleExport = async () => {
        const res = await fetch("/api/users/stages");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "stages.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Button variant="ghost" className="flex items-center justify-center hover:bg-slate-200" onClick={handleExport}>
            <FileDown strokeWidth={1.25} className="w-4" />
        </Button>
    );
}
