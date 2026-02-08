import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const allResources = await db.getAllResources();
    const allRequests = await db.getAllRequests();

    const stats = {
        // Count OPEN requests
        activeIncidents: allRequests.filter(r => r.status === 'OPEN').length,

        // Count "Busy" units (Approximated by non-available resources or specific type)
        // Since we don't have AMBULANCE type explicitly in seed, we'll mock this or use ON_CALL doctors
        activeUnits: allResources.filter(r => r.status === 'ON_CALL' || r.status === 'LIMITED').length,

        totalResources: allResources.length,

        latency: Math.floor(Math.random() * (30 - 10) + 10) + 'ms',

        // Calculate total beds from Hospitals
        availableBeds: allResources
            .filter(r => r.type === 'HOSPITAL')
            .reduce((acc, curr) => {
                const beds = curr.metadata?.hospital?.beds;
                if (beds) return acc + (beds.general || 0) + (beds.icu || 0);
                return acc;
            }, 0),

        // Add recent list for Table
        recentIncidents: allRequests.slice(0, 10).map(r => ({
            id: r.id,
            type: r.type,
            status: r.status,
            timestamp: r.createdAt,
            location: r.location || 'Unknown'
        }))
    };

    return NextResponse.json(stats);
}
