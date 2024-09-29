import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (session?.user?.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const { role } = await request.json();

    try {
        const targetUser = await prisma.user.findUnique({ where: { id } });

        if (!targetUser) {
            return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        if (targetUser.role === 'super_admin') {
            return new NextResponse(JSON.stringify({ error: 'Cannot modify super admin role' }), { status: 403 });
        }

        if (role === 'super_admin') {
            return new NextResponse(JSON.stringify({ error: 'Cannot promote to super admin' }), { status: 403 });
        }

        if (!['user', 'admin', 'banned'].includes(role)) {
            return new NextResponse(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });

        return new NextResponse(JSON.stringify({ user: updatedUser }), { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to update user' }), { status: 500 });
    }
}