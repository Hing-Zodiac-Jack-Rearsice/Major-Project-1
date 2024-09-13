"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import BuyButton from "@/components/events/BuyButton";
import { CalendarDays, Clock, MapPin } from "lucide-react";

const EventPage = () => {
  const { data: session } = useSession();
  const [event, setEvent] = useState<any>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      setEvent(data.event);
    };
    fetchEvent();
  }, [id]);

  if (!event) return <div className="flex justify-center items-center h-screen">Loading...</div>;

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
    <div className="w-full mx-auto">
      <img src={event.imageUrl} alt={event.eventName} className="w-full h-64 object-cover" />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">{event.eventName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-gray-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span>
                {formattedStartTime} to {formattedEndTime}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span>{event.location}</span>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <p className="text-gray-600">{event.description}</p>
            <div className="mt-4">
              {session?.user.role === "admin" ? (
                <Button className="w-full">{event.ticketPrice} $ (admin)</Button>
              ) : (
                <BuyButton
                  eventId={event.id}
                  ticketPrice={event.ticketPrice}
                  userEmail={session?.user.email}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
