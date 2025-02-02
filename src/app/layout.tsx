import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { connectToMongoDB } from "../../lib/db";
import { UserProvider } from "@/context/UserContext";
import Providers from "@/context/Query";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CM Agent Portal",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    connectToMongoDB();
    return (
        <html lang="en">
            <body className={`${inter.className} flex h-screen flex-col`}>
                <Providers>
                    <UserProvider>
                        <Navbar />
                        <div className="flex-1 overflow-hidden">{children}</div>
                        <Toaster richColors />
                    </UserProvider>
                </Providers>
            </body>
        </html>
    );
}
