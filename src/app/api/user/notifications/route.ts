import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { notificationPreferences: true }
        });

        const preferences = user?.notificationPreferences
            ? JSON.parse(user.notificationPreferences)
            : { email: true, sms: true, push: true }; // Default to all true

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Failed to fetch notification preferences', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const preferences = await request.json();

        // Simple validation
        if (typeof preferences.email !== 'boolean' ||
            typeof preferences.sms !== 'boolean' ||
            typeof preferences.push !== 'boolean') {
            return NextResponse.json({ error: 'Invalid preferences format' }, { status: 400 });
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                notificationPreferences: JSON.stringify(preferences)
            }
        });

        // If email notifications are enabled, maybe send a test/confirmation email?
        // (Skipping for now to avoid spamming on simple toggle)

        return NextResponse.json({ success: true, preferences });
    } catch (error) {
        console.error('Failed to update notification preferences', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
