"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { EventCard } from "@/components/dashboard/events/EventCard";
import EventForm from "@/components/dashboard/events/EventForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Plus, Bell } from "lucide-react"; // Import Bell icon
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkForDelete } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<any>("all");
  const [categories, setCategories] = useState<any>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [deletionStatus, setDeletionStatus] = useState({});
  const { data: session } = useSession();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0); // State for unread notifications count
  const router = useRouter(); // Initialize router

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/category/${category}?includeAll=true`);
      const data = await res.json();
      setEvents(data.data || []);
      checkDeletionStatus(data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const fetchUnreadNotificationsCount = useCallback(async () => {
    const res = await fetch("/api/events/notifications");
    if (res.ok) {
      const data = await res.json();
      const unreadCount = data.notifications.filter(
        (notification: { read: any }) => !notification.read
      ).length;
      setUnreadNotificationsCount(unreadCount);
    }
  }, []);

  const debouncedFetchEvents = useMemo(() => debounce(fetchEvents, 500), [fetchEvents]);

  const getCategories = useCallback(async () => {
    const response = await fetch("/api/category");
    if (response.ok) {
      const data = await response.json();
      setCategories(data.categories);
    }
  }, []);

  useEffect(() => {
    getCategories();
    fetchUnreadNotificationsCount(); // Fetch unread notifications count on mount
  }, [getCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedFetchEvents();
    }, 300);

    return () => {
      clearTimeout(timer);
      debouncedFetchEvents.cancel();
    };
  }, [category, debouncedFetchEvents]);

  const checkDeletionStatus = useCallback(async (eventList: any) => {
    const statusPromises = eventList.map(async (event: any) => {
      const result = await checkForDelete(event.id);
      return { [event.id]: result };
    });

    const statusResults = await Promise.all(statusPromises);
    const newDeletionStatus = Object.assign({}, ...statusResults);
    setDeletionStatus(newDeletionStatus);
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event: any) => {
      const isAdminEvent = event.userEmail === session?.user?.email;
      const matchesSearch =
        searchTerm === "" || event.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || event.categoryName === category;
      const eventDate = new Date(event.startDate);
      const matchesTimeFilter =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && eventDate > now) ||
        (timeFilter === "past" && eventDate <= now) ||
        (timeFilter === "pending" && event.status === "pending");

      return isAdminEvent && matchesSearch && matchesCategory && matchesTimeFilter;
    });
  }, [events, searchTerm, category, timeFilter, session]);

  const handleSearch = useCallback((e: any) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((value: any) => {
    setCategory(value);
  }, []);

  const handleTimeFilterChange = useCallback((value: any) => {
    setTimeFilter(value);
  }, []);

  const handleDelete = useCallback(
    async (eventId: any) => {
      try {
        const deleteFetch = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        });
        if (deleteFetch.status === 200) {
          fetchEvents();
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    },
    [fetchEvents]
  );

  const handleNotificationsClick = () => {
    router.push("/admin/dashboard/notifications"); // Navigate to notifications page
  };

  const memoizedEventGrid = useMemo(
    () => (
      <EventGrid
        events={filteredEvents}
        deletionStatus={deletionStatus}
        onDelete={handleDelete}
        callBack={fetchEvents}
      />
    ),
    [filteredEvents, deletionStatus, handleDelete, fetchEvents]
  );

  return (
    <div className="min-h-screen bg-background bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto p-6 sm:pl-20">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome, {session?.user?.name}</CardTitle>
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
            <EventForm refreshCallback={fetchEvents} initialStatus="pending">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Event
              </Button>
            </EventForm>
            <Button onClick={handleNotificationsClick} className="relative">
              <Bell className="h-6 w-6" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={handleTimeFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{loading ? <LoadingSpinner /> : memoizedEventGrid}</TabsContent>
          <TabsContent value="upcoming">
            {loading ? <LoadingSpinner /> : memoizedEventGrid}
          </TabsContent>
          <TabsContent value="past">{loading ? <LoadingSpinner /> : memoizedEventGrid}</TabsContent>
          <TabsContent value="pending">
            {loading ? <LoadingSpinner /> : memoizedEventGrid}
          </TabsContent>
        </Tabs>

        {filteredEvents.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No events found</p>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or add a new event.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const EventGrid = React.memo(({ events, deletionStatus, onDelete, callBack }: any) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {events.map((event: any) => (
        <EventCard
          key={event.id}
          event={event}
          canDelete={deletionStatus[event.id]}
          onDelete={onDelete}
          requestRefresh={callBack}
        />
      ))}
    </div>
  );
});

EventGrid.displayName = "EventGrid";
