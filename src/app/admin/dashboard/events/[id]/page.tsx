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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const EventPage = () => {
  const [event, setEvent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const { id } = useParams();

  const fetchEvent = async () => {
    const resEvent = await fetch(`/api/events/${id}`);
    const data = await resEvent.json();
    setEvent(data.event);
  };

  const fetchAttendance = async () => {
    const resAttendance = await fetch(`/api/attendance/events/${id}`);
    const attendanceData = await resAttendance.json();
    setAttendance(attendanceData.attendance);
  };

  useEffect(() => {
    fetchEvent();
    fetchAttendance();
  }, []);

  if (!event)
    return (
      <div className="pl-14 flex w-full h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedEndTime = eventEndDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    event && (
      <div className="sm:pl-14">
        <div className="relative h-96 w-full">
          <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
            <h1 className="text-3xl font-semibold text-white sm:text-5xl mb-2">
              {event.eventName}
            </h1>
            <p className="text-xl text-white">{formattedDate}</p>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="items-center gap-2 sm:flex">
              <p className="underline-offset-4 bg-yellow-300 p-2 rounded-sm dark:text-black font-bold text-nowrap">
                ON CLIENT SIDE
              </p>
              <Button className="font-bold">Update</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Date and Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {formattedTime} to {formattedEndTime}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{event.location}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ticket Price</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline">$ {event.ticketPrice}</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{event.description}</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">Attendees</CardTitle>
                <InviteForm eventId={id} onInviteSuccess={() => fetchAttendance()} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendance Table</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance !== null && attendance.length > 0 ? (
                    attendance.map((attendee: any) => (
                      <TableRow key={attendee.userEmail}>
                        <TableCell>
                          <div className="font-medium">{attendee.userName}</div>
                          <div className="text-sm text-muted-foreground">{attendee.userEmail}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{attendee.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No attendees yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <AttendanceChart eventId={id} />
                <SalesCard eventId={id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  );
};

export default EventPage;
