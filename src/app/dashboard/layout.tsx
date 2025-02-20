"use client";
import { useUser } from "@/context/UserContext";
import { Library, LineChart, Search, UserPlus, Users, Database, UserRound, BookUser } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

type NavItemProps = {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
};

function NavItem({ href, icon: Icon, label }: NavItemProps) {
    const path = usePathname();
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${path === href ? "bg-slate-200" : "hover:bg-muted"}`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );
}

export default function Dashboard({ children }: { children: React.ReactNode }) {
    const path = usePathname();
    const user = useUser();

    // testing
    // const user = { role: { title: "TL" } };

    const admin = user?.role.title === "BOSS";
    const agent = user?.role.title === "OE";
    const tech = user?.role.title === "TE";
    const tl = user?.role.title === "TL";
    const hr = user?.role.title === "HR";
    const indiv = user?.role.title === "INDIV";
    const shouldAddPadding = !path.includes("dashboard/database");

    return (
        <div className="flex h-full">
            <aside className="hidden w-[220px] overflow-y-auto border-r bg-white md:block lg:w-[280px]">
                <div className="sticky top-0 p-4">
                    <nav className="grid gap-2 text-sm font-medium">
                        {(tl || admin || agent) && <NavItem href="/dashboard/create" icon={UserPlus} label="Create New Lead" />}
                        {indiv && <NavItem href="/dashboard/patner_create" icon={UserPlus} label="Create New Lead" />}
                        {(tl || admin || agent) && <NavItem href="/dashboard/myleads" icon={Library} label="My Leads" />}
                        {indiv && <NavItem href="/dashboard/partner_leads" icon={Library} label="Partner Leads" />}
                        {(tl || admin) && <NavItem href="/dashboard/team_leads" icon={BookUser} label="Team Leads" />}
                        {(tl || admin || agent) && <NavItem href="/dashboard/search" icon={Search} label="Search" />}
                        {admin && <NavItem href="/dashboard/reports" icon={LineChart} label="Reports" />}
                        {(admin || hr) && <NavItem href="/dashboard/register" icon={Users} label="Agents" />}
                        {admin && <NavItem href="/dashboard/database" icon={Database} label="Database" />}
                        {(tl || admin || hr) && <NavItem href="/dashboard/attendance" icon={UserRound} label="Attendance" />}
                        {(tl || agent || tech) && <NavItem href="/dashboard/agent_attendance" icon={UserRound} label="My Attendance" />}
                    </nav>
                </div>
            </aside>
            <main className={`flex-1 overflow-y-auto ${shouldAddPadding ? "p-4" : ""}`}>
                <Suspense>{children}</Suspense>
            </main>
        </div>
    );
}
