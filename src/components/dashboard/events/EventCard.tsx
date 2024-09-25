import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export function EventCard({ event }: any) {
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  const formatDate = (date: any) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: any) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover transition-all duration-300 hover:scale-105"
          src={event.imageUrl}
          alt={event.eventName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <CardHeader className="absolute bottom-0 left-0 right-0 text-white">
          <CardTitle className="text-2xl font-bold">{event.eventName}</CardTitle>
        </CardHeader>
      </div>
      <CardContent className="mt-4 space-y-2">
        <div className="flex items-center space-x-2 text-sm dark:text-gray-400 light:text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(eventDate)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm dark:text-gray-400 light:text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{`${formatTime(eventDate)} - ${formatTime(eventEndDate)}`}</span>
        </div>
        {event.location && (
          <div className="flex items-center space-x-2 text-sm dark:text-gray-400 light:text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="hover:bg-red-100 hover:text-red-600">
          Cancel
        </Button>
        <Link href={`/admin/dashboard/events/${event.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Manage</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
