export const fetchcache = 'force-no-store';

async function mv_status(user: any): Promise<any> {
    try {
        if (!user || !user.accounts) return { error: 'user or user accounts not found' };
        const moneyviewaccount = user.accounts.find((account: any) => account.name === 'moneyview');
        if (!moneyviewaccount) return { error: 'moneyview account not found' };

        const tokenresponse = await fetch('https://atlas.whizdm.com/atlas/v1/token', {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ partnercode: 158, username: 'credmantra', password: 'p-wwj6.13m' }),
        });

        if (!tokenresponse.ok) {
            const errortext = await tokenresponse.text();
            return { error: `failed to fetch token: ${tokenresponse.status} ${tokenresponse.statusText}. ${errortext}` };
        }

        const tokendata = await tokenresponse.json();
        const token = tokendata.token;

        const leadstatusresponse = await fetch(`https://atlas.whizdm.com/atlas/v1/lead/status/${moneyviewaccount.id}`, {
            method: 'get',
            headers: {
                token: token,
            },
        });

        if (!leadstatusresponse.ok) {
            const errortext = await leadstatusresponse.text();
            return { error: `failed to fetch lead status: ${leadstatusresponse.status} ${leadstatusresponse.statusText}. ${errortext}` };
        }

        const leadstatusdata = await leadstatusresponse.json();
        return leadstatusdata;
    } catch (error) {
        console.error('error in mv_status:', error);
        return { error: 'error in mv_status' };
    }
}

async function ramfin_status(phone: string): Promise<any> {
    try {
        const scresponse = await fetch('https://credmantra.com/api/v1/partner-api/ram/status', {
            method: 'post',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ mobile: phone }),
        });
        if (!scresponse.ok) {
            const errordata = await scresponse.json();
            return { error: errordata.msg };
        }
        const scstatusdata = await scresponse.json();
        return scstatusdata;
    } catch (error) {
        return { error: 'error in smartcoin_status' };
    }
}

async function mpkt_status(user: any): Promise<any> {
    if (!user || !user.accounts) return { error: 'user or user accounts not found' };
    const mpktaccount = user.accounts.find((account: any) => account.name === 'mpocket');
    if (!mpktaccount) return { error: 'mpokket account not found' };

    const mpktres = await fetch('http://13.201.83.62/api/v1/mpocket/status', {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ request_id: mpktaccount.data.requestid }),
    });
    if (!mpktres.ok) {
        const errordata = await mpktres.json();
        return { error2: errordata };
    }
    const mpktstatusdata = await mpktres.json();
    console.log('mpktstatusdata');
    console.log(mpktstatusdata);
    if (mpktstatusdata.data === undefined) {
        return { error: 'no data' };
    }
    return mpktstatusdata.data;
}

async function cashe_status(user: any): Promise<any> {
    if (!user || !user.accounts) return { error: 'user or user accounts not found' };
    const casheaccount = user.accounts.find((account: any) => account.name === 'cashe');
    if (!casheaccount) return { error: 'cashe account not found' };
    const casheres = await fetch('https://credmantra.com/api/v1/partner-api/cashe/status', {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            partner_name: 'credmantra_partner1',
            partner_customer_id: casheaccount.id,
        }),
    });
    if (!casheres.ok) {
        const errordata = await casheres.json();
        return { error2: errordata };
    }
    const cashestatusdata = await casheres.json();
    return cashestatusdata;
}

async function fibe_status(user: any): Promise<any> {
    if (!user || !user.accounts) return { error: 'user or user accounts not found' };
    const fibeaccount = user.accounts.find((account: any) => account.name === 'fibe');
    if (!fibeaccount) return { error: 'fibe account not found' };
    const fiberes = await fetch('https://credmantra.com/api/v1/partner-api/fibe/customer-status', {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ custrefno: fibeaccount.res.esrefid }),
    });
    if (!fiberes.ok) {
        const errordata = await fiberes.json();
        return { error2: errordata };
    }
    const fibestatusdata = await fiberes.json();
    return fibestatusdata;
}

async function moneytap_status(user: any): Promise<any> {
    if (!user || !user.accounts) return { error: 'user or user accounts not found' };
    const moneytapaccount = user.accounts.find((account: any) => account.name === 'moneytap');
    if (!moneytapaccount) return { error: 'moneytap account not found' };

    const moneytapres = await fetch('https://credmantra.com/api/v1/partner-api/moneytap/moneytap/status', {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            customerid: moneytapaccount.customerid,
            phone: user.phone,
        }),
    });
    if (!moneytapres.ok) {
        const errordata = await moneytapres.json();
        return { error2: errordata };
    }
    const moneytapstatusdata = await moneytapres.json();
    return moneytapstatusdata;
}

export async function get_status(user: any): Promise<any> {
    try {
        const statusfunctions = [
            mv_status(user),
            ramfin_status(user.phone),
            moneytap_status(user),
            fibe_status(user),
            cashe_status(user),
            mpkt_status(user),
        ];
        const results = await Promise.all(statusfunctions);
        return {

            moneyview: results[0],
            ramfin: results[1],
            moneytap: results[2],
            fibe: results[3],
            cashe: results[4],
            mpocket: results[5],
        };
    } catch (error) {
        console.error('error in get_status:', error);
        throw error;
    }
}

