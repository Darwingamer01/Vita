"use client";
import React, { useRef, useState } from "react";
import { AnimatePresence, MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
}: {
    items: { title: string; icon: React.ReactNode; href: string; active?: boolean; badge?: string; onClick?: () => void }[];
    desktopClassName?: string;
    mobileClassName?: string;
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

const FloatingDockMobile = ({
    items,
    className,
}: {
    items: { title: string; icon: React.ReactNode; href: string; active?: boolean; badge?: string; onClick?: () => void }[];
    className?: string;
}) => {
    // Basic mobile implementation (static list for now or simplified)
    // For this specific request, the user wants the SIDEBAR to have the effect, so we focus on the Vertical/Desktop implementation.
    // We will render nothing for mobile here as the dashboard likely handles mobile nav differently or we just fallback to standard.
    return null;
};


const FloatingDockDesktop = ({
    items,
    className,
}: {
    items: { title: string; icon: React.ReactNode; href: string; active?: boolean; badge?: string; onClick?: () => void }[];
    className?: string;
}) => {
    // For Vertical Dock (Sidebar)
    let mouseY = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseY.set(e.pageY)}
            onMouseLeave={() => mouseY.set(Infinity)}
            className={cn(
                "mx-auto flex flex-col gap-2 items-start", // Vertical styling
                className
            )}
        >
            {items.map((item) => (
                <IconContainer mouseY={mouseY} key={item.title} {...item} />
            ))}
        </motion.div>
    );
};

function IconContainer({
    mouseY,
    title,
    icon,
    href,
    active,
    badge,
    onClick
}: {
    mouseY: MotionValue;
    title: string;
    icon: React.ReactNode;
    href?: string;
    active?: boolean;
    badge?: string;
    onClick?: () => void;
}) {
    let ref = useRef<HTMLDivElement>(null);

    // Distance calculation
    let distance = useTransform(mouseY, (val) => {
        let bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
        return val - bounds.y - bounds.height / 2;
    });

    // Scale calculations - Vertical (height/width scaling)
    // Base height is roughly 48px (p-3 + icon). 
    // We want to scale UP when close.
    let heightSync = useTransform(distance, [-150, 0, 150], [44, 64, 44]);
    let widthSync = useTransform(distance, [-150, 0, 150], [1, 1.05, 1]); // Subtle width expansion
    let iconScale = useTransform(distance, [-150, 0, 150], [1, 1.4, 1]); // Icon scaling

    let height = useSpring(heightSync, { mass: 0.1, stiffness: 150, damping: 12 });
    let width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });
    let scale = useSpring(iconScale, { mass: 0.1, stiffness: 150, damping: 12 });

    // If item is active, we might want it slightly larger by default or highlighted

    const content = (
        <motion.div
            ref={ref}
            style={{ height, scaleX: width }}
            onClick={onClick}
            className={cn(
                "relative flex items-center gap-3 px-3 py-2 w-full rounded-xl cursor-pointer transition-colors group",
                active ? "bg-blue-600 shadow-lg z-10" : "hover:bg-gray-800/50"
            )}
        >
            <motion.div
                style={{ scale }}
                className={cn("flex-shrink-0", active ? "text-white" : "text-gray-300 group-hover:text-white")}
            >
                {icon}
            </motion.div>

            <motion.span
                style={{ scale }}
                className={cn(
                    "font-semibold text-sm whitespace-nowrap origin-left opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto transition-all duration-300",
                    active ? "text-white" : "text-gray-200 group-hover:text-white"
                )}
            >
                {title}
            </motion.span>

            {badge && (
                <motion.span
                    style={{ scale }}
                    className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                    {badge}
                </motion.span>
            )}
        </motion.div>
    );

    return content;
}
