"use client";

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateSearch from "./dateSearch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    name?: string;
}

export function DataTable<TData, TValue>({ columns, data, name }: DataTableProps<TData, TValue>) {
    const dateprops = { start: "1970-01-01", end: "2030-01-01" };
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        state: { sorting, columnFilters, columnVisibility },
    });

    return (
        <>
            {name === "lenderARER" && (
                <div className="flex items-center py-4">
                    <Input
                        className="max-w-xs bg-white"
                        onChange={(event) => table.getColumn("lender")?.setFilterValue(event.target.value)}
                        placeholder="Search Lenders ..."
                        value={(table.getColumn("lender")?.getFilterValue() as string) ?? ""}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="ml-auto" variant="outline">
                                Fields
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            checked={column.getIsVisible()}
                                            className="capitalize"
                                            key={column.id}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
            {name === "table1" && (
                <div className="flex items-center py-4">
                    <Input
                        className="max-w-xs bg-white"
                        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                        placeholder="Search Lenders ..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    />
                    <DateSearch dates={dateprops} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="ml-auto" variant="outline">
                                Fields
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            checked={column.getIsVisible()}
                                            className="capitalize"
                                            key={column.id}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
            <div className="rounded-xl border bg-white px-4 py-2 shadow">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => {
                                    return (
                                        <TableHead
                                            className={index === 0 ? "sticky left-0 z-10 bg-background" : ""}
                                            // style={index === 0 ? { minWidth: "80px" } : { minWidth: "150px" }}
                                            key={header.id}
                                        >
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
                                <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell
                                            className={index === 0 ? "sticky left-0 z-10 bg-background" : ""}
                                            // style={index === 0 ? { minWidth: "80px" } : { minWidth: "150px" }}
                                            key={cell.id}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
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
        </>
    );
}
