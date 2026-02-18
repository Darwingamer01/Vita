'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, MapPin, Navigation } from 'lucide-react';
import { ResourceType } from '@/types';
import { useSession } from 'next-auth/react';

const RESOURCE_TYPES = [
    { value: 'BLOOD', label: '🩸 Blood Donor' },
    { value: 'OXYGEN', label: '💨 Oxygen Supply' },
    { value: 'AMBULANCE', label: '🚑 Ambulance' },
    { value: 'HOSPITAL', label: '🏥 Hospital' },
    { value: 'SHELTER', label: '🏠 Shelter / Camp' },
    { value: 'MEDICINE', label: '💊 Medicine' },
    { value: 'DOCTOR', label: '👨‍⚕️ Doctor' },
    { value: 'BLOOD_BANK', label: '🏦 Blood Bank' },
];

export default function AddResourcePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState('');

    const [formData, setFormData] = useState({
        type: 'BLOOD' as ResourceType,
        title: '',
        phone: '',
        address: '',
        lat: '',
        lng: '',
    });

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setLocError('Geolocation is not supported by your browser.');
            return;
        }
        setLocating(true);
        setLocError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({
                    ...prev,
                    lat: pos.coords.latitude.toFixed(6),
                    lng: pos.coords.longitude.toFixed(6),
                    address: prev.address || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
                }));
                setLocating(false);
            },
            (err) => {
                setLocError('Could not get location: ' + err.message);
                setLocating(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            setLocError('Please use the location button or enter lat/lng manually.');
            return;
        }
        setSubmitting(true);

        try {
            const payload = {
                type: formData.type,
                title: formData.title,
                description: 'User submitted resource',
                location: {
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng),
                    address: formData.address,
                },
                contact: {
                    phone: formData.phone,
                },
                status: 'AVAILABLE',
                verificationLevel: 'UNVERIFIED',
            };

            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/map'), 2500);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit resource');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting resource');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
                <div className="bg-green-100 dark:bg-green-900/30 p-8 rounded-full mb-6">
                    <CheckCircle size={72} className="text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h1>
                <p className="text-gray-600 dark:text-gray-400">Your contribution has been recorded and will help others.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Redirecting to map...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Emergency Resource</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Help your community by listing an available resource.
                        {session?.user?.name && (
                            <span className="text-blue-600 dark:text-blue-400"> Submitting as {session.user.name}.</span>
                        )}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">

                    {/* Resource Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Resource Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            {RESOURCE_TYPES.map(rt => (
                                <option key={rt.value} value={rt.value}>{rt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Title / Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. John Doe (O+) or City Care Hospital"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Address + Location Button */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Address / Location <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                required
                                type="text"
                                placeholder="Enter area name or address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={handleUseLocation}
                                disabled={locating}
                                title="Use my current location"
                                className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors flex-shrink-0"
                            >
                                {locating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
                            </button>
                        </div>
                        {locError && (
                            <p className="text-xs text-red-500 mt-1">{locError}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Click the <MapPin size={12} className="inline" /> button to auto-fill your current coordinates.
                        </p>
                    </div>

                    {/* Lat / Lng */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Latitude</label>
                            <input
                                type="text"
                                placeholder="e.g. 28.6139"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Longitude</label>
                            <input
                                type="text"
                                placeholder="e.g. 77.2090"
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 rounded-xl text-base transition-colors mt-2"
                    >
                        {submitting ? (
                            <><Loader2 size={20} className="animate-spin" /> Submitting...</>
                        ) : (
                            'Submit Resource'
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
