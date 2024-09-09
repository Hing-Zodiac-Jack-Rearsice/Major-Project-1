/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { ClientEventCard } from "@/components/events/ClientEventCard";
import React, { useEffect, useState } from "react";

const page = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events);
      console.log(data.events);
    };
    fetchEvents();
  }, []);
  return (
    <div className="mt-16 px-6 py-3">
      <h1 className="mb-6 text-xl font-bold">Events</h1>
      <div className="grid grid-cols-3 gap-4 ">
        {events &&
          events.map((event: any) => (
            <ClientEventCard key={event.id} event={event} />
          ))}
      </div>
    </div>
  );
};

export default page;
