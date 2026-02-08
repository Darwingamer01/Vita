'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Wrapper to prevent SSR of Leaflet map which depends on window
const Map = dynamic(() => import('./Map'), {
    loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>,
    ssr: false
});

export default Map;
