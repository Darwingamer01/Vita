'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingUp, Users, Map as MapIcon, ArrowRight } from 'lucide-react';

export default function CrisisPredictor() {
    const [selectedZone, setSelectedZone] = useState('Central Delhi');

    // Mock Prediction Data
    const predictions = {
        'Central Delhi': { risk: 85, trend: 'Increasing', predictedCases: 120, shortageWarning: ['Oxygen', 'ICU Beds'] },
        'South Delhi': { risk: 45, trend: 'Stable', predictedCases: 40, shortageWarning: [] },
        'Rohini': { risk: 70, trend: 'Increasing', predictedCases: 95, shortageWarning: ['Plasma', 'Ambulances'] },
    };

    const currentData = predictions[selectedZone as keyof typeof predictions];

    return (
        <div className="card border border-red-100 bg-red-50/30">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-red-900">
                    <TrendingUp className="text-red-600" />
                    AI Crisis Prediction
                    <span className="text-xs font-normal bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">Beta</span>
                </h3>
                <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="select select-sm bg-white border-red-200 text-red-900"
                >
                    {Object.keys(predictions).map(z => <option key={z} value={z}>{z}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
                    <div className="text-sm text-gray-500 mb-1">Predicted Risk Score</div>
                    <div className="text-4xl font-black text-red-600">{currentData.risk}%</div>
                    <div className={`text-xs mt-1 font-bold ${currentData.trend === 'Increasing' ? 'text-red-500' : 'text-green-500'}`}>
                        Trend: {currentData.trend}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex flex-col items-center justify-center text-center">
                    <div className="text-sm text-gray-500 mb-1">Forecasted Cases (24h)</div>
                    <div className="text-4xl font-black text-gray-800">{currentData.predictedCases}</div>
                    <div className="text-xs mt-1 text-gray-400">vs 80 yesterday</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 text-left">
                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <AlertTriangle size={14} className="text-orange-500" /> Resource Alerts
                    </div>
                    {currentData.shortageWarning.length > 0 ? (
                        <div className="space-y-2">
                            {currentData.shortageWarning.map(item => (
                                <div key={item} className="flex justify-between text-sm bg-red-50 p-2 rounded text-red-800">
                                    <span>{item}</span>
                                    <span className="font-bold text-red-600">Shortage Likely</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-green-600 text-sm flex items-center gap-2 h-full justify-center">
                            <Users size={16} /> No shortages predicted
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-red-200/50 flex justify-between items-center text-sm text-red-800">
                <p>AI Engine analysis based on real-time requests & user density.</p>
                <button className="flex items-center gap-1 font-bold hover:underline">
                    View Full Report <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
