import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                    className={cn(
                                        "hover:bg-transparent!",
                                        row.original.overallTotal
                                            ? "bg-gray-100 font-bold"
                                            : row.original.partner
                                              ? partnerColors[row.original.partner]
                                              : "pl-8",
                                    )}
                                    data-state={row.getIsSelected() && "selected"}
                                    key={row.id}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        if (cell.column.id === "expander") {
                                            return (
                                                <TableCell className="w-4" key={cell.id}>
                                                    {row.getCanExpand() ? (
                                                        <Button
                                                            className="hover:bg-gray-50 bg-white"
                                                            onClick={row.getToggleExpandedHandler()}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </Button>
                                                    ) : null}
                                                </TableCell>
                                            );
                                        }
                                        return <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>;
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="h-24 text-center" colSpan={columns.length}>
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
