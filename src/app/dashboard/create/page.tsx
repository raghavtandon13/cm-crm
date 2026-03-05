"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/formField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/otp";
import fromAPI from "@/lib/api";
import type { CMUser, Lead } from "@/lib/types";

export default function Create() {
    const phone = useSearchParams().get("phone");
    const router = useRouter();
    const [inject, setInject] = useState<boolean | undefined>(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [leadData, setLeadData] = useState<Lead | null>(null);

    const {
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<Lead>();

    const { data: userData } = useQuery<Partial<Lead>>({
        queryKey: ["userData", phone],
        queryFn: async () => {
            const { data: cmudata } = await fromAPI.get<Partial<CMUser>>(`/users/${phone}`);
            if (cmudata === undefined) {
                throw new Error("could not fetch user");
            } else {
                const ldata: Partial<Lead> = {
                    firstName: cmudata.name?.split(" ")[0],
                    lastName: cmudata.name?.split(" ")[1],
                    phone: cmudata.phone,
                    email: cmudata.email,
                    dob: cmudata.dob,
                    gender: cmudata.gender,
                    address: cmudata.addr,
                    pincode: cmudata.pincode,
                    city: cmudata.city,
                    state: cmudata.state,
                    empType: cmudata.employment,
                    company: cmudata.company_name,
                    pan: cmudata.pan,
                    salary: cmudata.income,
                };
                return ldata;
            }
        },
        enabled: !!phone,
    });

    useEffect(() => {
        if (userData) {
            Object.entries(userData).forEach(([key, value]) => {
                setValue(key as keyof Lead, value);
            });
        }
    }, [userData, setValue]);

    const { mutate: sendOtp } = useMutation({
        mutationFn: (phone: string) => {
            return fromAPI.get(`/users/otp?phone=${phone}`);
        },
        onSuccess: () => {
            setIsDialogOpen(true);
            toast("OTP sent successfully");
        },
        onError: (error: any) => {
            console.error("Error sending OTP:", error);
            toast.error(error.response.data.message || "Error sending OTP");
        },
    });

    const { mutate: verifyOtp } = useMutation({
        mutationFn: ({ phone, otp }: { phone: string; otp: string }) => {
            return fromAPI.post("/users/otp", { phone, otp });
        },
        onSuccess: () => {
            if (leadData) {
                mutateLead(leadData);
            }
        },
        onError: (error: any) => {
            console.error("Error verifying OTP:", error);
            toast.error(error.response.data.message || "Error verifying OTP");
        },
    });

    const { mutate: mutateLead, isPending } = useMutation({
        mutationFn: (data: Lead & { inject?: boolean }) => {
            return fromAPI.post("/agents/cmuser", data);
        },
        onSuccess: (_, data: Lead) => {
            toast(phone ? "User updated successfully" : "User created successfully");
            inject ? router.push(`/dashboard/search?accountsOnly=true&phone=${data.phone}`) : router.push(`/dashboard/search?phone=${data.phone}`);
        },
        onError: (error: any) => {
            console.error("Error creating lead:", error);
            toast.error(error.response.data.message || "Error creating lead");
        },
    });

    const onSubmit: SubmitHandler<any> = (data) => {
        setLeadData({ ...data, inject });
        if (inject) {
            sendOtp(data.phone);
        } else {
            mutateLead(data);
        }
    };

    const handleOtpSubmit = () => {
        if (leadData) {
            verifyOtp({ phone: leadData.phone, otp });
        }
    };

    return (
        <>
            <h1 className="mx-2 mt-0 text-xl font-semibold sm:mx-8 sm:mt-8">{phone ? "Edit Existing Lead" : "Create New Lead"}</h1>
            <form className="mx-2 my-4 sm:mx-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={control}
                            errors={errors}
                            label="First name"
                            name="firstName"
                            placeholder="Priya"
                            rules={{ required: "First name is required" }}
                        />
                        <FormField
                            control={control}
                            errors={errors}
                            label="Last name"
                            name="lastName"
                            placeholder="Sharma"
                            rules={{ required: "Last name is required" }}
                        />
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={control}
                            errors={errors}
                            label="Phone"
                            name="phone"
                            placeholder="98XXXXXXXX"
                            rules={{
                                required: "Phone is required",
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: "Phone number must be a 10-digit number.",
                                },
                            }}
                        />
                        <FormField
                            control={control}
                            errors={errors}
                            label="Email"
                            name="email"
                            placeholder="m@example.com"
                            rules={{ required: "Email is required" }}
                            type="email"
                        />
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={control}
                            errors={errors}
                            label="Date of Birth"
                            name="dob"
                            rules={{ required: "Date of Birth is required" }}
                            type="date"
                        />
                        <FormField
                            control={control}
                            errors={errors}
                            label="Gender"
                            name="gender"
                            options={[
                                { value: "MALE", label: "Male" },
                                { value: "FEMALE", label: "Female" },
                            ]}
                            placeholder="Select your gender"
                            rules={{ required: "Gender is required" }}
                        />
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField control={control} errors={errors} label="Address" name="address" placeholder="Enter your address" />
                        <FormField
                            control={control}
                            errors={errors}
                            label="Pincode"
                            name="pincode"
                            placeholder="Enter your area's pincode"
                            rules={{
                                required: "Pincode is required",
                                pattern: { value: /^\d{6}$/, message: "Pincode must be a 6-digit number." },
                            }}
                        />
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField control={control} errors={errors} label="City" name="city" placeholder="Enter your city" />
                        <FormField
                            control={control}
                            errors={errors}
                            label="State"
                            name="state"
                            options={indiaStates.map((state) => ({ value: state, label: state }))}
                        />
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={control}
                            errors={errors}
                            label="Employment Type"
                            name="empType"
                            options={[
                                { value: "Salaried", label: "Salaried" },
                                { value: "Self-employed", label: "Self Employed" },
                                { value: "No-employment", label: "Non Employed" },
                            ]}
                            rules={{ required: "Employment Type is required" }}
                        />
                        <FormField control={control} errors={errors} label="Company Name" name="company" placeholder="Enter company name" />
                    </div>

                    <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={control}
                            errors={errors}
                            label="Salary"
                            name="salary"
                            placeholder="Enter Salary"
                            rules={{
                                required: "Salary is required",
                                pattern: { value: /^\d+$/, message: "Salary must be a number." },
                            }}
                        />

                        <FormField control={control} errors={errors} label="PAN" name="pan" placeholder="Enter PAN" rules={{ required: "PAN is required" }} />
                    </div>

                    <div className="mt-4 flex gap-4">
                        <div className="hidden w-1/2 sm:flex"></div>
                        <div className="flex w-full gap-4 sm:w-1/2">
                            <Button
                                className="w-full flex-1"
                                onClick={() =>
                                    reset({
                                        firstName: "",
                                        lastName: "",
                                        phone: "",
                                        email: "",
                                        dob: "",
                                        address: "",
                                        pincode: "",
                                        city: "",
                                        company: "",
                                    })
                                }
                                type="button"
                                variant="destructive"
                            >
                                Reset
                            </Button>
                            <Button className="w-full flex-1" onClick={() => setInject(false)} type="submit">
                                Save
                            </Button>
                            <Button className="w-full flex-1" disabled={isPending} onClick={() => setInject(true)} type="submit">
                                {isPending ? (phone ? "Updating..." : "Creating...") : phone ? "Update Lead" : "Create Lead"}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter OTP</DialogTitle>
                        <DialogDescription>Please enter the OTP sent to your phone number.</DialogDescription>
                    </DialogHeader>
                    <InputOTP maxLength={6} onChange={setOtp}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    <DialogFooter>
                        <Button onClick={handleOtpSubmit}>Verify OTP</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

const indiaStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
    "Ladakh",
    "Jammu and Kashmir",
];
