import { NextResponse, NextRequest } from "next/server";
import User from "@/lib/users";
import { connectToMongoDB } from "../../../../../../lib/db";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, props: { params: Promise<{ phone: string }> }) {
    const params = await props.params;
    await connectToMongoDB();
    try {
        const phone = params.phone;
        const user = await User.findOne({ phone: phone });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const results = await Promise.all([
            mv_status(user),
            ramfin_status(user.phone),
            moneytap_status(user),
            fibe_status(user),
            cashe_status(user),
            mpkt_status(user),
        ]);

        return NextResponse.json(
            {
                moneyview: results[0],
                ramfin: results[1],
                moneytap: results[2],
                fibe: results[3],
                cashe: results[4],
                mpocket: results[5],
            },
            { status: 200 },
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                moneyview: "N/A",
                ramfin: "N/A",
                moneytap: "N/A",
                fibe: "N/A",
                cashe: "N/A",
                mpocket: "N/A",
            },
            { status: 200 },
        );
    }
}
const fetchJson = async (url: any, options: any) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return { error: "N/A" };
    }
};

async function mv_status(user: any) {
    try {
        if (!user || !user.accounts) return { error: "N/A" };
        const moneyviewaccount = user.accounts.find((account: any) => account.name === "moneyview");
        if (!moneyviewaccount) return { error: "N/A" };

        const tokenData = await fetchJson("https://atlas.whizdm.com/atlas/v1/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ partnercode: 158, username: "credmantra", password: "p-wwj6.13m" }),
        });

        if (!tokenData.token) return { error: "N/A" };

        return await fetchJson(`https://atlas.whizdm.com/atlas/v1/lead/status/${moneyviewaccount.id}`, {
            method: "GET",
            headers: { token: tokenData.token },
        });
    } catch {
        return { error: "N/A" };
    }
}

async function ramfin_status(phone: any) {
    try {
        return await fetchJson("https://credmantra.com/api/v1/partner-api/ram/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: phone }),
        });
    } catch {
        return { error: "N/A" };
    }
}

async function mpkt_status(user: any) {
    try {
        if (!user || !user.accounts) return { error: "N/A" };
        const mpktaccount = user.accounts.find((account: any) => account.name === "mpocket");
        if (!mpktaccount) return { error: "N/A" };

        return await fetchJson("http://13.201.83.62/api/v1/mpocket/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request_id: mpktaccount.data.requestid }),
        });
    } catch {
        return { error: "N/A" };
    }
}

async function cashe_status(user: any) {
    try {
        if (!user || !user.accounts) return { error: "N/A" };
        const casheaccount = user.accounts.find((account: any) => account.name === "cashe");
        if (!casheaccount) return { error: "N/A" };

        return await fetchJson("https://credmantra.com/api/v1/partner-api/cashe/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ partner_name: "credmantra_partner1", partner_customer_id: casheaccount.id }),
        });
    } catch {
        return { error: "N/A" };
    }
}

async function fibe_status(user: any) {
    try {
        if (!user || !user.accounts) return { error: "N/A" };
        const fibeaccount = user.accounts.find((account: any) => account.name === "fibe");
        if (!fibeaccount) return { error: "N/A" };

        return await fetchJson("https://credmantra.com/api/v1/partner-api/fibe/customer-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ custrefno: fibeaccount.res.esrefid }),
        });
    } catch {
        return { error: "N/A" };
    }
}

async function moneytap_status(user: any) {
    try {
        if (!user || !user.accounts) return { error: "N/A" };
        const moneytapaccount = user.accounts.find((account: any) => account.name === "moneytap");
        if (!moneytapaccount) return { error: "N/A" };

        return await fetchJson("https://credmantra.com/api/v1/partner-api/moneytap/moneytap/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerid: moneytapaccount.customerid, phone: user.phone }),
        });
    } catch {
        return { error: "N/A" };
    }
}
