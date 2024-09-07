import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const price = Number.parseInt(body.price);
  const sales = await prisma.sale.create({
    data: {
      eventId: body.eventId as string,
      userEmail: body.userEmail as string,
      userName: body.userName as string,
      price: price as number,
    },
  });
  return new NextResponse(JSON.stringify({ data: sales }), { status: 200 });
}
