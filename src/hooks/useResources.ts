'use client';

import { useState, useEffect } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import { Resource, ResourceType } from '@/types';

interface UseResourcesOptions {
    type?: ResourceType;
    autoFetch?: boolean;
    refreshInterval?: number; // in milliseconds
}

export function useResources(options: UseResourcesOptions = {}) {
    const { type, autoFetch = true, refreshInterval } = options;
    const { location } = useLocation();
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResources = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query params
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (location) {
                params.append('lat', location.lat.toString());
                params.append('lng', location.lng.toString());
            }

            const response = await fetch(`/api/resources?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch resources: ${response.statusText}`);
            }

            const data = await response.json();
            setResources(data);
        } catch (err: any) {
            setError(err.message);
            console.error('[useResources] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch on mount and when location/type changes
    useEffect(() => {
        if (autoFetch) {
            fetchResources();
        }
    }, [location, type, autoFetch]);

    // Auto-refresh if interval is set
    useEffect(() => {
        if (!refreshInterval) return;

        const interval = setInterval(() => {
            fetchResources();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval, location, type]);

    return {
        resources,
        isLoading,
        error,
        refetch: fetchResources
    };
}
