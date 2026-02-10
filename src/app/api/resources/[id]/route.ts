import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const resource = await db.getResourceById(id);

    if (resource) {
        return NextResponse.json(resource);
    } else {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const success = await db.deleteResource(id);

    if (success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json(
            { error: 'Failed to delete resource' },
            { status: 500 }
        );
    }
}
