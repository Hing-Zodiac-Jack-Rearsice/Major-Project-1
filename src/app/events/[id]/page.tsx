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
  ChevronLeft,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  Send,
  Link2,
  Phone,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { remainingTickets } from "@/app/actions";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Head from 'next/head';
import { Metadata } from 'next';

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

  // Replace the existing handleShare with these new sharing functions
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: event?.eventName,
        text: `Join me at ${event?.eventName}! ${event?.description}`,
        url: window.location.href,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Join me at ${event?.eventName}! ${event?.description}`
    );
    const title = encodeURIComponent(event?.eventName || "");
    const image = encodeURIComponent(`${window.location.origin}/api/og/events/${event?.id}`);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}&image=${image}`,
      telegram: `https://telegram.me/share/url?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${text}&source=${window.location.origin}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  // Replace the existing share button with this new component
  function ShareButton() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <Send className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleSocialShare("facebook")}>
            <Facebook className="mr-2 h-4 w-4" />
            <span>Facebook</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare("twitter")}>
            <Twitter className="mr-2 h-4 w-4" />
            <span>Twitter</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare("telegram")}>
            <Send className="mr-2 h-4 w-4" />
            <span>Telegram</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare("whatsapp")}>
            <Phone className="mr-2 h-4 w-4" />
            <span>WhatsApp</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSocialShare("linkedin")}>
            <Users className="mr-2 h-4 w-4" />
            <span>LinkedIn</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Add this component for metadata
  function EventMetadata({ event }: { event: Event }) {
    return (
      <Head>
        <title>{event.eventName}</title>
        <meta name="description" content={event.description} />
        
        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={event.eventName} />
        <meta property="og:description" content={event.description} />
        <meta property="og:image" content={`${window.location.origin}/api/og/events/${event.id}`} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={event.eventName} />
        <meta property="twitter:description" content={event.description} />
        <meta property="twitter:image" content={`${window.location.origin}/api/og/events/${event.id}`} />
      </Head>
    );
  }

  return (
    <>
      <EventMetadata event={event} />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        {/* Back button */}
        <div className="container mx-auto px-4 pt-4">
          <Link href="/events">
            <Button variant="ghost" className="group mb-4">
              <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Events
            </Button>
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-xl">
              {/* Hero Section */}
              <div className="relative h-[500px]">
                <img
                  src={event.imageUrl}
                  alt={event.eventName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

                {/* Event Title and Share Button */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <h1 className="text-4xl md:text-5xl font-bold text-white">
                        {event.eventName}
                      </h1>
                      <p className="text-lg text-white/80">
                        {formattedDate} • {formattedStartTime}
                      </p>
                    </div>
                    <ShareButton />
                  </div>
                </div>
              </div>

              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                {/* Left Column - Event Details */}
                <div className="space-y-6">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <p className="text-2xl font-bold">${event.ticketPrice}</p>
                    <p className="text-sm text-muted-foreground">per ticket</p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
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
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
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
                  </motion.div>
                </div>

                {/* Right Column - Event Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="md:col-span-2 space-y-8"
                >
                  <EventSection
                    title="About This Event"
                    content={event.description}
                  />

                  {event.featuredGuests && event.featuredGuests.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FeaturedSpeakers featuredGuests={event.featuredGuests} />
                    </motion.div>
                  )}

                  {event.highlights && event.highlights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <EventHighlights highlights={event.highlights} />
                    </motion.div>
                  )}

                  {event.sponsors && event.sponsors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <EventSponsors sponsors={event.sponsors} />
                    </motion.div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
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
    <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between transition-all hover:bg-primary/15">
      <div className="flex items-center space-x-3">
        <Ticket className="w-8 h-8 text-primary" />
        <div>
          <p className="text-sm font-medium text-primary">Tickets Remaining</p>
          <p className="text-2xl font-bold">{ticketsLeft}</p>
        </div>
      </div>
      {ticketsLeft <= 10 && (
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse">
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
