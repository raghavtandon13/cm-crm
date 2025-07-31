"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import fromAPI from "@/lib/api";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Shared Form Component
function UserForm({
    onSubmit,
    loading,
    formData,
    setFormData,
    submitLabel,
}: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    loading: boolean;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    submitLabel: string;
}) {
    return (
        <form onSubmit={onSubmit}>
            <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            placeholder="Priya"
                            value={formData.firstName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            placeholder="Sharma"
                            value={formData.lastName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
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
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}

function AgentForm() {
    const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fromAPI.post("/agents/create", formData);
            if (res.data.status === "success") {
                toast("Agent created successfully");
                setFormData({ firstName: "", lastName: "", email: "", password: "" });
            }
        } catch (err) {
            toast("Error creating agent");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Create Agent Account</CardTitle>
                <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
                <UserForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    formData={formData}
                    setFormData={setFormData}
                    submitLabel="Create Agent"
                />
            </CardContent>
        </Card>
    );
}

function DsaForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "INDIV", // default role
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            role: formData.role,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
        };

        try {
            const res = await fromAPI.post("/partner/create", payload);
            if (res.data.status === "success") {
                toast("DSA created successfully");
                setFormData({ firstName: "", lastName: "", email: "", password: "", role: "INDIV" });
            }
        } catch (err) {
            toast("Error creating DSA");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">Create DSA Account</CardTitle>
                <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Label className="mb-1 block">Select Role</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full text-left">
                                {formData.role === "INDIV" ? "INDIV (Individual)" : "DSA"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuCheckboxItem
                                checked={formData.role === "INDIV"}
                                onCheckedChange={() => setFormData((prev) => ({ ...prev, role: "INDIV" }))}
                            >
                                INDIV
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={formData.role === "DSA"}
                                onCheckedChange={() => setFormData((prev) => ({ ...prev, role: "DSA" }))}
                            >
                                DSA
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <UserForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    formData={formData}
                    setFormData={setFormData}
                    submitLabel="Create DSA"
                />
            </CardContent>
        </Card>
    );
}

export default function RegisterationForm() {
    const router = useRouter();
    const user = useUser();
    if (user?.role.title === "OE") {
        router.push("/dashboard/create");
    }

    return (
        <main className="flex min-h-[90vh] flex-col items-center justify-between pt-24 sm:p-24">
            <div className="mx-auto max-w-sm w-full">
                <Tabs defaultValue="agent" className="w-full">
                    <TabsList className="bg-transparent w-full justify-center">
                        <TabsTrigger value="agent">Agent</TabsTrigger>
                        <TabsTrigger value="dsa">DSA</TabsTrigger>
                    </TabsList>
                    <TabsContent value="agent">
                        <AgentForm />
                    </TabsContent>
                    <TabsContent value="dsa">
                        <DsaForm />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}
