// lib/db.ts

import { PrismaClient } from "@prisma/client";

import mongoose, { Connection } from "mongoose";
let cachedConnection: Connection | null = null;
let cachedConnectionLS: Connection | null = null;

declare global {
    var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

export async function connectToMongoDB() {
    if (cachedConnection) {
        return cachedConnection;
    }
    try {
        const cnx = await mongoose.connect(process.env.MONGODB_URI!);
        cachedConnection = cnx.connection;
        return cachedConnection;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function connectToLS() {
    if (cachedConnectionLS) {
        return cachedConnectionLS;
    }
    try {
        const cnx = await mongoose.connect(process.env.MONGODB_URI_LS!);
        cachedConnectionLS = cnx.connection;
        return cachedConnectionLS;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
