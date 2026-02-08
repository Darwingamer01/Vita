'use client';

import { useState } from 'react';
import { Save, Bed, Activity, Thermometer } from 'lucide-react';

export default function HospitalAdmin() {
    // Mock Hospital Data
    const [stats, setStats] = useState({
        general: 45,
        icu: 2,
        ventilator: 0,
        oxygen: 100
    });

    const handleChange = (key: keyof typeof stats, val: string) => {
        setStats(prev => ({ ...prev, [key]: parseInt(val) || 0 }));
    };

    return (
        <div className="card max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold">AIIMS Delhi - Resource Control</h2>
                    <p className="text-gray-500">Government ID: HOSP-DL-001</p>
                </div>
                <button className="btn btn-sm btn-outline">View Analytics</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="text-sm text-blue-800 font-bold mb-2 flex items-center gap-2"><Bed size={16} /> General Beds</div>
                    <input
                        type="number"
                        value={stats.general}
                        onChange={(e) => handleChange('general', e.target.value)}
                        className="input input-sm w-full font-mono text-xl font-bold"
                    />
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="text-sm text-purple-800 font-bold mb-2 flex items-center gap-2"><Activity size={16} /> ICU Beds</div>
                    <input
                        type="number"
                        value={stats.icu}
                        onChange={(e) => handleChange('icu', e.target.value)}
                        className="input input-sm w-full font-mono text-xl font-bold text-red-600"
                    />
                </div>
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <div className="text-sm text-red-800 font-bold mb-2 flex items-center gap-2"><Activity size={16} /> Ventilators</div>
                    <input
                        type="number"
                        value={stats.ventilator}
                        onChange={(e) => handleChange('ventilator', e.target.value)}
                        className="input input-sm w-full font-mono text-xl font-bold text-red-600"
                    />
                </div>
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <div className="text-sm text-green-800 font-bold mb-2 flex items-center gap-2"><Thermometer size={16} /> Oxygen (Cyl)</div>
                    <input
                        type="number"
                        value={stats.oxygen}
                        onChange={(e) => handleChange('oxygen', e.target.value)}
                        className="input input-sm w-full font-mono text-xl font-bold text-green-600"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button className="btn btn-ghost">Cancel</button>
                <button className="btn btn-primary px-8">
                    <Save size={18} /> Push Updates to Live Map
                </button>
            </div>
        </div>
    );
}
