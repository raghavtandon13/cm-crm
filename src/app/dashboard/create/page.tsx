"use client";

import { FormField } from "@/components/formField";
import { Button } from "@/components/ui/button";
import fromAPI from "@/lib/api";
import { CMUser, Lead } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";

export default function Create() {
    const phone = useSearchParams().get("phone");
    const router = useRouter();
    const [inject, setInject] = useState<boolean | undefined>(true);

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

    const { mutate, isPending } = useMutation({
        mutationFn: (data: Lead & { inject?: boolean }) => {
            return fromAPI.post("/agents/cmuser", data);
        },
        onSuccess: (_, data: Lead) => {
            toast(phone ? "User updated successfully" : "User created successfully");
            console.log("done");
            !!inject
                ? router.push(`/dashboard/search?accountsOnly=true&phone=${data.phone}`)
                : router.push(`/dashboard/search?phone=${data.phone}`);
        },
        onError: (error:any) => {
            console.error("Error creating lead:", error);
            toast.error(error.response.data.message || "Error creating lead");
        },
    });

    const onSubmit: SubmitHandler<any> = (data) => {
        mutate({ ...data, inject });
    };

    return (
        <>
            <h1 className="mx-2 mt-0 text-xl font-semibold sm:mx-8 sm:mt-8">
                {phone ? "Edit Existing Lead" : "Create New Lead"}
            </h1>
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
                            rules={{
                                required: "PAN is required",
                            }}
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
                                onClick={() => setInject(false)} // Set inject to false for "Save"
                            >
                                Save
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
        </>
    );
    // }
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
