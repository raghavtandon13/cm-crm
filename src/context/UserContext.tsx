"use client";

import { createContext, useContext, ReactNode } from "react";
import fromAPI from "@/lib/api";
import { Agent } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const UserContext = createContext<Agent | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { data: user } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await fromAPI.get("/agents/get");
            return response.data as Agent | undefined;
        },
    });
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    return context;
};
