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
            select: { name: true, email: true, image: true, phoneNumber: true, location: true }
        });

        if (!user) {
            // Return session data as fallback for new Google OAuth users
            return NextResponse.json({
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || '',
                phoneNumber: '',
                location: '',
            });
        }

        return NextResponse.json({
            name: user.name || session.user.name || '',
            email: user.email || '',
            image: user.image || session.user.image || '',
            phoneNumber: user.phoneNumber || '',
            location: user.location || '',
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, phoneNumber, location } = await request.json();

        const updatedUser = await prisma.user.upsert({
            where: { email: session.user.email },
            update: {
                name: name || session.user.name,
                phoneNumber: phoneNumber || null,
                location: location || null,
            },
            create: {
                email: session.user.email,
                name: name || session.user.name || 'User',
                image: session.user.image || null,
                phoneNumber: phoneNumber || null,
                location: location || null,
            }
        });

        return NextResponse.json({ success: true, user: { name: updatedUser.name, phoneNumber: updatedUser.phoneNumber, location: updatedUser.location } });
    } catch (error) {
        console.error('Error saving profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
