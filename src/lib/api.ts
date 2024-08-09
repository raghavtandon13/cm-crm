import axios from "axios";
import Cookie from "js-cookie";

const fromAPI = axios.create({
    baseURL: "/api",
});

fromAPI.interceptors.request.use(
    (config) => {
        const token = Cookie.get("cm-token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default fromAPI;
