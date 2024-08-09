"use client";
import fromAPI from "@/lib/api";
import { useEffect, useState } from "react";
import { Agent } from "@/lib/types";
import { Button, buttonVariants } from "./ui/button";
import { Power } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function UserProfile() {
    const [user, setUser] = useState<Agent | null>(null);

    const handleLogout = async () => {
        try {
            const response = await fromAPI.get("/agents/logout");
            if (response.data.status === "success") {
                window.location.href = "/";
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fromAPI.get("/agents/get");
                setUser(response.data);
            } catch {}
        };

        fetchUserData();
    }, []);

    return (
        user && (
            <>
                <div className="flex items-center justify-center gap-5">
                    <p>
                        <span className="text-gray-500">Username: </span>
                        {user.name}
                    </p>
                    <p>
                        <span className="text-gray-500">Access:</span>
                        {user.role.title}
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="mx-2" size="icon" variant="outline">
                            <Power className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to log out?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout} className={buttonVariants({ variant: "destructive" })}>
                                Log Out
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    );
}
