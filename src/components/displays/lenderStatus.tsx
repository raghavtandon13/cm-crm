"use client";

import { useState, type JSX } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";

type Lender = "moneyview" | "smartcoin" | "zype" | "fatakpay_pl";

export default function LenderStatus({ phone }: { phone: string }) {
    const [dialogOpen, setDialogOpen] = useState<Lender | null>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchStatus = async (lender: Lender) => {
        setLoading(true);
        setStatusData(null);

        const urlMap: Record<Lender, string> = {
            moneyview: "https://api4.credmantra.com/api/v1/partner-api/moneyview/status",
            smartcoin: "https://api4.credmantra.com/api/v1/partner-api/smartcoin/status",
            zype: "https://api4.credmantra.com/api/v1/partner-api/zype/status/",
            fatakpay_pl: "https://api4.credmantra.com/api/v1/partner-api/fatakpay/fatakpay/status/",
        };

        const payload: Record<Lender, any> = {
            moneyview: { phone },
            smartcoin: { phone },
            zype: { mobileNumber: phone },
            fatakpay_pl: { mobile: phone, prod: "PL" },
        };

        try {
            const response = await fetch(urlMap[lender], {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload[lender]),
            });
            const data = await response.json();
            setStatusData(data);
        } catch (error) {
            console.error(`Error fetching status for ${lender}`, error);
            setStatusData({ error: "Failed to fetch" });
        } finally {
            setLoading(false);
        }
    };

    const renderTableRows = (data: any): JSX.Element[] => {
        return Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>
                    {typeof value === "object" && value !== null ? (
                        <Table className="my-2 ml-4 border">
                            <TableBody>{renderTableRows(value)}</TableBody>
                        </Table>
                    ) : (
                        String(value)
                    )}
                </TableCell>
            </TableRow>
        ));
    };

    const lenders: Lender[] = ["moneyview", "smartcoin", "zype", "fatakpay_pl"];

    return (
        <div className="flex flex-col  py-10 gap-6">
            <h1 className="font-bold">Lender Status</h1>
            <div className="flex gap-4 flex-wrap">
                {lenders.map((lender) => (
                    <Dialog
                        key={lender}
                        open={dialogOpen === lender}
                        onOpenChange={(open) => {
                            setDialogOpen(open ? lender : null);
                            if (open) fetchStatus(lender);
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline">{lender.replace(/_/g, " ").toUpperCase()}</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{lender.replace(/_/g, " ").toUpperCase()} Status</DialogTitle>
                            </DialogHeader>
                            {loading ? (
                                <p className="text-gray-500">Loading...</p>
                            ) : statusData ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Field</TableHead>
                                            <TableHead>Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>{renderTableRows(statusData)}</TableBody>
                                </Table>
                            ) : null}
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}
