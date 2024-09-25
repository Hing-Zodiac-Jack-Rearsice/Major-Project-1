import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const event = await prisma.event.findUnique({
    where: {
      id: id as string,
    },
  });
  return NextResponse.json({ event }, { status: 200 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const updatedEvent = await prisma.event.update({
      where: { id: id as string },
      data: {
        eventName: body.eventName,
        ticketAmount: parseInt(body.ticketAmount),
        ticketPrice: parseFloat(body.ticketPrice),
        location: body.location,
        description: body.description,
        imageUrl: body.imageUrl,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    });

    return NextResponse.json({ data: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: `Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
