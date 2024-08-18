// api = "https://credmantra.com/api/v1/crm/better_stats"
// data = { dates: { start: "2024-07-01", end: "2024-07-20" } }

"use client";
import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

const data = [
    {
        name: "Faircent",
        status: "ON",
        First: "2024-07-04",
        Last: "2024-07-19",
        Total: 9606,
        Accepted: 1580,
        Rejected: 8021,
    },
    {
        name: "Upwards MarketPlace",
        status: "ON",
        First: "2024-07-05",
        Last: "2024-07-19",
        Total: 155878,
        Accepted: 42000,
        Rejected: 113878,
    },
    {
        name: "Prefr",
        status: "OFF",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 6377,
        Accepted: 1500,
        Rejected: 4877,
    },
    {
        name: "Fibe",
        status: "ON",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 155414,
        Accepted: 28695,
        Rejected: 126573,
    },
    {
        name: "Cashe",
        status: "OFF",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 93446,
        Accepted: 18860,
        Rejected: 74582,
    },
    {
        name: "MoneyView",
        status: "ON",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 225516,
        Accepted: 22502,
        Rejected: 203014,
    },
    {
        name: "Upwards",
        status: "OFF",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 20581,
        Accepted: 5980,
        Rejected: 14601,
    },
    {
        name: "Mpocket",
        status: "OFF",
        First: "2024-07-05",
        Last: "2024-07-05",
        Total: 8,
        Accepted: 2,
        Rejected: 6,
    },
    {
        name: "Payme",
        status: "ON",
        First: "2024-07-03",
        Last: "2024-07-19",
        Total: 11991,
        Accepted: 3500,
        Rejected: 8491,
    },
    {
        name: "Zype",
        status: "ON",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 18443,
        Accepted: 15379,
        Rejected: 3064,
    },
    {
        name: "LendingKart",
        status: "ON",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 2383,
        Accepted: 500,
        Rejected: 1883,
    },
    {
        name: "LoanTap",
        status: "OFF",
        First: "2024-07-01",
        Last: "2024-07-19",
        Total: 54,
        Accepted: 25,
        Rejected: 29,
    },
    {
        name: "Some Other Lender",
        status: "OFF",
        First: "2024-07-05",
        Last: "2024-07-19",
        Total: 15,
        Accepted: 42,
        Rejected: 101,
    },
];

export type LenderData = {
    name: string;
    status: string;
    First: string;
    Last: string;
    Total: number;
    Accepted: number;
    Rejected: number;
};

export const columns: ColumnDef<LenderData>[] = [
    { accessorKey: "name", header: () => <div className="w-36 text-left">Name</div> },
    {
        //  NOTE: Selection filters are MANUALLY added.
        //  Refer to bottom of this page to get same fuction with auto generated filters.

        accessorKey: "status",
        header: ({ column }) => {
            const columnFilterValue = column.getFilterValue();
            return (
                <div className="flex text-left">
                    <select
                        className="mr-2 rounded border"
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        value={columnFilterValue?.toString()}
                    >
                        <option value="">*</option>
                        <option value="ON">ON</option>
                        <option value="OFF">OFF</option>
                    </select>
                    Status
                </div>
            );
        },
        cell: ({ row }) => <div className="text-center">{row.getValue("status")}</div>,
    },
    {
        accessorKey: "First",
        header: () => <div className="text-center">First</div>,
        cell: ({ row }) => <div className="min-w-max text-right">{row.getValue("First")}</div>,
    },
    {
        accessorKey: "Last",
        header: () => <div className="text-center">Last</div>,
        cell: ({ row }) => <div className="min-w-max text-right">{row.getValue("Last")}</div>,
    },
    {
        accessorKey: "Total",
        header: ({ column }) => (
            <div className="flex items-center justify-end">
                <Sort column={column} />
                Total
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("Total"));
            const formatted = new Intl.NumberFormat("en-IN").format(amount);
            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: "Accepted",
        header: ({ column }) => (
            <div className="flex items-center justify-end">
                <Sort column={column} />
                Accepted
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("Accepted"));
            const formatted = new Intl.NumberFormat("en-IN").format(amount);
            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: "Rejected",
        header: ({ column }) => (
            <div className="flex items-center justify-end">
                <Sort column={column} />
                Rejected
            </div>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("Rejected"));
            const formatted = new Intl.NumberFormat("en-IN").format(amount);
            return <div className="text-right">{formatted}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger className="mr-[-20px]" asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(row.original))}>
                        Copy Lender Data
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

function Sort({ column }: { column: any }) {
    return (
        <ArrowUpDown
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="mx-2 h-4 w-4 cursor-pointer rounded border hover:bg-slate-200"
        />
    );
}

export function Table1() {
    return (
        <>
            <div className="my-2">
                <DataTable columns={columns} data={data} name="table1"/>
            </div>
        </>
    );
}

//  AUTO GENERATED FILTERS
/**************************
 *     {
 *	  accessorKey: "status",
 *	  header: ({ column }) => {
 *	      const sortedUniqueValues = useMemo(
 *		  () => Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
 *		  [column.getFacetedUniqueValues()],
 *	      );
 *	      return (
 *		  <div className="flex text-left">
 *		      <select
 *			  className="mr-2 rounded border"
 *			  onChange={(e) => column.setFilterValue(e.target.value)}
 *			  value={columnFilterValue?.toString()}
 *		      >
 *			  <option value="">*</option>
 *			  {sortedUniqueValues.map((value) => (
 *			      <option value={value} key={value}>
 *				  {value}
 *			      </option>
 *			  ))}
 *		      </select>
 *		      Status
 *		  </div>
 *	      );
 *	  },
 *	  cell: ({ row }) => <div className="text-center">{row.getValue("status")}</div>,
 *     }
 *************************/
