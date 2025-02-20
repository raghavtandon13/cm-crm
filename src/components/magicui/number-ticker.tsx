"use client";

import { useMotionValue, useSpring } from "motion/react";
import { ComponentPropsWithoutRef, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
    value: number;
    direction?: "up" | "down";
    delay?: number; // delay in s
    decimalPlaces?: number;
}

export function NumberTicker({ value, direction = "up", delay = 0, className, decimalPlaces = 0, ...props }: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(value);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });

    useEffect(() => {
        setTimeout(() => {
            motionValue.set(value);
        }, delay * 1000);
    }, [motionValue, delay, value]);

    useEffect(
        () =>
            springValue.on("change", (latest) => {
                if (ref.current) {
                    ref.current.textContent = Intl.NumberFormat("en-US", {
                        minimumFractionDigits: decimalPlaces,
                        maximumFractionDigits: decimalPlaces,
                    }).format(Number(latest.toFixed(decimalPlaces)));
                }
            }),
        [springValue, decimalPlaces],
    );

    return <span ref={ref} className={cn("inline-block tabular-nums tracking-wider text-black dark:text-white", className)} {...props} />;
}
