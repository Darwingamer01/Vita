'use client';

import { useEffect, useState } from 'react';
import { Resource } from '@/types';
import {
    Check, X, ShieldAlert, Database, Clock, TrendingUp,
    Shield, AlertTriangle, CheckCircle2, MapPin, Phone,
    RefreshCw, Eye, Trash2, Activity, Users, Zap, BarChart3
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const Map = dynamic(() => import('@/components/features/Map/Map'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-800/50 animate-pulse flex items-center justify-center text-slate-500 text-sm font-medium rounded-xl">
            Loading Map...
        </div>
    ),
});

const TYPE_COLORS: Record<string, string> = {
    HOSPITAL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    BLOOD: 'bg-red-500/20 text-red-300 border-red-500/30',
    BLOOD_BANK: 'bg-red-500/20 text-red-300 border-red-500/30',
    OXYGEN: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    AMBULANCE: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    DOCTOR: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    MEDICINE: 'bg-green-500/20 text-green-300 border-green-500/30',
    SHELTER: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

const TYPE_BAR_COLORS: Record<string, string> = {
    HOSPITAL: 'bg-blue-500',
    BLOOD: 'bg-red-500',
    BLOOD_BANK: 'bg-red-400',
    OXYGEN: 'bg-cyan-500',
    AMBULANCE: 'bg-orange-500',
    DOCTOR: 'bg-purple-500',
    MEDICINE: 'bg-green-500',
    SHELTER: 'bg-yellow-500',
};

// ── Confirmation Modal Types ──
type ModalAction = { type: 'approve' | 'reject'; resource: Resource } | null;

export default function AdminPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'flagged' | 'all'>('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalAction>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchResources = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await fetch('/api/resources');
            const data = await res.json();
            setResources(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchResources(); }, []);

    const unverifiedResources = resources.filter(r => r.verificationLevel === 'UNVERIFIED');
    const flaggedResources = resources.filter(r => r.verificationLevel === 'FLAGGED');
    const verifiedResources = resources.filter(r =>
        r.verificationLevel === 'VERIFIED' || r.verificationLevel === 'COMMUNITY'
    );

    const confirmAction = async () => {
        if (!modal) return;
        const { type, resource } = modal;
        setModal(null);
        setActionLoading(resource.id + '-' + type);
        await new Promise(r => setTimeout(r, 500));
        if (type === 'approve') {
            setResources(prev => prev.map(r => r.id === resource.id ? { ...r, verificationLevel: 'VERIFIED' } : r));
            showToast(`"${resource.title}" approved successfully.`, 'success');
        } else {
            setResources(prev => prev.filter(r => r.id !== resource.id));
            showToast(`"${resource.title}" has been rejected and removed.`, 'error');
        }
        setActionLoading(null);
    };

    const handleVerify = (resource: Resource) => setModal({ type: 'approve', resource });
    const handleReject = (resource: Resource) => setModal({ type: 'reject', resource });

    const trustScore = resources.length > 0
        ? Math.round((verifiedResources.length / resources.length) * 100)
        : 0;

    const tabResources = activeTab === 'pending'
        ? unverifiedResources
        : activeTab === 'flagged'
            ? flaggedResources
            : resources;

    const typeBreakdown = Object.entries(
        resources.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a);

    const isApprove = modal?.type === 'approve';

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white">
            {/* ── Page Header ── */}
            <div className="pt-20 pb-6 px-6 md:px-10 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/30 to-orange-500/20 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-900/20">
                            <Shield size={20} className="text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Admin Dashboard</h1>
                            <p className="text-sm text-slate-400 mt-0.5">Resource moderation &amp; community oversight</p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchResources(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-slate-300 transition-all"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-8">

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Resources',
                            value: loading ? '—' : resources.length,
                            sub: `${verifiedResources.length} verified`,
                            icon: Database,
                            iconColor: 'text-blue-400',
                            border: 'border-blue-500/20',
                            glow: 'shadow-blue-900/20',
                        },
                        {
                            label: 'Pending Review',
                            value: loading ? '—' : unverifiedResources.length,
                            sub: unverifiedResources.length > 0 ? 'needs action' : 'all clear',
                            icon: Clock,
                            iconColor: 'text-amber-400',
                            border: 'border-amber-500/20',
                            glow: 'shadow-amber-900/20',
                        },
                        {
                            label: 'Flagged Items',
                            value: loading ? '—' : flaggedResources.length,
                            sub: flaggedResources.length === 0 ? 'community healthy' : 'urgent review',
                            icon: AlertTriangle,
                            iconColor: 'text-red-400',
                            border: 'border-red-500/20',
                            glow: 'shadow-red-900/20',
                        },
                        {
                            label: 'Trust Score',
                            value: loading ? '—' : `${trustScore}%`,
                            sub: 'community rating',
                            icon: TrendingUp,
                            iconColor: 'text-emerald-400',
                            border: 'border-emerald-500/20',
                            glow: 'shadow-emerald-900/20',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className={`relative p-5 rounded-2xl bg-white/[0.03] border ${stat.border} shadow-lg ${stat.glow} overflow-hidden`}
                        >
                            {/* subtle gradient blob */}
                            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl bg-current" />
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <stat.icon size={15} className={stat.iconColor} />
                            </div>
                            <p className={`text-4xl font-black ${stat.iconColor} leading-none`}>{stat.value}</p>
                            <p className="text-xs text-slate-600 mt-2">{stat.sub}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── Main Content ── */}
                <div className="grid xl:grid-cols-3 gap-6">

                    {/* LEFT: Moderation Panel (2 cols) */}
                    <div className="xl:col-span-2 flex flex-col gap-4">

                        {/* Tab Bar */}
                        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
                            {([
                                { id: 'pending', label: 'Pending', count: unverifiedResources.length, dot: 'bg-amber-400' },
                                { id: 'flagged', label: 'Flagged', count: flaggedResources.length, dot: 'bg-red-400' },
                                { id: 'all', label: 'All Resources', count: resources.length, dot: 'bg-slate-500' },
                            ] as const).map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                        ? 'bg-white/10 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`w-5 h-5 rounded-full ${tab.dot} text-white text-[10px] font-black flex items-center justify-center`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Resource List */}
                        <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="p-12 text-center text-slate-500">
                                    <Activity size={28} className="mx-auto mb-3 animate-pulse text-slate-600" />
                                    <p className="text-sm">Loading resources...</p>
                                </div>
                            ) : tabResources.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={28} className="text-emerald-400" />
                                    </div>
                                    <p className="text-slate-300 font-semibold">
                                        {activeTab === 'pending' ? 'No pending resources' :
                                            activeTab === 'flagged' ? 'No flagged content' :
                                                'No resources found'}
                                    </p>
                                    <p className="text-slate-600 text-sm mt-1">
                                        {activeTab === 'all' ? 'Add some resources to get started.' : 'Everything looks good!'}
                                    </p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {tabResources.map((resource, i) => (
                                        <motion.div
                                            key={resource.id}
                                            layout
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
                                            transition={{ delay: i * 0.04 }}
                                            className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors group"
                                        >
                                            {/* Type Badge */}
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${TYPE_COLORS[resource.type] || 'bg-slate-700/50 text-slate-300 border-slate-600/50'}`}>
                                                {resource.type.replace('_', '\u00A0')}
                                            </span>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-sm truncate">{resource.title}</p>
                                                <div className="flex items-center gap-4 mt-0.5">
                                                    {(resource.location?.address || (resource.location?.lat && resource.location?.lng)) && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                            <MapPin size={9} />
                                                            {resource.location.address || `${resource.location.lat?.toFixed(4)}, ${resource.location.lng?.toFixed(4)}`}
                                                        </span>
                                                    )}
                                                    {resource.contact?.phone && (
                                                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                            <Phone size={9} />
                                                            {resource.contact.phone}
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] text-slate-600">
                                                        {new Date(resource.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    {resource.reportCount > 0 && (
                                                        <span className="text-[11px] text-red-400 font-semibold">
                                                            ⚠ {resource.reportCount} report{resource.reportCount > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                 {(activeTab === 'pending' || activeTab === 'flagged') ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerify(resource)}
                                                            disabled={!!actionLoading}
                                                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                                                        >
                                                            {actionLoading === resource.id + '-approve'
                                                                ? <RefreshCw size={11} className="animate-spin" />
                                                                : <Check size={11} />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(resource)}
                                                            disabled={!!actionLoading}
                                                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                                                        >
                                                            {actionLoading === resource.id + '-reject'
                                                                ? <RefreshCw size={11} className="animate-spin" />
                                                                : <X size={11} />}
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${resource.verificationLevel === 'VERIFIED' || resource.verificationLevel === 'COMMUNITY'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                            : resource.verificationLevel === 'FLAGGED'
                                                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                            }`}>
                                                            {resource.verificationLevel}
                                                        </span>
                                                        <button
                                                            onClick={() => handleReject(resource)}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Map + Analytics (1 col) */}
                    <div className="flex flex-col gap-4">

                        {/* Live Map */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex-shrink-0">
                            <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-sm font-semibold text-white">Live Map</span>
                                </div>
                                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{resources.length} markers</span>
                            </div>
                            <div className="h-64 relative">
                                <Map resources={resources} />
                            </div>
                        </div>

                        {/* Resource Breakdown */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <BarChart3 size={14} className="text-blue-400" />
                                <h3 className="text-sm font-semibold text-white">Resource Breakdown</h3>
                            </div>
                            {typeBreakdown.length === 0 ? (
                                <p className="text-xs text-slate-600 text-center py-4">No data yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {typeBreakdown.map(([type, count]) => (
                                        <div key={type} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 w-20 truncate font-medium">{type.replace('_', ' ')}</span>
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(count / resources.length) * 100}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                    className={`h-full rounded-full ${TYPE_BAR_COLORS[type] || 'bg-slate-500'}`}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-300 w-4 text-right">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap size={14} className="text-purple-400" />
                                <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Live Map', href: '/map', icon: Eye, color: 'hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300' },
                                    { label: 'Add Resource', href: '/add', icon: Zap, color: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300' },
                                    { label: 'Dashboard', href: '/dashboard', icon: Activity, color: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300' },
                                    { label: 'Requests', href: '/requests', icon: ShieldAlert, color: 'hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300' },
                                ].map(action => (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border border-white/[0.06] text-slate-400 transition-all ${action.color}`}
                                    >
                                        <action.icon size={17} />
                                        <span className="text-xs font-semibold">{action.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Confirmation Modal ── */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 16 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md bg-[#111827] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className={`px-6 pt-6 pb-5 border-b border-white/[0.06] flex items-start gap-4`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    isApprove
                                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                                        : 'bg-red-500/15 border border-red-500/30'
                                }`}>
                                    {isApprove
                                        ? <CheckCircle2 size={22} className="text-emerald-400" />
                                        : <AlertTriangle size={22} className="text-red-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-bold text-white">
                                        {isApprove ? 'Approve Resource?' : 'Reject Resource?'}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        {isApprove
                                            ? 'This resource will be marked as verified and visible to all users.'
                                            : 'This resource will be permanently removed from the platform.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModal(null)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Resource Preview */}
                            <div className="px-6 py-4">
                                <div className="flex items-center gap-3 p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${
                                        TYPE_COLORS[modal.resource.type] || 'bg-slate-700/50 text-slate-300 border-slate-600/50'
                                    }`}>
                                        {modal.resource.type.replace('_', '\u00A0')}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white text-sm truncate">{modal.resource.title}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {modal.resource.location?.address
                                                || (modal.resource.location?.lat && `${modal.resource.location.lat.toFixed(4)}, ${modal.resource.location.lng?.toFixed(4)}`)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-6 flex gap-3">
                                <button
                                    onClick={() => setModal(null)}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                        isApprove
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/40'
                                            : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-900/40'
                                    }`}
                                >
                                    {isApprove ? <Check size={15} /> : <Trash2 size={15} />}
                                    {isApprove ? 'Yes, Approve' : 'Yes, Reject'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Toast Notification ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
                            toast.type === 'success'
                                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-950 border-red-500/40 text-red-300'
                        }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                            : <X size={16} className="text-red-400 flex-shrink-0" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
