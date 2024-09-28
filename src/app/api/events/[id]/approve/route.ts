import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (session?.user?.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const { approved } = await request.json();

    const updatedEvent = await prisma.event.update({
        where: { id },
        data: { status: approved ? 'approved' : 'rejected' },
    });

    return new NextResponse(JSON.stringify({ event: updatedEvent }), { status: 200 });
}