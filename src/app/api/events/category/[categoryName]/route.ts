import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { categoryName: string } }) {
  const { categoryName } = params;
  const session = await auth();

  if (categoryName === "all") {
    const allEvents = await prisma.event.findMany({
      where: {
        status: 'approved',
      },
    });
    return new NextResponse(JSON.stringify({ data: allEvents }), { status: 200 });
  }
  const eventsFromCategory = await prisma.event.findMany({
    where: {
      categoryName: categoryName,
      status: 'approved',
    },
  });
  return new NextResponse(JSON.stringify({ data: eventsFromCategory }), { status: 200 });
}
