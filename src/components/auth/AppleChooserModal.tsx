'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface AppleChooserProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AppleChooserModal({ isOpen, onClose }: AppleChooserProps) {
    const router = useRouter();

    const handleLogin = () => {
        // Simulate network delay then login
        setTimeout(() => {
            onClose();
            router.push('/dashboard');
        }, 1500); // Apple usually takes a bit longer visually
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col items-center p-8 lg:p-12 text-center"
                    >
                        {/* Apple Logo */}
                        <div className="mb-6">
                            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-1.01 3.8-1.01c.54 0 2.22 0 3.39 1.63-2.91 1.76-2.4 5.37.52 6.64-.67 1.83-1.6 3.65-2.79 4.97zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                        </div>

                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Sign in with Apple ID</h3>
                        <p className="text-gray-500 mb-8 max-w-sm text-lg">
                            Use your Apple ID to sign in to Vita.
                        </p>

                        {/* Apple ID Input Simulation */}
                        <div className="w-full space-y-4 mb-8">
                            <div className="w-full border-b border-gray-200">
                                <input disabled type="text" value="angelixa7005@icloud.com" className="w-full text-center py-2 text-xl font-medium bg-transparent border-none focus:ring-0" />
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button
                                onClick={handleLogin}
                                className="w-full bg-black text-white rounded-xl py-4 font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="text-2xl leading-none pb-1">☺️</span> Continue with Face ID
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full text-blue-500 font-medium py-2 hover:underline"
                            >
                                Use different Apple ID
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
