import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ResourceType } from '@/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ResourceType | null;
    const query = searchParams.get('q');

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

    const resources = await db.getAllResources({
        type: type || undefined,
        metadataFilter: Object.keys(metadataFilter).length > 0 ? metadataFilter : undefined
    });

    return NextResponse.json(resources);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // In a real app, validation would happen here
        const newResource = await db.addResource(body);
        return NextResponse.json(newResource, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
