"use client";

import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/dashboard/events/EventCard";
import EventForm from "@/components/dashboard/events/EventForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Plus, Filter, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function AdminDashboard() {

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/category/${category}`);
      const data = await res.json();
      setEvents(data.data || []);
      filterEvents(data.data || [], searchTerm, category, timeFilter);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    const response = await fetch("/api/category");
    const data = await response.json();
    setCategories(data.categories);
  };

  useEffect(() => {
    getCategories();
    fetchEvents();
    console.log(categories);
  }, [category]);

  const filterEvents = (eventList: any, search: any, cat: any, time: any) => {
    let filtered = eventList;

    // Filter by search term
    if (search) {
      filtered = filtered.filter((event: any) =>
        event.eventName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category (if not 'all')
    if (cat !== "all") {
      filtered = filtered.filter((event: any) => event.categoryName === cat);
    }

    // Filter by time
    const now = new Date();
    if (time === "upcoming") {
      filtered = filtered.filter((event: any) => new Date(event.startDate) > now);
    } else if (time === "past") {
      filtered = filtered.filter((event: any) => new Date(event.startDate) <= now);
    }

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    filterEvents(events, searchTerm, category, timeFilter);
  }, [searchTerm, category, timeFilter, events]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
  };

  if (loading) return <LoadingSpinner />;

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen bg-background bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto p-6 sm:pl-20">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome, Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage your events and ticket sales efficiently.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Your Events</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Select onValueChange={handleCategoryChange} value={category}>
              <SelectTrigger className="w-full md:w-auto">
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
            <EventForm refreshCallback={fetchEvents}>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </EventForm>
=======
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="px-6">
          <div>
            <h1 className="font-medium text-xl">Hello there, Admin</h1>
            <p className="text-sm text-zinc-500">
              Ready to manage your ticket sales?
            </p>
          </div>
          <div className="flex items-center mt-5 gap-2">
            <h1 className="font-medium text-xl">Your Events</h1>
            <EventForm refreshCallback={() => fetchEvents()} />
          </div>
        </div>
        <div className="px-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 mt-5 sm:mt-0">
            {events &&
              events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
>>>>>>> Stashed changes
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={handleTimeFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <EventGrid events={filteredEvents} />
          </TabsContent>
          <TabsContent value="upcoming">
            <EventGrid events={filteredEvents} />
          </TabsContent>
          <TabsContent value="past">
            <EventGrid events={filteredEvents} />
          </TabsContent>
        </Tabs>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No events found</p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or add a new event.
              </p>
              <EventForm refreshCallback={fetchEvents}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Event
                </Button>
              </EventForm>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function EventGrid({ events }: { events: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
