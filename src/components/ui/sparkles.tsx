"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SparklesCore = ({
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
}: {
    id?: string;
    className?: string;
    background?: string;
    minSize?: number;
    maxSize?: number;
    speed?: number;
    particleColor?: string;
    particleDensity?: number;
}) => {
    const randomMove = () => Math.random() * 2 - 1;

    // Generate fixed number of sparkles for visual effect without heavy library
    const sparkles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        size: Math.random() * (maxSize || 1 - (minSize || 0.5)) + (minSize || 0.5),
    }));

    return (
        <div className={cn("relative z-0", className)} style={{ background }}>
            {sparkles.map((sparkle) => (
                <motion.span
                    key={sparkle.id}
                    className="absolute rounded-full"
                    style={{
                        backgroundColor: particleColor || "#fff",
                        left: sparkle.x,
                        top: sparkle.y,
                        width: sparkle.size + "px",
                        height: sparkle.size + "px",
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: Math.random() * 2 + 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};
