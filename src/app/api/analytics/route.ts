// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const events = await prisma.event.findMany({
            where: {
                userEmail: session.user.email as string,
            },
            include: {
                tickets: true,
                attendances: true,
                sales: true,
            },
        });

        const users = await prisma.user.findMany();

        return NextResponse.json({ events, users });
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

