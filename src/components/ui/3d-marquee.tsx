"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const ThreeDMarquee = <T,>({
    items,
    renderItem,
    className,
    speed = "normal",
}: {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
    speed?: "slow" | "normal" | "fast";
}) => {
    const [start, setStart] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setStart(true);
        }, 500);
    }, []);

    const getDuration = () => {
        if (speed === "fast") return "20s";
        if (speed === "slow") return "120s";
        return "40s";
    };

    return (
        <div
            className={cn(
                "flex h-[25rem] items-center justify-center relative overflow-hidden",
                className
            )}
        >
            <div
                className="flex w-full perspective-1000 transform-style-3d"
                style={{
                    transform: "rotateX(20deg) rotateY(-10deg) rotateZ(5deg) skewX(-5deg)",
                }}
            >
                <div
                    className={cn(
                        "flex min-w-full shrink-0 gap-8 py-4 w-max flex-nowrap",
                        start && "animate-marquee",
                    )}
                    style={{
                        animationDuration: getDuration(),
                    }}
                >
                    {items.map((item, idx) => (
                        <React.Fragment key={`marquee-item-${idx}`}>
                            {renderItem(item, idx)}
                        </React.Fragment>
                    ))}
                    {/* Duplicates for infinite loop - multiple sets to ensure coverage */}
                    {items.map((item, idx) => (
                        <React.Fragment key={`marquee-dup-1-${idx}`}>
                            {renderItem(item, idx)}
                        </React.Fragment>
                    ))}
                    {items.map((item, idx) => (
                        <React.Fragment key={`marquee-dup-2-${idx}`}>
                            {renderItem(item, idx)}
                        </React.Fragment>
                    ))}
                    {items.map((item, idx) => (
                        <React.Fragment key={`marquee-dup-3-${idx}`}>
                            {renderItem(item, idx)}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-gray-900 via-gray-900/0 z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-gray-900 via-gray-900/0 z-10"></div>
        </div>
    );
};
