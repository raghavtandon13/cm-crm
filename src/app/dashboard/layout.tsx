"use client";
import { useUser } from "@/context/UserContext";
import { DASHBOARD_ROUTES, RoleTitle } from "@/lib/roles";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
                    <nav className="grid gap-2 text-sm font-medium">
                        {DASHBOARD_ROUTES.filter(
                            (route) => route.showInSidebar && route.roles.includes(user?.role.title as RoleTitle),
                        ).map((route) => (
                            <NavItem
                                key={route.path}
                                href={route.path}
                                icon={route.icon}
                                label={route.label}
                                collapsed={collapsed}
                            />
                        ))}
                    </nav>
                </div>
            </aside>
            <main className={`flex-1 overflow-y-auto ${shouldAddPadding ? "p-4" : ""}`}>
                <Suspense>{children}</Suspense>
            </main>
        </div>
    );
}
