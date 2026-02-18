'use client';

import { useEffect, useState } from 'react';
import { Request } from '@/types';
import {
    Phone, MapPin, Clock, Plus, X, MessageSquare,
    CheckCircle2, Trash2, RefreshCw, AlertTriangle,
    Send, Loader2, PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_OPTIONS = ['BLOOD', 'OXYGEN', 'AMBULANCE', 'HOSPITAL', 'DOCTOR', 'MEDICINE', 'SHELTER', 'OTHER'];

const TYPE_STYLES: Record<string, { badge: string; dot: string }> = {
    BLOOD: { badge: 'bg-red-500/20 text-red-300 border-red-500/30', dot: 'bg-red-400' },
    OXYGEN: { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' },
    AMBULANCE: { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
    HOSPITAL: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
    DOCTOR: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
    MEDICINE: { badge: 'bg-green-500/20 text-green-300 border-green-500/30', dot: 'bg-green-400' },
    SHELTER: { badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400' },
    OTHER: { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30', dot: 'bg-slate-400' },
};

const STATUS_STYLES: Record<string, string> = {
    OPEN: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    FULFILLED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    CLOSED: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<Request | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [formData, setFormData] = useState({
        title: '', description: '', contact: '', location: '', type: 'BLOOD', urgency: 'MEDIUM'
    });

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => { setRequests(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, status: 'OPEN' }),
            });
            if (res.ok) {
                const newReq = await res.json();
                setRequests(prev => [newReq, ...prev]);
                setShowForm(false);
                setFormData({ title: '', description: '', contact: '', location: '', type: 'BLOOD', urgency: 'MEDIUM' });
                showToast('Request posted successfully!', 'success');
            } else {
                showToast('Failed to post request. Try again.', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/requests/${deleteModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== deleteModal.id));
                showToast('Request deleted.', 'success');
            } else {
                showToast('Failed to delete. Try again.', 'error');
            }
        } catch {
            showToast('Network error.', 'error');
        } finally {
            setDeleting(false);
            setDeleteModal(null);
        }
    };

    const openCount = requests.filter(r => r.status === 'OPEN').length;
    const fulfilledCount = requests.filter(r => r.status === 'FULFILLED').length;

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white">

            {/* ── Page Header ── */}
            <div className="pt-20 pb-6 px-6 md:px-10 border-b border-white/5">
                <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Community Requests</h1>
                        <p className="text-sm text-slate-400 mt-1">Real-time help requests posted by the community</p>
                        {!loading && (
                            <div className="flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    {openCount} open
                                </span>
                                {fulfilledCount > 0 && (
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        {fulfilledCount} fulfilled
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-900/30 flex-shrink-0"
                    >
                        <Plus size={16} />
                        Request Help
                    </button>
                </div>
            </div>

            {/* ── Request List ── */}
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                        <Loader2 size={32} className="animate-spin mb-3 text-slate-600" />
                        <p className="text-sm">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                            <MessageSquare size={32} className="text-slate-600" />
                        </div>
                        <p className="text-slate-300 font-semibold text-lg">No requests yet</p>
                        <p className="text-slate-600 text-sm mt-1 mb-6">Be the first to post a community help request.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold transition-all"
                        >
                            <Plus size={15} /> Post First Request
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {requests.map((req, i) => {
                                const typeStyle = TYPE_STYLES[req.type] || TYPE_STYLES.OTHER;
                                return (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                        transition={{ delay: i * 0.04 }}
                                        className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                                    >
                                        {/* Card Body */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${typeStyle.badge}`}>
                                                        {req.type}
                                                    </span>
                                                    {req.status && (
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${STATUS_STYLES[req.status] || STATUS_STYLES.OPEN}`}>
                                                            {req.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="flex items-center gap-1 text-[11px] text-slate-600 flex-shrink-0">
                                                    <Clock size={10} />
                                                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold text-white leading-snug">{req.title}</h3>
                                            {req.description && (
                                                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{req.description}</p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                                {req.location && (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <MapPin size={11} className="text-slate-600" />
                                                        {req.location}
                                                    </span>
                                                )}
                                                {req.contact && (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Phone size={11} className="text-slate-600" />
                                                        {req.contact}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.02] flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                {req.contact && (
                                                    <>
                                                        <a
                                                            href={`tel:${req.contact}`}
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                                                        >
                                                            <PhoneCall size={11} />
                                                            Call
                                                        </a>
                                                        <a
                                                            href={`https://wa.me/${req.contact.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-xs font-semibold transition-all"
                                                        >
                                                            <MessageSquare size={11} />
                                                            WhatsApp
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setDeleteModal(req)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold transition-all"
                                            >
                                                <Trash2 size={11} />
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* ── Post Request Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => !submitting && setShowForm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.93, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.93, y: 16 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 pt-6 pb-5 border-b border-white/[0.06] flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Post a Help Request</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">The community will see this and can reach out to you.</p>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    disabled={submitting}
                                    className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                                {/* Type Selector */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Resource Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TYPE_OPTIONS.map(type => {
                                            const s = TYPE_STYLES[type] || TYPE_STYLES.OTHER;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData(f => ({ ...f, type }))}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${formData.type === type
                                                        ? s.badge + ' scale-105'
                                                        : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:border-white/20'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Urgency Selector */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Urgency Level</label>
                                    <div className="flex gap-2">
                                        {([
                                            { value: 'LOW', label: 'Low', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
                                            { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                                            { value: 'HIGH', label: 'High', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
                                            { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
                                        ] as const).map(u => (
                                            <button
                                                key={u.value}
                                                type="button"
                                                onClick={() => setFormData(f => ({ ...f, urgency: u.value }))}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${formData.urgency === u.value
                                                    ? u.color + ' scale-105'
                                                    : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:border-white/20'
                                                    }`}
                                            >
                                                {u.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Title</label>
                                    <input
                                        placeholder="e.g. Urgently need B+ blood donor"
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                                        value={formData.title}
                                        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Details</label>
                                    <textarea
                                        placeholder="Patient condition, hospital name, urgency level..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                                        required
                                    />
                                </div>

                                {/* Contact + Location */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Contact</label>
                                        <input
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                                            value={formData.contact}
                                            onChange={e => setFormData(f => ({ ...f, contact: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Location</label>
                                        <input
                                            placeholder="Area, City"
                                            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                                            value={formData.location}
                                            onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        disabled={submitting}
                                        className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 disabled:opacity-60"
                                    >
                                        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                        {submitting ? 'Posting...' : 'Post Request'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation Modal ── */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => !deleting && setDeleteModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.93, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.93, y: 16 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 pt-6 pb-5 border-b border-white/[0.06] flex items-start gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Delete Request?</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">This will permanently remove <span className="text-white font-semibold">"{deleteModal.title}"</span> from the community board.</p>
                                </div>
                            </div>
                            <div className="px-6 py-5 flex gap-3">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    disabled={deleting}
                                    className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 disabled:opacity-60"
                                >
                                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold whitespace-nowrap ${toast.type === 'success'
                            ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950 border-red-500/40 text-red-300'
                            }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 size={15} className="text-emerald-400" />
                            : <AlertTriangle size={15} className="text-red-400" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
