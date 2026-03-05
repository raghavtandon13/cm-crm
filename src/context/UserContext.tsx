"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";
import fromAPI from "@/lib/api";
import type { Agent } from "@/lib/types";

const UserContext = createContext<Agent | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { data: user } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await fromAPI.get("/auth/get");
            return response.data as Agent | any | undefined;
        },
    });
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    return context;
};
