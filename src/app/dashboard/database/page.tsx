"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Text, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import fromAPI from "@/lib/api";
// import superjson from "superjson";

type NavItemProps = {
    href: string;
    label: string;
};

type Query = {
    id: string;
    name: string;
    query: string;
    date: string;
};

function NavItem({ href, label }: NavItemProps) {
    const searchParams = useSearchParams();
    const isActive = searchParams.get("id") === href.split("=")[1];

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-slate-200" : "hover:bg-muted"}`}
        >
            <Text className="h-4 w-4" />
            {label}
        </Link>
    );
}

export default function Create() {
    const searchParams = useSearchParams();
    const queryId = searchParams.get("id");
    const [queryText, setQueryText] = useState("");
    const [queryName, setQueryName] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "json">("table");

    const { data } = useQuery({
        queryKey: ["query"],
        queryFn: async () => {
            const response = await fromAPI.get("/db/queries");
            return response.data as Query[];
        },
    });

    const runMutation = useMutation({
        mutationFn: async ({ id, queryText }: { id?: string; queryText: string }) => {
            const response = await fromAPI.post("/db/queries/run", {
                id,
                query: queryText,
                // query: superjson.stringify(queryText),
            });
            return response.data;
        },
    });

    const saveMutation = useMutation({
        mutationFn: async ({ name, queryText }: { name: string; queryText: string }) => {
            const response = await fromAPI.post("/db/queries/save", {
                name,
                query: queryText,
            });
            return response.data;
        },
    });

    const selectedQuery = data?.find((q) => q.id === queryId);

    useEffect(() => {
        if (selectedQuery?.query) {
            setQueryText(selectedQuery.query);
        }
    }, [selectedQuery]);

    const renderTable = (data: any) => {
        if (!Array.isArray(data) || data.length === 0) {
            return <p className="text-slate-500">No data available</p>;
        }

        const headers = Object.keys(data[0]);

        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map((header) => (
                                <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof row[header] === "object" && row[header] !== null
                                        ? Array.isArray(row[header])
                                            ? renderTable(row[header])
                                            : renderNestedObject(row[header])
                                        : row[header]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderNestedObject = (obj: any) => {
        const entries = Object.entries(obj);
        return (
            <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                    {entries.map(([key, value]) => (
                        <tr key={key}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {typeof value === "object" && value !== null
                                    ? Array.isArray(value)
                                        ? renderTable(value)
                                        : renderNestedObject(value)
                                    : String(value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="flex h-full">
            <aside className="hidden w-[220px] overflow-y-auto border-r bg-white md:block lg:w-[280px]">
                <div className="sticky top-0 p-4">
                    <nav className="grid gap-2 text-sm font-medium">
                        {data?.map((query) => <NavItem key={query.id} href={`/dashboard/database?id=${query.id}`} label={query.name} />)}
                    </nav>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">{selectedQuery?.name}</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    runMutation.mutate({
                                        queryText: queryText,
                                    })
                                }
                                disabled={!queryText || runMutation.isPending}
                            >
                                {runMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    "Run Query"
                                )}
                            </Button>
                            <Button
                                onClick={() =>
                                    saveMutation.mutate({
                                        name: queryName,
                                        queryText: queryText,
                                    })
                                }
                                disabled={!queryText || !queryName || saveMutation.isPending}
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Query"
                                )}
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardContent className="p-4">
                            <input
                                type="text"
                                className="w-full p-3 mb-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Query Name"
                                value={queryName}
                                onChange={(e) => setQueryName(e.target.value)}
                                disabled={saveMutation.isPending}
                            />
                            <textarea
                                className={`w-full min-h-[200px] p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${runMutation.isPending ? "bg-slate-100 cursor-not-allowed" : ""}`}
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                                disabled={runMutation.isPending}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-md font-semibold">Results</h3>
                                <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "json" : "table")}>
                                    {viewMode === "table" ? "JSON" : "Table"}
                                </Button>
                            </div>
                            <div className="min-h-[300px] p-3 rounded-md border bg-slate-50">
                                {runMutation.isPending ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                                    </div>
                                ) : runMutation.isError ? (
                                    <p className="text-red-500">Error running query: {runMutation.error?.message}</p>
                                ) : runMutation.data ? (
                                    viewMode === "table" ? (
                                        renderTable(runMutation.data)
                                    ) : (
                                        <pre className="whitespace-pre-wrap">{JSON.stringify(runMutation.data, null, 2)}</pre>
                                    )
                                ) : (
                                    <p className="text-slate-500">Query results will appear here</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
