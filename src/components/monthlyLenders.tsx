"use client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

// Fetch function separated for cleaner code
const fetchMonthlyLenders = async () => {
    try {
        const response = await fetch("/api/users/monthlylenders");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    } catch (error) {
        throw new Error("Failed to fetch monthly lenders data");
    }
};

export default function MonthlyLenders() {
    // Using React Query for data fetching
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["monthlyLenders"],
        queryFn: fetchMonthlyLenders,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center p-8 text-red-500">
                Error: {error instanceof Error ? error.message : "Something went wrong"}
            </div>
        );
    }

    return (
        <main className="flex flex-col items-stretch md:p-8">
            {Object.entries(data || {})
                .filter(([key]) => ["Zype_LS", "MoneyTap"].includes(key))
                .map(
                    ([lenderName, lenderData]) =>
                        lenderData && (
                            <div key={lenderName} className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">{lenderName}</h2>
                                <Table>
                                    <TableBody>
                                        {Object.entries(lenderData).map(([key, value]) => (
                                            <TableRow key={`${lenderName}-${key}`}>
                                                <TableCell className="font-medium">{key}</TableCell>
                                                <TableCell className="text-right">
                                                    {typeof value === "number"
                                                        ? value.toLocaleString()
                                                        : value.toString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ),
                )}
        </main>
    );
}
