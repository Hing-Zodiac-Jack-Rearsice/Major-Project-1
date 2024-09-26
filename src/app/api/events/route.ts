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
    try {
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
        },
      });
      return new NextResponse(JSON.stringify({ data: uploadEvent }), { status: 200 });
    } catch (error) {
      console.log(error);
      return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
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
