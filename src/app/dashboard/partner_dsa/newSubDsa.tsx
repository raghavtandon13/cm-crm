"use client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import fromAPI from "@/lib/api";

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
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Priya"
                            required
                            value={formData.firstName}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Sharma"
                            required
                            value={formData.lastName}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                        placeholder="m@example.com"
                        required
                        type="email"
                        value={formData.email}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
                        required
                        type="password"
                        value={formData.password}
                    />
                </div>
                <Button className="w-full" disabled={loading} type="submit">
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
            <UserForm formData={formData} loading={loading} onSubmit={handleSubmit} setFormData={setFormData} submitLabel="Create Sub DSA" />
        </div>
    );
}

export default function NewSubDsa() {
    const router = useRouter();
    const user = useUser();

    const [dialogOpen, setDialogOpen] = useState(false);

    if (user?.role?.title === "OE") {
        router.push("/dashboard/create");
    }

    const handleSuccess = () => {
        setDialogOpen(false);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Sub DSA Management</h1>

                <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create New Sub DSA
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Sub DSA Account</DialogTitle>
                            <DialogDescription>Enter the information below to create a new Sub DSA account.</DialogDescription>
                        </DialogHeader>
                        <SubDsaForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
