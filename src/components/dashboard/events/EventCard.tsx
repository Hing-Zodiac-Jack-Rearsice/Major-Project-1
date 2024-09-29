import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Loader2, MapPin } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function EventCard({ event, requestRefresh, canDelete, onDelete }: any) {
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    await onDelete(event.id);
    requestRefresh();
  };
  // if (event.status === "pending") {
  //   return <p>Pending</p>;
  // }
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
          <CardTitle className="text-2xl font-bold">
            {event.eventName}
          </CardTitle>
        </CardHeader>
      </div>
      <CardContent className="mt-4 space-y-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(eventDate)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{`${formatTime(eventDate)} - ${formatTime(
            eventEndDate
          )}`}</span>
        </div>
        {event.location && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {canDelete === undefined ? (
          <Button disabled variant="outline">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </Button>
        ) : canDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Cancel</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your event and remove the data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go back</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="outline"
                className="cursor-not-allowed opacity-50"
              >
                Cancel
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p>This event has sold tickets and cannot be canceled.</p>
            </HoverCardContent>
          </HoverCard>
        )}
        <Link href={`/admin/dashboard/events/${event.id}`}>
          <Button>Manage</Button>
        </Link>
      </CardFooter>
      <div className="flex justify-between items-center mb-2">
        {event.status === "pending" && (
          <Badge variant="secondary">Pending Approval</Badge>
        )}
      </div>
    </Card>
  );
}
