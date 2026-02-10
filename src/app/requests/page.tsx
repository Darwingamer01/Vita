'use client';

import { useEffect, useState } from 'react';
import { Request } from '@/types';
import { MessageSquare, Phone, MapPin, Clock, Plus } from 'lucide-react';

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', contact: '', location: '', type: 'BLOOD' });

    useEffect(() => {
        fetch('/api/requests').then(res => res.json()).then(setRequests);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/requests', {
            method: 'POST',
            body: JSON.stringify({ ...formData, status: 'OPEN' }),
        });
        if (res.ok) {
            const newReq = await res.json();
            setRequests([newReq, ...requests]);
            setShowForm(false);
            setFormData({ title: '', description: '', contact: '', location: '', type: 'BLOOD' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex flex-col items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Community Requests</h1>
                    <p className="text-gray-600">Real-time needs posted by the community.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    <Plus size={20} className="mr-2" /> Request Help
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h2 className="font-bold mb-4">Post a Requirement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            placeholder="Title (e.g. Need B+ Blood)"
                            className="w-full p-2 rounded border"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Details (Patient condition, hospital name...)"
                            className="w-full p-2 rounded border"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="Contact Number"
                                className="w-full p-2 rounded border"
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                required
                            />
                            <input
                                placeholder="Location"
                                className="w-full p-2 rounded border"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancel</button>
                            <button type="submit" className="btn btn-primary">Post Request</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-block ${req.type === 'BLOOD' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {req.type}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">{req.title}</h3>
                                <p className="text-gray-600 mt-1">{req.description}</p>
                            </div>
                            {req.status === 'FULFILLED' && (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">FULFILLED</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {req.location}</span>
                            <span className="flex items-center gap-1"><Phone size={16} /> {req.contact}</span>
                            <span className="flex items-center gap-1"><Clock size={16} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                            <div className="flex gap-2">
                                <a href={`tel:${req.contact}`} className="btn btn-outline py-1 px-4 text-xs h-8">Call</a>
                                <a href={`https://wa.me/${req.contact}`} className="btn btn-primary py-1 px-4 text-xs h-8 bg-green-600 hover:bg-green-700 border-green-600">WhatsApp</a>
                            </div>
                            <button
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete this request?')) {
                                        try {
                                            const res = await fetch(`/api/requests/${req.id}`, { method: 'DELETE' });
                                            if (res.ok) {
                                                setRequests(requests.filter(r => r.id !== req.id));
                                            } else {
                                                alert('Failed to delete request');
                                            }
                                        } catch (e) {
                                            console.error('Delete error', e);
                                            alert('An error occurred');
                                        }
                                    }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Delete Request
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
