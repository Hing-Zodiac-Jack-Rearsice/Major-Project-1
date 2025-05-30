import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // body data from qr code
  const body = await request.json();
  const eventId = body.eventId;
  return new NextResponse(JSON.stringify({ data: body }), { status: 200 });
  //   const findAttendance = await prisma.attendance.findFirst({
  //     where: {
  //       eventId: eventId as string,
  //       userEmail: body.userEmail as string,
  //     },
  //   });
  //   const event = await prisma.event.findUnique({
  //     where: {
  //       id: eventId as string,
  //     },
  //   });
  //   if (event?.startDate && event?.endDate) {
  //     // handle the date calculation here
  //     const currentDate = new Date();
  //     const startDate = new Date(event.startDate);
  //     const endDate = new Date(event.endDate);
  //     if (currentDate >= startDate && currentDate <= endDate) {
  //       // make changes to attendance here change status from "absend" to "attended"
  //     }
  //   }
  //   const updateUserAttendance = await prisma.attendance.update({
  //     where: {
  //       id: findAttendance?.id as string,
  //     },
  //     data: {
  //       status: "Attended",
  //     },
  //   });

  //   return new NextResponse(JSON.stringify({ data: updateUserAttendance }), { status: 200 });
  //   return new NextResponse(JSON.stringify({ data: updateUserAttendance }), { status: 200 });
}

export async function GET() {
  //   const session = await auth();
  const attendanceCounts = await prisma.event.findMany({
    where: {
      userEmail: "bensey873@gmail.com",
    },
    select: {
      id: true,
      eventName: true,
      attendances: {
        select: {
          status: true,
        },
      },
      _count: {
        select: {
          attendances: true,
        },
      },
    },
  });
  const detailedResults = attendanceCounts.map((event) => {
    const attended = event.attendances.filter((a) => a.status === "attended").length;
    const absent = event.attendances.filter((a) => a.status === "absent").length;
    const total = event._count.attendances;
    const attendanceRate = total > 0 ? (attended / total) * 100 : 0;

    return {
      id: event.id,
      eventName: event.eventName,
      attended,
      absent,
      total,
      attendanceRate: attendanceRate.toFixed(2) + "%",
    };
  });

  // return detailedResults;
  return new Response(JSON.stringify({ detailedResults }), { status: 200 });
}
