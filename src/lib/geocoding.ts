/**
 * Geocoding Utility
 * Uses OpenStreetMap Nominatim API for reverse geocoding
 * No API key required, but subject to usage limits (1 request/sec)
 */

interface AddressDetails {
    DisplayName: string;
    Address: {
        road?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        district?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
    };
}

export async function getAddressFromCoordinates(lat: number, lng: number): Promise<AddressDetails | null> {
    try {
        // Use OpenStreetMap Nominatim API
        // Must provide a User-Agent header as per Nominatim usage policy
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'VitaApp/1.0 (vita-app-project)'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            console.error('[Geocoding] API Error:', data.error);
            return null;
        }

        return {
            DisplayName: data.display_name,
            Address: data.address
        };
    } catch (error) {
        console.error('[Geocoding] Error fetching address:', error);
        return null;
    }
}
