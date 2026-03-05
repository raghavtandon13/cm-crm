"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UserSearch({ phone }: { phone: string }) {
    const handleSubmit = (e: any) => {
        e.preventDefault();
        const phoneNumber = e.target[0].value;
        window.location.href = `?phone=${phoneNumber}`;
    };

    return (
        <form className="w-full items-center justify-center  pt-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    className="flex-[6] bg-white py-2 sm:py-1"
                    defaultValue={phone}
                    maxLength={10}
                    pattern="\d{10}"
                    placeholder="Search Phone Number"
                    type="tel"
                />
                <Button className="flex-[1]" variant="default">
                    Search
                </Button>
            </div>
        </form>
    );
}
