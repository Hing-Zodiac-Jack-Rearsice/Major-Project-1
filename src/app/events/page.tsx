"use client";

import React, { useEffect, useState } from "react";
import { ClientEventCard } from "@/components/events/ClientEventCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar, Loader2, Ticket, Plus } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce"; // Import debounce

const Page = () => {
  const [events, setEvents] = useState<any>([]);
  const [searchedEvents, setSearchedEvents] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilNextEvent, setTimeUntilNextEvent] = useState("");

  const getCategories = async () => {
    const response = await fetch("/api/category");
    const data = await response.json();
    if (response.ok) {
      setCategories(data.categories);
    }
  };

  const filterUpcomingEvents = (events: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event: any) => new Date(event.startDate) >= today);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/category/${category}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data || []);
      } else {
        console.error("Error fetching events:", await res.text());
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
    fetchEvents();
  }, [category]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextEvent = events.find((event: any) => new Date(event.startDate) > now);
      if (nextEvent) {
        const timeDiff = new Date(nextEvent.startDate).getTime() - now.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        setTimeUntilNextEvent(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNextEvent("No upcoming events");
      }
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => clearInterval(countdownInterval);
  }, [events]);

  // Debounced search function
  const requestSearchApi = debounce(async (query: string) => {
    try {
      const res = await fetch(
        `/api/events/category/${category}/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setSearchedEvents(data.data || []);
    } catch (error) {
      console.error("Error searching events:", error);
      setSearchedEvents([]);
    }
  }, 300); // Adjust the debounce delay as needed

  const handleSearch = (e: any) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim() !== "") {
      requestSearchApi(val); // Call the debounced search function
    } else {
      setSearchedEvents([]);
    }
  };

  const eventsToDisplay =
    search === "" ? filterUpcomingEvents(events) : filterUpcomingEvents(searchedEvents);

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="relative h-96 overflow-hidden">
        <video autoPlay loop muted className="absolute w-full h-full object-cover">
          <source src="/videos/trailer-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-4"
          >
            Discover Amazing Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl mb-8"
          >
            Find and join exciting experiences
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-3xl font-bold"
          >
            Next event in: {timeUntilNextEvent}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-center mb-12 gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-10 pr-4 py-3 w-full rounded-full shadow-md focus:ring-2 focus:ring-primary"
              value={search}
              onChange={handleSearch}
            />
          </div>

          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="w-full md:w-auto rounded-full shadow-md">
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

        {loading ? (
          <div className="text-center py-12 flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : eventsToDisplay.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {eventsToDisplay.map((event: any, index: any) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ClientEventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-lg shadow-lg bg-background"
          >
            <Calendar className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-3xl font-semibold mb-3">No events found</h2>
            <p className="text-lg text-muted-foreground">
              Try adjusting your search or category selection
            </p>
          </motion.div>
        )}
      </div>

      <motion.div
        className="fixed bottom-8 right-8"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* {session?.user?.role === "admin" && (
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg"
            onClick={() => alert("Create new event")}
          >
            <Plus className="w-8 h-8" />
          </Button>
        )} */}
      </motion.div>
    </div>
  );
};

export default Page;
