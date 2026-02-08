import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await db.reportResource(id);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Report submitted successfully',
            status: result.newStatus
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
