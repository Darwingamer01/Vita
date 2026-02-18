import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { ResourceType } from '@/types';
import { getBatchDistanceMatrix } from '@/lib/distanceMatrix';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as ResourceType | null;
        const query = searchParams.get('q');

        // Get user location for distance calculation
        const userLat = searchParams.get('lat');
        const userLng = searchParams.get('lng');

        if (query) {
            const results = await db.getAllResources({ query });
            return NextResponse.json(results);
        }

        const bloodGroup = searchParams.get('bloodGroup'); // e.g. "A+"
        const component = searchParams.get('component'); // e.g. "PLASMA", "PLATELETS"
        const oxygenType = searchParams.get('oxygenType'); // e.g. "CYLINDER"

        // Construct Metadata Filter
        const metadataFilter: Record<string, any> = {};
        if (bloodGroup) {
            // Query param "A-" becomes db key "bloodStock.groups.A-"
            // We use 'check_positive' to ensure stock > 0
            metadataFilter[`bloodStock.groups.${decodeURIComponent(bloodGroup)}`] = 'check_positive';
        }
        if (component) {
            if (component === 'PLASMA') metadataFilter['bloodStock.plasmaAvailable'] = true;
            if (component === 'PLATELETS') metadataFilter['bloodStock.apheresisAvailable'] = true;
        }
        if (oxygenType) {
            metadataFilter['oxygenType'] = oxygenType;
        }

        let resources = await db.getAllResources({
            type: type || undefined,
            metadataFilter: Object.keys(metadataFilter).length > 0 ? metadataFilter : undefined
        });

        // If user location is provided, calculate real-time distances
        if (userLat && userLng) {
            const userLocation = {
                lat: parseFloat(userLat),
                lng: parseFloat(userLng)
            };

            // Get destinations from resources
            const destinations = resources.map(r => ({
                lat: r.location.lat,
                lng: r.location.lng
            }));

            try {
                // Batch calculate distances using Google Maps Distance Matrix API
                const distances = await getBatchDistanceMatrix(userLocation, destinations);

                // Enhance resources with real-time distance data
                resources = resources.map((resource, index) => ({
                    ...resource,
                    distance: distances[index].distance,
                    duration: distances[index].durationInTraffic || distances[index].duration,
                    durationWithoutTraffic: distances[index].duration,
                    hasTrafficData: !!distances[index].durationInTraffic
                }));

                // Sort by duration (fastest first)
                resources.sort((a, b) => (a.duration || 999) - (b.duration || 999));
            } catch (error) {
                console.error('[Resources API] Distance calculation error:', error);
                // Continue without distance data if API fails
            }
        }

        return NextResponse.json(resources);
    } catch (error: any) {
        console.error('[Resources API] Failed to fetch resources:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[Resources API] POST request body:', JSON.stringify(body, null, 2));

        // Extract and validate required fields with flexible naming
        const type = body.type || body.resourceType;
        const title = body.title || body.name;
        const lat = body.lat || body.latitude || body.location?.lat;
        const lng = body.lng || body.longitude || body.location?.lng;
        const contact = body.contact || body.phone || body.contactNumber;
        const status = body.status || 'AVAILABLE'; // Default to AVAILABLE if not provided

        // Validate required fields
        if (!type) {
            console.error('[Resources API] Missing type');
            return NextResponse.json({
                error: 'Missing required field: type (e.g., HOSPITAL, AMBULANCE, BLOOD_BANK)'
            }, { status: 400 });
        }

        if (!title) {
            console.error('[Resources API] Missing title');
            return NextResponse.json({
                error: 'Missing required field: title'
            }, { status: 400 });
        }

        if (lat === undefined || lat === null || isNaN(parseFloat(lat))) {
            console.error('[Resources API] Invalid latitude:', lat);
            return NextResponse.json({
                error: 'Missing or invalid latitude (lat)'
            }, { status: 400 });
        }

        if (lng === undefined || lng === null || isNaN(parseFloat(lng))) {
            console.error('[Resources API] Invalid longitude:', lng);
            return NextResponse.json({
                error: 'Missing or invalid longitude (lng)'
            }, { status: 400 });
        }

        if (!contact) {
            console.error('[Resources API] Missing contact');
            return NextResponse.json({
                error: 'Missing required field: contact'
            }, { status: 400 });
        }

        // Normalize type to uppercase
        const normalizedType = type.toUpperCase();

        // Create resource directly with Prisma
        const newResource = await prisma.resource.create({
            data: {
                type: normalizedType,
                title,
                description: body.description || body.details || null,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                address: body.address || body.location?.address || null,
                city: body.city || null,
                district: body.district || null,
                contact: JSON.stringify(typeof contact === 'string' ? { phone: contact } : contact),
                status: status.toUpperCase(),
                verificationLevel: 'UNVERIFIED',
                metadata: body.metadata ? JSON.stringify(body.metadata) : null,
                lastUpdated: new Date(),
                reportCount: 0,
                upvoteCount: 0
            }
        });

        console.log('[Resources API] Resource created successfully:', newResource.id);
        return NextResponse.json(newResource, { status: 201 });
    } catch (e: any) {
        console.error('[Resources API] Error creating resource:', e);
        console.error('[Resources API] Error stack:', e.stack);
        return NextResponse.json({
            error: 'Failed to create resource',
            details: e.message
        }, { status: 400 });
    }
}
