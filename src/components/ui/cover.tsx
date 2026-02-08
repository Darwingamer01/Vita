"use client";
import React, { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

export const Cover = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const [hovered, setHovered] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState(0);
    const [beamPositions, setBeamPositions] = useState<number[]>([]);

    useEffect(() => {
        if (ref.current) {
            setContainerWidth(ref.current?.clientWidth ?? 0);

            const height = ref.current?.clientHeight ?? 0;
            const numberOfBeams = Math.floor(height / 10); // Adjust the divisor to control the spacing
            const positions = Array.from(
                { length: numberOfBeams },
                (_, i) => (i + 1) * (height / (numberOfBeams + 1))
            );
            setBeamPositions(positions);
        }
    }, [ref.current]);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            ref={ref}
            className="relative hover:bg-neutral-900 group/cover inline-block dark:bg-neutral-900 bg-neutral-100 px-2 py-2  transition-all duration-200 rounded-sm"
        >
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: {
                                duration: 0.2,
                            },
                        }}
                        className="h-full w-full overflow-hidden absolute inset-0"
                    >
                        <motion.div
                            animate={{
                                translateX: ["-50%", "0%"],
                            }}
                            transition={{
                                translateX: {
                                    duration: 10,
                                    ease: "linear",
                                    repeat: Infinity,
                                },
                            }}
                            className="w-[200%] h-full flex"
                        >
                            <SparklesCore
                                background="transparent"
                                minSize={0.4}
                                maxSize={1}
                                particleDensity={500}
                                className="w-full h-full"
                                particleColor="#FFFFFF"
                            />
                            <SparklesCore
                                background="transparent"
                                minSize={0.4}
                                maxSize={1}
                                particleDensity={500}
                                className="w-full h-full"
                                particleColor="#FFFFFF"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {beamPositions.map((position, index) => (
                <Beam
                    key={index}
                    hovered={hovered}
                    duration={Math.random() * 2 + 1}
                    delay={Math.random() * 2 + 1}
                    width={containerWidth}
                    style={{
                        top: `${position}px`,
                    }}
                />
            ))}
            <motion.span
                key={String(hovered)}
                animate={{
                    scale: hovered ? 0.8 : 1,
                }}
                exit={{
                    filter: "none",
                    scale: 1,
                }}
                transition={{
                    duration: 0.5,
                    scale: {
                        duration: 0.5,
                        ease: "easeOut"
                    },
                    filter: {
                        duration: 0.5,
                        ease: "easeOut"
                    },
                }}
                className={cn(
                    "dark:text-white inline-block text-neutral-900 relative z-20 group-hover/cover:text-white transition duration-200",
                    className
                )}
            >
                {children}
            </motion.span>
            <CircleIcon className="absolute -right-[2px] -top-[2px]" />
            <CircleIcon className="absolute -bottom-[2px] -right-[2px]" />
            <CircleIcon className="absolute -left-[2px] -top-[2px]" />
            <CircleIcon className="absolute -bottom-[2px] -left-[2px]" />
        </div>
    );
};

export const Beam = ({
    className,
    delay,
    duration,
    hovered,
    width = 600,
    ...otherProps
}: {
    className?: string;
    delay?: number;
    duration?: number;
    hovered?: boolean;
    width?: number;
    [key: string]: any;
}) => {
    return (
        <motion.div
            initial={{
                width: 0,
            }}
            animate={{
                width: hovered ? width : 0,
            }}
            transition={{
                duration: 2,
                ease: "linear",
                delay: delay,
            }}
            className={cn(
                "absolute left-0 bg-neutral-100 dark:bg-neutral-800 h-[1px]",
                className
            )}
            {...otherProps}
        />
    );
};

export const CircleIcon = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "pointer-events-none animate-pulse group-hover/cover:hidden group-hover/cover:opacity-100 group h-2 w-2 rounded-full bg-neutral-600 dark:bg-white opacity-20",
                className
            )}
        ></div>
    );
};
