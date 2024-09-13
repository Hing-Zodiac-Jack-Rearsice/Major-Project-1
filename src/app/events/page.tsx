/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ClientEventCard } from "@/components/events/ClientEventCard";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [searchedEvents, setSearchedEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };
    fetchEvents();
  }, []);

  const requestSearchApi = async (query: string) => {
    try {
      const res = await fetch(`/api/events/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchedEvents(data.events || []);
      console.log(data.events);
    } catch (error) {
      console.error("Error searching events:", error);
      setSearchedEvents([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="mt-16 px-6 py-3">
      <div className="relative ml-auto flex-1 md:grow-0 mb-4 mt-2">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <h1 className="mb-6 text-xl font-bold">Events</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {eventsToDisplay.map((event: any) => (
          <ClientEventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default Page;
