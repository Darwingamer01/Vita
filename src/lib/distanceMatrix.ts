/**
 * Google Maps Distance Matrix Service
 * Calculates real-time driving distance and duration between two points
 */

interface DistanceMatrixResult {
    distance: number;      // in kilometers
    duration: number;      // in minutes
    durationInTraffic?: number; // with current traffic
    status: 'OK' | 'ZERO_RESULTS' | 'ERROR';
    error?: string;
}

interface Location {
    lat: number;
    lng: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: DistanceMatrixResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(origin: Location, destination: Location): string {
    return `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
}

/**
 * Get distance and duration using Google Maps Distance Matrix API
 */
export async function getDistanceMatrix(
    origin: Location,
    destination: Location
): Promise<DistanceMatrixResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // If no API key, fallback to Haversine
    if (!apiKey) {
        console.warn('[DistanceMatrix] No API key found, using fallback');
        return fallbackDistance(origin, destination);
    }

    // Check cache
    const cacheKey = getCacheKey(origin, destination);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('[DistanceMatrix] Cache hit');
        return cached.data;
    }

    try {
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.append('origins', `${origin.lat},${origin.lng}`);
        url.searchParams.append('destinations', `${destination.lat},${destination.lng}`);
        url.searchParams.append('mode', 'driving');
        url.searchParams.append('departure_time', 'now');
        url.searchParams.append('traffic_model', 'best_guess');
        url.searchParams.append('key', apiKey);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`API status: ${data.status}`);
        }

        const element = data.rows[0]?.elements[0];

        if (!element || element.status !== 'OK') {
            console.warn('[DistanceMatrix] No route found, using fallback');
            return fallbackDistance(origin, destination);
        }

        const result: DistanceMatrixResult = {
            distance: element.distance.value / 1000, // Convert meters to km
            duration: Math.ceil(element.duration.value / 60), // Convert seconds to minutes
            durationInTraffic: element.duration_in_traffic
                ? Math.ceil(element.duration_in_traffic.value / 60)
                : undefined,
            status: 'OK'
        };

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    } catch (error) {
        console.error('[DistanceMatrix] API error:', error);
        return fallbackDistance(origin, destination);
    }
}

/**
 * Fallback: Calculate approximate distance using Haversine formula
 */
function fallbackDistance(origin: Location, destination: Location): DistanceMatrixResult {
    const distance = getHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const duration = Math.ceil((distance / 30) * 60); // Assume 30 km/h average speed

    return {
        distance,
        duration,
        status: 'OK'
    };
}

/**
 * Haversine formula for calculating distance between two coordinates
 */
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Batch calculate distances for multiple destinations
 * More efficient for multiple resources
 */
export async function getBatchDistanceMatrix(
    origin: Location,
    destinations: Location[]
): Promise<DistanceMatrixResult[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // If no API key or too many destinations, use individual calls
    if (!apiKey || destinations.length > 25) {
        return Promise.all(
            destinations.map(dest => getDistanceMatrix(origin, dest))
        );
    }

    try {
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.append('origins', `${origin.lat},${origin.lng}`);
        url.searchParams.append(
            'destinations',
            destinations.map(d => `${d.lat},${d.lng}`).join('|')
        );
        url.searchParams.append('mode', 'driving');
        url.searchParams.append('departure_time', 'now');
        url.searchParams.append('traffic_model', 'best_guess');
        url.searchParams.append('key', apiKey);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`API status: ${data.status}`);
        }

        const rows = data.rows?.[0];
        if (!rows || !rows.elements) {
            console.warn('[DistanceMatrix] Invalid API response structure, using fallback');
            return destinations.map(dest => fallbackDistance(origin, dest));
        }

        return rows.elements.map((element: any, index: number) => {
            if (element.status !== 'OK') {
                return fallbackDistance(origin, destinations[index]);
            }

            return {
                distance: element.distance.value / 1000,
                duration: Math.ceil(element.duration.value / 60),
                durationInTraffic: element.duration_in_traffic
                    ? Math.ceil(element.duration_in_traffic.value / 60)
                    : undefined,
                status: 'OK'
            };
        });
    } catch (error) {
        console.error('[DistanceMatrix] Batch API error:', error);
        return Promise.all(
            destinations.map(dest => fallbackDistance(origin, dest))
        );
    }
}
