import React, { useState } from 'react';
import {
    Clock, CheckCircle, AlertTriangle, User, Shield,
    ArrowRight, Phone, Navigation, Zap, Activity
} from 'lucide-react';
import { Request, ActivityLogItem, MatchSuggestion, RequestStatus } from '@/types';
import { motion } from 'framer-motion';

// --- Helper Functions ---
const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: RequestStatus) => {
    switch (status) {
        case 'ESCALATED': return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200';
        case 'CANCELLED': return 'text-gray-500 bg-gray-50 border-gray-200';
        default: return 'text-gray-700 bg-white border-gray-200';
    }
};

// --- SUBSYSTEM: TIMELINE ---
export const RequestTimeline = ({ timeline }: { timeline: ActivityLogItem[] }) => {
    return (
        <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
            {timeline.slice().reverse().map((item, idx) => (
                <div key={item.id} className="relative">
                    {/* Timestamp Dot */}
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm
                        ${item.type === 'CREATED' ? 'bg-blue-500' :
                            item.type === 'STATUS_CHANGE' ? 'bg-purple-500' :
                                item.type === 'MATCH_FOUND' ? 'bg-green-500' : 'bg-gray-400'}`}
                    />

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <Clock size={12} />
                            {formatTime(item.timestamp)}
                        </div>
                        <p className="text-gray-900 font-medium text-sm leading-snug">
                            {item.message}
                        </p>
                        {item.actor === 'SYSTEM' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                <Zap size={10} strokeWidth={3} /> AI System
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">by {item.actor}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- SUBSYSTEM: AI MATCHES ---
export const AIMatches = ({ matches }: { matches: MatchSuggestion[] }) => {
    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                <Zap size={16} className="text-yellow-500" fill="currentColor" />
                AI Best Matches
            </h3>

            <div className="grid gap-3">
                {matches.map((match) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={match.resourceId}
                        className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {match.resourceName}
                                </h4>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 font-bold
                                        ${match.verificationLevel === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        <Shield size={10} /> {match.verificationLevel}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <Navigation size={10} /> {match.distance} km away
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-blue-600/20 group-hover:text-blue-600 transition-colors">
                                    {match.matchScore}%
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Match Score</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => alert("Request sent to all hospitals")} className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                                <Phone size={12} /> Call
                            </button>
                            <button onClick={() => alert("Request sent to all hospitals")} className="flex-1 py-1.5 bg-blue-600 border border-blue-600 rounded-lg text-xs font-bold text-white shadow-sm hover:bg-blue-700 flex items-center justify-center gap-2">
                                Assign <ArrowRight size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- SUBSYSTEM: STATUS CONTROL ---
export const StatusControl = ({
    currentStatus,
    onUpdateStatus,
    onAddNote
}: {
    currentStatus: RequestStatus,
    onUpdateStatus: (s: RequestStatus) => void,
    onAddNote: (note: string) => void
}) => {
    const [note, setNote] = useState('');

    const handleSubmitNote = () => {
        if (!note.trim()) return;
        onAddNote(note);
        setNote('');
    };

    return (
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={16} /> Operational Control
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                        {(['IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CANCELLED'] as RequestStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => onUpdateStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                                    ${currentStatus === status
                                        ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Note</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                            placeholder="Add internal note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitNote()}
                        />
                        <button
                            onClick={handleSubmitNote}
                            className="bg-gray-900 text-white px-4 rounded-lg font-bold text-xs"
                        >
                            Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
