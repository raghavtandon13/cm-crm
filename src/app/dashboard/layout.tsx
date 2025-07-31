"use client";
import { useUser } from "@/context/UserContext";
import {
    Library,
    LineChart,
    Search,
    UserPlus,
    Users,
    Database,
    UserRound,
    BookUser,
    ChevronLeft,
    ChevronRight,
    Download,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

type NavItemProps = {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    collapsed: boolean;
};

function NavItem({ href, icon: Icon, label, collapsed }: NavItemProps) {
    const path = usePathname();
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${path === href ? "bg-slate-200" : "hover:bg-muted"}`}
        >
            <Icon className="h-4 w-4" />
            {!collapsed && label}
        </Link>
    );
}

export default function Dashboard({ children }: { children: React.ReactNode }) {
    const path = usePathname();
    const user = useUser();
    const [collapsed, setCollapsed] = useState(false);

    // testing
    // const user = { role: { title: "QA" } };

    const admin = user?.role.title === "BOSS";
    const agent = user?.role.title === "OE";
    const tech = user?.role.title === "TE";
    const tl = user?.role.title === "TL";
    const hr = user?.role.title === "HR";
    const indiv = user?.role.title === "INDIV";
    const dsa = user?.role.title === "DSA";
    const subdsa = user?.role.title === "SUBDSA";
    const qa = user?.role.title === "QA";
    const shouldAddPadding = !path.includes("dashboard/database");

    return (
        <div className="flex h-full">
            <aside
                className={`hidden overflow-y-auto border-r bg-white md:block ${collapsed ? "w-[60px]" : "w-[220px]"} lg:${collapsed ? "w-[60px]" : "w-[280px]"}`}
            >
                <div className="sticky top-0 p-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center justify-center w-full mb-4 p-2 border rounded-lg"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                    {/* prettier-ignore */}
                    <nav className="grid gap-2 text-sm font-medium">
                        {(tl || admin || agent) && <NavItem href="/dashboard/create" icon={UserPlus} label="Create New Lead" collapsed={collapsed} />}
                        {( indiv || dsa || subdsa ) && <NavItem href="/dashboard/patner_create" icon={UserPlus} label="Create New Lead" collapsed={collapsed} />}
                        {(tl || admin || agent) && <NavItem href="/dashboard/myleads" icon={Library} label="My Leads" collapsed={collapsed} />}
                        {( indiv || dsa || subdsa ) && <NavItem href="/dashboard/partner_leads" icon={Library} label="Partner Leads" collapsed={collapsed} />}
                        {(tl || admin) && <NavItem href="/dashboard/team_leads" icon={BookUser} label="Team Leads" collapsed={collapsed} />}
                        {(tl || admin || agent) && <NavItem href="/dashboard/search" icon={Search} label="Search" collapsed={collapsed} />}
                        {admin && <NavItem href="/dashboard/reports" icon={LineChart} label="Reports" collapsed={collapsed} />}
                        {(admin || hr) && <NavItem href="/dashboard/register" icon={Users} label="Agents" collapsed={collapsed} />}
                        {(dsa) && <NavItem href="/dashboard/partner_dsa" icon={Users} label="Agents" collapsed={collapsed} />}
                        {admin && <NavItem href="/dashboard/database" icon={Database} label="Database" collapsed={collapsed} />}
                        {(tl || admin || hr) && <NavItem href="/dashboard/attendance" icon={UserRound} label="Attendance" collapsed={collapsed} />}
                        {(tl || admin || tech) && <NavItem href="/dashboard/agent_attendance" icon={UserRound} label="My Attendance" collapsed={collapsed} />}
                        {(tl || admin || qa) && <NavItem href="/dashboard/export" icon={Download} label="Export" collapsed={collapsed} />}
                    </nav>
                </div>
            </aside>
            <main className={`flex-1 overflow-y-auto ${shouldAddPadding ? "p-4" : ""}`}>
                <Suspense>{children}</Suspense>
            </main>
        </div>
    );
}
