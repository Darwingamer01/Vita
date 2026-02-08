'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Heart, Activity, Ambulance, Map as MapIcon, Home, Zap, Shield, Search } from 'lucide-react';
import clsx from 'clsx';

import VoiceSearch from '@/components/features/VoiceSearch';
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Hide navbar on auth pages and dashboard (dashboard has its own layout)
    if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/dashboard') || pathname === '/privacy' || pathname === '/terms' || pathname === '/about') {
        return null;
    }

    const isHome = pathname === '/';

    const navItems = [
        { name: 'Live Map', href: '/map', icon: MapIcon },
        { name: 'Blood', href: '/blood', icon: Heart },
        { name: 'Oxygen', href: '/oxygen', icon: Activity },
        { name: 'Ambulance', href: '/ambulance', icon: Ambulance },
        { name: 'Hospitals', href: '/hospital', icon: Activity },
        { name: 'Meds', href: '/medicine', icon: Zap },
        { name: 'Requests', href: '/requests', icon: Zap },
        { name: 'Admin', href: '/admin', icon: Shield },
    ];

    return (
        <nav className={clsx(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isHome ? "bg-transparent border-none pt-4" : "bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
        )}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                {/* Logo */}
                <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 flex items-center gap-2 tracking-tighter">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30">
                        <Zap size={20} className="text-blue-400 fill-current" />
                    </div>
                    VITA
                </Link>

                {/* Desktop Nav */}
                <div className="hidden xl:flex items-center gap-6">
                    {!isHome && navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'flex items-center gap-1 text-sm font-medium transition-colors',
                                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className={clsx("flex items-center gap-4 pl-4", !isHome && "border-l border-white/10")}>
                        {!isHome && <VoiceSearch />}

                        {/* Always show Login/Add, but styled differently on Home */}
                        <Link href="/login" className={clsx("text-sm font-bold transition-colors", isHome ? "text-white hover:text-blue-400" : "text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400")}>Login</Link>
                        <Link href="/signup">
                            <MovingBorderButton
                                borderRadius="1.75rem"
                                className="bg-gray-900 dark:bg-white/10 text-white border-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-sm font-bold"
                                containerClassName="h-10 w-28"
                            >
                                Sign Up
                            </MovingBorderButton>
                        </Link>

                        {!isHome && (
                            <Link href="/add" className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20">
                                + Add Resource
                            </Link>
                        )}
                    </div>
                </div>



                {/* Mobile Menu Toggle */}
                <button
                    className="xl:hidden p-2 text-gray-900 dark:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="xl:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 absolute top-16 left-0 right-0 overflow-y-auto pb-20 z-40"
                    >
                        <div className="flex flex-col p-6 gap-6">
                            {!isHome && (
                                <div className="grid grid-cols-2 gap-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex flex-col items-center justify-center gap-2 text-sm font-medium p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <item.icon size={20} className="text-blue-600 dark:text-blue-400" />
                                            <span className="text-gray-900 dark:text-gray-300">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 mt-4">
                                {!isHome && (
                                    <Link
                                        href="/add"
                                        className="btn bg-blue-600 text-white py-3 rounded-xl font-bold text-center w-full"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        + Add Resource
                                    </Link>
                                )}
                                <Link
                                    href="/login"
                                    className="btn bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white py-3 rounded-xl font-medium text-center w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="btn bg-blue-600 text-white py-3 rounded-xl font-medium text-center w-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}


