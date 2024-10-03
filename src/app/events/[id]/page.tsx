/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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

interface Event {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  imageUrl: string;
  ticketPrice: number;
}

export default function EventPage() {
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
          <h1 className="absolute bottom-4 left-4 text-4xl font-bold text-white">
            {event.eventName}
          </h1>
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
            <CardFooter className="flex justify-start pt-6">
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
          </div>
          <div className="md:col-span-2 space-y-8">
            <EventSection
              title="About This Event"
              content={event.description}
            />
            <EventSection
              title="What to Expect"
              content={
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Engaging presentations from industry experts</li>
                  <li>
                    Networking opportunities with like-minded professionals
                  </li>
                  <li>Interactive workshops and hands-on sessions</li>
                  <li>Delicious refreshments and meals provided</li>
                </ul>
              }
            />
            <EventSchedule />
            <FeaturedSpeakers />
            <PastEventHighlights />
            <EventSponsors />
            <AdditionalInformation />
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

function EventSchedule() {
  const scheduleItems = [
    { time: "9:00 AM", event: "Registration and Welcome Coffee" },
    {
      time: "10:00 AM",
      event: "Opening Keynote by John Doe, CEO of Tech Innovators",
    },
    { time: "11:30 AM", event: 'Panel Discussion: "The Future of Technology"' },
    { time: "1:00 PM", event: "Networking Lunch" },
    {
      time: "2:00 PM",
      event: 'Workshop: "Hands-on with AI and Machine Learning"',
    },
    { time: "4:00 PM", event: "Closing Remarks & Raffle" },
  ];

  return (
    <EventSection
      title="Event Schedule"
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The event will feature a full-day schedule packed with keynote
            sessions, panel discussions, and interactive workshops. Here's a
            breakdown of the day's schedule:
          </p>
          <ul className="space-y-2">
            {scheduleItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
              >
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <span className="font-semibold">{item.time}:</span>{" "}
                  {item.event}
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function FeaturedSpeakers() {
  const speakers = [
    {
      name: "John Doe",
      title: "CEO of Tech Innovators",
      description:
        "A visionary leader with 20+ years of experience in the tech industry.",
    },
    {
      name: "Jane Smith",
      title: "CTO of FutureTech",
      description: "Known for her expertise in AI and big data.",
    },
    {
      name: "Emily Zhang",
      title: "Head of Product at NextGen",
      description: "Leading product development in the SaaS space.",
    },
  ];

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
            {speakers.map((speaker, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
              >
                <Users className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">{speaker.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {speaker.title}
                  </div>
                  <div className="mt-1 text-sm">{speaker.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function PastEventHighlights() {
  const highlights = [
    "Over 500 attendees from top companies like Google, Facebook, and Microsoft.",
    "Keynote presentations that inspired innovation and future-thinking in tech.",
    "Interactive workshops that provided hands-on experience with emerging technologies.",
    "Extensive networking sessions that led to new business partnerships and collaborations.",
  ];

  return (
    <EventSection
      title="Past Event Highlights"
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Our previous events have been highly successful, bringing together
            professionals from various industries to collaborate and share
            ideas. Here are some highlights from our last event:
          </p>
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
              >
                <Star className="w-5 h-5 text-primary mt-1" />
                <div>{highlight}</div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function EventSponsors() {
  const sponsors = [
    {
      name: "Tech Innovators",
      description: "A leading company in AI and machine learning solutions.",
    },
    {
      name: "NextGen Solutions",
      description: "Providing state-of-the-art SaaS platforms for businesses.",
    },
    {
      name: "CloudX",
      description:
        "Cloud hosting and data storage solutions trusted by Fortune 500 companies.",
    },
  ];

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
                  <span className="font-semibold">{sponsor.name}</span> -{" "}
                  {sponsor.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}

function AdditionalInformation() {
  const info = [
    {
      title: "Parking",
      content: "Free parking is available on-site for all attendees.",
    },
    {
      title: "COVID-19 Guidelines",
      content:
        "We will be following all local health and safety guidelines to ensure the safety of our attendees.",
    },
    {
      title: "Dress Code",
      content: "Business casual is recommended for all participants.",
    },
  ];

  return (
    <EventSection
      title="Additional Information"
      content={
        <ul className="space-y-2">
          {info.map((item, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 bg-secondary/5 rounded-md p-3"
            >
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <span className="font-semibold">{item.title}:</span>{" "}
                {item.content}
              </div>
            </li>
          ))}
        </ul>
      }
    />
  );
}
