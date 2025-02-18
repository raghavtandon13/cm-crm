"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import fromAPI from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterationForm() {
    const user = useUser();
    const router = useRouter();
    if (user?.role.title === "OE") {
        router.push(`/dashboard/create`);
    }

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fromAPI.post("/agents/create", formData);

            if (response.data.status === "success") {
                toast("Agent created successfully");
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                });
                // here i want to clear teh form
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-[90vh] flex-col items-center justify-between pt-24 sm:p-24">
            <div className="mx-auto max-w-sm">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="bg-transparent">
                        <TabsTrigger value="account">Agent</TabsTrigger>
                        <TabsTrigger value="password">DSA</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <Card className="mx-auto max-w-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Create Agent Account</CardTitle>
                                <CardDescription>Enter your information to create an account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="firstName">First name</Label>
                                                <Input
                                                    id="firstName"
                                                    placeholder="Priya"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="lastName">Last name</Label>
                                                <Input
                                                    id="lastName"
                                                    placeholder="Sharma"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? "Creating account..." : "Create Agent"}
                                        </Button>
                                    </div>
                                </form>
                                {/* <div className="mt-4 text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline">
                                        Log in
                                    </Link>
                                </div> */}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="password">
                        <Card className="mx-auto max-w-sm">
                            <CardHeader>
                                <CardTitle className="text-xl">Create DSA Account (DEMO!)</CardTitle>
                                <CardDescription>Enter your information to create an account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="firstName">First name</Label>
                                                <Input
                                                    id="firstName"
                                                    placeholder="Priya"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="lastName">Last name</Label>
                                                <Input
                                                    id="lastName"
                                                    placeholder="Sharma"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? "Creating account..." : "Create DSA"}
                                        </Button>
                                    </div>
                                </form>
                                {/* <div className="mt-4 text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline">
                                        Log in
                                    </Link>
                                </div> */}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
