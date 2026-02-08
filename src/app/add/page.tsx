'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, MapPin } from 'lucide-react';
import { ResourceType } from '@/types';

export default function AddResourcePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        type: 'BLOOD' as ResourceType,
        title: '',
        phone: '',
        address: '',
        lat: '28.6139',
        lng: '77.2090',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                type: formData.type,
                title: formData.title,
                description: 'User submitted resource',
                location: {
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng),
                    address: formData.address
                },
                contact: {
                    phone: formData.phone
                },
                status: 'AVAILABLE',
                verificationLevel: 'UNVERIFIED',
            };

            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/map');
                }, 2000);
            } else {
                alert('Failed to submit resource');
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-green-100 p-6 rounded-full mb-6">
                    <CheckCircle size={64} className="text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
                <p className="text-gray-600">Your contribution has been recorded and will help others.</p>
                <p className="text-sm text-gray-500 mt-4">Redirecting to map...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Add Emergency Resource</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                        <option value="BLOOD">Blood Donor</option>
                        <option value="OXYGEN">Oxygen Supply</option>
                        <option value="AMBULANCE">Ambulance</option>
                        <option value="SHELTER">Shelter / Camp</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title / Name</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. John Doe (O+) or City Care Hospital"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
                    <div className="flex gap-2">
                        <input
                            required
                            type="text"
                            placeholder="Enter area name or address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                        <button type="button" className="btn btn-outline" title="Use current location (Mock)">
                            <MapPin size={20} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Note: Logic to auto-detect lat/lng from address or pin-drop would go here. Defaulting to Central Delhi.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                        <input
                            type="text"
                            value={formData.lat}
                            readOnly
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                        <input
                            type="text"
                            value={formData.lng}
                            readOnly
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn btn-primary py-3 text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : 'Submit Resource'}
                </button>

            </form>
        </div>
    );
}
