"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, LineChart, Search, UserPlus, Users } from "lucide-react";

export default function Dashboard({ children }: { children: React.ReactNode }) {
    const path = usePathname();

    return (
        <div className="flex h-full">
            <aside className="hidden w-[220px] overflow-y-auto border-r bg-white md:block lg:w-[280px]">
                <div className=" sticky top-0 p-4">
                    <nav className="grid gap-2 text-sm font-medium">
                        <Link
                            href="/dashboard/create"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                path === "/dashboard/create" ? "bg-slate-200" : "hover:bg-muted"
                            }`}
                        >
                            <UserPlus className="h-4 w-4" />
                            Create New Lead
                        </Link>
                        <Link
                            href="#"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                path === "/dashboard/myleads" ? "bg-slate-200" : "hover:bg-muted"
                            }`}
                        >
                            <Library className="h-4 w-4" />
                            My Leads
                        </Link>
                        <Link
                            href="/dashboard/search"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                path === "/dashboard/search" ? "bg-slate-200" : "hover:bg-muted"
                            }`}
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </Link>
                        <Link
                            href="/dashboard/reports"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                path === "/dashboard/reports" ? "bg-slate-200" : "hover:bg-muted"
                            }`}
                        >
                            <LineChart className="h-4 w-4" />
                            Reports
                        </Link>
                        <Link
                            href="#"
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                path === "/dashboard/agents" ? "bg-slate-200" : "hover:bg-muted"
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Agents
                        </Link>
                    </nav>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
    );
}
