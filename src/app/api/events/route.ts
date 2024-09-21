import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user.role === "admin") {
    try {
      const events = await prisma.event.findMany({
        where: {
          // created by that email user
          userEmail: session.user.email as string,
        },
      });
      return new NextResponse(JSON.stringify({ events }), { status: 200 });
    } catch (error) {
      console.log(error, "fetching all events error");
    }
  } else if (session?.user.role === "user") {
    try {
      const events = await prisma.event.findMany();
      return new NextResponse(JSON.stringify({ events }), { status: 200 });
    } catch (error) {
      console.log(error, "fetching all events error");
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
