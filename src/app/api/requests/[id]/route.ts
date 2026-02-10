import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await db.updateRequest(id, body);

        if (!updated) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (e) {
        console.error('Update Request Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const requestItem = await db.getRequestById(id);

    if (requestItem) {
        return NextResponse.json(requestItem);
    } else {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await db.deleteRequest(id);

        if (!success) {
            return NextResponse.json({ error: 'Request not found or failed to delete' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Delete Request Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
