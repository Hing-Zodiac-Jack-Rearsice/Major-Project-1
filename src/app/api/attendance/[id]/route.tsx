import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { id } = params;
  const addUserToAttendace = await prisma.attendance.create({
    data: {
      eventId: id,
      userEmail: body.userEmail,
      eventName: body.eventName,
    },
  });
  return new NextResponse(JSON.stringify({ data: addUserToAttendace }), { status: 200 });
}
