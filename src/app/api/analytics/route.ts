// app/api/analytics/route.ts
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const events = await prisma.event.findMany({
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