import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  // console.log("Session in /api/events:", session); // Add this line

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (session?.user.role === "admin") {
    try {
      const events = await prisma.event.findMany({
        where: {
          userEmail: session.user.email as string,
        },
      });
      return new NextResponse(JSON.stringify({ events }), { status: 200 });
    } catch (error) {
      console.log(error, "fetching all events error");
      return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  } else if (session?.user.role === "user") {
    try {
      const events = await prisma.event.findMany();
      return new NextResponse(JSON.stringify({ events }), { status: 200 });
    } catch (error) {
      console.log(error, "fetching all events error");
      return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user.role === "admin") {
    const body = await request.json();

    // Validate incoming data
    const requiredFields = [
      "eventName",
      "ticketAmount",
      "ticketPrice",
      "location",
      "startDate",
      "endDate",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new NextResponse(JSON.stringify({ error: `${field} is required` }), { status: 400 });
      }
    }

    try {
      // Check for existing event with the same name and date
      const existingEvent = await prisma.event.findFirst({
        where: {
          eventName: body.eventName,
          startDate: body.startDate,
          endDate: body.endDate,
        },
      });

      if (existingEvent) {
        return new NextResponse(
          JSON.stringify({ error: "Event already exists for the given date range" }),
          { status: 409 }
        );
      }

      const uploadEvent = await prisma.event.create({
        data: {
          userEmail: session.user.email as string,
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
          status: body.status || "pending",
          featuredGuests: body.featuredGuests,
          highlights: body.highlights,
          sponsors: body.sponsors,
        },
      });

      return new NextResponse(JSON.stringify({ data: uploadEvent }), { status: 201 });
    } catch (error) {
      console.error("Error creating event:", error);
      return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  const body = await request.json();

  if (session?.user.role === "admin") {
    try {
      const updateEvent = await prisma.event.update({
        where: {
          id: body.id,
        },
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
        },
      });
      return new NextResponse(JSON.stringify({ data: updateEvent }), { status: 200 });
    } catch (error) {
      console.log(error);
      return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
}
