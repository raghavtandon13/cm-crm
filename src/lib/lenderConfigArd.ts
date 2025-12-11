export const lenderRules = {
    creditlinks: [
        (obj) => obj.message === "Not eligible" && "Rejected",
        (obj) => obj.message === "The lead is already created." && "Deduped",
        (obj) => obj.leadId !== null && (!obj.message || obj.message === null) && "Accepted",
        (obj) => obj.message === "Eligible" && "Accepted",
        (obj) => obj.message === "Lead created successfully." && "Accepted",
    ],

    fatakpay: [
        (obj) => obj.status === "Ineligible" && "Rejected",
        (obj) => obj.status === "Deduped" && "Deduped",
        (obj) => obj.max_eligibility_amount !== null && "Accepted",
    ],

    fatakpay_pl: [
        (obj) => obj.status === "Eligible" && "Accepted",
        (obj) => obj.status === "Ineligible" && "Rejected",
        (obj) => obj.status === "Deduped" && "Deduped",
    ],

    kamakshi: [
        (obj) => obj.msg === "Lead created successfully." && "Accepted",
        (obj) => obj.status === "Ineligible" && "Rejected",
        (obj) => /required/i.test(obj.status) && "Rejected",
        (obj) => /Issue/i.test(obj.status) && "Rejected",
        (obj) => /Unexpected data/i.test(obj.status) && "Rejected",

        (obj) => obj.status === "Trailing data" && "Errors",
        (obj) => obj.status === "Gateway Time-out" && "Errors",
        (obj) => obj.status === "Not enough data available to satisfy format" && "Errors",
        (obj) => obj.status === "Bad Gateway" && "Errors",
        (obj) => obj.status === "Date is Incorrect." && "Errors",
        (obj) => obj.status === "Too Many Attempts." && "Errors",
        (obj) => /SQLSTATE/i.test(obj.status) && "Errors",

        (obj) => obj.status === "Dedupe" && "Deduped",
    ],

    lendenclub: [
        (obj) => obj.is_duplicate === true && "Deduped",
        (obj) => obj.is_duplicate === false && "Accepted",

        (obj) => /required/i.test(obj.status) && "Rejected",
        (obj) => /Issue/i.test(obj.status) && "Rejected",
        (obj) => /Unexpected data/i.test(obj.status) && "Rejected",

        (obj) => /Mandatory/i.test(obj.error) && "Errors",
        (obj) => /Invalid/i.test(obj.error) && "Errors",
        (obj) => obj.error === "Decryption Failed" && "Errors",
        (obj) => obj.error === "An unexpected error occurred" && "Errors",
        (obj) => obj.error === "Unable to process the request" && "Errors",
    ],

    loantap: [
        (obj) => obj.message === "Application created successfully" && "Accepted",
        (obj) => obj.message === "Application created successfully." && "Accepted",
    ],

    moneyview: [
        (obj) => Array.isArray(obj.offerObjects) && obj.offerObjects.length > 0 && "Accepted",

        (obj) => obj.message === "Duplicate lead found in MV" && "Deduped",
        (obj) => obj.message === "dedupe found" && "Deduped",

        (obj) => obj.message === "Lead has been expired." && "Rejected",
        (obj) => obj.message === "Lead has been rejected." && "Rejected",

        (obj) =>
            [
                "No dedupe found",
                "Invalid employment type",
                "Invalid Age",
                "Invalid PAN",
                "Invalid or Missing phone number",
                "Invalid education level",
                "Invalid data to get offer for lead",
                "Server call failed. Please try again.",
                "Error while verification of lead",
                "Loan Application status is invalid.",
                "Error in fetching offers",
            ].includes(obj.message) && "Errors",
    ],

    mpocket: [
        (obj) => obj.message === "User Eligible for Loan" && "Accepted",
        (obj) => obj.message === "New User" && "Accepted",
        (obj) => obj.message === "Data Accepted Successfully" && "Accepted",

        (obj) => obj.message === "User Profile Rejected on System" && "Rejected",
        (obj) => obj.message === "User Not Eligible for Loan" && "Rejected",
        (obj) => (!obj.message || obj.message === null) && "Rejected",

        (obj) => obj.message === "Bad Request" && "Errors",
        (obj) => obj.message === "socket hang up" && "Errors",
    ],

    ramfin: [
        (obj) => obj.dedupe === "Success" && "Accepted",

        (obj) =>
            obj.msg === "Success" &&
            obj.updated_status?.message !== "This customer is not associated with you." &&
            "Accepted",

        (obj) => obj.status === "Dedupe" && "Deduped",

        (obj) =>
            obj.msg === "Success" &&
            obj.updated_status?.message === "This customer is not associated with you." &&
            "Rejected",

        (obj) => /Issue/i.test(obj.message) && "Rejected",
        (obj) => obj.message === "The pancard field is required." && "Rejected",

        (obj) => obj.message === "Too Many Attempts." && "Errors",
        (obj) => /SQLSTATE/i.test(obj.message) && "Errors",
        (obj) => /errno/i.test(obj.message) && "Errors",
    ],

    smartcoin: [
        (obj) => obj.isDuplicateLead === "true" && "Deduped",
        (obj) => obj.message === "duplicate found and partner can reject this lead" && "Deduped",

        (obj) => obj.isDuplicateLead === "false" && "Accepted",
        (obj) => obj.message === "Lead created successfully" && "Accepted",

        (obj) => obj.status === "failure" && "Rejected",
        (obj) => obj.message === "unauthorised client id " && "Rejected",

        (obj) => obj.message === "socket hang up" && "Errors",
        (obj) => obj.message === "read ECONNRESET" && "Errors",
        (obj) =>
            obj.message === "Client network socket disconnected before secure TLS connection was established" &&
            "Errors",
        (obj) => obj.message === "write ETIMEDOUT" && "Errors",
        (obj) => obj.message === "write EPIPE" && "Errors",
        (obj) => /Request failed/i.test(obj.message) && "Errors",
    ],

    sot: [
        (obj) => obj.Message === "Lead generated successfully." && "Accepted",
        (obj) => obj.Message === "Eligibility Failed" && "Rejected",
        (obj) => obj.Message === "Monthly income is not eligible for the loan." && "Rejected",
        (obj) =>
            obj.Message === "You are not eligible for the loan as there is an active loan with the same PAN number." &&
            "Deduped",
    ],

    zype: [
        (obj) => obj.status === "ACCEPT" && "Accepted",
        (obj) => obj.message === "PRE_APPROVAL_OFFER_ALREADY_GENERATED" && "Accepted",

        (obj) => obj.status === "REJECT" && "Rejected",
        (obj) => obj.message === "DOB_OUT_OF_RANGE" && "Rejected",
        (obj) => obj.message === "DOB_INVALID" && "Rejected",

        (obj) => obj.status === "Dedupe" && "Deduped",
        (obj) => obj.status === "Deduped" && "Deduped",

        (obj) => obj.message === "SUCCESS_DEDUPE_NOT_FOUND" && "Deduped",
        (obj) => obj.message === "DEDUPE_IN_PROGRESS" && "Deduped",
        (obj) => obj.message === "APPLICATION_ALREADY_EXISTS" && "Deduped",
    ],
};

export function getARDStatus(obj) {
    const rules = lenderRules[obj.name.toLowerCase()];
    if (!rules) return "Unknown";

    for (const rule of rules) {
        const result = rule(obj);
        if (result) return result; // return first matching rule
    }

    return "Unknown";
}
