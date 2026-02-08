'use client';

import { useEffect, useState } from 'react';
import { Resource } from '@/types';
import { Check, X, ShieldAlert } from 'lucide-react';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/features/Map/Map'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Heatmap...</div>
});

export default function AdminPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, this would be authenticated
        async function fetchResources() {
            const res = await fetch('/api/resources');
            const data = await res.json();
            setResources(data);
            setLoading(false);
        }
        fetchResources();
    }, []);

    const unverifiedResources = resources.filter(r => r.verificationLevel === 'UNVERIFIED');
    const flaggedResources = resources.filter(r => r.verificationLevel === 'FLAGGED');

    const handleVerify = (id: string) => {
        // Mock API call
        alert(`Resource ${id} verified! (Mock)`);
        setResources(resources.map(r => r.id === id ? { ...r, verificationLevel: 'COMMUNITY' } : r));
    };

    const handleReject = (id: string) => {
        // Mock API call
        alert(`Resource ${id} rejected! (Mock)`);
        setResources(resources.filter(r => r.id !== id));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <ShieldAlert className="text-red-600" /> Admin Dashboard
            </h1>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Total Resources</p>
                    <p className="text-3xl font-black text-gray-900">{resources.length}</p>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Pending Verification</p>
                    <p className="text-3xl font-black text-orange-500">{unverifiedResources.length}</p>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Flagged Items</p>
                    <p className="text-3xl font-black text-red-600">{flaggedResources.length}</p>
                </div>
                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase">Community Trust</p>
                    <p className="text-3xl font-black text-green-600">94%</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* LEFT COL: TASKS */}
                <div className="space-y-8">

                    {/* FLAGGED RESOURCES */}
                    <div className="card border-red-100 bg-red-50/30">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
                            <ShieldAlert size={20} /> Attention Needed ({flaggedResources.length})
                        </h2>
                        {flaggedResources.length === 0 ? (
                            <p className="text-gray-500 text-sm">No flagged content.</p>
                        ) : (
                            <div className="space-y-3">
                                {flaggedResources.map(r => (
                                    <div key={r.id} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-red-900">{r.title}</h3>
                                                <p className="text-xs text-red-600">Reported {r.reportCount} times</p>
                                            </div>
                                            <button onClick={() => handleReject(r.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PENDING VERIFICATION */}
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4">Pending Verification ({unverifiedResources.length})</h2>
                        {loading ? <p>Loading...</p> : (
                            <div className="space-y-4">
                                {unverifiedResources.length === 0 ? (
                                    <p className="text-gray-500">No pending resources.</p>
                                ) : (
                                    unverifiedResources.map(resource => (
                                        <div key={resource.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-100 rounded-lg bg-gray-50">
                                            <div>
                                                <h3 className="font-bold">{resource.title}</h3>
                                                <p className="text-sm text-gray-600">{resource.type} • {resource.location.address}</p>
                                                <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(resource.lastUpdated).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2 mt-4 md:mt-0">
                                                <button onClick={() => handleVerify(resource.id)} className="btn bg-green-100 text-green-700 hover:bg-green-200 border-green-200 text-sm py-1 px-3">
                                                    <Check size={16} className="mr-1" /> Approve
                                                </button>
                                                <button onClick={() => handleReject(resource.id)} className="btn bg-red-100 text-red-700 hover:bg-red-200 border-red-200 text-sm py-1 px-3">
                                                    <X size={16} className="mr-1" /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COL: MAP & ANALYTICS */}
                <div className="space-y-8">
                    <div className="card p-0 overflow-hidden h-[500px] border border-gray-200 relative">
                        <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow text-xs font-bold uppercase text-gray-500">
                            Live Incident Heatmap
                        </div>
                        <Map resources={resources} />
                    </div>
                </div>
            </div>
        </div>
    );
}
