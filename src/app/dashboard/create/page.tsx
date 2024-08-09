"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function create() {
    const submit = () => {};
    return (
        <>
            <h1 className="mx-2 mt-0 text-xl font-semibold sm:mx-8 sm:mt-8">Create New Lead</h1>
            <form onSubmit={submit} className="mx-2 my-4 sm:mx-8">
                <div className="grid gap-4">
                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" placeholder="Priya" required className="bg-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" placeholder="Sharma" required className="bg-white" />
                        </div>
                    </div>
                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" placeholder="98XXXXXXXX" required className="bg-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required className="bg-white" />
                        </div>
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" required className="bg-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select Your Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" placeholder="Enter your address" required className="bg-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" pattern="\d{6}" placeholder="Enter your area's pincode" required className="bg-white" />
                        </div>
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="Enter your city" required className="bg-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" placeholder="Select your state" required className="bg-white" />
                        </div>
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="empType">Employment Type</Label>
                            <Input id="empType" placeholder="Select your employment type" required className="bg-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">Company Name</Label>
                            <Input id="company" placeholder="Enter company name" required className="bg-white" />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                        <div className="hidden w-1/2 sm:flex"></div>
                        <div className="flex w-full gap-4 sm:w-1/2">
                            <Button type="reset" variant={"destructive"} className="w-full flex-1">
                                Reset
                            </Button>
                            <Button type="submit" className="w-full flex-1">
                                Create Lead
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
