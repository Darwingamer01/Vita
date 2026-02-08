"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
    Heart, Activity, Ambulance, Map as MapIcon,
    Zap, Users, Stethoscope
} from 'lucide-react';

export function ExpandableCardDemo() {
    const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
        null
    );
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(false);
            }
        }

        if (active && typeof active === "object") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <>
            <AnimatePresence>
                {active && typeof active === "object" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 h-full w-full z-10"
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === "object" ? (
                    <div className="fixed inset-0  grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.title}-${id}`}
                            layout
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                            }}
                            exit={{
                                opacity: 0,
                                transition: {
                                    duration: 0.05,
                                },
                            }}
                            className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                            onClick={() => setActive(null)}
                        >
                            <CloseIcon />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.title}-${id}`}
                            ref={ref}
                            className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden border border-white/10"
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            <motion.div layoutId={`image-${active.title}-${id}`} className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                                <motion.img
                                    layoutId={`img-${active.title}-${id}`}
                                    src={active.src}
                                    alt={active.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`}></div>

                                <motion.div
                                    layoutId={`icon-container-${active.title}-${id}`}
                                    className={`relative z-10 w-24 h-24 rounded-3xl ${active.iconBg} flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md`}
                                >
                                    {React.cloneElement(active.icon as React.ReactElement<any>, { size: 48, className: "text-white drop-shadow-md" })}
                                </motion.div>
                            </motion.div>

                            <div>
                                <div className="flex justify-between items-start p-4">
                                    <div className="">
                                        <motion.h3
                                            layoutId={`title-${active.title}-${id}`}
                                            className="font-bold text-neutral-700 dark:text-neutral-100"
                                        >
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.description}-${id}`}
                                            className="text-neutral-600 dark:text-neutral-300"
                                        >
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.a
                                        layoutId={`button-${active.title}-${id}`}
                                        href={active.ctaLink}
                                        className="px-4 py-3 text-sm rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        {active.ctaText}
                                    </motion.a>
                                </div>
                                <div className="pt-4 relative px-4">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-300 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                                    >
                                        {typeof active.content === "function"
                                            ? active.content()
                                            : active.content}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
            <ul className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        layoutId={`card-${card.title}-${id}`}
                        key={`card-${card.title}-${id}`}
                        onClick={() => setActive(card)}
                        className={`p-6 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800/[0.5] rounded-3xl cursor-pointer border ${card.border} backdrop-blur-sm transition-all duration-500 ease-out group`}
                    >
                        <div className="flex gap-4 flex-col w-full h-full justify-between">
                            <div>
                                <motion.div layoutId={`image-${card.title}-${id}`} className="mb-6 h-48 w-full rounded-2xl overflow-hidden relative group-hover:shadow-xl transition-all border border-white/10">
                                    <motion.img
                                        layoutId={`img-${card.title}-${id}`}
                                        src={card.src}
                                        alt={card.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 ease-out`}></div>

                                    <motion.div
                                        layoutId={`icon-container-${card.title}-${id}`}
                                        className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center border border-white/20 backdrop-blur-md`}
                                    >
                                        {React.cloneElement(card.icon as React.ReactElement<any>, { size: 20, className: "text-white" })}
                                    </motion.div>
                                </motion.div>

                                <motion.h3
                                    layoutId={`title-${card.title}-${id}`}
                                    className="font-bold text-neutral-800 dark:text-neutral-100 text-xl mb-2"
                                >
                                    {card.title}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${card.description}-${id}`}
                                    className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed"
                                >
                                    {card.description}
                                </motion.p>
                            </div>

                            <motion.button
                                layoutId={`button-${card.title}-${id}`}
                                className="px-4 py-2 text-sm rounded-full font-bold bg-white/10 hover:bg-white/20 text-white w-fit mt-4 flex items-center gap-2"
                            >
                                {card.ctaText}
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </ul>
        </>
    );
}

export const CloseIcon = () => {
    return (
        <motion.svg
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
                transition: {
                    duration: 0.05,
                },
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-black"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    );
};

const cards = [
    {
        title: "God-Mode Visibility.",
        description: "The fog of war is gone. Identify critical resources with sub-second latency.",
        src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
        icon: <MapIcon size={32} />,
        iconColor: "text-emerald-400",
        bgGradient: "from-emerald-600 via-teal-500 to-cyan-500",
        ctaGradient: "from-emerald-500 to-teal-500",
        iconBg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        ctaText: "Explore Master Map",
        ctaLink: "/map",
        content: () => (
            <p>Master Map gives you a complete overview of the emergency landscape. Filter by resource type, distance, and availability in real-time. Our God-Mode visibility ensures that no critical resource is hidden when lives are at stake. <br /> <br /> Real-time satellite overlays, traffic congestion heatmaps, and hospital capacity indicators provide a holistic view for command centers.</p>
        ),
    },
    {
        title: "Doctors Available NOW",
        description: "Cardio, Neuro, and Peds specialists on-call.",
        src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
        icon: <Stethoscope size={32} />,
        iconColor: "text-cyan-300",
        bgGradient: "from-cyan-500 via-sky-500 to-blue-500",
        ctaGradient: "from-cyan-500 to-blue-500",
        iconBg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        ctaText: "Find Doctors",
        ctaLink: "/doctors",
        content: () => (
            <p>Connect instantly with available specialists. Our network tracks real-time availability of doctors across various specializations including Cardiology, Neurology, and Pediatrics, ensuring rapid response for critical cases. <br /> <br /> Video triage capabilities allow specialists to assess patients remotely before arrival.</p>
        ),
    },
    {
        title: "Blood & Oxygen",
        description: "Live stock from verified banks. Filter by distance.",
        src: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?q=80&w=2070&auto=format&fit=crop",
        icon: <Heart size={32} />,
        iconColor: "text-rose-400",
        bgGradient: "from-rose-500 via-pink-500 to-fuchsia-500",
        ctaGradient: "from-rose-500 to-pink-500",
        iconBg: "bg-rose-500/10",
        border: "border-rose-500/20",
        ctaText: "Check Stock",
        ctaLink: "/blood",
        content: () => (
            <p>Access real-time inventory of Blood Banks and Oxygen Suppliers. Verified data ensures that you never chase a ghost lead. Filter by distance and blood group to find exactly what you need in seconds. <br /> <br /> Automated alerts notify donors in the vicinity for rare blood group requirements.</p>
        ),
    },
    {
        title: "Ambulance & Beds",
        description: "ICU/Ventilator availability in real-time.",
        src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop",
        icon: <Ambulance size={32} />,
        iconColor: "text-violet-400",
        bgGradient: "from-violet-600 via-purple-500 to-indigo-500",
        ctaGradient: "from-violet-500 to-indigo-500",
        iconBg: "bg-violet-500/10",
        border: "border-violet-500/20",
        ctaText: "Find Bed/Amb",
        ctaLink: "/ambulance",
        content: () => (
            <p>Track real-time availability of ICU beds and Ventilators. Locate the nearest available ambulance with advanced life support capabilities. Direct integration with hospital management systems ensures sub-second accuracy. <br /> <br /> GPS tracking allows you to see the ambulance's estimated time of arrival live on your screen.</p>
        ),
    },
    {
        title: "Neural Prediction.",
        description: "Processing millions of data points to predict shortages.",
        src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
        icon: <Zap size={32} />,
        iconColor: "text-amber-400",
        bgGradient: "from-amber-400 via-orange-500 to-red-500",
        ctaGradient: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-500/10",
        border: "border-amber-500/20",
        ctaText: "Try AI",
        ctaLink: "/ai",
        content: () => (
            <p>Our Neural Prediction engine analyzes historical data, real-time traffic, and hospital load to predict resource shortages before they happen. AI-driven triage helps prioritize patients effectively, saving valuable time. <br /> <br /> Predictive models alert administrators to potential surge events up to 4 hours in advance.</p>
        ),
    },
    {
        title: "Community Lifeline",
        description: "Broadcast SOS requests. Connect with local volunteers.",
        src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
        icon: <Users size={32} />,
        iconColor: "text-indigo-300",
        bgGradient: "from-indigo-500 via-blue-500 to-sky-500",
        ctaGradient: "from-indigo-500 to-blue-500",
        iconBg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        ctaText: "View Requests",
        ctaLink: "/community",
        content: () => (
            <p>When official channels are overwhelmed, the Community Lifeline connects you with verified local volunteers. Broadcast SOS requests for non-medical aid, food, or transport and get help from your neighbors. <br /> <br /> A trust-based reputation system ensures safety and reliability for both volunteers and requesters.</p>
        ),
    },
];
