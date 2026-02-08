import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const tasks = await prisma.volunteerTask.findMany({
            where: {
                status: 'OPEN',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching volunteer tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, location, urgent, points } = body;

        const task = await prisma.volunteerTask.create({
            data: {
                title,
                location,
                urgent: urgent || false,
                points: points || 10,
                status: 'OPEN',
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error creating volunteer task:', error);
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}
