"use client";
import React from 'react';
import { Users, Heart, Globe, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#020617] selection:bg-emerald-300 selection:text-emerald-900">
            <ContainerScroll
                titleComponent={
                    <>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold uppercase tracking-wider border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                                <Sparkles className="inline-block w-4 h-4 mr-2 mb-0.5" />
                                Our Mission
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
                            Engineering Hope <br />
                            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x">
                                for Humanity.
                            </span>
                        </h1>
                    </>
                }
            >
                {/* Scrollable Card Content */}
                <div className="w-full bg-white border border-slate-200/50 backdrop-blur-xl rounded-2xl p-6 md:p-12 text-left relative">

                    {/* Decorative Background inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <Target className="text-emerald-500" /> The Vita Initiative
                            </h2>
                            <span className="text-xs font-bold text-gray-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                Est. 2025
                            </span>
                        </div>

                        <div className="prose prose-lg max-w-none text-slate-600">
                            <section className="mb-10">
                                <p className="text-xl font-light leading-relaxed text-slate-700 mb-6">
                                    In the chaos of an emergency, information is as vital as oxygen. <strong className="text-emerald-600 font-bold">Vita</strong> was born from a simple question: <em>Why can we track a pizza delivery in real-time, but not an ambulance?</em>
                                </p>
                                <p className="text-sm md:text-base leading-relaxed mb-4">
                                    We are building the world's first decentralized, AI-powered emergency response neural network. By connecting hospitals, ambulances, blood banks, and volunteers into a single "God-Mode" view, we reduce response times by up to 40%.
                                </p>
                            </section>

                            <section className="mb-10 grid md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                                    <Globe className="text-emerald-500 w-8 h-8 mb-4 opacity-80" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Universal Access</h3>
                                    <p className="text-sm text-slate-500">
                                        Healthcare is a human right. Our platform is free for users and open-source for developers.
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors">
                                    <Users className="text-teal-500 w-8 h-8 mb-4 opacity-80" />
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Community Powered</h3>
                                    <p className="text-sm text-slate-500">
                                        Verified volunteers are the backbone of Vita. We empower local heroes with global tools.
                                    </p>
                                </div>
                            </section>

                            <section className="border-t border-slate-100 pt-8">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center mb-8">
                                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-3 fill-current animate-pulse" />
                                    <h4 className="text-emerald-900 font-bold mb-2">Join the Movement</h4>
                                    <p className="text-emerald-800/80 text-sm mb-4">
                                        Whether you code, drive, or heal - there is a place for you here.
                                    </p>
                                    <Link href="/signup" className="inline-block px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors">
                                        Become a Volunteer
                                    </Link>
                                </div>

                                <div className="flex justify-center">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-200"
                                    >
                                        &larr; Return to Dashboard
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </ContainerScroll>
        </div>
    );
}
