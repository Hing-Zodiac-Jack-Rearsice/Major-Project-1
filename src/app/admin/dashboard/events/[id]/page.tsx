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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Ticket, Users, ChevronLeft, Edit } from "lucide-react";
import Link from "next/link";

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
      <div className="flex w-full h-screen items-center justify-center">
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
    <div className="min-h-screen bg-background sm:pl-14">
      <div className="relative h-64 md:h-96 w-full">
        <img src={event.imageUrl} alt={event.eventName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
          <Link href="/admin/dashboard/events">
            <Button variant="outline" className="self-start mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
            </Button>
          </Link>

          <h1 className="text-3xl font-semibold text-white sm:text-5xl mb-2">{event.eventName}</h1>
          <p className="text-xl text-white">{formattedDate}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
              >
                Client Side
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p className="text-sm">These details will be visible to the client side</p>
            </HoverCardContent>
          </HoverCard>
          <Button className="font-bold">
            <Edit className="mr-2 h-4 w-4" /> Update Event
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <CardTitle>Date and Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{formattedDate}</p>
              <p>
                {formattedTime} to {formattedEndTime}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center space-x-2">
              <MapPin className="h-6 w-6" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{event.location}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center space-x-2">
              <Ticket className="h-6 w-6" />
              <CardTitle>Ticket Price</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-lg">
                ${event.ticketPrice}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="mb-8">
          <TabsList>
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-semibold flex items-center">
                    <Users className="mr-2 h-6 w-6" /> Attendees
                  </CardTitle>
                  <InviteForm eventId={id} onInviteSuccess={() => fetchAttendance()} />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attendee</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance !== null && attendance.length > 0 ? (
                      attendance.map((attendee: any) => (
                        <TableRow key={attendee.userEmail}>
                          <TableCell>
                            <div className="font-medium">{attendee.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {attendee.userEmail}
                            </div>
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
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AttendanceChart eventId={id} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SalesCard eventId={id} />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventPage;
