"use client";

import { FormField } from "@/components/formField";
import { Button } from "@/components/ui/button";
import fromAPI from "@/lib/api";
import { CMUser, Lead } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";

export default function Create() {
    const phone = useSearchParams().get("phone");

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
                };
                console.log(ldata);
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
    }, [userData]);

    const mutation = useMutation({
        mutationFn: (data: Lead) => {
            return fromAPI.post("https://api.example.com/leads", data);
        },
        onSuccess: () => {
            toast(phone ? "User updated successfully" : "User created successfully");
            reset();
        },
        onError: (error) => console.error("Error creating lead:", error),
    });

    const onSubmit: SubmitHandler<Lead> = (data) => {
        mutation.mutate(data);
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
                            rules={{ required: "Address is required" }}
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
                            rules={{ required: "City is required" }}
                            placeholder="Enter your city"
                        />
                        <FormField
                            label="State"
                            name="state"
                            errors={errors}
                            control={control}
                            rules={{ required: "State is required" }}
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
                            rules={{ required: "Company Name is required" }}
                            placeholder="Enter company name"
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
                            <Button type="submit" className="w-full flex-1" disabled={mutation.isPending}>
                                {mutation.isPending
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
