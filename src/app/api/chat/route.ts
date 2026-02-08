import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { message } = await request.json();
        const lowerMsg = message.toLowerCase();

        let reply = "I'm Vee! I can help you find Blood Banks, Oxygen, or Ambulances. Try asking 'need oxygen' or 'find ambulance'.";
        let actions: any[] = [];

        const safeParse = (jsonString: string) => {
            try {
                return JSON.parse(jsonString);
            } catch (e) {
                return {};
            }
        };

        // Dynamic Database Search Logic
        if (lowerMsg.includes('blood') || lowerMsg.includes('plasma')) {
            const donors = await prisma.resource.findMany({
                where: { type: 'BLOOD_BANK', status: 'AVAILABLE' },
                take: 3
            });

            if (donors.length > 0) {
                reply = `I found ${donors.length} blood banks available nearby.`;
                actions = donors.map(d => {
                    const contact = safeParse(d.contact);
                    return {
                        label: `Call ${d.title}`,
                        url: `tel:${contact.phone || ''}`
                    };
                });
                // Add "View All" action
                actions.push({ label: 'View All Blood Banks', url: '/dashboard?tab=blood' });
            } else {
                reply = "I couldn't find any blood banks currently marked as available, but you can check the full list.";
                actions.push({ label: 'Browse Blood Requests', url: '/dashboard?tab=blood' });
            }

        } else if (lowerMsg.includes('oxygen') || lowerMsg.includes('cylinder')) {
            const oxygen = await prisma.resource.findMany({
                where: { type: 'OXYGEN', status: 'AVAILABLE' },
                take: 3
            });

            if (oxygen.length > 0) {
                reply = `Found ${oxygen.length} oxygen suppliers nearby.`;
                actions = oxygen.map(d => {
                    const contact = safeParse(d.contact);
                    return {
                        label: `${d.title} (${d.district || 'City'})`,
                        url: `tel:${contact.phone || ''}`
                    };
                });
                actions.push({ label: 'View All Suppliers', url: '/dashboard?tab=oxygen' });
            } else {
                reply = "No verified oxygen suppliers found right now. Please check the community requests.";
                actions.push({ label: 'Go to Oxygen Page', url: '/dashboard?tab=oxygen' });
            }

        } else if (lowerMsg.includes('ambulance')) {
            const ambulances = await prisma.resource.findMany({
                where: { type: 'AMBULANCE', status: 'AVAILABLE' },
                take: 3
            });

            if (ambulances.length > 0) {
                reply = `Emergency? Found ${ambulances.length} ambulances online.`;
                actions = ambulances.map(d => {
                    const contact = safeParse(d.contact);
                    return {
                        label: `Call ${d.title}`,
                        url: `tel:${contact.phone || ''}`
                    };
                });
            }
            reply += " For critical emergencies, always dial 112/102 first.";
            actions.push({ label: 'Find Ambulance', url: '/dashboard?tab=ambulance' });
        }

        return NextResponse.json({ reply, actions });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { reply: "Vee is having trouble connecting to the database. Please check the main menu for resources.", actions: [] },
            { status: 500 }
        );
    }
}
