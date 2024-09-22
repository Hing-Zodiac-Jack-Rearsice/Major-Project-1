import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const uploadTicket = await prisma.ticket.create({
      data: {
        eventId: body.eventId,
        eventName: body.eventName,
        userEmail: body.userEmail,
        qrCodeUrl: body.qrCodeUrl,
      },
    });
    return new NextResponse(JSON.stringify({ data: uploadTicket }), { status: 200 });
  } catch (error) {
    console.log(error, "error");
  }
}
