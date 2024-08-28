"use client";
import fromAPI from "@/lib/api";
import { useUser } from "@/context/UserContext";
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
import { useState } from "react";
import { Checkbox } from "./ui/checkbox";

export default function UserProfile() {
    const user = useUser();
    const [confirm, setConfirm] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await fromAPI.get(`/agents/logout?confirmLogout=${confirm}`);
            if (response.data.status === "success") {
                window.location.href = "/";
            }
        } catch (err) {
            console.log(err);
        }
    };

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
                            <AlertDialogDescription>
                                <div className="flex items-center">
                                    Mark logout time?
                                    <Checkbox
                                        className="ml-2"
                                        onCheckedChange={() => {
                                            setConfirm(!confirm);
                                        }}
                                    />
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleLogout}
                                className={buttonVariants({ variant: "destructive" })}
                            >
                                Log Out
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    );
}
