import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const requests = await db.getAllRequests();
    return NextResponse.json(requests);
}

import { pusherServer } from '../../../lib/pusher-server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newReq = await db.createRequest(body);

        // Trigger Real-time Event
        try {
            await pusherServer.trigger('requests-channel', 'new-request', newReq);
        } catch (pusherError) {
            console.error('Pusher Trigger Error:', pusherError);
        }

        return NextResponse.json(newReq, { status: 201 });
    } catch (e) {
        console.error('Create Request Error:', e);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
