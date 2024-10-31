/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, MapPin, Ticket } from "lucide-react";
import { set } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const EventTicketsPage = () => {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [category, setCategory] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const getCategories = async () => {
    const response = await fetch("/api/category");
    const data = await response.json();
    setCategories(data.categories);
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/tickets");
        const data = await res.json();
        setTickets(data.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
    getCategories();
  }, []);

  const filteredTickets =
    category === "all"
      ? tickets
      : tickets.filter((ticket: any) => ticket.event.categoryName === category);

  if (session?.user.role === "admin")
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
          Event organizers cannot purchase tickets.
        </p>
      </div>
    );
  if (session?.user.role === "super_admin")
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
          Super admins cannot purchase tickets.
        </p>
      </div>
    );
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
  };

  const handleDialogClose = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="container mx-auto mt-20 mb-10 px-4">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Ticket className="mr-2 h-6 w-6" />
          My Tickets
        </h1>
        <Select onValueChange={setCategory} value={category}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.category}>
                  {cat.category.charAt(0).toUpperCase() + cat.category.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.map((ticket: any) => (
            <Card
              key={ticket.id}
              className="overflow-hidden transition-shadow hover:shadow-lg hover:cursor-pointer"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardHeader className="p-0">
                <img
                  src={ticket.event.imageUrl}
                  alt={ticket.eventName}
                  className="h-48 w-full object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 text-xl">{ticket.eventName}</CardTitle>
                <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(ticket.event.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="mr-2 h-4 w-4" />
                  {new Date(ticket.event.startDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(ticket.event.endDate).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="mr-2 h-4 w-4" />
                  {ticket.event.location || "Location TBA"}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4">
                <Badge variant="secondary">{ticket.event.categoryName}</Badge>
                <img src={ticket.qrCodeUrl} alt="QR Code" className="h-12 w-12" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8 p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <Ticket className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tickets found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              It looks like you don't have any tickets yet. Check out our upcoming events and grab
              your tickets!
            </p>
          </div>
        </Card>
      )}

      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <span className="sr-only">Open ticket details</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[90vw] md:max-w-[500px] lg:max-w-[700px]">
            <div className="flex flex-col items-center justify-center">
              <img
                src={selectedTicket.qrCodeUrl}
                alt="QR Code"
                className="w-full max-w-[400px] h-auto mb-6"
              />
              <h2 className="text-2xl font-bold text-center">{selectedTicket.eventName}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Scan this QR code at the event entrance
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EventTicketsPage;
