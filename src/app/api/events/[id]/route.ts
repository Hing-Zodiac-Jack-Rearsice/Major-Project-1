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

    const event = await prisma.event.findUnique({
      where: { id: id as string },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const currentDate = new Date();
    if (new Date(event.endDate) < currentDate) {
      return NextResponse.json({ error: "Cannot update expired event" }, { status: 400 });
    }

    const ticketsSoldCount = await prisma.ticket.count({
      where: { eventId: id as string },
    });

    if (ticketsSoldCount > 0) {
      // If at least one ticket is sold, restrict updates to ticket amount only
      if (body.ticketAmount !== undefined && body.ticketAmount < ticketsSoldCount) {
        return NextResponse.json(
          { error: "Cannot reduce ticket amount below sold tickets" },
          { status: 400 }
        );
      } else {
        // Prevent other updates if tickets are sold
        return NextResponse.json(
          { error: "Cannot update event details after tickets are sold" },
          { status: 400 }
        );
      }
    }

    // Proceed with the update if no tickets have been sold
    const updatedEvent = await prisma.event.update({
      where: { id: id as string },
      data: {
        eventName: body.eventName,
        ticketAmount: body.ticketAmount,
        ticketPrice: body.ticketPrice,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        imageUrl: body.imageUrl,
        categoryName: body.categoryName,
        qrCodeTheme: body.qrCodeTheme,
        featuredGuests: body.featuredGuests,
        highlights: body.highlights,
        sponsors: body.sponsors,
      },
    });

    return NextResponse.json({ data: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        error: `Failed to update event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const eventNoRelated = await prisma.event.findUnique({
    where: {
      id: id,
      attendances: {
        none: {},
      },
      tickets: {
        none: {},
      },
      sales: {
        none: {},
      },
    },
  });
  if (eventNoRelated) {
    const eventName = eventNoRelated.eventName;
    const deleteEvent = await prisma.event.delete({
      where: {
        id: id,
      },
    });
    return new NextResponse(JSON.stringify({ msg: `${eventName} deleted` }), {
      status: 200,
    });
  } else {
    return new NextResponse(JSON.stringify({ msg: "This event cannot be deleted" }), {
      status: 400,
    });
  }
}
