"use client";
import React from 'react';
import { Shield, Lock, Eye, Server } from 'lucide-react';
import Link from 'next/link';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#020617] selection:bg-cyan-300 selection:text-cyan-900">
            <ContainerScroll
                titleComponent={
                    <>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-bold uppercase tracking-wider border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                                <Shield className="inline-block w-4 h-4 mr-2 mb-0.5" />
                                Privacy & Security
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
                            Your Data. <br />
                            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                                Our Responsibility.
                            </span>
                        </h1>
                    </>
                }
            >
                {/* Scrollable Card Content */}
                <div className="w-full bg-white border border-slate-200/50 backdrop-blur-xl rounded-2xl p-6 md:p-12 text-left relative">

                    {/* Decorative Background inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                <Lock className="text-blue-500" /> Vita Privacy Protocol
                            </h2>
                            <span className="text-xs font-bold text-gray-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                v2.4 • Updated Jan 2026
                            </span>
                        </div>

                        <div className="prose prose-lg max-w-none text-slate-600">
                            <section className="mb-10">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Eye className="text-cyan-500 w-5 h-5" /> 1. Data Collection
                                </h3>
                                <p className="mb-4 text-sm md:text-base leading-relaxed">
                                    We collect only the essential information necessary to provide life-saving emergency services. This includes:
                                </p>
                                <ul className="list-none space-y-3 pl-0">
                                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                        <span className="text-sm"><strong>Personal Identity:</strong> Name, phone number, and medical qualifications (for verified volunteers).</span>
                                    </li>
                                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></span>
                                        <span className="text-sm"><strong>Live Geolocation:</strong> Used strictly for matching active SOS requests with nearest resources.</span>
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-10">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Server className="text-indigo-500 w-5 h-5" /> 2. Usage & Security
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-2xl border border-cyan-100">
                                        <h4 className="font-bold text-cyan-900 text-sm mb-2">How we use it</h4>
                                        <p className="text-xs text-cyan-800/80">
                                            To coordinate ambulance dispatch, verify blood bank inventory, and connect critical patients with doctors.
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                                        <h4 className="font-bold text-purple-900 text-sm mb-2">Zero Sale Policy</h4>
                                        <p className="text-xs text-purple-800/80">
                                            We never sell data to advertisers. Your medical privacy is sacred and protected by advanced encryption.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="border-t border-slate-100 pt-8">
                                <p className="text-slate-500 text-sm mb-6">
                                    For data requests or deletion, contact <a href="mailto:dpo@vita.network" className="text-blue-600 font-bold hover:underline">dpo@vita.network</a>.
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
