"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
                    type="tel"
                    pattern="\d{10}"
                    maxLength={10}
                    className="flex-[6] bg-white py-2 sm:py-1"
                    placeholder="Search Phone Number"
                    defaultValue={phone}
                />
                <Button className="flex-[1]" variant="default">
                    Search
                </Button>
            </div>
        </form>
    );
}
