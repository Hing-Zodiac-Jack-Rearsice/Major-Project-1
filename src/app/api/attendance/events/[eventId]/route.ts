import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  const { eventId } = params;
  const attendance = await prisma.attendance.findMany({
    where: {
      eventId: eventId as string,
    },
  });
  return new NextResponse(JSON.stringify({ attendance }), { status: 200 });
}
export async function POST(request: Request, { params }: { params: { eventId: string } }) {
  // body data from qr code
  const body = await request.json();
  const { eventId } = params;
  const findAttendance = await prisma.attendance.findFirst({
    where: {
      eventId: eventId as string,
      userEmail: body.userEmail as string,
    },
  });
  const event = await prisma.event.findUnique({
    where: {
      id: eventId as string,
    },
  });
  if (event?.startDate && event?.endDate) {
    // handle the date calculation here
    const currentDate = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    if (currentDate >= startDate && currentDate <= endDate) {
      // make changes to attendance here change status from "absend" to "attended"\
      const updateUserAttendance = await prisma.attendance.update({
        where: {
          id: findAttendance?.id as string,
        },
        data: {
          status: "attended",
        },
      });
      return new NextResponse(JSON.stringify({ msg: `attendance updated for ${body.userEmail}` }), {
        status: 200,
      });
    } else if (currentDate > endDate) {
      return new NextResponse(JSON.stringify({ msg: "the event has ended" }), { status: 404 });
    } else if (currentDate < startDate) {
      return new NextResponse(JSON.stringify({ msg: "the event has not started" }), {
        status: 404,
      });
    }
  }
}
