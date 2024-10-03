import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { remainingTickets } from "@/app/actions";

export function ClientEventCard({ event }: any) {
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);
  const [ticketsLeft, setTicketsLeft] = useState(0);

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
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
    >
      <div className="relative h-56 w-full">
        <Image
          src={event.imageUrl}
          alt={event.eventName}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        {ticketsLeft <= 100 && ticketsLeft > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
            <Ticket className="w-4 h-4 inline-block mr-1" />
            Only {ticketsLeft} left!
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-2xl font-bold truncate mb-2">
            {event.eventName}
          </h3>
          <div className="flex items-center text-white text-sm mb-1">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-white text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {formattedTime} - {formattedEndTime}
            </span>
          </div>
          <div className="flex items-center text-white text-sm">
            <span className="font-bold">Price: ${event.ticketPrice}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{event.location || "Location TBA"}</span>
        </div>
        <Link href={`/events/${event.id}`} className="block">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
            Learn More
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
