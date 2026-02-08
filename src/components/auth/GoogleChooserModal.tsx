'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface GoogleChooserProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GoogleChooserModal({ isOpen, onClose }: GoogleChooserProps) {
    const router = useRouter();

    const handleMockLogin = () => {
        // Simulate network delay then login
        setTimeout(() => {
            // Mock Session Data
            const mockUser = {
                name: 'Angelixa',
                email: 'angelixa7005@gmail.com',
                image: null, // UI Avatars will be used if null
                verified: true,
                phone: '+1 (555) 000-0000',
                location: 'New Delhi, India'
            };

            // Check if we already have stored data for this user to preserve edits
            const stored = localStorage.getItem('vita_user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.email === mockUser.email) {
                        // We have data for this user, keep it!
                        console.log("Preserving existing user data for", mockUser.email);
                    } else {
                        // Different user, overwrite
                        localStorage.setItem('vita_user', JSON.stringify(mockUser));
                    }
                } catch (e) {
                    // corrupt data, overwrite
                    localStorage.setItem('vita_user', JSON.stringify(mockUser));
                }
            } else {
                // No data, set initial mock
                localStorage.setItem('vita_user', JSON.stringify(mockUser));
            }

            onClose();
            router.push('/dashboard');
        }, 800);
    };

    const handleRealLogin = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative bg-white rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden"
                    >
                        {/* Google Header */}
                        <div className="p-8 pb-4 text-center">
                            <div className="flex justify-center mb-4">
                                <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900">Choose an account</h3>
                            <p className="text-sm text-gray-600 mt-1">to continue to Vita</p>
                        </div>

                        {/* Account List */}
                        <div className="px-4 pb-6 space-y-1">
                            <button
                                onClick={handleMockLogin}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group border-b border-gray-100 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                                    A
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-black">angelixa7005@gmail.com</p>
                                    <p className="text-xs text-gray-500">Angelixa (Demo)</p>
                                </div>
                            </button>

                            <button
                                onClick={handleRealLogin}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Use another account</p>
                                </div>
                            </button>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-500">
                            To continue, Google will share your name, email address, and language preference with Vita.
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
