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

    try {
        const updatedEvent = await prisma.event.update({
            where: { id },
            data: { status: approved ? 'approved' : 'rejected' },
        });

        // Create a notification for the admin who created the event
        if (approved) {
            await prisma.notification.create({
                data: {
                    userEmail: updatedEvent.userEmail, // Assuming userEmail is stored in the event
                    message: `Your event "${updatedEvent.eventName}" has been approved.`,
                },
            });
        }

        return new NextResponse(JSON.stringify({ event: updatedEvent }), { status: 200 });
    } catch (error) {
        console.error('Error updating event status:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to update event status' }), { status: 500 });
    }
}