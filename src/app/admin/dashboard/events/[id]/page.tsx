"use client";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import InviteForm from "@/components/dashboard/events/InviteForm";
import { AttendanceChart } from "@/components/dashboard/events/AttendanceChart";
import { SalesCard } from "@/components/dashboard/events/SalesCard";

const page = () => {
  const [event, setEvent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchEvent = async () => {
      const resEvent = await fetch(`/api/events/${id}`);
      const data = await resEvent.json();
      const resAttendance = await fetch(`/api/attendance/events/${id}`);
      const attendanceData = await resAttendance.json();
      //   console.log(data.event);
      setEvent(data.event);
      setAttendance(attendanceData.attendance);
    };
    fetchEvent();
  }, []);
  if (!event) return <div className="pl-14">Loading...</div>;
  // Create a Date object from the event.date string
  const eventDate = new Date(event.date);

  // Format the date
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // If you want to separate the time as well, you can do that here
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    event && (
      <div className="sm:pl-14">
        <img src={event.imageUrl} alt="" className="w-full h-96 object-cover" />
        <div className="px-6">
          <div>
            {/* this can be used for events details on client side*/}
            {/* <h1 className="text-2xl">Event details</h1> */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold my-4 sm:text-4xl">{event.eventName}</h1>
              <div className="items-center gap-2 sm:flex">
                <p className="underline-offset-4 bg-yellow-300 p-2 rounded-sm dark:text-black font-bold text-nowrap">
                  ON CLIENT SIDE
                </p>
                <Button className="font-bold">Update</Button>
              </div>
            </div>
            <div className="gap-10 items-center sm:flex">
              <div className="my-2 sm:my-0">
                <h1 className="text-xl font-semibold">Date and Time</h1>
                <p>
                  {formattedDate} - {formattedTime}
                </p>
              </div>
              <div className="my-2 sm:my-0">
                <h1 className="text-xl font-semibold">Location</h1>
                <p>{event.location}</p>
              </div>
              <Button variant="outline" className="w-full sm:w-fit">
                $ {event.ticketPrice}
              </Button>
            </div>
            <div className="my-4">
              <h1 className="text-xl font-semibold">Event Description</h1>
              <p>{event.description}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <h1 className="text-2xl">Attendees</h1>
            <InviteForm eventId={id} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="sm:table-cell text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance !== null ? (
                attendance?.map((attendee: any) => (
                  <TableRow key={attendee.userEmail}>
                    <TableCell>
                      <div className="font-medium">{attendee.userName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {attendee.userEmail}
                      </div>
                    </TableCell>
                    <TableCell className="sm:table-cell text-right">
                      <Badge className="text-xs" variant="secondary">
                        {attendee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>
                    <div className="font-medium text-left">No attendees yet.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <h1 className="text-2xl">Analytics</h1>
          <div>
            <AttendanceChart eventId={id} />
            <SalesCard eventId={id} />
          </div>
        </div>
      </div>
    )
  );
};

export default page;
