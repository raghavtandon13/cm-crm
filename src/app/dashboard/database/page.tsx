"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Text, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import fromAPI from "@/lib/api";

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

    return (
        <div className="flex h-full">
            <aside className="hidden w-[220px] overflow-y-auto border-r bg-white md:block lg:w-[280px]">
                <div className="sticky top-0 p-4">
                    <nav className="grid gap-2 text-sm font-medium">
                        {data?.map((query) => (
                            <NavItem key={query.id} href={`/dashboard/database?id=${query.id}`} label={query.name} />
                        ))}
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
                            <div className="min-h-[300px] p-3 rounded-md border bg-slate-50">
                                {runMutation.isPending ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                                    </div>
                                ) : runMutation.isError ? (
                                    <p className="text-red-500">Error running query: {runMutation.error?.message}</p>
                                ) : runMutation.data ? (
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(runMutation.data, null, 2)}
                                    </pre>
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
