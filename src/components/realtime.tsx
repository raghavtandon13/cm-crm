import fromAPI from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { NumberTicker } from "./magicui/number-ticker";

export function RealtimeStats() {
    const { data: realTimeCount, isPending } = useQuery({
        queryKey: ["realtimestats"],
        queryFn: async () => {
            const response = await fromAPI.get(`/leads/realtime`);
            return response.data.count;
        },
        refetchInterval: 2000,
    });

    if (isPending) return <></>;
    return (
        <NumberTicker
            value={realTimeCount}
            className="whitespace-pre-wrap text-8xl font-medium tracking-tighter text-black dark:text-white"
        />
    );
}
