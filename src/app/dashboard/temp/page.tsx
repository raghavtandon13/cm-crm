"use client";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const uploadCsv = async ({ file, aggType }: { file: File; aggType: "smartcoin" | "moneyview" | "phone" }) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/temp", { method: "POST", headers: { "x-agg-type": aggType }, body: formData });
    if (!res.ok) throw new Error(await res.text());

    const aggCount = res.headers.get("agg-count");
    const blob = await res.blob();

    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${aggType}-output.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return { aggCount: aggCount ? aggCount : 0 };
};

type AggType = "smartcoin" | "moneyview" | "phone";

export default function TempPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [aggType, setAggType] = useState<AggType>("smartcoin");

    const uploadMutation = useMutation({
        mutationFn: uploadCsv,
        onSuccess: (data) => {
            toast.success(`CSV processed successfully! Found ${data.aggCount} IDs`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to upload CSV");
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.name.endsWith(".csv")) {
            setFile(selectedFile);
        } else if (selectedFile) {
            toast.error("Please select a valid CSV file");
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.name.endsWith(".csv")) {
            setFile(droppedFile);
        } else if (droppedFile) {
            toast.error("Please drop a valid CSV file");
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadMutation.mutate({ file, aggType });
        }
    };

    const progress = uploadMutation.isPending ? 75 : 0;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        CSV Upload
                    </CardTitle>
                    <CardDescription>
                        Upload a CSV file containing an &apos;ids&apos; column
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* File Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"} `}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center gap-4 pointer-events-none">
                            {file ? (
                                <>
                                    <FileText className="h-12 w-12 text-green-600" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-gray-400" />
                                    <div>
                                        <p className="font-medium">Drag & drop a CSV here or click to browse</p>
                                        <p className="text-sm text-gray-500">Only CSV files are accepted</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    {/* Upload Progress */}
                    {uploadMutation.isPending && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Processing CSV...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    )}

                    {/* Status Messages */}
                    {/* {uploadMutation.isSuccess && ( */}
                    {/*     <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg"> */}
                    {/*         <CheckCircle className="h-5 w-5 text-green-600" /> */}
                    {/*         <div> */}
                    {/*             <p className="font-medium text-green-800">Upload Successful</p> */}
                    {/*             <p className="text-sm text-green-600">Processed {add r.headers.get("agg-count") here} IDs</p> */}
                    {/*         </div> */}
                    {/*     </div> */}
                    {/* )} */}

                    {uploadMutation.isSuccess && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">Upload Successful</p>
                                <p className="text-sm text-green-600">
                                    Processed {uploadMutation.data?.aggCount ?? 0} records
                                </p>
                            </div>
                        </div>
                    )}

                    {uploadMutation.isError && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-800">Upload Failed</p>
                                <p className="text-sm text-red-600">
                                    {uploadMutation.error instanceof Error
                                        ? uploadMutation.error.message.includes("Data should not be empty")
                                            ? "Nothing Found"
                                            : uploadMutation.error.message
                                        : "Unknown error occurred"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex justify-end gap-2">
                        <div className="flex items-center gap-2">
                            <Select
                                value={aggType}
                                onValueChange={(value) => setAggType(value as AggType)}
                                disabled={uploadMutation.isPending}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select aggregation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="smartcoin">Smartcoin</SelectItem>
                                    <SelectItem value="moneyview">MoneyView</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {file && (
                            <Button onClick={() => setFile(null)} variant="outline" disabled={uploadMutation.isPending}>
                                Clear
                            </Button>
                        )}
                        <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
                            {uploadMutation.isPending ? "Processing..." : "Upload CSV"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
