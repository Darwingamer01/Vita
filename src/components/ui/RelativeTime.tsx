'use client';

import { useEffect, useState } from 'react';

interface RelativeTimeProps {
    timestamp: string | Date;
    className?: string;
}

/**
 * Component that displays relative time (e.g., "2 mins ago")
 * Auto-updates every 30 seconds
 */
export default function RelativeTime({ timestamp, className = '' }: RelativeTimeProps) {
    const [relativeTime, setRelativeTime] = useState('');
    const [colorClass, setColorClass] = useState('');

    const calculateRelativeTime = () => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let text = '';
        let color = '';

        if (diffMins < 1) {
            text = 'just now';
            color = 'text-green-600 dark:text-green-400';
        } else if (diffMins < 60) {
            text = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
            color = diffMins < 5
                ? 'text-green-600 dark:text-green-400'
                : diffMins < 15
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-orange-600 dark:text-orange-400';
        } else if (diffHours < 24) {
            text = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            color = diffHours < 2
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-red-600 dark:text-red-400';
        } else {
            text = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            color = 'text-red-600 dark:text-red-400';
        }

        setRelativeTime(text);
        setColorClass(color);
    };

    useEffect(() => {
        calculateRelativeTime();

        // Update every 30 seconds
        const interval = setInterval(calculateRelativeTime, 30000);

        return () => clearInterval(interval);
    }, [timestamp]);

    return (
        <span className={`text-xs font-semibold ${colorClass} ${className}`}>
            {relativeTime}
        </span>
    );
}
