import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // const session = await auth();
  const { id } = params;
  // if (session?.user.role === "admin") {
  const event = await prisma.event.findUnique({
    where: {
      id: id as string,
    },
  });
  return new NextResponse(JSON.stringify({ event }), { status: 200 });
  // }
}
