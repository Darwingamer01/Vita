'use client';

import { useState } from 'react';
import { Resource } from '@/types';
import { Save, Clock, User } from 'lucide-react';

export default function DoctorDashboard() {
    const [isAvailable, setIsAvailable] = useState(true);
    const [nextSlot, setNextSlot] = useState('14:00');

    // Mock Doctor Data
    const doctor = {
        name: 'Dr. Naresh Trehan',
        specialty: 'Cardiologist',
        hospital: 'Medanta',
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{doctor.name}</h2>
                    <p className="text-gray-500">{doctor.specialty} • {doctor.hospital}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isAvailable ? 'ONLINE' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-bold flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></div> Accepting Consultations</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={isAvailable}
                            onChange={(e) => setIsAvailable(e.target.checked)}
                        />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label font-bold">Next Available Slot</label>
                        <div className="flex gap-2">
                            <input
                                type="time"
                                value={nextSlot}
                                onChange={(e) => setNextSlot(e.target.value)}
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary w-full">
                    <Save size={18} /> Update Status
                </button>
            </div>
        </div>
    );
}
