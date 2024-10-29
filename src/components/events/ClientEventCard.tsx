import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Ticket, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { remainingTickets } from "@/app/actions";
import { ShareEventButtons } from "./ShareEventButtons";

export function ClientEventCard({ event }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [ticketsLeft, setTicketsLeft] = useState(0);
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  useEffect(() => {
    const getRemainingTickets = async () => {
      setTicketsLeft(await remainingTickets(event.id));
    };
    if (event) getRemainingTickets();
  }, [event]);

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
    <Link href={`/events/${event.id}`}>
      <motion.div className="group relative rounded-xl overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.eventName}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {ticketsLeft <= 100 && ticketsLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg z-20"
            >
              <Ticket className="w-4 h-4 inline-block mr-1" />
              Only {ticketsLeft} left!
            </motion.div>
          )}

          {/* Quick Details Overlay */}
          <motion.div
            initial={false}
            className="absolute inset-0 flex flex-col justify-end p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/90">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">{formattedDate}</span>
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">{formattedTime}</span>
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{event.location}</span>
              </div>

              <div className="flex items-center gap-2 text-white/90">
                <Ticket className="h-4 w-4 text-primary" />
                <span className="text-sm">${event.ticketPrice} per ticket</span>
              </div>

              <p className="text-sm text-white/80 line-clamp-2 mt-1">
                {event.description}
              </p>
            </div>
          </motion.div>

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 left-4 z-20"
            >
              <ShareEventButtons
                event={event}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card Content - Always Visible */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">
            {event.eventName}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
