import Image from "next/image";
import Link from "next/link";
import UserProfile from "./role";
import { Button } from "@/components/ui/button";
import { Menu, Home, LineChart, Package, ShoppingCart, Users, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
    return (
        <header className="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6">
            <nav className="w-full flex-col justify-between gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/" className="flex items-center gap-2 text-xl">
                    <Image className="rounded" src="/cred.svg" alt="Credmantra Logo" width={100} height={36} priority />
                    Agent Portal
                </Link>
                <div className="hidden md:flex">
                    <UserProfile />
                </div>
            </nav>
            <Sheet>
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
                        <Link href="#" className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 transition-all">
                            <UserPlus className="h-4 w-4" />
                            Create New Lead
                        </Link>
                        <Link href="#" className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 transition-all">
                            <ShoppingCart className="h-4 w-4" />
                            My Leads
                        </Link>
                        <Link href="#" className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 transition-all">
                            <Package className="h-4 w-4" />
                            Search
                        </Link>
                        <Link href="#" className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 transition-all">
                            <LineChart className="h-4 w-4" />
                            Reports
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}
