import Cookie from "js-cookie";

const getHeaders = (additionalHeaders?: Record<string, string>) => {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...additionalHeaders };
    const token = Cookie.get("cm-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
};

const handleResponse = async (response: Response) => {
    let data: any;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) data = await response.json();
    else data = await response.text();

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

    return { data, status: response.status, statusText: response.statusText, headers: response.headers };
};

const fromAPI = {
    get: async <T = any>(url: string, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(`/api${url}`, {
            method: "GET",
            headers: getHeaders(config?.headers),
        });
        const { data, ...rest } = await handleResponse(response);
        return { data: data as T, ...rest };
    },

    post: async <T = any>(url: string, data?: any, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(`/api${url}`, {
            method: "POST",
            headers: getHeaders(config?.headers),
            body: data ? JSON.stringify(data) : undefined,
        });
        const { data: responseData, ...rest } = await handleResponse(response);
        return { data: responseData as T, ...rest };
    },
};

export const http = {
    get: async <T = any>(url: string, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(config?.headers),
        });
        const { data, ...rest } = await handleResponse(response);
        return { data: data as T, ...rest };
    },

    post: async <T = any>(url: string, data?: any, config?: { headers?: Record<string, string> }) => {
        const response = await fetch(url, {
            method: "POST",
            headers: getHeaders(config?.headers),
            body: data ? JSON.stringify(data) : undefined,
        });
        const { data: responseData, ...rest } = await handleResponse(response);
        return { data: responseData as T, ...rest };
    },
};

/**
 * @example
 * @get
 * await fromAPI.get(
 *     "/users",
 *     { headers: { "X-Custom-Header": "example-value", "Another-Header": "123" } }
 * )
 *
 * @post
 * await fromAPI.post(
 *     "/login",
 *     { email: "testexample.com", password: "secret" },
 *     { headers: { "X-App-Version": "1.0.0" } },
 * )
 */

export default fromAPI;
