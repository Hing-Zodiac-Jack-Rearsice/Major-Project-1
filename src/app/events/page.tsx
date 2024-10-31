"use client";

import React, { useEffect, useState, useRef } from "react";
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
import {
  Search,
  Calendar,
  Loader2,
  Ticket,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Timer,
  MapPin,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce"; // Import debounce
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CustomCursor } from "@/components/ui/CustomCursor";

import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [events, setEvents] = useState<any>([]);
  const [searchedEvents, setSearchedEvents] = useState<any>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilNextEvent, setTimeUntilNextEvent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12; // Changed from 9 to 12 events per page
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const isInView = useInView(carouselRef);

  const getCategories = async () => {
    try {
      const response = await fetch("/api/category");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Add console.log to debug the response
      console.log("Categories response:", data);

      // Make sure we're setting the correct data structure
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        console.error("Unexpected categories data structure:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
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
      // Sort events by start date and find the nearest upcoming event
      const upcomingEvents = events
        .filter((event: any) => new Date(event.startDate) > now)
        .sort(
          (a: any, b: any) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

      const nextEvent = upcomingEvents[0]; // Get the nearest event

      if (nextEvent) {
        const timeDiff =
          new Date(nextEvent.startDate).getTime() - now.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
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
        `/api/events/category/${category}/search?query=${encodeURIComponent(
          query
        )}`
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
    search === ""
      ? filterUpcomingEvents(events)
      : filterUpcomingEvents(searchedEvents);

  // Calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = eventsToDisplay.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(eventsToDisplay.length / eventsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add this component for pagination controls
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            onClick={() => paginate(number)}
            className="w-8 h-8"
          >
            {number}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Update the category change handler
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // Add new function to get nearest upcoming event
  const getNearestUpcomingEvent = () => {
    const now = new Date();
    return events
      .filter((event: any) => new Date(event.startDate) > now)
      .sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )[0];
  };

  // Update the getRecommendedEvents function to get 5 nearest events
  const getRecommendedEvents = () => {
    const now = new Date();
    return events
      .filter((event: any) => new Date(event.startDate) > now)
      .sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, 5);
  };

  // Add auto-rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev < getRecommendedEvents().length - 1 ? prev + 1 : 0
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [currentSlide]);

  const CarouselSkeleton = () => {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background/80 to-background shadow-2xl border border-white/10">
          <div className="grid md:grid-cols-[1.3fr,1fr] gap-8 p-8">
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="space-y-6">
              <div>
                <Skeleton className="h-10 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new component near the CarouselSkeleton component
  const NextEventCountdownSkeleton = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white/10 backdrop-blur-none rounded-xl p-6 mt-1 w-full max-w-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-primary" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <motion.div className="mt-4 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-b from-background to-secondary/10 events-listing-page">
      {/* Hero Section with Video Background */}
      <div className="relative h-[500px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute w-full h-full object-cover"
        >
          <source src="/videos/trailer-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-6xl font-bold mb-4 text-center"
          >
            Discover Amazing Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl mb-8 text-center max-w-2xl"
          >
            Find and join exciting experiences in your area
          </motion.p>

          {/* Next Event Countdown Section */}
          {loading ? (
            <NextEventCountdownSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-none rounded-xl p-6 mt-1 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">
                    Next Event Starting In:
                  </h3>
                </div>
                <div className="text-3xl font-bold font-mono">
                  {timeUntilNextEvent}
                </div>
              </div>

              {/* Quick Access to Nearest Event */}
              {getNearestUpcomingEvent() && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 p-4 bg-white/5 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold">
                      {getNearestUpcomingEvent()?.eventName}
                    </h4>
                    <p className="text-sm opacity-80">
                      {new Date(
                        getNearestUpcomingEvent()?.startDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/events/${getNearestUpcomingEvent()?.id}`}>
                    <Button variant="secondary" className="gap-2">
                      Check it out <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Search and Filter Section - Updated styling */}
        <div className="container mx-auto px-6 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
          >
            <div className="relative w-full md:w-2/3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-12 pr-4 py-6 w-full rounded-xl shadow-sm focus:ring-2 focus:ring-primary/50 bg-background/50 backdrop-blur-sm text-lg"
                  value={search}
                  onChange={handleSearch}
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <Select
                onValueChange={handleCategoryChange}
                value={category}
                disabled={loading}
              >
                <SelectTrigger className="w-full md:w-[240px] rounded-xl py-6 shadow-sm bg-background/50 backdrop-blur-sm">
                  {loading ? (
                    <Skeleton className="h-6 w-[180px]" />
                  ) : (
                    <SelectValue
                      placeholder="Select a category"
                      className="text-lg"
                    />
                  )}
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all" className="text-base">
                      All Categories
                    </SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem
                        key={cat.id || cat._id}
                        value={cat.category || cat.name || cat}
                        className="text-base"
                      >
                        {(cat.category || cat.name || cat)
                          .charAt(0)
                          .toUpperCase() +
                          (cat.category || cat.name || cat)
                            .slice(1)
                            .toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>

        {/* Happening Soon Carousel Section */}
        {loading ? (
          <CarouselSkeleton />
        ) : getRecommendedEvents().length > 0 ? (
          <div className="mb-12" ref={carouselRef}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Timer className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Happening Soon</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev > 0 ? prev - 1 : getRecommendedEvents().length - 1
                    )
                  }
                  className="rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev < getRecommendedEvents().length - 1 ? prev + 1 : 0
                    )
                  }
                  className="rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background/80 to-background shadow-2xl border border-white/10">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: {
                      duration: 0.3,
                    },
                  }}
                  className="relative w-full"
                >
                  {getRecommendedEvents()
                    .slice(currentSlide, currentSlide + 1)
                    .map((event: any) => (
                      <motion.div
                        key={event.id}
                        className="relative group"
                        whileHover={{ scale: 1.002 }}
                      >
                        <div className="grid md:grid-cols-[1.3fr,1fr] gap-8 p-8">
                          {/* Enhanced image container */}
                          <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl group">
                            {/* Reflective top edge */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />

                            <motion.div
                              className="relative w-full h-full"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.4 }}
                            >
                              <img
                                src={event.imageUrl}
                                alt={event.eventName}
                                className="w-full h-full object-cover"
                              />

                              {/* Hover Details Overlay */}
                              <motion.div
                                initial={false}
                                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6"
                              >
                                <div className="space-y-3">
                                  <h4 className="text-xl font-bold text-white">
                                    Quick Details
                                  </h4>

                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-white/90">
                                      <Calendar className="h-4 w-4 text-primary" />
                                      <span className="text-sm">
                                        {new Date(
                                          event.startDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-white/90">
                                      <Timer className="h-4 w-4 text-primary" />
                                      <span className="text-sm">
                                        {new Date(
                                          event.startDate
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-white/90">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span className="text-sm">
                                        {event.location}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-white/90">
                                      <Ticket className="h-4 w-4 text-primary" />
                                      <span className="text-sm">
                                        ${event.ticketPrice} per ticket
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-sm text-white/80 line-clamp-2 mt-2">
                                    {event.description}
                                  </p>
                                </div>
                              </motion.div>
                            </motion.div>

                            {/* Reflective bottom edge */}
                            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
                          </div>

                          <div className="flex flex-col justify-between py-4">
                            <div className="space-y-6">
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                                  {event.eventName}
                                </h3>
                                <p className="text-muted-foreground line-clamp-3">
                                  {event.description}
                                </p>
                              </motion.div>

                              <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                {/* Event details (date, time, location) */}
                                <motion.div
                                  className="flex items-center gap-3 bg-white/5 p-3 rounded-lg backdrop-blur-sm"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <Calendar className="h-5 w-5 text-primary" />
                                  <span>
                                    {new Date(
                                      event.startDate
                                    ).toLocaleDateString(undefined, {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </motion.div>

                                <motion.div
                                  className="flex items-center gap-3 bg-white/5 p-3 rounded-lg backdrop-blur-sm"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <Timer className="h-5 w-5 text-primary" />
                                  <span>
                                    {new Date(
                                      event.startDate
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </motion.div>

                                <motion.div
                                  className="flex items-center gap-3 bg-white/5 p-3 rounded-lg backdrop-blur-sm"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.6 }}
                                >
                                  <MapPin className="h-5 w-5 text-primary" />
                                  <span>{event.location}</span>
                                </motion.div>
                              </motion.div>
                            </div>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.7 }}
                              className="mt-6"
                            >
                              <Link href={`/events/${event.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button className="w-full gap-2 h-12 text-lg shadow-lg hover:shadow-primary/20 transition-all duration-300">
                                    View Event Details
                                    <ArrowRight className="h-5 w-5" />
                                  </Button>
                                </motion.div>
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              </AnimatePresence>

              {/* Updated Carousel Indicators - More visible and interactive */}
              <div className="flex justify-center gap-3 pb-6">
                {getRecommendedEvents().map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`relative h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-12 bg-primary"
                        : "w-3 bg-primary/50 hover:bg-primary/70"
                    }`}
                  >
                    {/* Active indicator glow effect */}
                    {currentSlide === index && (
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md -z-10" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Add a fallback message when no upcoming events are available
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12 text-center p-8 bg-card rounded-xl"
          >
            <Timer className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Upcoming Events</h3>
            <p className="text-muted-foreground">
              Check back later for new events
            </p>
          </motion.div>
        )}

        {/* Main Events Grid - Updated layout */}
        {loading ? (
          <div className="text-center py-12 flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : eventsToDisplay.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">All Events</h2>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
            >
              {currentEvents.map((event: any, index: any) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="transform transition-all hover:scale-[1.02] event-card-hover relative group"
                >
                  <ClientEventCard event={event} />
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group-hover:block hidden"
                    >
                      <CustomCursor />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
            <PaginationControls />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-lg shadow-lg bg-card"
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
