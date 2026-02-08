'use client';

import { useEffect } from 'react';
import { pusherClient } from '../../lib/pusher-client';
import { AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertBanner() {
    useEffect(() => {
        const channel = pusherClient.subscribe('alerts-channel');

        channel.bind('new-alert', (data: any) => {
            toast.custom((t) => (
                <div className="w-full max-w-md bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-5">
                    <AlertCircle className="shrink-0 animate-pulse" size={24} />
                    <div className="flex-1">
                        <h4 className="font-bold text-lg">{data.title}</h4>
                        <p className="text-red-100 text-sm mt-1">{data.message}</p>
                        <div className="mt-2 text-xs bg-red-700/50 inline-block px-2 py-1 rounded">
                            {data.district} • {data.type}
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t)} className="text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            ), { duration: 10000, position: 'top-center' });
        });

        return () => {
            pusherClient.unsubscribe('alerts-channel');
        };
    }, []);

    return null; // Headless component, uses Toast
}
