'use client';

import { useEffect, useState } from 'react';
import { MapPin, X, AlertCircle, Loader2 } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

export default function LocationPermissionModal() {
    const { location, isLoading, error, requestLocation, hasPermission } = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Show modal if no permission and not dismissed
        const permission = localStorage.getItem('locationPermission');
        const wasDismissed = localStorage.getItem('locationModalDismissed');

        if (!hasPermission && permission !== 'denied' && !wasDismissed && !dismissed) {
            // Show modal after 2 seconds
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [hasPermission, dismissed]);

    const handleDismiss = () => {
        setShowModal(false);
        setDismissed(true);
        localStorage.setItem('locationModalDismissed', 'true');
    };

    const handleAllow = () => {
        requestLocation();
    };

    // Don't show if already has permission or was dismissed
    if (hasPermission || !showModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <MapPin size={32} className="text-blue-600 dark:text-blue-400" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                    Enable Location Access
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-slate-400 text-center mb-6">
                    We need your location to show you the <span className="font-bold text-blue-600 dark:text-blue-400">nearest emergency resources</span> and calculate <span className="font-bold text-blue-600 dark:text-blue-400">accurate arrival times</span>.
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-slate-300">
                            <span className="font-bold">Real-time distances</span> to ambulances, hospitals, and blood banks
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-slate-300">
                            <span className="font-bold">Traffic-aware ETAs</span> for faster emergency response
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-slate-300">
                            <span className="font-bold">Sorted by proximity</span> - see closest resources first
                        </p>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleAllow}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Getting Location...
                            </>
                        ) : (
                            'Allow Access'
                        )}
                    </button>
                </div>

                {/* Privacy note */}
                <p className="text-xs text-gray-500 dark:text-slate-500 text-center mt-4">
                    🔒 Your location is only used to calculate distances and is never stored on our servers.
                </p>
            </div>
        </div>
    );
}
