import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { eventIds } = await request.json();

        // Fetch all sales data in a single query
        const salesData = await prisma.sale.findMany({
            where: {
                eventId: {
                    in: eventIds
                }
            },
            select: {
                eventId: true,
            }
        });

        // Create a map of event IDs to deletion status
        const deletionStatus = eventIds.reduce((acc: any, eventId: string) => {
            acc[eventId] = !salesData.some(sale => sale.eventId === eventId);
            return acc;
        }, {});

        return NextResponse.json(deletionStatus);
    } catch (error) {
        console.error('Error checking deletion status:', error);
        return NextResponse.json({ error: 'Failed to check deletion status' }, { status: 500 });
    }
}
