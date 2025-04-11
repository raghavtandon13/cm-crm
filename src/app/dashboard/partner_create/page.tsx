"use client";

import { FormField } from "@/components/formField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/otp";
import { Progress } from "@/components/ui/progress";
import fromAPI from "@/lib/api";
import { CMUser, Lead } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, File } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import Papa from "papaparse";
import { read, utils } from "xlsx";

export default function Create() {
    const phone = useSearchParams().get("phone");
    const router = useRouter();
    const [inject, setInject] = useState<boolean | undefined>(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [leadData, setLeadData] = useState<Lead | null>(null);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false); // State for CSV dialog
    const [progress, setProgress] = useState(0);

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
            router.push(`/dashboard/partner_leads`);
            // !!inject
            //     ? router.push(`/dashboard/search?accountsOnly=true&phone=${data.phone}`)
            //     : router.push(`/dashboard/search?phone=${data.phone}`);
        },
        onError: (error: any) => {
            console.error("Error creating lead:", error);
            toast.error(error.response.data.message || "Error creating lead");
        },
    });

    const handleSubmitCSV = async () => {
        const fileInput = document.getElementById("csvfile") as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const fileType = file.name.split(".").pop()?.toLowerCase();

            if (fileType === "csv") {
                Papa.parse(file, {
                    complete: (result: any) => {
                        const headers = result.data[0]; // Extract headers
                        const chunkSize = 1000; // Each chunk will have one lead
                        const chunks = [];
                        for (let i = 1; i < result.data.length; i += chunkSize) {
                            chunks.push([headers, ...result.data.slice(i, i + chunkSize)]);
                        }

                        setProgress(0);

                        uploadNextChunk(chunks, 0);
                    },
                });
            } else if (fileType === "xlsx") {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
                    console.log(jsonData);

                    const headers = jsonData[0]; // Extract headers
                    const chunkSize = 1; // Each chunk will have one lead
                    const chunks = [];
                    for (let i = 1; i < jsonData.length; i += chunkSize) {
                        chunks.push([headers, ...jsonData.slice(i, i + chunkSize)]);
                    }

                    setProgress(0);

                    uploadNextChunk(chunks, 0);
                };
                reader.readAsArrayBuffer(file);
            } else {
                toast.error("Unsupported file type");
            }
        }
    };

    const uploadNextChunk = async (chunks: string[][], index: number) => {
        if (index < chunks.length) {
            try {
                const csvString = Papa.unparse(chunks[index]); // Convert chunk to CSV string
                const formData = new FormData();
                formData.append("file", new Blob([csvString], { type: "text/csv" }), "chunk.csv");
                await fromAPI.post("/partner/cmuser/csv", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setProgress(((index + 1) / chunks.length) * 100);

                uploadNextChunk(chunks, index + 1);
            } catch (error) {
                console.error("Error uploading chunk:", error);
                toast.error("Error uploading chunk");
            }
        } else {
            toast.success("CSV uploaded successfully");
            router.push("/dashboard/partner_leads");
        }
    };

    return (
        <>
            <div className="flex justify-between align-middle mt-4">
                <h1 className="mx-2 mt-0 text-xl font-semibold sm:mx-8 sm:mt-0">{phone ? "Edit Existing Lead" : "Create New Lead"}</h1>
                {!isPhoneVerified && (
                    <Button className="mr-8" onClick={() => setIsCsvDialogOpen(true)}>
                        <File className="w-4 mr-2" />
                        Upload CSV
                    </Button>
                )}
            </div>

            <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload CSV</DialogTitle>
                        <DialogDescription>Please select a CSV or XLSX file to upload.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-row space-x-1">
                        <Input className="bg-white" id="csvfile" type="file" />
                        <DialogFooter>
                            <Button onClick={handleSubmitCSV}>Upload</Button>
                        </DialogFooter>
                    </div>
                    {progress > 0 && (
                        <>
                            {Math.round(progress)}%
                            <Progress value={progress} className="" />
                        </>
                    )}

                    {progress === 0 && (
                        <>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-gray-600 text-sm">
                                        <div className="flex">
                                            CSV Headers and Values
                                            <ChevronDown className="text-gray-600 w-4" />
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul>
                                            <li className="text-gray-600 text-sm">• firstName</li>
                                            <li className="text-gray-600 text-sm">• lastName</li>
                                            <li className="text-gray-600 text-sm">• phone</li>
                                            <li className="text-gray-600 text-sm">• email</li>
                                            <li className="text-gray-600 text-sm">• dob</li>
                                            <li className="text-gray-600 text-sm">• gender (MALE/FEMALE)</li>
                                            <li className="text-gray-600 text-sm">• address</li>
                                            <li className="text-gray-600 text-sm">• pincode</li>
                                            <li className="text-gray-600 text-sm">• city</li>
                                            <li className="text-gray-600 text-sm">• state</li>
                                            <li className="text-gray-600 text-sm">• empType (Salaried/Self-employed/No-employment)</li>
                                            <li className="text-gray-600 text-sm">• company</li>
                                            <li className="text-gray-600 text-sm">• salary</li>
                                            <li className="text-gray-600 text-sm">• pan</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </>
                    )}
                </DialogContent>
            </Dialog>
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
                            <FormField label="Address" name="address" control={control} errors={errors} placeholder="Enter your address" />
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
                            <FormField label="City" name="city" control={control} errors={errors} placeholder="Enter your city" />
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
                                <Button type="submit" className="w-full flex-1" disabled={isPending} onClick={() => setInject(false)}>
                                    {isPending ? (phone ? "Updating..." : "Creating...") : phone ? "Update Lead" : "Create Lead"}
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
