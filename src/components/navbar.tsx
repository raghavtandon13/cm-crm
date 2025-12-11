"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/context/UserContext";
import { DASHBOARD_ROUTES, RoleTitle } from "@/lib/roles";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UserProfile from "./role";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
    const [open, setOpen] = useState(false);
    const path = usePathname();
    const user = useUser();

    return (
        <header className="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6">
            <nav className="w-full flex-col justify-between gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/" className="flex items-center gap-2 text-xl">
                    <Image className="rounded" src="/cred.svg" alt="Credmantra Logo" width={100} height={36} priority />
                    Portal
                </Link>
                <div className="hidden md:flex">
                    <UserProfile />
                </div>
            </nav>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="ml-auto md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <nav className="grid gap-6 text-lg font-medium">
                        <UserProfile />
                        <hr />
                        {DASHBOARD_ROUTES.filter(
                            (route) =>
                                route.showInSidebar &&
                                (user?.role?.title ? route.roles.includes(user.role.title as RoleTitle) : false),
                        ).map((route) => (
                            <Link
                                key={route.path}
                                href={route.path}
                                onClick={() => setOpen(false)}
                                className={`${path === route.path ? "bg-slate-200" : "hover:bg-muted"} flex items-center gap-3 rounded-lg px-3 py-2 transition-all`}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}
