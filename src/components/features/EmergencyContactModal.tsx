'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Plus, Trash2, Save, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function EmergencyContactModal() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [contacts, setContacts] = useState<string[]>(['']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if user has contacts
        const checkContacts = async () => {
            // In a real app, you might check a flag in the session or fetch user profile
            // For now, we'll assume if it's the first login (or we can't find them in session storage), we ask.
            // Better approach: fetch user profile to see if 'emergencyContacts' is null
            if (session?.user) {
                try {
                    // We need an endpoint to check current user status or pass it via session
                    // For MVP, we will try to fetch profile or check local storage to avoid spamming
                    // Let's implement a simple check:
                    const res = await fetch('/api/auth/session?update'); // Trick to get fresh session if we added it there
                    // Or just fetch specific user data
                } catch (e) {
                    console.error(e);
                }
            }
        };

        // Simulating the check: Open if authenticated and specific condition met
        // For this task: "when the user will signup first time"
        // We will trigger this if session exists but no contacts found. 
        // Since we don't have this in session yet, we'll fetch it on mount.
        if (session?.user) {
            fetch('/api/user/me') // We need this endpoint or similar
                .then(res => res.json())
                .then(data => {
                    if (!data.emergencyContacts) {
                        setIsOpen(true);
                    }
                })
                .catch(() => { });
        }
    }, [session]);

    const handleAddContact = () => {
        if (contacts.length < 3) {
            setContacts([...contacts, '']);
        }
    };

    const handleRemoveContact = (index: number) => {
        const newContacts = [...contacts];
        newContacts.splice(index, 1);
        setContacts(newContacts);
    };

    const handleChange = (index: number, value: string) => {
        const newContacts = [...contacts];
        newContacts[index] = value;
        setContacts(newContacts);
    };

    const handleSave = async () => {
        const validContacts = contacts.filter(c => c.trim().length >= 10);
        if (validContacts.length === 0) {
            alert('Please enter at least one valid contact number.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts: validContacts })
            });

            if (res.ok) {
                setIsOpen(false);
            } else {
                alert('Failed to save contacts');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    <div className="bg-red-600 p-6 text-white text-center">
                        <ShieldAlert size={48} className="mx-auto mb-3 opacity-90" />
                        <h2 className="text-2xl font-bold">Emergency Setup</h2>
                        <p className="text-red-100 text-sm mt-1">
                            Please add contacts to notify in case of an SOS emergency.
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                            {contacts.map((contact, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            placeholder={`Contact #${index + 1}`}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white transition-all outline-none font-medium text-gray-900"
                                            value={contact}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                        />
                                    </div>
                                    {contacts.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveContact(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {contacts.length < 3 && (
                            <button
                                onClick={handleAddContact}
                                type="button"
                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold text-sm hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Another Contact
                            </button>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Save Emergency Contacts</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
