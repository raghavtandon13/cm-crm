import Cookie from "js-cookie";

/**
 * Build headers dynamically based on request body
 */
const getHeaders = (data?: any, additionalHeaders?: Record<string, string>) => {
    const headers: Record<string, string> = {
        ...additionalHeaders,
    };

    const token = Cookie.get("cm-token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    /**
     * IMPORTANT:
     * Only set JSON content-type if body is NOT FormData
     * Browser will auto-set multipart boundary for FormData
     */
    if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

/**
 * Unified response handler
 */
const handleResponse = async (response: Response) => {
    let data: any;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).response = {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
        throw error;
    }

    return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    };
};

/**
 * API calls prefixed with /api
 */
const fromAPI = {
    get: async <T = any>(url: string, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(`/api${url}`, {
            method: "GET",
            headers: getHeaders(undefined, config?.headers),
        });

        const { data, ...rest } = await handleResponse(response);
        return { data: data as T, ...rest };
    },

    post: async <T = any>(url: string, data?: any, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(`/api${url}`, {
            method: "POST",
            headers: getHeaders(data, config?.headers),
            body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
        });

        const { data: responseData, ...rest } = await handleResponse(response);
        return { data: responseData as T, ...rest };
    },
};

/**
 * Raw HTTP calls (no /api prefix)
 */
export const http = {
    get: async <T = any>(url: string, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(undefined, config?.headers),
        });

        const { data, ...rest } = await handleResponse(response);
        return { data: data as T, ...rest };
    },

    post: async <T = any>(url: string, data?: any, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(data, config?.headers),
            body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
        });

        const { data: responseData, ...rest } = await handleResponse(response);
        return { data: responseData as T, ...rest };
    },
};

export default fromAPI;
