'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyButtonProps {
    isOpen?: boolean;
    onClose?: () => void;
    showTrigger?: boolean;
}

export default function EmergencyButton({ isOpen: externalIsOpen, onClose, showTrigger = true }: EmergencyButtonProps = {}) {
    // Sync external state if provided
    useEffect(() => {
        if (typeof externalIsOpen === 'boolean') {
            if (externalIsOpen) handleTrigger();
            else if (!externalIsOpen && isTriggered) handleCancel();
        }
    }, [externalIsOpen]);

    const [isTriggered, setIsTriggered] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [sosSent, setSosSent] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTriggered && countdown > 0 && !sosSent) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (countdown === 0 && !sosSent) {
            // Send SOS
            setSosSent(true);
            // In real app, call API here
        }
        return () => clearTimeout(timer);
    }, [isTriggered, countdown, sosSent]);

    const handleTrigger = () => {
        setIsTriggered(true);
        setCountdown(3);
        setSosSent(false);
    };

    const handleCancel = () => {
        setIsTriggered(false);
        setCountdown(3);
        setSosSent(false);
        if (onClose) onClose();
    };

    return (
        <>
            {/* FAB */}
            {showTrigger && (
                <button
                    onClick={handleTrigger}
                    className="fixed bottom-6 left-6 z-[100] w-14 h-14 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-pulse"
                >
                    <AlertTriangle size={24} />
                </button>
            )}

            {/* Overlay */}
            <AnimatePresence>
                {isTriggered && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm p-8 text-center relative overflow-hidden"
                        >
                            {!sosSent ? (
                                <>
                                    <div className="absolute inset-0 bg-red-500 opacity-10 animate-pulse"></div>
                                    <AlertTriangle className="mx-auto text-red-600 mb-4" size={64} />
                                    <h2 className="text-3xl font-black text-gray-900 mb-2">SOS ENDING</h2>
                                    <p className="text-gray-500 mb-8">Sending emergency alert to nearby responders in...</p>

                                    <div className="text-8xl font-black text-red-600 mb-8 tabular-nums">
                                        {countdown}
                                    </div>

                                    <button
                                        onClick={handleCancel}
                                        className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <X size={24} /> CANCEL
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-green-600"
                                        >
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </motion.div>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">SOS SENT!</h2>
                                    <p className="text-gray-500 mb-6">Help is on the way. Responders have been notified of your location.</p>
                                    <button
                                        onClick={handleCancel}
                                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
