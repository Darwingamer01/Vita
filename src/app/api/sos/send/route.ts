import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getToken, decode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSOSAlert } from '@/lib/notifications';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    let userEmail = session?.user?.email;

    // Fallback 1: getToken
    if (!userEmail) {
        try {
            const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
            if (token?.email) {
                userEmail = token.email;
            }
        } catch (e) { }
    }

    // Fallback 2: Manual Decode from Cookie
    if (!userEmail) {
        try {
            const cookieStore = await cookies();
            const tokenCookie = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token');

            if (tokenCookie) {
                const decoded = await decode({
                    token: tokenCookie.value,
                    secret: process.env.NEXTAUTH_SECRET!
                });

                if (decoded?.email) {
                    userEmail = decoded.email as string;
                }
            }
        } catch (e) {
            console.error('[SOS API] Manual decode failed:', e);
        }
    }

    if (!userEmail) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { location } = await request.json();

    // 1. Fetch User Contacts
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { emergencyContacts: true, name: true }
    });

    if (!user || !user.emergencyContacts) {
        return NextResponse.json({ error: 'No emergency contacts found' }, { status: 404 });
    }

    const contacts: string[] = JSON.parse(user.emergencyContacts);

    // 2. Send Real Alerts
    console.log('--- SOS TRIGGERED ---');
    console.log(`User: ${user.name} (${userEmail})`);

    const results = await Promise.all(contacts.map(async (contact) => {
        const isEmail = contact.includes('@');
        const data = {
            userName: user.name || 'Unknown User',
            location: {
                lat: location.lat,
                lng: location.lng,
                address: location.address // If provided by frontend
            },
            contactPhone: isEmail ? '' : contact,
            contactEmail: isEmail ? contact : undefined
        };

        return sendSOSAlert(data);
    }));

    const successCount = results.filter(r => r.smsSent || r.emailSent).length;
    console.log(`--- SOS SENT: ${successCount}/${contacts.length} ---`);

    return NextResponse.json({ success: true, recipients: contacts.length, delivered: successCount });
} catch (error) {
    console.error('SOS Send Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
}
