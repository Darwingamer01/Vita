'use client';

import { signOut } from 'next-auth/react';
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
    Radio,
    Trash2,
    Truck,
    Clock
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
import EmergencyContactModal from '@/components/features/EmergencyContactModal';
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

    // --- Resource Modal Logic ---
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [resourceFormData, setResourceFormData] = useState({
        title: '',
        type: 'HOSPITAL' as ResourceType,
        description: '',
        location: {
            lat: 28.61, // Default to Delhi (or user location)
            lng: 77.23,
            address: '',
            city: '',
            district: ''
        },
        contact: {
            phone: '',
            email: ''
        },
        specialty: '', // New Field
        hospitalBeds: {
            general: 0,
            icuVentilator: 0
        },
        isVerified: false,
        bloodStock: {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        },
        bloodFeatures: {
            plasma: false,
            apheresis: false
        },
        ambulanceType: 'BASIC',
        oxygenType: 'CYLINDER',
        operatingHours: ''
    });

    const handleSaveResource = async () => {
        if (!resourceFormData.title || !resourceFormData.location.city) {
            alert("Please fill in at least Title and City");
            return;
        }

        // Prepare Metadata based on Type
        let metadata = {};
        if (resourceFormData.type === 'DOCTOR' && resourceFormData.specialty) {
            metadata = {
                doctor: {
                    specialty: resourceFormData.specialty,
                    qualification: 'MBBS, MD', // Default or add field
                    experienceYears: 5,
                    availableToday: true
                }
            };
        } else if (resourceFormData.type === 'HOSPITAL') {
            metadata = {
                hospital: {
                    beds: {
                        general: resourceFormData.hospitalBeds.general,
                        icu: resourceFormData.hospitalBeds.icuVentilator,
                        ventilator: 0, // Simplified for UI
                        oxygen: 0
                    },
                    specialties: [],
                    insuranceAccepted: [],
                    ayushmanBharat: true
                }
            };
        } else if (resourceFormData.type === 'BLOOD_BANK') {
            metadata = {
                bloodStock: {
                    groups: resourceFormData.bloodStock,
                    plasmaAvailable: resourceFormData.bloodFeatures.plasma,
                    apheresisAvailable: resourceFormData.bloodFeatures.apheresis
                }
            };
        } else if (resourceFormData.type === 'AMBULANCE') {
            metadata = {
                ambulanceType: resourceFormData.ambulanceType,
                operatingHours: resourceFormData.operatingHours || '24x7'
            };
        } else if (resourceFormData.type === 'OXYGEN') {
            metadata = {
                oxygenType: resourceFormData.oxygenType,
                operatingHours: resourceFormData.operatingHours || '24x7'
            };
        }

        try {
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...resourceFormData,
                    verificationLevel: resourceFormData.isVerified ? 'VERIFIED' : 'UNVERIFIED',
                    metadata // Attach calculated metadata
                })
            });

            if (res.ok) {
                setIsResourceModalOpen(false);
                // Refresh resources
                const r = await fetch('/api/resources');
                const d = await r.json();
                setResources(d);
                alert('Resource added successfully!');
            } else {
                alert('Failed to add resource');
            }
        } catch (error) {
            console.error('Failed to save resource:', error);
            alert('Error saving resource');
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
                                    signOut({ callbackUrl: '/' });
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setGlobalSearch(val);

                                    // Intelligent Routing
                                    const lowerVal = val.toLowerCase();
                                    if (lowerVal.includes('doctor') || lowerVal.includes('dr')) setActiveTab('doctor');
                                    else if (lowerVal.includes('hospital') || lowerVal.includes('clinic')) setActiveTab('hospital');
                                    else if (lowerVal.includes('medicine') || lowerVal.includes('drug') || lowerVal.includes('pharma')) setActiveTab('medicine');
                                    else if (lowerVal.includes('blood')) setActiveTab('blood');
                                    else if (lowerVal.includes('ambulance')) setActiveTab('ambulance');
                                    else if (lowerVal.includes('oxygen')) setActiveTab('oxygen');
                                    else if (lowerVal.includes('shelter')) setActiveTab('shelter');
                                    else if (lowerVal.includes('request') || lowerVal.includes('help')) setActiveTab('requests');
                                }}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-slate-800 border-none rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:text-gray-900 dark:focus:text-white transition-all shadow-inner focus:shadow-none"
                            />
                            <button
                                onClick={() => {
                                    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                                        // @ts-ignore
                                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                        const recognition = new SpeechRecognition();
                                        recognition.lang = 'en-US';
                                        recognition.start();

                                        recognition.onstart = () => {
                                            const btn = document.getElementById('mic-btn');
                                            if (btn) btn.classList.add('text-red-500', 'animate-pulse');
                                        };

                                        recognition.onresult = (event: any) => {
                                            const transcript = event.results[0][0].transcript;
                                            setGlobalSearch(transcript);
                                            // Trigger routing logic manually since setGlobalSearch is async/doesn't trigger onChange
                                            const lowerVal = transcript.toLowerCase();
                                            if (lowerVal.includes('doctor') || lowerVal.includes('dr')) setActiveTab('doctor');
                                            else if (lowerVal.includes('hospital') || lowerVal.includes('clinic')) setActiveTab('hospital');
                                            else if (lowerVal.includes('medicine') || lowerVal.includes('drug') || lowerVal.includes('pharma')) setActiveTab('medicine');
                                            else if (lowerVal.includes('blood')) setActiveTab('blood');
                                            else if (lowerVal.includes('ambulance')) setActiveTab('ambulance');
                                            else if (lowerVal.includes('oxygen')) setActiveTab('oxygen');
                                            else if (lowerVal.includes('shelter')) setActiveTab('shelter');
                                            else if (lowerVal.includes('request') || lowerVal.includes('help')) setActiveTab('requests');
                                        };

                                        recognition.onend = () => {
                                            const btn = document.getElementById('mic-btn');
                                            if (btn) btn.classList.remove('text-red-500', 'animate-pulse');
                                        };
                                    } else {
                                        alert('Voice search not supported in this browser.');
                                    }
                                }}
                                id="mic-btn"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                            >
                                <Mic size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsResourceModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-200"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Resource</span>
                        </button>

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
                            <button
                                onClick={handleOpenAdd}
                                className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group min-h-[200px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center mb-3 transition-colors">
                                    <Plus size={24} />
                                </div>
                                <span className="text-sm font-bold">New Request</span>
                            </button>

                            <AnimatePresence mode="popLayout">
                                {userRequests
                                    .filter(req => activeFilter === 'ALL' || req.type === activeFilter)
                                    .map((req) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            key={req.id}
                                            onClick={() => setViewingRequest(req)}
                                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                                        >
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(req); }}
                                                    className="p-2 bg-white border border-gray-200 shadow-sm hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <PenLine size={14} />
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Are you sure you want to delete this request?')) {
                                                            try {
                                                                const res = await fetch(`/api/requests/${req.id}`, { method: 'DELETE' });
                                                                if (res.ok) {
                                                                    fetchRequests();
                                                                } else {
                                                                    alert('Failed to delete request');
                                                                }
                                                            } catch (err) {
                                                                console.error('Failed to delete', err);
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 bg-white border border-gray-200 shadow-sm hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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
                            </AnimatePresence>
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
                                    {/* ... existing Request Details ... */}
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

                {/* Resource Modal */}
                <AnimatePresence>
                    {isResourceModalOpen && (
                        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                                className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Plus size={20} className="text-blue-600" />
                                        Add New Resource
                                    </h3>
                                    <button
                                        onClick={() => setIsResourceModalOpen(false)}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-red-500"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <FileText size={14} /> Title / Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. City Hospital, Dr. Smith"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                value={resourceFormData.title}
                                                onChange={e => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <Activity size={14} /> Type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    className="w-full appearance-none px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium cursor-pointer text-sm text-gray-900"
                                                    value={resourceFormData.type}
                                                    onChange={e => setResourceFormData({ ...resourceFormData, type: e.target.value as ResourceType })}
                                                >
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
                                                <Phone size={14} /> Phone
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                value={resourceFormData.contact.phone}
                                                onChange={e => setResourceFormData({ ...resourceFormData, contact: { ...resourceFormData.contact, phone: e.target.value } })}
                                            />
                                        </div>

                                        {/* Dynamic Fields based on Type */}
                                        <AnimatePresence>
                                            {resourceFormData.type === 'DOCTOR' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="col-span-2 overflow-hidden p-1"
                                                >
                                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                        <Stethoscope size={14} /> Specialty
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Cardiologist, Pediatrician"
                                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                        value={resourceFormData.specialty}
                                                        onChange={e => setResourceFormData({ ...resourceFormData, specialty: e.target.value })}
                                                    />

                                                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100 mt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={20} className={resourceFormData.isVerified ? "text-blue-600" : "text-gray-400"} />
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">Verified Resource</p>
                                                                <p className="text-xs text-gray-500">Is this doctor officially verified?</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setResourceFormData({ ...resourceFormData, isVerified: !resourceFormData.isVerified })}
                                                            className={`w-12 h-6 rounded-full transition-colors relative ${resourceFormData.isVerified ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${resourceFormData.isVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {resourceFormData.type === 'HOSPITAL' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="col-span-2 overflow-hidden p-1 space-y-4"
                                                >
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                                <Building2 size={14} /> General Beds
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="0"
                                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                                value={resourceFormData.hospitalBeds.general || ''}
                                                                onChange={e => setResourceFormData({
                                                                    ...resourceFormData,
                                                                    hospitalBeds: { ...resourceFormData.hospitalBeds, general: parseInt(e.target.value) || 0 }
                                                                })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                                <Activity size={14} /> ICU + Vent
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="0"
                                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                                value={resourceFormData.hospitalBeds.icuVentilator || ''}
                                                                onChange={e => setResourceFormData({
                                                                    ...resourceFormData,
                                                                    hospitalBeds: { ...resourceFormData.hospitalBeds, icuVentilator: parseInt(e.target.value) || 0 }
                                                                })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={20} className={resourceFormData.isVerified ? "text-blue-600" : "text-gray-400"} />
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">Verified Resource</p>
                                                                <p className="text-xs text-gray-500">Is this hospital officially verified?</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setResourceFormData({ ...resourceFormData, isVerified: !resourceFormData.isVerified })}
                                                            className={`w-12 h-6 rounded-full transition-colors relative ${resourceFormData.isVerified ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${resourceFormData.isVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {resourceFormData.type === 'BLOOD_BANK' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="col-span-2 overflow-hidden p-1 space-y-4"
                                                >
                                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        <Heart size={14} /> Blood Stock (Units)
                                                    </label>
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                                                            <div key={group} className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1">{group}</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white text-gray-900 text-center font-bold text-sm transition-all outline-none"
                                                                    value={(resourceFormData.bloodStock as any)[group] || ''}
                                                                    onChange={e => setResourceFormData({
                                                                        ...resourceFormData,
                                                                        bloodStock: { ...resourceFormData.bloodStock, [group]: parseInt(e.target.value) || 0 }
                                                                    })}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-100">
                                                            <span className="text-xs font-bold text-red-700">Plasma</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setResourceFormData({
                                                                    ...resourceFormData,
                                                                    bloodFeatures: { ...resourceFormData.bloodFeatures, plasma: !resourceFormData.bloodFeatures.plasma }
                                                                })}
                                                                className={`w-10 h-5 rounded-full transition-colors relative ${resourceFormData.bloodFeatures.plasma ? 'bg-red-500' : 'bg-gray-300'}`}
                                                            >
                                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${resourceFormData.bloodFeatures.plasma ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                                                            <span className="text-xs font-bold text-orange-700">Apheresis</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setResourceFormData({
                                                                    ...resourceFormData,
                                                                    bloodFeatures: { ...resourceFormData.bloodFeatures, apheresis: !resourceFormData.bloodFeatures.apheresis }
                                                                })}
                                                                className={`w-10 h-5 rounded-full transition-colors relative ${resourceFormData.bloodFeatures.apheresis ? 'bg-orange-500' : 'bg-gray-300'}`}
                                                            >
                                                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${resourceFormData.bloodFeatures.apheresis ? 'translate-x-5' : 'translate-x-0'}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100 mt-4">
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={20} className={resourceFormData.isVerified ? "text-blue-600" : "text-gray-400"} />
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">Verified Resource</p>
                                                                <p className="text-xs text-gray-500">Is this blood bank officially verified?</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setResourceFormData({ ...resourceFormData, isVerified: !resourceFormData.isVerified })}
                                                            className={`w-12 h-6 rounded-full transition-colors relative ${resourceFormData.isVerified ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${resourceFormData.isVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {resourceFormData.type === 'AMBULANCE' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="col-span-2 overflow-hidden p-1 space-y-4"
                                                >
                                                    <div>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                            <Truck size={14} /> Ambulance Type
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full appearance-none px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium cursor-pointer text-sm text-gray-900"
                                                                value={resourceFormData.ambulanceType}
                                                                onChange={e => setResourceFormData({ ...resourceFormData, ambulanceType: e.target.value })}
                                                            >
                                                                <option value="BASIC">Basic Life Support (BLS)</option>
                                                                <option value="ADVANCED">Advanced Life Support (ALS)</option>
                                                                <option value="ICU">ICU Transport</option>
                                                                <option value="NEONATAL">Neonatal / Pediatric</option>
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                                <Filter size={14} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={20} className={resourceFormData.isVerified ? "text-blue-600" : "text-gray-400"} />
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">Verified Resource</p>
                                                                <p className="text-xs text-gray-500">Is this ambulance service officially verified?</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setResourceFormData({ ...resourceFormData, isVerified: !resourceFormData.isVerified })}
                                                            className={`w-12 h-6 rounded-full transition-colors relative ${resourceFormData.isVerified ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${resourceFormData.isVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {resourceFormData.type === 'OXYGEN' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="col-span-2 overflow-hidden p-1 space-y-4"
                                                >
                                                    <div>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                            <Activity size={14} /> Supply Type
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {['CYLINDER', 'CONCENTRATOR', 'REFILL'].map((type) => (
                                                                <button
                                                                    key={type}
                                                                    type="button"
                                                                    onClick={() => setResourceFormData({ ...resourceFormData, oxygenType: type })}
                                                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${resourceFormData.oxygenType === type
                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                            <Clock size={14} /> Operating Hours
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. 24x7, 9AM - 9PM"
                                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                            value={resourceFormData.operatingHours || ''}
                                                            onChange={e => setResourceFormData({ ...resourceFormData, operatingHours: e.target.value })}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={20} className={resourceFormData.isVerified ? "text-blue-600" : "text-gray-400"} />
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">Verified Source</p>
                                                                <p className="text-xs text-gray-500">Is this oxygen supplier verified?</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setResourceFormData({ ...resourceFormData, isVerified: !resourceFormData.isVerified })}
                                                            className={`w-12 h-6 rounded-full transition-colors relative ${resourceFormData.isVerified ? 'bg-blue-600' : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${resourceFormData.isVerified ? 'translate-x-6' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <MapPin size={14} /> Location Details
                                            </label>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                    value={resourceFormData.location.city}
                                                    onChange={e => setResourceFormData({ ...resourceFormData, location: { ...resourceFormData.location, city: e.target.value } })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="District"
                                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                    value={resourceFormData.location.district}
                                                    onChange={e => setResourceFormData({ ...resourceFormData, location: { ...resourceFormData.location, district: e.target.value } })}
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Full Address"
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none font-medium text-sm"
                                                value={resourceFormData.location.address}
                                                onChange={e => setResourceFormData({ ...resourceFormData, location: { ...resourceFormData.location, address: e.target.value } })}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                <AlignLeft size={14} /> Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="Details about services, specialized equipment, etc."
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all outline-none resize-none font-medium text-sm"
                                                value={resourceFormData.description}
                                                onChange={e => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
                                    <button
                                        onClick={() => setIsResourceModalOpen(false)}
                                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-bold transition-colors text-sm hover:bg-gray-100 rounded-2xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveResource}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 text-sm flex items-center gap-2"
                                    >
                                        <Plus size={18} fill="currentColor" />
                                        Add Resource
                                    </button>
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
