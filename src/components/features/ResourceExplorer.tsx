'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map from '@/components/features/Map';
import ResourceCard from '@/components/features/ResourceCard';
import { Resource } from '@/types';
import { Search, Trash2 } from 'lucide-react';
import ChatWidget from './ChatWidget';
import EmergencyButton from './EmergencyButton';

interface ResourceExplorerProps {
    initialFilter?: string;
    title?: string;
    searchQuery?: string;
}

export default function ResourceExplorer({ initialFilter = 'ALL', title, searchQuery = '' }: ResourceExplorerProps) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(initialFilter);
    const [subFilter, setSubFilter] = useState<string | null>(null);
    const [internalSearch, setInternalSearch] = useState(searchQuery);

    const handleDeleteResource = async (id: string) => {
        try {
            const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setResources(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Failed to delete resource");
            }
        } catch (error) {
            console.error("Error deleting resource:", error);
            alert("Error deleting resource");
        }
    };

    // Sync internal search if prop changes (Global Search drives this)
    useEffect(() => {
        setInternalSearch(searchQuery);
    }, [searchQuery]);

    // Sync state with prop if it changes (Critical for Sidebar navigation)
    useEffect(() => {
        setFilter(initialFilter);
        setSubFilter(null);
    }, [initialFilter]);

    useEffect(() => {
        async function fetchResources() {
            setLoading(true);
            try {
                let url = '/api/resources';
                const params = new URLSearchParams();

                // If filter is specific (not ALL), pass it
                if (filter !== 'ALL') params.append('type', filter);

                // Pass Search Query
                if (internalSearch) params.append('query', internalSearch);

                // Add Sub-filters
                if (filter === 'BLOOD' || filter === 'BLOOD_BANK') {
                    // Check if filter is a Blood Group or a Component
                    if (subFilter) {
                        if (['PLASMA', 'PLATELETS'].includes(subFilter)) {
                            params.append('component', subFilter);
                        } else {
                            params.append('bloodGroup', subFilter);
                        }
                    }
                }

                if (filter === 'OXYGEN') {
                    if (subFilter) params.append('oxygenType', subFilter);
                }

                if (Array.from(params).length > 0) url += `?${params.toString()}`;

                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    setResources(data);
                } else {
                    console.error('[ResourceExplorer] API returned non-array:', data);
                    setResources([]);
                }
            } catch (err) {
                console.warn('Failed to fetch resources, using empty state.', err);
                setResources([]);
            } finally {
                setLoading(false);
            }
        }
        // Debounce slightly if typing fast, but for now direct call
        const timer = setTimeout(() => fetchResources(), 300);
        return () => clearTimeout(timer);
    }, [filter, subFilter, internalSearch]); // Refetch on any change

    // If fetching from API, we don't need client-side filtering unless for other optimizations
    // But for now, we rely on API response which is already filtered.
    const displayResources = resources;



    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden relative bg-white dark:bg-slate-900">
            <div className="md:hidden absolute top-0 left-0 right-0 z-20 bg-white dark:bg-slate-900 p-2 text-center border-b border-gray-100 dark:border-slate-800 font-bold text-sm text-gray-900 dark:text-white">
                {title || 'Resource Map'}
            </div>

            <div className="w-full md:w-1/3 lg:w-96 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col h-1/2 md:h-full z-10 pt-10 md:pt-0">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 sticky top-0">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white mb-4 hidden md:block tracking-tight">{title || 'Find Resources'}</h1>
                    <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={internalSearch}
                            onChange={(e) => setInternalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:text-gray-900 dark:focus:text-white transition-all shadow-inner focus:shadow-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                    {initialFilter === 'ALL' && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['ALL', 'HOSPITAL', 'BLOOD_BANK', 'OXYGEN', 'AMBULANCE', 'SHELTER', 'DOCTOR'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setFilter(type); setSubFilter(null); }}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === type
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-md shadow-gray-900/10'
                                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Sub Filters for BLOOD */}
                    <AnimatePresence>
                        {(filter === 'BLOOD' || filter === 'BLOOD_BANK') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 block">Blood Group</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                <button
                                                    key={bg}
                                                    onClick={() => setSubFilter(subFilter === bg ? null : bg)}
                                                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${subFilter === bg
                                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-500 ring-offset-2'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-200 hover:bg-red-50'
                                                        }`}
                                                >
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-50">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 block">Component</label>
                                        <div className="flex gap-2">
                                            {['PLASMA', 'PLATELETS'].map(comp => (
                                                <button
                                                    key={comp}
                                                    onClick={() => setSubFilter(subFilter === comp ? null : comp)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${subFilter === comp
                                                        ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                                                        }`}
                                                >
                                                    {comp}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sub Filters for OXYGEN */}
                    <AnimatePresence>
                        {(filter === 'OXYGEN') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 block">Supply Type</label>
                                <div className="flex gap-2">
                                    {['CYLINDER', 'CONCENTRATOR', 'REFILL'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setSubFilter(subFilter === type ? null : type)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${subFilter === type
                                                ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {initialFilter !== 'ALL' && (
                        <div className="text-xs font-medium text-gray-400 mt-3 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Showing {displayResources.length} live results
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-950">
                    {loading ? (
                        <p className="text-center text-gray-500 mt-10">Loading resources...</p>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {displayResources.map(resource => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                                    transition={{
                                        layout: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
                                        opacity: { duration: 0.3 }
                                    }}
                                    key={resource.id}
                                    className="relative group"
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Are you sure you want to delete this resource?')) {
                                                handleDeleteResource(resource.id);
                                            }
                                        }}
                                        className="absolute top-2 right-2 z-10 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        title="Delete Resource"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <ResourceCard resource={resource} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    {!loading && displayResources.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-500 mt-10"
                        >
                            <p>No resources found.</p>
                            <div className="mt-4">
                                <a href="/add" className="text-blue-600 hover:underline">Add a new resource</a>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Map View */}
            <div className="flex-1 h-1/2 md:h-full relative">
                <Map resources={displayResources} className="h-full w-full" />
            </div>

            {/* <ChatWidget /> */}
            {/* <EmergencyButton /> */}
        </div>
    );
}
