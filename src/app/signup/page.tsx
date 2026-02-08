'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, User, Mail, Lock } from 'lucide-react';
import GoogleChooserModal from '@/components/auth/GoogleChooserModal';
import AppleChooserModal from '@/components/auth/AppleChooserModal';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [showAppleModal, setShowAppleModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API
        setTimeout(() => {
            setIsLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex font-sans selection:bg-purple-100 selection:text-purple-900 bg-white dark:bg-slate-900">
            <GoogleChooserModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
            <AppleChooserModal isOpen={showAppleModal} onClose={() => setShowAppleModal(false)} />

            {/* LEFT PANEL - BRANDING (50%) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gray-50 dark:bg-slate-950 flex-col justify-between p-12 lg:p-16">
                {/* Enhanced Aurora Gradient - Warmer & Energetic */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-20%] w-[1200px] h-[1200px] bg-gradient-to-bl from-orange-200 via-pink-200 to-transparent blur-[120px] opacity-70 mix-blend-multiply dark:mix-blend-soft-light animate-blob" />
                    <div className="absolute bottom-[-20%] left-[-20%] w-[1200px] h-[1200px] bg-gradient-to-tr from-purple-300 via-blue-200 to-transparent blur-[120px] opacity-70 mix-blend-multiply dark:mix-blend-soft-light animate-blob animation-delay-4000" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] dark:opacity-[0.1]"></div>
                </div>

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                        <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">VITA</span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 dark:from-orange-400 dark:to-pink-400">Lifeline.</span>
                        </h1>
                        <p className="text-2xl text-gray-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                            Be the first responder. Connect with 50+ hospitals and access real-time emergency data instantly.
                        </p>
                    </motion.div>
                </div>

                {/* Trust/Stats */}
                <div className="relative z-10 grid grid-cols-2 gap-8 max-w-md">
                    <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">24/7</p>
                        <p className="text-sm font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-widest">Support</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">100%</p>
                        <p className="text-sm font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-widest">Verified</p>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - FORM (50%) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white dark:bg-slate-900 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[400px] space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">Create Account</h2>
                        <p className="text-gray-500 dark:text-slate-400 text-lg">Start your emergency preparedness journey.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Apple Button */}
                        <button
                            onClick={() => setShowAppleModal(true)}
                            className="flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 text-gray-900 dark:text-white font-bold transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-1.01 3.8-1.01c.54 0 2.22 0 3.39 1.63-2.91 1.76-2.4 5.37.52 6.64-.67 1.83-1.6 3.65-2.79 4.97zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                            Apple
                        </button>
                        {/* Google Button */}
                        <button
                            onClick={() => setShowGoogleModal(true)}
                            className="flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 text-gray-900 dark:text-white font-bold transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Google
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-3 text-gray-400 font-bold tracking-widest">Or with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 dark:text-white">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-lg placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 dark:text-white">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-lg placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                                placeholder="name@work-email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 dark:text-white">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white text-lg placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black font-bold py-4 rounded-xl transition-all shadow-xl shadow-black/10 dark:shadow-white/5 hover:shadow-2xl hover:shadow-black/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-lg"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>Create Account <ArrowRight size={20} strokeWidth={2.5} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 dark:text-slate-400">
                        Already have an account? <Link href="/login" className="text-black dark:text-white font-bold hover:underline">Log in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
