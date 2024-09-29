"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import BuyButton from "@/components/events/BuyButton";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { remainingTickets } from "@/app/actions";

export default function EventPage() {
  const { data: session } = useSession();
  const [event, setEvent] = useState<any>(null);
  const { id } = useParams();
  const [ticketsLeft, setTicketsLeft] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      setEvent(data.event);
    };
    const getRemainingTickets = async () => {
      setTicketsLeft(await remainingTickets(id));
    };

    if (id) {
      fetchEvent();
      getRemainingTickets();
    }
  }, [id]);

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedStartTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = eventEndDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="relative h-96">
          <img src={event.imageUrl} alt={event.eventName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <h1 className="absolute bottom-4 left-4 text-4xl font-bold text-white">
            {event.eventName}
          </h1>
        </div>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span className="text-lg">{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-lg">
                {formattedStartTime} to {formattedEndTime}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-lg">{event.location}</span>
            </div>
            <TicketsLeftCard ticketsLeft={ticketsLeft} />
          </div>
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            <div className="pt-4">
              <h3 className="text-xl font-semibold mb-2">What to Expect</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Engaging presentations from industry experts</li>
                <li>Networking opportunities with like-minded professionals</li>
                <li>Interactive workshops and hands-on sessions</li>
                <li>Delicious refreshments and meals provided</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          {session?.user.role === "admin" ? (
            <Button variant="secondary" className="w-full md:w-auto">
              Admins are not permitted to purchase. View only.
            </Button>
          ) : (
            <BuyButton
              eventId={event.id}
              ticketPrice={event.ticketPrice}
              userEmail={session?.user.email}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function TicketsLeftCard({ ticketsLeft }: { ticketsLeft: number }) {
  return (
    <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Ticket className="w-8 h-8 text-primary" />
        <div>
          <p className="text-sm font-medium text-primary">Tickets Remaining</p>
          <p className="text-2xl font-bold">{ticketsLeft}</p>
        </div>
      </div>
      {ticketsLeft <= 10 && (
        <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
          Almost Sold Out!
        </span>
      )}
    </div>
  );
}
