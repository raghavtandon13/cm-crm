"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import fromAPI from "@/lib/api";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

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

function SubDsaForm({ onSuccess }: { onSuccess?: () => void }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "SUBDSA", // fixed role
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
                toast("Sub DSA created successfully");
                setFormData({ firstName: "", lastName: "", email: "", password: "", role: "SUBDSA" });
                onSuccess?.();
            }
        } catch (err) {
            toast("Error creating Sub DSA");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <UserForm
                onSubmit={handleSubmit}
                loading={loading}
                formData={formData}
                setFormData={setFormData}
                submitLabel="Create Sub DSA"
            />
        </div>
    );
}

export default function NewSubDsa() {
    const router = useRouter();
    const user = useUser();
    const [dialogOpen, setDialogOpen] = useState(false);

    if (user?.role.title === "OE") {
        router.push("/dashboard/create");
    }

    const handleSuccess = () => {
        setDialogOpen(false);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Sub DSA Management</h1>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Sub DSA
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Sub DSA Account</DialogTitle>
                            <DialogDescription>
                                Enter the information below to create a new Sub DSA account.
                            </DialogDescription>
                        </DialogHeader>
                        <SubDsaForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
