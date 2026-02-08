"use client";
import React from 'react';
import { ScrollText, ShieldCheck, Scale, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#020617] selection:bg-pink-300 selection:text-pink-900">
            <ContainerScroll
                titleComponent={
                    <>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-sm font-bold uppercase tracking-wider border border-pink-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                                <Scale className="inline-block w-4 h-4 mr-2 mb-0.5" />
                                Legal Agreement
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
                            Rules of Engagement <br />
                            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500 animate-gradient-x">
                                for Saving Lives.
                            </span>
                        </h1>
                    </>
                }
            >
                {/* Scrollable Card Content */}
                <div className="w-full bg-white border border-slate-200/50 backdrop-blur-xl rounded-2xl p-6 md:p-12 text-left relative">

                    {/* Decorative Background inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <ScrollText className="text-pink-500" /> Vita Terms of Service
                            </h2>
                            <span className="text-xs font-bold text-gray-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                Effective Jan 2026
                            </span>
                        </div>

                        <div className="prose prose-lg max-w-none text-slate-600">
                            <section className="mb-10">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="text-pink-500 w-5 h-5" /> 1. Acceptance of Terms
                                </h3>
                                <p className="mb-4 text-sm md:text-base leading-relaxed">
                                    By accessing or using the Vita Emergency Network platform ("Vita"), you agree to be bound by these Terms. If you disobey these rules, you may be banned from the platform immediately regardless of your intent.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <AlertCircle className="text-orange-500 w-5 h-5" /> 2. Emergency Usage Disclaimer
                                </h3>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                                    <strong className="text-red-700 block mb-1">CRITICAL NOTICE:</strong>
                                    <p className="text-red-900/80 text-sm">
                                        Vita is a crowdsourced information platform. We do not guarantee the availability of resources. In a life-threatening medical emergency, always attempt to call national emergency services (112/911) first.
                                    </p>
                                </div>
                                <p className="text-sm">
                                    We verify resources to the best of our ability using AI and community reports, but real-time status changes may occur.
                                </p>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <FileText className="text-yellow-500 w-5 h-5" /> 3. User Conduct
                                </h3>
                                <ul className="list-none space-y-3 pl-0">
                                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                                        <span className="text-sm"><strong>False Alarms:</strong> Intentionally triggering SOS for non-emergencies is a criminal offense.</span>
                                    </li>
                                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                                        <span className="text-sm"><strong>Misinformation:</strong> Posting false availability of medicines or beds will result in an IP ban.</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="border-t border-slate-100 pt-8">
                                <p className="text-slate-500 text-sm mb-6">
                                    Questions? Contact Legal Team at <a href="mailto:legal@vita.network" className="text-pink-600 font-bold hover:underline">legal@vita.network</a>.
                                </p>
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
