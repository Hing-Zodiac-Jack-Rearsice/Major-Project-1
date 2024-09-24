import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  const tickets = await prisma.ticket.findMany({
    where: {
      userEmail: session?.user?.email as string,
    },
    select: {
      userEmail: true,
      eventName: true,
      qrCodeUrl: true,
      event: {
        select: {
          startDate: true,
          endDate: true,
          location: true,
          categoryName: true,
          imageUrl: true,
        },
      },
    },
  });

  return new NextResponse(JSON.stringify({ data: tickets }), { status: 200 });
}
