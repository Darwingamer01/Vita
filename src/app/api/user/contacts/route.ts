import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getToken, decode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { emergencyContacts: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let contacts: string[] = [];
        try {
            if (user.emergencyContacts) {
                contacts = JSON.parse(user.emergencyContacts as string);
            }
        } catch (e) {
            console.error('Error parsing contacts:', e);
            contacts = [];
        }

        return NextResponse.json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    let userEmail = session?.user?.email;
    let userName = session?.user?.name || 'User';

    // Fallback 1: getToken
    if (!userEmail) {
        try {
            const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
            if (token?.email) {
                userEmail = token.email;
                if (token.name) userName = token.name;
            }
        } catch (e) {
            // Silent catch
        }
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
                    if (decoded.name) userName = decoded.name as string;
                }
            }
        } catch (e) {
            console.error('[Contacts API] Manual decode failed:', e);
        }
    }

    if (!userEmail) {
        return NextResponse.json({
            error: 'Unauthorized',
        }, { status: 401 });
    }

    try {
        const { contacts } = await request.json();

        if (!Array.isArray(contacts) || contacts.length === 0) {
            return NextResponse.json({ error: 'At least one contact is required' }, { status: 400 });
        }

        const updatedUser = await prisma.user.upsert({
            where: { email: userEmail },
            update: {
                emergencyContacts: JSON.stringify(contacts)
            },
            create: {
                email: userEmail,
                name: userName,
                emergencyContacts: JSON.stringify(contacts)
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error saving contacts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
