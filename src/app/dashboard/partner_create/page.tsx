"use client";

import fromAPI from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CMUser, Lead } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/formField";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/otp";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

export default function Create() {
    const phone = useSearchParams().get("phone");
    const router = useRouter();
    const [inject, setInject] = useState<boolean | undefined>(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [leadData, setLeadData] = useState<Lead | null>(null);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isOTP, setIsOTP] = useState(false);

    const {
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm<Lead>();

    // fetch cmuser
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

    // setting values
    useEffect(() => {
        if (userData) {
            Object.entries(userData).forEach(([key, value]) => {
                setValue(key as keyof Lead, value);
            });
        }
    }, [userData, setValue]);

    // dedupe check
    const onPhoneSubmit: SubmitHandler<any> = (data) => dedupeCheck(data.phone);
    const { mutate: dedupeCheck } = useMutation({
        mutationFn: (phone: string) => fromAPI.post("/partner/cmuser/dedupe-check", { phone }),
        onSuccess: (res) => {
            if (res.data.status === "success") {
                toast.success("New Lead");
                setIsPhoneVerified(true);
            } else {
                setIsPhoneVerified(false);
                toast.error("Duplicate lead found");
            }
        },
        onError: (error: any) => {
            console.error("Error during dedupe check:", error);
            toast.error(error.response.data.message);
        },
    });

    // send  otp
    const onSubmit: SubmitHandler<any> = (data) => {
        setLeadData({ ...data, inject });
        sendOtp(data.phone);
    };
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

    // verify otp
    const handleOtpSubmit = () => {
        setIsOTP(true);
        if (leadData) {
            verifyOtp({ phone: leadData.phone, otp });
        }
    };
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

    // create cmuser
    const { mutate: mutateLead, isPending } = useMutation({
        mutationFn: (data: Lead & { inject?: boolean }) => {
            return fromAPI.post("/partner/cmuser", data);
        },
        onSuccess: (_, data: Lead) => {
            toast(phone ? "User updated successfully" : "User created successfully");
            setIsDialogOpen(false);
            reset();
            // router.push(`/dashboard/partner_leads`);
            !!inject
                ? router.push(`/dashboard/partner_search?accountsOnly=true&phone=${data.phone}`)
                : router.push(`/dashboard/partner_search?phone=${data.phone}`);
        },
        onError: (error: any) => {
            console.error("Error creating lead:", error);
            toast.error(error.response.data.message || "Error creating lead");
        },
    });

    return (
        <>
            <div className="flex justify-between align-middle mt-4">
                <h1 className="mx-2 mt-0 text-xl font-semibold sm:mx-8 sm:mt-0">
                    {phone ? "Edit Existing Lead" : "Create New Lead"}
                </h1>
            </div>

            {!isPhoneVerified ? (
                <form onSubmit={handleSubmit(onPhoneSubmit)} className="mx-2 my-4 sm:mx-8">
                    <div className="grid gap-4">
                        <FormField
                            className="w-[350px]"
                            label="Phone"
                            name="phone"
                            errors={errors}
                            control={control}
                            rules={{
                                required: "Phone is required",
                                pattern: {
                                    value: /^\d{10}$/,
                                    message: "Phone number must be a 10-digit number.",
                                },
                            }}
                            placeholder="98XXXXXXXX"
                        />
                        <Button type="submit" className="w-[100px] flex-1">
                            Next
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mx-2 my-4 sm:mx-8">
                    <div className="grid gap-4">
                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                label="First name"
                                name="firstName"
                                control={control}
                                errors={errors}
                                rules={{ required: "First name is required" }}
                                placeholder="Priya"
                            />
                            <FormField
                                label="Last name"
                                name="lastName"
                                control={control}
                                errors={errors}
                                rules={{ required: "Last name is required" }}
                                placeholder="Sharma"
                            />
                        </div>

                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                disabled
                                label="Phone"
                                name="phone"
                                errors={errors}
                                control={control}
                                rules={{
                                    required: "Phone is required",
                                    pattern: { value: /^\d{10}$/, message: "Phone number must be a 10-digit number." },
                                }}
                                placeholder="98XXXXXXXX"
                            />
                            <FormField
                                label="Email"
                                name="email"
                                control={control}
                                errors={errors}
                                rules={{ required: "Email is required" }}
                                type="email"
                                placeholder="m@example.com"
                            />
                        </div>

                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                label="Date of Birth"
                                name="dob"
                                control={control}
                                errors={errors}
                                rules={{ required: "Date of Birth is required" }}
                                type="date"
                            />
                            <FormField
                                label="Gender"
                                name="gender"
                                control={control}
                                errors={errors}
                                placeholder="Select your gender"
                                rules={{ required: "Gender is required" }}
                                options={[
                                    { value: "MALE", label: "Male" },
                                    { value: "FEMALE", label: "Female" },
                                ]}
                            />
                        </div>

                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                label="Address"
                                name="address"
                                control={control}
                                errors={errors}
                                placeholder="Enter your address"
                            />
                            <FormField
                                label="Pincode"
                                name="pincode"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Pincode is required",
                                    pattern: { value: /^\d{6}$/, message: "Pincode must be a 6-digit number." },
                                }}
                                placeholder="Enter your area's pincode"
                            />
                        </div>

                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                label="City"
                                name="city"
                                control={control}
                                errors={errors}
                                placeholder="Enter your city"
                            />
                            <FormField
                                label="State"
                                name="state"
                                errors={errors}
                                control={control}
                                options={indiaStates.map((state) => ({ value: state, label: state }))}
                            />
                        </div>

                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                label="Employment Type"
                                name="empType"
                                control={control}
                                errors={errors}
                                rules={{ required: "Employment Type is required" }}
                                options={[
                                    { value: "Salaried", label: "Salaried" },
                                    { value: "Self-employed", label: "Self Employed" },
                                    { value: "No-employment", label: "Non Employed" },
                                ]}
                            />
                            <FormField
                                label="Company Name"
                                name="company"
                                control={control}
                                errors={errors}
                                placeholder="Enter company name"
                            />
                        </div>

                        <div className="grid grid-rows-1 gap-4 sm:grid-cols-2">
                            <FormField
                                label="Salary"
                                name="salary"
                                control={control}
                                errors={errors}
                                rules={{
                                    required: "Salary is required",
                                    pattern: { value: /^\d+$/, message: "Salary must be a number." },
                                }}
                                placeholder="Enter Salary"
                            />

                            <FormField
                                label="PAN"
                                name="pan"
                                control={control}
                                errors={errors}
                                rules={{ required: "PAN is required" }}
                                placeholder="Enter PAN"
                            />
                        </div>

                        <div className="mt-4 flex gap-4">
                            <div className="hidden w-1/2 sm:flex"></div>
                            <div className="flex w-full gap-4 sm:w-1/2">
                                <Button
                                    type="button"
                                    variant="destructive"
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
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full flex-1"
                                    disabled={isPending}
                                    onClick={() => setInject(true)}
                                >
                                    {isPending
                                        ? phone
                                            ? "Updating..."
                                            : "Creating..."
                                        : phone
                                          ? "Update Lead"
                                          : "Create Lead"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        <Button disabled={isOTP} onClick={handleOtpSubmit}>
                            Verify OTP
                        </Button>
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
