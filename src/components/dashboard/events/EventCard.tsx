import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import Link from "next/link";
import { checkForDelete } from "@/app/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export function EventCard({ event, requestRefresh }: any) {
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);
  const [canDelete, setCanDelete] = useState<any>(false);
  const [loading, setLoading] = useState(false);
  const formatDate = (date: any) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  useEffect(() => {
    const checkDeletion = async () => {
      const result = await checkForDelete(event.id);
      setCanDelete(result);
    };
    checkDeletion();
  }, [event.id]);
  const formatTime = (date: any) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleDelete = async () => {
    setLoading(true);
    try {
      const deleteFetch = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });
      if (deleteFetch.status === 200) {
        requestRefresh();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
        {canDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Cancel</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your event and remove
                  the data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go back</AlertDialogCancel>
                <AlertDialogAction className="bg-blue-600 text-white" onClick={handleDelete}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button disabled variant="default">
            Disabled
          </Button>
        )}
        <Link href={`/admin/dashboard/events/${event.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Manage</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
