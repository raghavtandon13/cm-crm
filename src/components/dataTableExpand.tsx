import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    getExpandedRowModel,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const partnerColors: Record<string, string> = {
    Zype_LS: "bg-blue-100 text-blue-900",
    MoneyTap: "bg-green-100 text-green-900",
};
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    name?: string;
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [expanded, setExpanded] = useState({});

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            expanded,
        },
        onExpandedChange: setExpanded,
        getSubRows: (row: any) => {
            if (row.partnerData) return row.partnerData;
            if (row.monthlyCounts)
                return Object.entries(row.monthlyCounts).map(([month, data]: [any, any]) => ({
                    ...data,
                    month,
                    partner: row.partner,
                }));
            if (row.dailyCounts)
                return Object.entries(row.dailyCounts).map(([day, count]) => ({
                    day,
                    count,
                    month: row.month,
                    partner: row.partner,
                }));
            return undefined;
        },
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between"></div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        "hover:bg-transparent!",
                                        row.original.overallTotal
                                            ? "bg-gray-100 font-bold"
                                            : row.original.partner
                                              ? partnerColors[row.original.partner]
                                              : "pl-8",
                                    )}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        if (cell.column.id === "expander") {
                                            return (
                                                <TableCell key={cell.id} className="w-4">
                                                    {row.getCanExpand() ? (
                                                        <Button
                                                            className="hover:bg-gray-50 bg-white"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={row.getToggleExpandedHandler()}
                                                        >
                                                            {row.getIsExpanded() ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    ) : null}
                                                </TableCell>
                                            );
                                        }
                                        return (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default DataTable;
