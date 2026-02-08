import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const alerts = await prisma.alert.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(alerts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Save to DB
        const alert = await prisma.alert.create({
            data: {
                title: body.title,
                message: body.message,
                district: body.district,
                severity: body.severity,
                type: body.type,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h expiry
            }
        });

        // Trigger Real-time Event
        const { pusherServer } = await import('../../../lib/pusher-server');
        await pusherServer.trigger('alerts-channel', 'new-alert', alert);

        return NextResponse.json(alert, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }
}
