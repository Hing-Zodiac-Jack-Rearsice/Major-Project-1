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
import { Search, Calendar } from "lucide-react";

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
    setCategories(data.categories);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/category/${category}`);
      const data = await res.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
    setSearch("");
    setSearchedEvents([]);
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

  const eventsToDisplay = search === "" ? events : searchedEvents;

  return (
    <div className="min-h-screen bg-background mt-16">
      <div className="container mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
          <p className="text-muted-foreground">Find and join exciting events</p>
        </header>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-full rounded-full"
              value={search}
              onChange={handleSearch}
            />
          </div>

          <Select onValueChange={setCategory} value={category}>
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner"></div>
            <p className="mt-4 text-muted-foreground">Loading events...</p>
          </div>
        ) : eventsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {eventsToDisplay.map((event: any) => (
              <ClientEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No events found</h2>
            <p className="text-muted-foreground">Try adjusting your search or category selection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
