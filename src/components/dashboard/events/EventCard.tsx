import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function EventCard({ event }: any) {
  // Create a Date object from the event.date string
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

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
  // If you want to separate the time as well, you can do that here
  const formattedEndTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{event.eventName}</CardTitle>
        {/* <CardDescription>{event.location}</CardDescription> */}
        {/* Display the formatted date and time */}
        <CardDescription className="flex justify-between">
          <p> {formattedDate}</p>
          <p>
            {formattedTime} - {formattedEndTime}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <img
          className="rounded-md h-[250px] object-cover w-full"
          src={event.imageUrl}
          alt="event image"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Link href={`/admin/dashboard/events/${event.id}`}>
          <Button>Manage</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
