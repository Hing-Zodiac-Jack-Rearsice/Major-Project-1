"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BuyButton from "@/components/events/BuyButton";
import {
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  Users,
  Star,
  Coffee,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { remainingTickets } from "@/app/actions";
import { ShareEventButtons } from "@/components/events/ShareEventButtons";

interface Event {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  imageUrl: string;
  ticketPrice: number;
  featuredGuests?: { name: string; subtitle: string }[];
  highlights?: { highlight: string }[];
  sponsors?: { name: string }[];
}

export default function EventPageClient() {
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const { id } = useParams();
  const [ticketsLeft, setTicketsLeft] = useState<number>(0);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch event");
        }
        const data = await res.json();
        setEvent(data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    const getRemainingTickets = async () => {
      try {
        const remaining = await remainingTickets(id);
        setTicketsLeft(remaining);
      } catch (error) {
        console.error("Error fetching remaining tickets:", error);
      } finally {
        setLoadingTickets(false);
      }
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
      <Card className="overflow-hidden shadow-lg">
        <div className="relative h-96">
          <img
            src={event.imageUrl}
            alt={event.eventName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <h1 className="text-4xl font-bold text-black dark:text-white">
              {event.eventName}
            </h1>
            <ShareEventButtons
              event={event}
              className="bg-white/10 hover:bg-white/20 text-white"
            />
          </div>
        </div>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          <div className="space-y-6">
            <EventInfoCard
              icon={<CalendarDays className="w-5 h-5 text-primary" />}
              title="Date"
              content={formattedDate}
            />
            <EventInfoCard
              icon={<Clock className="w-5 h-5 text-primary" />}
              title="Time"
              content={`${formattedStartTime} to ${formattedEndTime}`}
            />
            <EventInfoCard
              icon={<MapPin className="w-5 h-5 text-primary" />}
              title="Location"
              content={event.location}
            />
            {loadingTickets ? (
              <LoadingSpinner />
            ) : (
              <TicketsLeftCard ticketsLeft={ticketsLeft} />
            )}
            {session?.user.role === "admin" ? (
              <Button variant="secondary" className="w-full">
                Admins are in view only
              </Button>
            ) : (
              <BuyButton
                eventId={event.id}
                ticketPrice={event.ticketPrice}
                userEmail={session?.user.email}
              />
            )}
          </div>
          <div className="md:col-span-2 space-y-8">
            <EventSection
              title="About This Event"
              content={event.description}
            />
            {event.featuredGuests && event.featuredGuests.length > 0 && (
              <FeaturedSpeakers featuredGuests={event.featuredGuests} />
            )}
            {event.highlights && event.highlights.length > 0 && (
              <EventHighlights highlights={event.highlights} />
            )}
            {event.sponsors && event.sponsors.length > 0 && (
              <EventSponsors sponsors={event.sponsors} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventInfoCard({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex items-center space-x-3 bg-secondary/10 rounded-lg p-4">
      {icon}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{content}</p>
      </div>
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

function EventSection({
  title,
  content,
}: {
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="text-muted-foreground leading-relaxed">{content}</div>
    </div>
  );
}

function FeaturedSpeakers({
  featuredGuests,
}: {
  featuredGuests: { name: string; subtitle: string }[];
}) {
  return (
    <EventSection
      title="Featured Speakers"
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Our event brings together leading experts from various industries to
            share their knowledge and insights.
          </p>
          <ul className="space-y-4">
            {featuredGuests.map((speaker, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
              >
                <Users className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">{speaker.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {speaker.subtitle}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function EventHighlights({
  highlights,
}: {
  highlights: { highlight: string }[];
}) {
  return (
    <EventSection
      title="Event Highlights"
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Our previous events have been highly successful, bringing together
            professionals from various industries to collaborate and share
            ideas. Here are some highlights from our last event:
          </p>
          <ul className="space-y-2">
            {highlights.map((item, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
              >
                <Star className="w-5 h-5 text-primary mt-1" />
                <div>{item.highlight}</div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function EventSponsors({ sponsors }: { sponsors: { name: string }[] }) {
  return (
    <EventSection
      title="Event Sponsors"
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We are proud to partner with the following companies to bring you
            this incredible event:
          </p>
          <ul className="space-y-2">
            {sponsors.map((sponsor, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
              >
                <Coffee className="w-5 h-5 text-primary mt-1" />
                <div>
                  <span className="font-semibold">{sponsor.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
