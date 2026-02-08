'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Map as MapIcon,
    Users,
    Settings,
    Bell,
    LogOut,
    Home,
    FileText,
    Shield,
    Search,
    Database,
    Lock,
    Cpu,
    Mic,
    Heart,
    Ambulance,
    Zap,
    Building2,
    Pill,
    Stethoscope,
    Plus,
    PenLine,
    X,
    Filter,
    AlertTriangle,
    Phone,
    MapPin,
    AlignLeft,
    AlertCircle,
    Radio
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { pusherClient } from '../../lib/pusher-client';

// Dynamic Map Import to avoid SSR issues
import dynamic from 'next/dynamic';
import ResourceExplorer from '@/components/features/ResourceExplorer';
import { FloatingDock } from '@/components/ui/floating-dock';
import ChatWidget from '@/components/features/ChatWidget';
import EmergencyButton from '@/components/features/EmergencyButton';
import SettingsPanel from '@/components/features/Settings/SettingsPanel';
import { RequestTimeline, AIMatches, StatusControl } from '@/components/features/RequestLifecycle';
import { Request, ResourceType, UrgencyLevel, RequestStatus, Resource } from '@/types';

const Map = dynamic(() => import('@/components/features/Map/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map Engine...</div>
});

// Mock Chart (Line)
const MiniChart = () => (
    <div className="flex items-end gap-1 h-32 w-full mt-4 opacity-50">
        {[40, 60, 45, 70, 50, 60, 75, 50, 65, 80, 70, 90, 60, 85, 95, 70, 80, 60, 75, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
        ))}
    </div>
);

// Wrap content in Suspense for useSearchParams
function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('requests');
    const [globalSearch, setGlobalSearch] = useState('');
    const [stats, setStats] = useState({
        activeIncidents: 0,
        activeUnits: 0,
        availableBeds: 0,
        totalResources: 0,
        latency: '--',
        recentIncidents: [] as any[]
    });

    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await fetch('/api/resources');
                const data = await res.json();
                setResources(data);
            } catch (error) {
                console.error('Failed to fetch resources:', error);
            }
        };
        fetchResources();
    }, []);

    // Real-time Requests Subscription
    useEffect(() => {
        const channel = pusherClient.subscribe('requests-channel');

        channel.bind('new-request', (newReq: Request) => {
            setUserRequests((prev) => [newReq, ...prev]);
        });

        return () => {
            pusherClient.unsubscribe('requests-channel');
        };
    }, []);

    interface NavItem {
        id: string;
        label: string;
        icon: React.ReactNode;
        group: string;
        badge?: string;
    }

    const [userRequests, setUserRequests] = useState<Request[]>([]);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<Request | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [showNotifications, setShowNotifications] = useState(false);
    const [viewingRequest, setViewingRequest] = useState<Request | null>(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            const data = await res.json();
            setUserRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };

    const handleUpdateStatus = async (status: RequestStatus) => {
        if (!viewingRequest) return;
        try {
            const res = await fetch(`/api/requests/${viewingRequest.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updated = await res.json();
                setViewingRequest(updated);
                fetchRequests();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleAddNote = async (note: string) => {
        if (!viewingRequest) return;
        try {
            const res = await fetch(`/api/requests/${viewingRequest.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: note })
            });
            if (res.ok) {
                const updated = await res.json();
                setViewingRequest(updated);
                fetchRequests();
            }
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };


    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'MEDICAL' as ResourceType,
        urgency: 'MODERATE' as UrgencyLevel,
        location: '',
        contact: ''
    });

    useEffect(() => {
        // Load initial requests from DB via API
        fetchRequests();
    }, []);

    const navItems: NavItem[] = [
        { id: 'requests', label: 'Live Requests', icon: <Radio size={18} />, group: 'main' },
        { id: 'shelter', label: 'Shelters', icon: <Home size={18} />, group: 'resources' },
        { id: 'doctor', label: 'Doctors', icon: <Stethoscope size={18} />, group: 'resources' },
        { id: 'hospital', label: 'Hospitals', icon: <Building2 size={18} />, group: 'resources' },
        { id: 'medicine', label: 'Medicines', icon: <Pill size={18} />, group: 'resources' },
        { id: 'blood', label: 'Blood Banks', icon: <Heart size={18} />, group: 'resources' },
        { id: 'ambulance', label: 'Ambulance', icon: <Ambulance size={18} />, group: 'resources' },
        { id: 'oxygen', label: 'Oxygen', icon: <Zap size={18} />, group: 'resources' },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} />, group: 'main' },
        { id: 'logout', label: 'Logout', icon: <LogOut size={18} />, group: 'admin' },
    ];


    const handleOpenAdd = () => {
        setEditingRequest(null);
        setFormData({
            title: '',
            description: '',
            type: '' as ResourceType,
            urgency: '' as UrgencyLevel,
            location: '',
            contact: ''
        });
        setIsRequestModalOpen(true);
    };

    const handleOpenEdit = (req: Request) => {
        setEditingRequest(req);
        setFormData({
            title: req.title,
            description: req.description,
            type: req.type,
            urgency: req.urgency,
            location: req.location,
            contact: req.contact
        });
        setIsRequestModalOpen(true);
    };

    const handleSaveRequest = async () => {
        if (!formData.title || !formData.description || !formData.location || !formData.type || !formData.urgency) {
            alert("Please fill in all fields"); // Basic validation feedback
            return;
        }

        try {
            if (editingRequest) {
                await fetch(`/api/requests/${editingRequest.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        status: 'OPEN',
                        createdAt: new Date().toISOString(),
                        responseCount: 0
                    })
                });
            }
            fetchRequests();
            setIsRequestModalOpen(false);
        } catch (error) {
            console.error('Failed to save request:', error);
        }
    };

    return (
        <div className="flex h-screen bg-[#F3F4F6] dark:bg-slate-950 overflow-hidden">
            {/* SIDEBAR */}
            {/* SIDEBAR - Always Dark for Brand Consistency */}
            <aside className="w-[88px] hover:w-64 transition-all duration-300 ease-in-out bg-slate-900 text-white flex flex-col flex-shrink-0 shadow-xl z-40 border-r border-slate-800 group/sidebar overflow-hidden">
                <div className="h-16 flex items-center justify-start px-6 border-b border-slate-800 overflow-hidden whitespace-nowrap">
                    <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-blue-400">
                        <Activity size={28} className="text-blue-500 shrink-0" />
                        <span className="opacity-0 group-hover/sidebar:opacity-100 w-0 group-hover/sidebar:w-auto transition-all duration-300 delay-75">
                            Vita
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-visible">
                    <FloatingDock
                        items={navItems.map(item => ({
                            title: item.label,
                            icon: item.icon,
                            href: '#',
                            onClick: () => {
                                if (item.id === 'logout') {
                                    router.push('/');
                                } else {
                                    setActiveTab(item.id);
                                }
                            },
                            active: activeTab === item.id,
                            badge: item.badge
                        }))}
                        desktopClassName="items-stretch gap-1"
                    />
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#F3F4F6] dark:bg-slate-950 relative h-full transition-colors">

                {/* HEADER (White, Sticky) */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between flex-shrink-0 shadow-sm z-30 transition-colors">

                    {/* Search Bar (Centered/Leftish) */}
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <div className="relative group w-full max-w-md animate-in fade-in duration-300">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search resources, medicines, or hospitals..."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-slate-800 border-none rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:text-gray-900 dark:focus:text-white transition-all shadow-inner focus:shadow-none"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
                                <Mic size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>

                            {showNotifications && (
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                    >
                                        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {[
                                                { id: 1, title: 'Critical Oxygen Shortage', time: '2m ago', type: 'critical' },
                                                { id: 2, title: 'New Request: Blood Needed', time: '15m ago', type: 'info' },
                                                { id: 3, title: 'Server Maintenance', time: '1h ago', type: 'system' }
                                            ].map((notif) => (
                                                <div key={notif.id} className="p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                                                    <div className="flex gap-3">
                                                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.type === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 leading-snug">{notif.title}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t border-gray-100 text-center">
                                            <button className="text-xs font-bold text-gray-500 hover:text-gray-900">Mark all as read</button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>

                    </div>
                </header>

                {/* CONTENT AREA SWITCHER */}
                {activeTab === 'map' ? (
                    <div className="flex-1 relative z-0">
                        <Map resources={resources} className="h-full w-full absolute inset-0" />

                        {/* Map Overlay Controls */}
                        <div className="absolute top-4 left-4 z-[400] bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col gap-2 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-bold text-gray-500 uppercase px-2">Live Layers</h3>
                            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span className="text-sm font-bold text-gray-700">Doctors ({resources.filter(r => r.type === 'DOCTOR').length})</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Hospitals ({resources.filter(r => r.type === 'HOSPITAL').length})</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <span className="text-sm font-bold text-gray-700">Ambulances ({resources.filter(r => r.type === 'AMBULANCE').length})</span>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <SettingsPanel />
                ) : navItems.find(i => i.id === activeTab)?.group === 'resources' ? (
                    <div className="flex-1 h-full overflow-hidden">
                        {/* Render Resource Explorer for the active resource type */}
                        {(() => {
                            const resourceTypeMap: Record<string, string> = {
                                'doctor': 'DOCTOR',
                                'hospital': 'HOSPITAL',
                                'blood': 'BLOOD_BANK',
                                'ambulance': 'AMBULANCE',
                                'oxygen': 'OXYGEN',
                                'medicine': 'MEDICINE'
                            };
                            return <ResourceExplorer
                                initialFilter={resourceTypeMap[activeTab] || 'ALL'}
                                title={navItems.find(i => i.id === activeTab)?.label}
                                searchQuery={globalSearch}
                            />
                        })()}
                    </div>
                ) : (
                    <div className="p-8 space-y-6 flex-1 overflow-y-auto relative">
                        {/* Header: Title & Action */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Live Requests</h1>
                                <p className="text-gray-500 dark:text-gray-300 text-sm font-medium">Manage and track your emergency requests in real-time.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                                        className={`p-2 rounded-lg transition-colors ${showFilterMenu || activeFilter !== 'ALL' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <Filter size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {showFilterMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                                            >
                                                <div className="p-2 space-y-1">
                                                    {['ALL', 'MEDICAL', 'BLOOD_BANK', 'AMBULANCE', 'HOSPITAL', 'MEDICINE', 'OXYGEN'].map((filter) => (
                                                        <button
                                                            key={filter}
                                                            onClick={() => {
                                                                setActiveFilter(filter);
                                                                setShowFilterMenu(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                                        >
                                                            {filter === 'BLOOD_BANK' ? 'Blood Bank' : filter.charAt(0) + filter.slice(1).toLowerCase().replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {activeFilter === 'ALL' && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {['ALL', 'HOSPITAL', 'BLOOD_BANK', 'OXYGEN', 'AMBULANCE', 'SHELTER', 'DOCTOR'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { setActiveFilter(type); }}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === type
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-md shadow-gray-900/10'
                                            : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {type.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Requests Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 mt-6">
                            {userRequests
                                .filter(req => activeFilter === 'ALL' || req.type === activeFilter)
                                .map((req) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={req.id}
                                        onClick={() => setViewingRequest(req)}
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(req); }}
                                                className="p-2 bg-white border border-gray-200 shadow-sm hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all"
                                            >
                                                <PenLine size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                                            ${req.urgency === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    req.urgency === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                        'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                {req.urgency}
                                            </span>
                                            <span className="text-xs font-medium text-gray-400 dark:text-slate-400">
                                                {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">{req.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-300 mb-5 line-clamp-2 leading-relaxed">{req.description}</p>

                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5">
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded border border-gray-100 dark:border-slate-600 dark:text-slate-200">
                                                {req.type === 'MEDICAL' && <Stethoscope size={12} />}
                                                {req.type === 'BLOOD_BANK' && <Heart size={12} />}
                                                {req.type === 'AMBULANCE' && <Ambulance size={12} />}
                                                {req.type}
                                            </div>
                                            <span className="dark:text-slate-400">{req.location}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${req.status === 'OPEN' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{req.status}</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(3, req.responseCount))].map((_, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                            <button
                                onClick={handleOpenAdd}
                                className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group min-h-[200px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-3 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="text-sm font-bold">New Request</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal Overlay */}
                {/* Modal Overlay */}
                <AnimatePresence>
                    {isRequestModalOpen && (
                        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                                className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden"
                            >
                                {/* Header - Fixed */}
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        {editingRequest ? <PenLine size={20} /> : <Zap size={20} className="text-blue-600" />}
                                        {editingRequest ? 'Edit Request' : 'New Emergency Request'}
                                    </h3>
                                    <button
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Body - Scrollable */}
                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <FileText size={14} /> Title
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="What's the emergency?"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <Activity size={14} /> Type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className={`w-full appearance-none px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium cursor-pointer text-sm ${!formData.type ? 'text-gray-400' : 'text-gray-900'}`}
                                                    value={formData.type}
                                                    onChange={e => setFormData({ ...formData, type: e.target.value as ResourceType })}
                                                >
                                                    <option value="" disabled>Select Type</option>
                                                    <option value="DOCTOR">Doctor</option>
                                                    <option value="HOSPITAL">Hospital</option>
                                                    <option value="MEDICINE">Medicines</option>
                                                    <option value="BLOOD_BANK">Blood Bank</option>
                                                    <option value="AMBULANCE">Ambulance</option>
                                                    <option value="OXYGEN">Oxygen</option>
                                                    <option value="SHELTER">Shelter</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <Filter size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <AlertCircle size={14} /> Urgency
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className={`w-full appearance-none px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium cursor-pointer text-sm ${!formData.urgency ? 'text-gray-400' : 'text-gray-900'}`}
                                                    value={formData.urgency}
                                                    onChange={e => setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })}
                                                >
                                                    <option value="" disabled>Select Level</option>
                                                    <option value="LOW">Low</option>
                                                    <option value="MODERATE">Moderate</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="CRITICAL">Critical</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <AlertTriangle size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <MapPin size={14} /> Location
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Area / Location"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <Phone size={14} /> Contact
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="Mobile Number"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                value={formData.contact}
                                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <AlignLeft size={14} /> Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="Provide more details about the situation..."
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none resize-none font-medium text-sm"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer - Fixed */}
                                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
                                    <button
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-bold transition-colors text-sm hover:bg-gray-100 rounded-2xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveRequest}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 text-sm flex items-center gap-2"
                                    >
                                        {editingRequest ? 'Update Request' :
                                            <>
                                                <Zap size={18} fill="currentColor" />
                                                Submit Request
                                            </>
                                        }
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>        <ChatWidget />
                <EmergencyButton />
                {/* Request Detail Modal (Expanded Lifecycle View) */}
                <AnimatePresence>
                    {viewingRequest && (
                        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex"
                            >
                                {/* Left Panel: Request Details & Timeline */}
                                <div className="w-2/3 flex flex-col h-full border-r border-gray-100">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                                    ${viewingRequest.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {viewingRequest.urgency}
                                                </span>
                                                <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">#{viewingRequest.id}</span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">{viewingRequest.title}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { handleOpenEdit(viewingRequest); setViewingRequest(null); }} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                                                <PenLine size={20} />
                                            </button>
                                            <button onClick={() => setViewingRequest(null)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="prose prose-sm max-w-none text-gray-600 mb-8">
                                            <p>{viewingRequest.description}</p>
                                            <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-500">
                                                <span className="flex items-center gap-1"><MapIcon size={14} /> {viewingRequest.location}</span>
                                                <span className="flex items-center gap-1"><Users size={14} /> Contact: {viewingRequest.contact}</span>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <StatusControl
                                                currentStatus={viewingRequest.status}
                                                onUpdateStatus={handleUpdateStatus}
                                                onAddNote={handleAddNote}
                                            />
                                        </div>

                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Activity Log</h3>
                                        <RequestTimeline timeline={viewingRequest.timeline || []} />
                                    </div>
                                </div>

                                {/* Right Panel: AI Matches & Map Preview */}
                                <div className="w-1/3 bg-gray-50 flex flex-col h-full">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Zap size={18} className="text-blue-600" /> Vita AI Analysis
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        <AIMatches matches={viewingRequest.matches || []} />


                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </main>
        </div >
    );
}

// Rename the main component to DashboardContent (state logic above) and export default wrapper
export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
