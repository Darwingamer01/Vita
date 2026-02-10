import { Resource, ResourceType, AvailabilityStatus, Request, Alert, Location } from '@/types';
import { prisma } from './prisma'; // Singleton instance
import { Resource as DbResource, Request as DbRequest } from '@/generated/client/client';

// Simple Haversine Distance (in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg: number) { return deg * (Math.PI / 180) }

// Helper to map DB Resource to App Resource
const mapDbResource = (r: DbResource): Resource => {
    return {
        id: r.id,
        type: r.type as ResourceType,
        title: r.title,
        description: r.description || undefined,
        location: {
            lat: r.lat,
            lng: r.lng,
            address: r.address || undefined,
            city: r.city || undefined,
            district: r.district || undefined,
        },
        contact: JSON.parse(r.contact),
        status: r.status as AvailabilityStatus,
        verificationLevel: r.verificationLevel as any,
        lastUpdated: r.lastUpdated.toISOString(),
        createdAt: r.createdAt.toISOString(),
        metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
        reportCount: r.reportCount,
        upvoteCount: r.upvoteCount,
        distance: undefined // Calculated at runtime if needed
    };
};

// Helper to map DB Request to App Request
const mapDbRequest = (r: DbRequest): Request => {
    return {
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type as ResourceType,
        contact: r.contact,
        location: r.location,
        urgency: r.urgency as any,
        status: r.status as any,
        createdAt: r.createdAt.toISOString(),
        responseCount: r.responseCount,
        timeline: JSON.parse(r.timeline),
        matches: JSON.parse(r.matches),
        adminNotes: r.adminNotes || undefined
    };
};

class DatabaseService {

    // Enhanced Filter with Radius Logic and Metadata Support
    async getAllResources(filters?: {
        type?: ResourceType;
        status?: AvailabilityStatus;
        lat?: number;
        lng?: number;
        radius?: number; // km
        query?: string;
        metadataFilter?: Record<string, any>; // New generic metadata filter
    }): Promise<Resource[]> {
        // Build Prisma Query
        const whereClause: any = {};

        if (filters?.type) {
            if (filters.type === 'BLOOD_BANK') {
                // Special case for Blood Bank logic (handled in JS for simplicity or OR query)
                // For Prisma SQLite, filtering based on JSON content is limited. 
                // We'll fetch broadly and filter in JS if complex.
                // But generally: type = BLOOD_BANK OR (type=HOSPITAL AND metadata contains bloodStock)
                whereClause['OR'] = [
                    { type: 'BLOOD_BANK' },
                    {
                        type: 'HOSPITAL',
                        metadata: { contains: 'bloodStock' }
                    }
                ];
            } else {
                whereClause['type'] = filters.type;
            }
        }

        if (filters?.status) {
            whereClause['status'] = filters.status;
        }

        // Text Search
        if (filters?.query) {
            const q = filters.query.toLowerCase();
            whereClause['OR'] = [
                { title: { contains: q } }, // Case insensitive usually depends on DB collation, SQLite default is tolerant
                { type: { contains: q } },
                { address: { contains: q } },
                { metadata: { contains: q } } // Simple check in JSON string
            ];
        }

        // Fetch from DB
        const dbResources = await prisma.resource.findMany({
            where: whereClause
        });

        // Map to App Types
        let results = dbResources.map(mapDbResource);

        // Apply filters that are hard to do in Prisma/SQLite
        // 1. Metadata Deep Check
        if (filters?.metadataFilter) {
            const metaCriteria = filters.metadataFilter;
            results = results.filter(r => {
                if (!r.metadata) return false;
                return Object.entries(metaCriteria).every(([key, value]) => {
                    const keys = key.split('.');
                    let current: any = r.metadata;
                    for (const k of keys) {
                        if (current === undefined || current === null) return false;
                        current = current[k];
                    }
                    if (value === 'check_positive') {
                        return typeof current === 'number' && current > 0;
                    }
                    return current === value;
                });
            });
        }

        // 2. Spatial Filter
        if (filters?.lat && filters?.lng && filters?.radius) {
            results = results.map(r => ({
                ...r,
                distance: getDistance(filters.lat!, filters.lng!, r.location.lat, r.location.lng)
            })).filter(r => r.distance! <= filters.radius!);

            // Sort by distance
            results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return results;
    }

    async getResourceById(id: string): Promise<Resource | undefined> {
        const r = await prisma.resource.findUnique({ where: { id } });
        return r ? mapDbResource(r) : undefined;
    }

    // Helper to generate AI Matches
    private async generateMatches(req: Partial<Request>): Promise<import('@/types').MatchSuggestion[]> {
        // Find top 3 relevant resources
        const candidates = await prisma.resource.findMany({
            where: {
                OR: [
                    { type: req.type },
                    { type: 'HOSPITAL' } // Fallback for medical
                ]
            },
            take: 10 // Analyze top 10
        });

        return candidates.map(r => ({
            resourceId: r.id,
            resourceName: r.title,
            type: r.type as ResourceType,
            distance: 2.5, // Mock distance or calculate real if req.location given
            matchScore: r.verificationLevel === 'VERIFIED' ? 95 : 80,
            verificationLevel: r.verificationLevel as any,
            contact: JSON.parse(r.contact).phone
        }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 3);
    }

    async getAllRequests(): Promise<Request[]> {
        const reqs = await prisma.request.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return reqs.map(mapDbRequest);
    }

    async getRequestById(id: string): Promise<Request | undefined> {
        const req = await prisma.request.findUnique({ where: { id } });
        return req ? mapDbRequest(req) : undefined;
    }

    async createRequest(req: any): Promise<Request> {
        const matches = await this.generateMatches(req);

        const initialTimeline = [
            {
                id: Math.random().toString(36).substr(2, 9),
                type: 'CREATED',
                timestamp: new Date().toISOString(),
                message: 'Request created',
                actor: 'USER'
            }
        ];

        if (matches.length > 0) {
            initialTimeline.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'MATCH_FOUND',
                timestamp: new Date().toISOString(),
                message: `AI found ${matches.length} potential matches`,
                actor: 'SYSTEM'
            });
        }

        const newReq = await prisma.request.create({
            data: {
                title: req.title,
                description: req.description,
                type: req.type,
                contact: req.contact,
                location: req.location,
                urgency: req.urgency,
                status: 'OPEN',
                timeline: JSON.stringify(initialTimeline),
                matches: JSON.stringify(matches)
            }
        });

        return mapDbRequest(newReq);
    }

    async updateRequest(id: string, updates: Partial<Request>): Promise<Request | null> {
        const existing = await prisma.request.findUnique({ where: { id } });
        if (!existing) return null;

        const currentAppReq = mapDbRequest(existing);
        const newTimeline = [...currentAppReq.timeline];

        // Handle Status Change Logic
        if (updates.status && updates.status !== currentAppReq.status) {
            newTimeline.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'STATUS_CHANGE',
                timestamp: new Date().toISOString(),
                message: `Status changed from ${currentAppReq.status} to ${updates.status}`,
                actor: 'ADMIN' as any
            });
        }

        // Handle Admin Notes
        if (updates.adminNotes && updates.adminNotes !== currentAppReq.adminNotes) {
            newTimeline.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'NOTE_ADDED',
                timestamp: new Date().toISOString(),
                message: `Admin Note: ${updates.adminNotes}`,
                actor: 'ADMIN' as any
            });
        }

        const updated = await prisma.request.update({
            where: { id },
            data: {
                ...updates,
                matches: updates.matches ? JSON.stringify(updates.matches) : undefined,
                status: updates.status,
                timeline: JSON.stringify(newTimeline),
                adminNotes: updates.adminNotes
            }
        });

        return mapDbRequest(updated);
    }

    async deleteRequest(id: string): Promise<boolean> {
        try {
            await prisma.request.delete({ where: { id } });
            return true;
        } catch (error) {
            console.error("Failed to delete request", error);
            return false;
        }
    }

    async addResource(resource: Partial<Resource>): Promise<Resource> {
        const newResource = await prisma.resource.create({
            data: {
                type: resource.type!,
                title: resource.title!,
                description: resource.description,
                lat: resource.location!.lat,
                lng: resource.location!.lng,
                address: resource.location!.address,
                city: resource.location!.city,
                district: resource.location!.district,
                contact: JSON.stringify(resource.contact),
                status: resource.status || 'AVAILABLE',
                verificationLevel: resource.verificationLevel || 'UNVERIFIED',
                metadata: resource.metadata ? JSON.stringify(resource.metadata) : JSON.stringify({}),
                reportCount: 0,
                upvoteCount: 0
            }
        });
        return mapDbResource(newResource);
    }

    async reportResource(id: string): Promise<{ success: boolean; newStatus?: string }> {
        try {
            const resource = await prisma.resource.findUnique({ where: { id } });
            if (!resource) return { success: false };

            const newCount = resource.reportCount + 1;
            let newLevel = resource.verificationLevel;

            if (newCount >= 3) {
                newLevel = 'FLAGGED';
            }

            const updated = await prisma.resource.update({
                where: { id },
                data: {
                    reportCount: newCount,
                    verificationLevel: newLevel
                }
            });

            return { success: true, newStatus: updated.verificationLevel };
        } catch (error) {
            return { success: false };
        }
    }

    async deleteResource(id: string): Promise<boolean> {
        try {
            await prisma.resource.delete({ where: { id } });
            return true;
        } catch (error) {
            console.error("Failed to delete resource", error);
            return false;
        }
    }

    async getAllAlerts(): Promise<Alert[]> {
        const alerts = await prisma.alert.findMany();
        return alerts.map(a => ({
            id: a.id,
            title: a.title,
            message: a.message,
            district: a.district,
            severity: a.severity as any,
            type: a.type as any,
            createdAt: a.createdAt.toISOString(),
            expiresAt: a.expiresAt.toISOString()
        }));
    }
}

export const db = new DatabaseService();
