"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import fromAPI from "@/lib/api";
import { useState } from "react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [yay, setYay] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(false);
        setYay(false);

        try {
            const response = await fromAPI.post("/auth/login", { email: email, pass: password });
            if (response.data.status === "success") {
                setYay(true);
                window.location.href = "/dashboard";
            }
        } catch (error: any) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="flex min-h-[90vh] flex-col items-center justify-between pt-24 sm:p-24">
            <form onSubmit={handleSubmit}>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Enter your email below to login to your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    {error && (
                        <div className="mb-4 flex items-center justify-center">
                            <span className="text-sm text-red-500">Invalid Email or Password</span>
                        </div>
                    )}

                    {yay && (
                        <div className="mb-4 flex items-center justify-center">
                            <span className="text-sm text-green-600">Login Successful !!!</span>
                        </div>
                    )}
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </main>
    );
}
