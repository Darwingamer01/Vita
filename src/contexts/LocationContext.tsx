'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
    location: { lat: number; lng: number } | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => void;
    hasPermission: boolean;
    setManualLocation: (lat: number, lng: number) => void;
    address: any | null;
}

import { getAddressFromCoordinates } from '@/lib/geocoding';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [hasAsked, setHasAsked] = useState(false);

    // Fetch address when location changes
    useEffect(() => {
        const fetchAddress = async () => {
            if (location) {
                try {
                    const addr = await getAddressFromCoordinates(location.lat, location.lng);
                    if (addr) {
                        setAddress(addr);
                        console.log('[Location] Address fetched:', addr.DisplayName);
                    }
                } catch (error) {
                    console.error('[Location] Failed to fetch address', error);
                }
            }
        };

        fetchAddress();
    }, [location]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                setHasPermission(true);
                setIsLoading(false);

                // Store in localStorage for persistence
                localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lng: longitude }));
                localStorage.setItem('locationPermission', 'granted');

                console.log('[Location] Permission granted:', { lat: latitude, lng: longitude });
            },
            (err) => {
                setIsLoading(false);
                setHasPermission(false);

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError('Location permission denied. Please enable location access in your browser settings.');
                        localStorage.setItem('locationPermission', 'denied');
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError('Location information unavailable. Please try again.');
                        break;
                    case err.TIMEOUT:
                        setError('Location request timed out. Please try again.');
                        break;
                    default:
                        setError('An unknown error occurred while getting your location.');
                }

                console.error('[Location] Error:', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    };

    // Auto-request location on mount if not previously denied
    useEffect(() => {
        const permission = localStorage.getItem('locationPermission');
        const savedLocation = localStorage.getItem('userLocation');

        // If previously granted and we have a saved location, use it
        if (permission === 'granted' && savedLocation) {
            try {
                const loc = JSON.parse(savedLocation);
                setLocation(loc);
                setHasPermission(true);
                console.log('[Location] Using saved location:', loc);
            } catch (e) {
                console.error('[Location] Failed to parse saved location');
            }
        }

        // Auto-request if never asked and not denied
        if (!hasAsked && permission !== 'denied') {
            setHasAsked(true);
            // Small delay to avoid blocking initial render
            setTimeout(() => {
                requestLocation();
            }, 1000);
        }
    }, []);

    // Refresh location every 5 minutes if permission granted
    useEffect(() => {
        if (!hasPermission) return;

        const interval = setInterval(() => {
            console.log('[Location] Refreshing location...');
            requestLocation();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [hasPermission]);

    const setManualLocation = (lat: number, lng: number) => {
        setLocation({ lat, lng });
        setAddress(null); // Clear address while fetching new one
        setHasPermission(true);
        // Store in localStorage
        localStorage.setItem('userLocation', JSON.stringify({ lat, lng }));
        localStorage.setItem('locationPermission', 'granted');
        console.log('[Location] Manual location set:', { lat, lng });
    };

    return (
        <LocationContext.Provider value={{ location, address, isLoading, error, requestLocation, hasPermission, setManualLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
