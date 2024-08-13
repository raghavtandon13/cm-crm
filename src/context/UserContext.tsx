"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import fromAPI from "@/lib/api";
import { Agent } from "@/lib/types";

const UserContext = createContext<Agent | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Agent | undefined>(undefined);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fromAPI.get("/agents/get");
                setUser(response.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchUserData();
    }, []);

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    return context;
};
