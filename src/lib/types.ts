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
    consent?: string;
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
    passwordUpdated?: boolean;
    active: boolean;
}

//  FIX: add more stuff to Lead Type example Income

export type Lead = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    dob: string;
    gender: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
    empType: "Salaried" | "Self-employed" | "No-employment";
    company: string;
    salary: string;
    pan: string;
};

export type Assignment = {
    id: string;
    cmUserId: string;
    agentId: string;
    assignedAt: Date;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
    agent: Agent;
};
