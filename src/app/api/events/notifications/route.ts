import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    if (!session.user.email) {
        return new NextResponse(JSON.stringify({ error: 'User email is missing' }), { status: 400 });
    }

    const notifications = await prisma.notification.findMany({
        where: { userEmail: session.user.email },
        orderBy: { createdAt: 'desc' },
    });

    return new NextResponse(JSON.stringify({ notifications }), { status: 200 });
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = await request.json();
    await prisma.notification.delete({
        where: { id },
    });

    return new NextResponse(JSON.stringify({ message: 'Notification deleted' }), { status: 200 });
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = await request.json();
    await prisma.notification.update({
        where: { id },
        data: { read: true },
    });

    return new NextResponse(JSON.stringify({ message: 'Notification marked as read' }), { status: 200 });
}