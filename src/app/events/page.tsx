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
import { Search, Calendar, Loader2, Ticket } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";

const Page = () => {
  const [events, setEvents] = useState<any>([]);
  const [searchedEvents, setSearchedEvents] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<any>([]);
  const [loading, setLoading] = useState(true);

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
    const intervalId = setInterval(() => {
      fetchEvents();
    }, 30000); // Fetch events every 30 seconds

    return () => clearInterval(intervalId);
  }, [category]);

  const requestSearchApi = async (query: any) => {
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
  };

  const handleSearch = (e: any) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim() !== "") {
      requestSearchApi(val);
    } else {
      setSearchedEvents([]);
    }
  };

  const eventsToDisplay =
    search === "" ? filterUpcomingEvents(events) : filterUpcomingEvents(searchedEvents);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 pt-24">
      <div className="container mx-auto px-6 py-8">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-3">Discover Amazing Events</h1>
          <p className="text-xl text-muted-foreground">Find and join exciting experiences</p>
        </motion.header>

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
            className="text-center py-16 rounded-lg shadow-lg"
          >
            <Calendar className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-3xl font-semibold mb-3">No events found</h2>
            <p className="text-lg text-muted-foreground">
              Try adjusting your search or category selection
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Page;
