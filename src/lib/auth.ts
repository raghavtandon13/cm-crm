import { jwtVerify } from "jose";
import { db } from "../../lib/db";
const secret = process.env.JWT_SECRET as string;

export default async function getUser(token: string) {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    const id = verified.payload.id as string;
    if (!id) return;
    const user = await db.agent.findUnique({ where: { id }, include: { role: true } });
    return user;
}
