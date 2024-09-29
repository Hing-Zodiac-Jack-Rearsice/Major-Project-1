import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const pendingEvents = await prisma.event.findMany({
        where: { status: 'pending' },
        include: { user: { select: { name: true, email: true } } },
    });

    return new NextResponse(JSON.stringify({ events: pendingEvents }), { status: 200 });
}