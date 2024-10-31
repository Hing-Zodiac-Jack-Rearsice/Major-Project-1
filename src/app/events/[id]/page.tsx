import React, { Suspense } from "react";
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
import { ShareEventButtons } from "@/components/events/ShareEventButtons";
import { Metadata } from "next";
import EventPageClient from "./EventPageClient";

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

async function getEvent(id: string): Promise<Event> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/events/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch event");
  }
  const data = await res.json();
  return data.event;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const event = await getEvent(params.id);

  return {
    title: event.eventName,
    description: event.description,
    openGraph: {
      title: event.eventName,
      description: event.description,
      images: [
        {
          url: event.imageUrl,
          width: 1200,
          height: 630,
          alt: event.eventName,
        },
      ],
      type: "website",
      url: `${process.env.NEXT_PUBLIC_URL}/events/${event.id}`,
      siteName: "Your Event Platform Name",
    },
    twitter: {
      card: "summary_large_image",
      title: event.eventName,
      description: event.description,
      images: [event.imageUrl],
      creator: "@YourTwitterHandle",
    },
  };
}

export default function EventPage() {
  return (
    <div className="relative">
      <Suspense fallback={<LoadingSpinner />}>
        <EventPageClient />
      </Suspense>
    </div>
  );
}
