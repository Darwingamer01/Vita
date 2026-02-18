'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
    User,
    Bell,
    Shield,
    Palette,
    Moon,
    Sun,
    Monitor,
    Smartphone,
    Mail,
    Lock,
    LogOut,
    ChevronRight,
    Camera,
    Globe,
    HelpCircle,
    Eye,
    EyeOff,
    Trash2,
    Plus,
    Save,
    MapPin,
    Loader2
} from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

export default function SettingsPanel() {
    const { location, address, requestLocation, setManualLocation, isLoading: isLocationLoading } = useLocation();
    const { data: session } = useSession();
    const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Manual location state
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');

    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (location) {
            setManualLat(location.lat.toString());
            setManualLng(location.lng.toString());
        }
    }, [location]);

    useEffect(() => {
        if (activeTab === 'safety') {
            const fetchContacts = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch('/api/user/contacts');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.contacts && data.contacts.length > 0) {
                            setEmergencyContacts(data.contacts);
                        } else {
                            setEmergencyContacts(['']);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch contacts:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchContacts();
        }
    }, [activeTab]);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        news: true
    });

    // Fetch notification preferences
    useEffect(() => {
        if (activeTab === 'notifications' && session?.user?.email) {
            const fetchPreferences = async () => {
                try {
                    const res = await fetch('/api/user/notifications');
                    if (res.ok) {
                        const data = await res.json();
                        setNotifications(prev => ({ ...prev, ...data }));
                    }
                } catch (error) {
                    console.error('Failed to fetch notification preferences:', error);
                }
            };
            fetchPreferences();
        }
    }, [activeTab, session]);

    const handleNotificationChange = async (key: string, value: boolean) => {
        // Optimistic update
        const newNotifications = { ...notifications, [key]: value };
        setNotifications(newNotifications);

        if (session?.user?.email) {
            try {
                await fetch('/api/user/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newNotifications)
                });
            } catch (error) {
                console.error('Failed to update notification preferences:', error);
                // Revert on failure (optional, but good UX)
                setNotifications(prev => ({ ...prev, [key]: !value }));
            }
        }
    };
    const { theme, setTheme } = useTheme();

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'location', label: 'Location', icon: <MapPin size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
        { id: 'safety', label: 'Safety', icon: <Smartphone size={18} /> },
    ];

    const [user, setUser] = useState({
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '',
        countryCode: '+1',
        location: '',
        verified: false
    });

    useEffect(() => {
        const loadProfile = async () => {
            // First set from session immediately so UI isn't blank
            if (session?.user) {
                setUser(prev => ({
                    ...prev,
                    name: session.user!.name || prev.name,
                    email: session.user!.email || prev.email,
                    verified: true,
                }));
            }

            // Then fetch full profile (including phone + location) from DB
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setUser(prev => ({
                        ...prev,
                        name: data.name || prev.name,
                        email: data.email || prev.email,
                        phone: data.phoneNumber || '',
                        location: data.location || '',
                        verified: true,
                    }));
                }
            } catch (e) {
                console.error('Failed to load profile from API', e);
                // Fallback to localStorage
                const stored = localStorage.getItem('vita_user');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (parsed.email === session?.user?.email) {
                            setUser(prev => ({ ...prev, ...parsed }));
                        }
                    } catch { /* ignore */ }
                }
            }
        };

        loadProfile();
    }, [session]);



    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // New Features State
    const [is2FAEnabled, setIs2FAEnabled] = useState(true);
    const [currentSession, setCurrentSession] = useState('Detecting device...');

    useEffect(() => {
        // Detect current session details
        const ua = window.navigator.userAgent;
        let browser = "Unknown Browser";
        let os = "Unknown OS";

        if (ua.indexOf("Win") !== -1) os = "Windows PC";
        else if (ua.indexOf("Mac") !== -1) os = "Mac";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("like Mac") !== -1) os = "iOS";

        if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
        else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
        else if (ua.indexOf("Safari") !== -1) browser = "Safari";
        else if (ua.indexOf("Edge") !== -1) browser = "Edge";

        setCurrentSession(`${os} - ${browser}`);
    }, []);

    const handleChangePassword = () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            alert('Please fill in all fields');
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            alert('New passwords do not match');
            return;
        }
        if (passwordData.new.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            alert('Password updated successfully!');
            setIsChangingPassword(false);
            setPasswordData({ current: '', new: '', confirm: '' });
        }, 1000);
    };

    const handleSignOut = () => {
        // Do NOT clear vita_user to allow persistence across logins
        // localStorage.removeItem('vita_user'); 
        signOut({ callbackUrl: '/' });
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            // Clear local storage (mock database)
            localStorage.removeItem('vita_user');

            // Sign out (if using next-auth) or redirect
            signOut({ callbackUrl: '/' });

            alert('Your account has been deleted.');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="p-8 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and application settings.</p>
            </div>

            <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-8">
                {/* Sidebar Navigation */}
                <div className="w-64 flex-shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                                />
                            )}
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-gray-200">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-colors duration-300">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-2xl mx-auto space-y-8"
                            >
                                {activeTab === 'profile' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-6 pb-8 border-b border-gray-100">
                                            <div className="relative group cursor-pointer">
                                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Camera className="text-white" size={24} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{user.email}</p>
                                                {user.verified && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        Verified User
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={user.name}
                                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Phone Number</label>
                                                <div className="group flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden">
                                                    <div className="relative flex items-center border-r border-gray-300 dark:border-gray-600">
                                                        <select
                                                            value={user.countryCode || '+1'}
                                                            onChange={(e) => setUser({ ...user, countryCode: e.target.value })}
                                                            className="appearance-none bg-transparent border-none py-2 pl-4 pr-8 text-gray-900 dark:text-white font-medium outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            <option value="+1">🇺🇸 +1</option>
                                                            <option value="+91">🇮🇳 +91</option>
                                                            <option value="+44">🇬🇧 +44</option>
                                                            <option value="+61">🇦🇺 +61</option>
                                                            <option value="+81">🇯🇵 +81</option>
                                                            <option value="+49">🇩🇪 +49</option>
                                                            <option value="+33">🇫🇷 +33</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        value={user.phone}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/[^\d\s-]/g, '');
                                                            setUser({ ...user, phone: value });
                                                        }}
                                                        className="flex-1 px-4 py-2 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                                        placeholder="000 000 0000"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Location</label>
                                                <input
                                                    type="text"
                                                    value={user.location}
                                                    onChange={(e) => setUser({ ...user, location: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch('/api/user/profile', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                name: user.name,
                                                                phoneNumber: user.countryCode && user.phone
                                                                    ? `${user.countryCode} ${user.phone}`
                                                                    : user.phone,
                                                                location: user.location,
                                                            })
                                                        });
                                                        if (res.ok) {
                                                            // Also update localStorage as cache
                                                            localStorage.setItem('vita_user', JSON.stringify(user));
                                                            alert('Profile updated successfully!');
                                                        } else {
                                                            alert('Failed to save profile. Please try again.');
                                                        }
                                                    } catch {
                                                        alert('Network error. Please try again.');
                                                    }
                                                }}
                                                className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
                                            >
                                                Save Changes
                                            </button>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Account Deletion</h4>
                                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                                                <div>
                                                    <p className="text-sm font-bold text-red-900 dark:text-red-200">Delete Personal Account</p>
                                                    <p className="text-xs text-red-700 dark:text-red-300/80 mt-1">Permanently remove your account and all data.</p>
                                                </div>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className="px-4 py-2 bg-white dark:bg-red-500/20 text-red-600 dark:text-red-200 border border-red-200 dark:border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'location' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Location Settings</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your location for accurate emergency resource finding.</p>

                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 mb-8">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                                                        <MapPin size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Current Coordinates</h4>
                                                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">Latitude</span>
                                                                <span className="font-mono text-gray-900 dark:text-white font-medium">{location?.lat.toFixed(6) || 'Not set'}</span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">Longitude</span>
                                                                <span className="font-mono text-gray-900 dark:text-white font-medium">{location?.lng.toFixed(6) || 'Not set'}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={requestLocation}
                                                            disabled={isLocationLoading}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isLocationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                                                            Detect My Location
                                                        </button>

                                                    </div>
                                                </div>

                                                {/* Detailed Address Display */}
                                                {address && (
                                                    <div className="mt-6 border-t border-blue-100 dark:border-blue-800 pt-6">
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Detailed Address</h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">City / Town</span>
                                                                <span className="text-gray-900 dark:text-white font-medium truncate block" title={address.Address.city || address.Address.town || address.Address.village || 'N/A'}>
                                                                    {address.Address.city || address.Address.town || address.Address.village || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">State</span>
                                                                <span className="text-gray-900 dark:text-white font-medium truncate block">
                                                                    {address.Address.state || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">District / County</span>
                                                                <span className="text-gray-900 dark:text-white font-medium truncate block">
                                                                    {address.Address.district || address.Address.county || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">Pincode</span>
                                                                <span className="text-gray-900 dark:text-white font-medium truncate block">
                                                                    {address.Address.postcode || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 sm:col-span-2">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold block">Full Country</span>
                                                                <span className="text-gray-900 dark:text-white font-medium truncate block">
                                                                    {address.Address.country || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Manually Set Location</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                    If automatic detection isn't accurate, you can manually enter coordinates.
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Latitude</label>
                                                        <input
                                                            type="text"
                                                            value={manualLat}
                                                            onChange={(e) => setManualLat(e.target.value)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                                            placeholder="e.g. 28.6139"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Longitude</label>
                                                        <input
                                                            type="text"
                                                            value={manualLng}
                                                            onChange={(e) => setManualLng(e.target.value)}
                                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                                            placeholder="e.g. 77.2090"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => {
                                                            const lat = parseFloat(manualLat);
                                                            const lng = parseFloat(manualLng);
                                                            if (!isNaN(lat) && !isNaN(lng)) {
                                                                setManualLocation(lat, lng);
                                                                alert('Location updated successfully!');
                                                            } else {
                                                                alert('Please enter valid coordinates.');
                                                            }
                                                        }}
                                                        className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                                    >
                                                        Update Location
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how and when you want to be notified.</p>

                                            <div className="space-y-4">
                                                {[
                                                    { id: 'email', label: 'Email Notifications', desc: 'Receive updates and alerts via email', icon: <Mail size={20} /> },
                                                    { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts on your device', icon: <Bell size={20} /> },
                                                    { id: 'sms', label: 'SMS Messages', desc: 'Urgent alerts via text message', icon: <Smartphone size={20} /> },
                                                ].map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600">
                                                                {item.icon}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.label}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={notifications[item.id as keyof typeof notifications]}
                                                                onChange={(e) => handleNotificationChange(item.id, e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Security Settings</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your password and security verifications.</p>

                                            {!isChangingPassword ? (
                                                <button
                                                    onClick={() => setIsChangingPassword(true)}
                                                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors mb-4 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <Lock size={20} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Change Password</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                                                </button>
                                            ) : (
                                                <div className="p-6 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 rounded-xl mb-4 shadow-sm ring-4 ring-blue-50/50 dark:ring-blue-900/20">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Update Password</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 block">Current Password</label>
                                                            <div className="relative">
                                                                <input
                                                                    type={showPasswords.current ? "text" : "password"}
                                                                    value={passwordData.current}
                                                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white pr-10"
                                                                    placeholder="Enter current password"
                                                                />
                                                                <button
                                                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                                                    title={showPasswords.current ? "Hide password" : "Show password"}
                                                                >
                                                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 block">New Password</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showPasswords.new ? "text" : "password"}
                                                                        value={passwordData.new}
                                                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white pr-10"
                                                                        placeholder="Min 6 characters"
                                                                    />
                                                                    <button
                                                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                                                        title={showPasswords.new ? "Hide password" : "Show password"}
                                                                    >
                                                                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 block">Confirm Password</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type={showPasswords.confirm ? "text" : "password"}
                                                                        value={passwordData.confirm}
                                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white pr-10"
                                                                        placeholder="Retype password"
                                                                    />
                                                                    <button
                                                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                                                        title={showPasswords.confirm ? "Hide password" : "Show password"}
                                                                    >
                                                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-3 pt-2">
                                                            <button
                                                                onClick={() => setIsChangingPassword(false)}
                                                                className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium text-sm transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleChangePassword}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                                            >
                                                                Update Password
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}



                                            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-8 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Two-Factor Authentication</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{is2FAEnabled ? 'Currently enabled (SMS)' : 'Add an extra layer of security'}</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={is2FAEnabled}
                                                        onChange={() => {
                                                            setIs2FAEnabled(!is2FAEnabled);
                                                            alert(!is2FAEnabled ? "Two-Factor Authentication Enabled!" : "Two-Factor Authentication Disabled.");
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                </label>
                                            </div>

                                            <div className="mt-8">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Active Sessions</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Monitor size={18} className="text-green-600 dark:text-green-400" />
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{currentSession}</p>
                                                                <p className="text-xs text-green-700 dark:text-green-400 font-medium">New Delhi, India • Active Now</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg opacity-60">
                                                        <div className="flex items-center gap-3">
                                                            <Smartphone size={18} className="text-gray-500 dark:text-gray-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">iPhone 13 - Safari</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">New Delhi, India • 2 hours ago</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8"></div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Appearance</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Customize the look and feel of Vita.</p>

                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { id: 'light', label: 'Light', icon: <Sun size={24} /> },
                                                    { id: 'dark', label: 'Dark', icon: <Moon size={24} /> },
                                                    { id: 'system', label: 'System', icon: <Monitor size={24} /> }
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => setTheme(mode.id as 'light' | 'dark' | 'system')}
                                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === mode.id
                                                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        {mode.icon}
                                                        <span className="text-sm font-bold">{mode.label}</span>

                                                    </button>
                                                ))}
                                            </div>


                                        </div>
                                    </div>
                                )}

                                {activeTab === 'safety' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Emergency Contacts</h3>
                                            <p className="text-sm text-gray-500">Manage the contacts that will be notified when you trigger SOS.</p>
                                        </div>

                                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                                            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-900">How it works</p>
                                                <p className="text-xs text-red-700 mt-1">
                                                    When you press the SOS button, an SMS with your location will be sent to these numbers immediately.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact List */}
                                        <div className="space-y-3">
                                            {emergencyContacts.map((contact, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="tel"
                                                            placeholder="Enter Phone Number"
                                                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none font-medium text-gray-900"
                                                            value={contact}
                                                            onChange={(e) => {
                                                                const newContacts = [...emergencyContacts];
                                                                newContacts[index] = e.target.value;
                                                                setEmergencyContacts(newContacts);
                                                            }}
                                                        />
                                                        {emergencyContacts.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const newContacts = emergencyContacts.filter((_, i) => i !== index);
                                                                    setEmergencyContacts(newContacts);
                                                                }}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            {emergencyContacts.length < 5 && (
                                                <button
                                                    onClick={() => setEmergencyContacts([...emergencyContacts, ''])}
                                                    className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} /> Add Contact
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    setIsLoading(true);
                                                    const validContacts = emergencyContacts.filter(c => c.trim().length >= 10);
                                                    try {
                                                        const res = await fetch('/api/user/contacts', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ contacts: validContacts }),
                                                            credentials: 'include'
                                                        });
                                                        const data = await res.json();

                                                        if (res.ok) {
                                                            alert('Contacts saved successfully!');
                                                        } else {
                                                            console.error('Save failed:', data);
                                                            alert(`Failed to save contacts: ${data.error || 'Unknown error'}`);
                                                        }
                                                    } catch (error) {
                                                        console.error('Error saving contacts:', error);
                                                        alert(`Error saving contacts: ${error instanceof Error ? error.message : 'Network error'}`);
                                                    } finally {
                                                        setIsLoading(false);
                                                    }
                                                }}
                                                disabled={isLoading}
                                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                Save Settings
                                            </button>
                                        </div>

                                        <p className="text-xs text-center text-gray-400">
                                            Please verify that these numbers are active and reachable.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Settings Footer */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Vita App v1.0.2</span>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Help</a>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
