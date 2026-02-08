'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/types';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        fetch('/api/alerts').then(res => res.json()).then(setAlerts);
    }, []);

    const severityStyles = {
        INFO: 'bg-blue-50 border-blue-200 text-blue-900 icon-blue-600',
        WARNING: 'bg-yellow-50 border-yellow-200 text-yellow-900 icon-yellow-600',
        CRITICAL: 'bg-red-50 border-red-200 text-red-900 icon-red-600',
    };

    const SeverityIcon = ({ severity }: { severity: Alert['severity'] }) => {
        if (severity === 'CRITICAL') return <ShieldAlert className="text-red-600" />;
        if (severity === 'WARNING') return <AlertTriangle className="text-yellow-600" />;
        return <Info className="text-blue-600" />;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                    <AlertTriangle className="text-red-600" size={32} />
                    Community Alerts
                </h1>
                <p className="text-gray-600 mt-2">Verified updates from authorities and community moderators.</p>
            </div>

            <div className="space-y-4">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-6 rounded-xl border ${severityStyles[alert.severity].split(' ')[1]} ${severityStyles[alert.severity].split(' ')[0]}`}>
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <SeverityIcon severity={alert.severity} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`text-lg font-bold ${severityStyles[alert.severity].split(' ')[2]}`}>{alert.title}</h3>
                                    <span className="text-xs font-mono uppercase bg-white/50 px-2 py-1 rounded">{alert.district}</span>
                                </div>
                                <p className="text-gray-800 leading-relaxed">{alert.message}</p>
                                <p className="text-xs text-gray-500 mt-4 text-right">
                                    Posted: {new Date(alert.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                {alerts.length === 0 && <p className="text-center text-gray-500">No active alerts in your region.</p>}
            </div>
        </div>
    );
}
