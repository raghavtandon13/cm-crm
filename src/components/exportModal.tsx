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

export function CsvExportModal({
    cellValue,
    location,
    usage,
    onClose,
}: {
    cellValue: number;
    location: any;
    usage: string;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            let route: string = "";
            if (usage === "statsTable") {
                route = "stats";
            } else if (usage === "incoming") {
                route = "incoming";
            }
            const response = await fetch(`/api/leads/export/${route}`, {
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
        onClose(); // Close the modal after the export is complete
    };

    const renderDescription = () => {
        if (usage === "statsTable") {
            const fromDate = new Date(location.dates.from).toLocaleDateString("en-IN");
            const toDate = new Date(location.dates.to).toLocaleDateString("en-IN");
            return <span>{`${location.type} leads in ${location.lender} from ${fromDate} to ${toDate}`}</span>;
        } else if (usage === "incoming") {
            return <span>Export incoming leads.</span>;
        } else {
            return <span>Export current selection.</span>;
        }
    };

    return (
        <AlertDialog open={true}>
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
                            renderDescription()
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={loading}>
                        Close
                    </AlertDialogCancel>
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
