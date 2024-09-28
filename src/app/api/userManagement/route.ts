import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const users = await prisma.user.findMany();
        return new NextResponse(JSON.stringify({ users }), { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (session?.user?.role !== 'super_admin') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { id } = params;
    const { role } = await request.json();

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
    });

    return new NextResponse(JSON.stringify({ user: updatedUser }), { status: 200 });
}