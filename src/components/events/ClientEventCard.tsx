"use client";

import Image from "next/image";
import React from "react";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import Link from "next/link";

export function ClientEventCard({ event }: any) {
  const eventDate = new Date(event.date);

  // Format the date
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // If you want to separate the time as well, you can do that here
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto  h-auto rounded p-6 border  ">
        <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white">
          {event.eventName}
        </CardItem>

        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src={event.imageUrl}
            className="h-60 w-full object-cover rounded group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-4 dark:text-neutral-300 w-full justify-between flex "
        >
          <p> {formattedDate}</p>
          <p> {formattedTime}</p>
        </CardItem>
        <div className="flex justify-between items-center mt-5">
          <Link href={`/events/${event.id}`} className="w-full">
            <CardItem
              translateZ={20}
              as="button"
              className="w-full px-4 py-2 rounded bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
            >
              Learn more
            </CardItem>
          </Link>
        </div>
      </CardBody>
    </CardContainer>
  );
}
