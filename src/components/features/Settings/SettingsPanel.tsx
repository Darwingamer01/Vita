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
    EyeOff
} from 'lucide-react';

export default function SettingsPanel() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        news: true
    });
    const { theme, setTheme } = useTheme();

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
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
        const stored = localStorage.getItem('vita_user');
        let parsedUser = null;
        if (stored) {
            try {
                parsedUser = JSON.parse(stored);
                // Ensure countryCode exists for older stored data
                if (!parsedUser.countryCode) parsedUser.countryCode = '+1';

                // Clean phone number
                if (parsedUser.phone && parsedUser.phone.startsWith('+')) {
                    parsedUser.phone = parsedUser.phone.replace(/^\+\d+\s*|[()]/g, '').trim();
                }
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }

        if (session?.user) {
            // Prioritize local storage if it matches the authenticated user
            if (parsedUser && parsedUser.email === session.user.email) {
                setUser(parsedUser);
            } else {
                // Fallback to session data
                setUser({
                    name: session.user.name || 'User',
                    email: session.user.email || 'user@example.com',
                    phone: '',
                    countryCode: '+1',
                    location: '',
                    verified: true
                });
            }
        } else if (parsedUser) {
            // No session, but we have stored data (e.g. guest or just loading)
            setUser(parsedUser);
        }
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
                                                onClick={() => {
                                                    localStorage.setItem('vita_user', JSON.stringify(user));
                                                    alert("Profile updated successfully!");
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
                                                            <input type="checkbox" checked={notifications[item.id as keyof typeof notifications]} onChange={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })} className="sr-only peer" />
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
        </div>
    );
}
