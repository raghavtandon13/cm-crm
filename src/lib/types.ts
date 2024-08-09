import { Document } from "mongoose";

export interface CMUser extends Document {
    name?: string;
    phone: string;
    accounts: Record<string, any>[];
    role: "ADMIN" | "USER";
    pan?: string;
    dob?: string;
    email?: string;
    addr?: string;
    city?: string;
    state?: string;
    category?: string;
    gender?: string;
    employment: "Salaried" | "Self-employed" | "No-employment";
    company_name?: string;
    income?: string;
    loan_required?: string;
    credit_required?: string;
    partner?: string;
    partnerSent?: boolean;
    residence_type?: string;
    phoneOtp?: string;
    pincode?: string;
    phoneOtpExpire?: Date;
    detailsFilled: boolean;
    eformFilled: boolean;
    isBanned: boolean;
    google?: GoogleInfo;
    createdAt: Date;
    updatedAt: Date;
}

interface GoogleInfo {
    id?: string;
    email?: string;
    name?: string;
}

// types.ts
export interface Role {
    id: string;
    title: string;
    features: any[];
}

export interface Agent {
    id: string;
    email: string;
    name?: string;
    roleId: string;
    role: Role;
    tempAccess: any[];
    createdAt: string;
    updatedAt: string;
}
