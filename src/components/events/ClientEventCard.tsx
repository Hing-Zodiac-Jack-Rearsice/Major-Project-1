"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export function ClientEventCard({ event }: any) {
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
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
    >
      <div className="relative h-48 w-full">
        <Image src={event.imageUrl} alt={event.eventName} layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-xl font-bold truncate">{event.eventName}</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {formattedTime} - {formattedEndTime}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">{event.location || "Location TBA"}</span>
        </div>
        <Link href={`/events/${event.id}`} className="block">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out">
            Learn More
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
