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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Ticket, ChevronLeft, Users, Star, Award, UserCheck } from "lucide-react";
import Link from "next/link";
import EventUpdateForm from "@/components/dashboard/events/EventUpdateForm";
import { remainingTickets } from "@/app/actions";
import { Progress } from "@/components/ui/progress";

export default function Component(props: { prop1: string } = { prop1: "default" }) {
  const [event, setEvent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const { id } = useParams();
  const [ticketsLeft, setTicketsLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const resEvent = await fetch(`/api/events/${id}`);
      if (!resEvent.ok) throw new Error("Failed to fetch event");
      const data = await resEvent.json();
      setEvent(data.event);
      setTicketsLeft(await remainingTickets(id));
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const resAttendance = await fetch(`/api/attendance/events/${id}`);
      if (!resAttendance.ok) throw new Error("Failed to fetch attendance");
      const attendanceData = await resAttendance.json();
      setAttendance(attendanceData.attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchAttendance();
  }, [id]);

  if (loading) return <LoadingSpinner />;

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

  const ticketsSold = event.ticketAmount - ticketsLeft;
  const ticketPercentage = (ticketsSold / event.ticketAmount) * 100;

  return (
    <div className="min-h-screen bg-background sm:pl-14">
      <div className="relative h-64 md:h-96 w-full">
        <img src={event.imageUrl} alt={event.eventName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
          <Link href="/admin/dashboard/events" className="w-fit">
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
          <EventUpdateForm event={event} refreshCallback={fetchEvent} />
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
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Price:</span>
                <Badge variant="secondary" className="text-lg">
                  ${event.ticketPrice}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sold:</span>
                  <span className="font-medium">
                    {ticketsSold} / {event.ticketAmount}
                  </span>
                </div>
                <Progress value={ticketPercentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-medium text-green-600">{ticketsLeft}</span>
                </div>
              </div>
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
                <CardTitle className="text-2xl font-semibold">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Star className="mr-2 h-5 w-5 text-yellow-500" />
                      Event Highlights
                    </h3>
                    {event.highlights && event.highlights.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {event.highlights.map((item: any, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 mt-1 text-yellow-500">•</span>
                            <span>{item.highlight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No highlights set</p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Award className="mr-2 h-5 w-5 text-primary" />
                      Sponsors
                    </h3>
                    {event.sponsors && event.sponsors.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {event.sponsors.map((item: any, index: number) => (
                          <Badge key={index} variant="outline" className="text-sm py-1 px-2">
                            {item.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No sponsors set</p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <UserCheck className="mr-2 h-5 w-5 text-green-500" />
                      Featured Guests
                    </h3>
                    {event.featuredGuests && event.featuredGuests.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {event.featuredGuests.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 p-3 bg-secondary rounded-lg"
                          >
                            {/* <Avatar>
                              <AvatarImage src={`https://i.pravatar.cc/150?u=${item.name}`} />
                              <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                            </Avatar> */}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No featured guests set</p>
                    )}
                  </div>
                </div>
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
                <div className="grid grid-cols-1 gap-6">
                  <Card className="border-none">
                    {/* <CardHeader>
                      <CardTitle className="text-lg">Sales</CardTitle>
                    </CardHeader> */}
                    <CardContent>
                      <SalesCard eventId={id} />
                    </CardContent>
                  </Card>
                  <Card className="border-none">
                    {/* <CardHeader>
                      <CardTitle className="text-lg">Attendance</CardTitle>
                    </CardHeader> */}
                    <CardContent>
                      <AttendanceChart eventId={id} />
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
}
