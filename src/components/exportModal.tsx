"use client";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export async function CsvExportModal({ cellValue, location }: { cellValue: number; location: any }) {
    console.log(cellValue, location);
    const [open, setOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
	    console.log(location)
	    console.log("hello")
            const response = await fetch("/api/leads/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(location),
            });
            if (!response.ok) throw new Error("Failed to export CSV");

            // Trigger file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `leads-${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Export Leads Data</AlertDialogTitle>
                    <AlertDialogDescription>
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin h-5 w-5 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                                <span>Generating your CSV file, please wait...</span>
                            </div>
                        ) : (
                            <span>Click Start Export to generate your CSV file.</span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>Close</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleExport}
                        disabled={loading}
                        className={cn("btn-primary", { "opacity-50 cursor-not-allowed": loading })}
                    >
                        {loading ? "Exporting..." : "Start Export"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
