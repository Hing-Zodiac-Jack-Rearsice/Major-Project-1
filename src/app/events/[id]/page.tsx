"use client";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BuyButton from "@/components/events/BuyButton";

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session } = useSession();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [event, setEvent] = useState<any>(null);
  //   const [qrCodeUrl, setQrCodeUrl] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { id } = useParams();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      //   console.log(data.event);
      setEvent(data.event);
    };
    fetchEvent();
  }, []);

  if (!event) return <div className="pl-14">Loading...</div>;
  // Create a Date object from the event.date string
  const eventDate = new Date(event.date);

  // Format the date
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // If you want to separate the time as well, you can do that here
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    event && (
      <div className="">
        <img src={event.imageUrl} alt="" className="w-full h-96 object-cover" />
        <div className="px-6">
          <div>
            {/* this can be used for events details on client side*/}
            {/* <h1 className="text-2xl">Event details</h1> */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold my-4 sm:text-4xl">{event.eventName}</h1>
              <div className="items-center gap-2 sm:flex">
                <p className="underline-offset-4 bg-yellow-300 p-2 rounded-sm dark:text-black font-bold text-nowrap">
                  working client
                </p>
                <Button className="font-bold">Update</Button>
              </div>
            </div>
            <div className="gap-10 items-center sm:flex">
              <div className="my-2 sm:my-0">
                <h1 className="text-xl font-semibold">Date and Time</h1>
                <p>
                  {formattedDate} - {formattedTime}
                </p>
              </div>
              <div className="my-2 sm:my-0">
                <h1 className="text-xl font-semibold">Location</h1>
                <p>{event.location}</p>
              </div>
              {session?.user.role === "admin" ? (
                <Button>{event.ticketPrice} $ (admin)</Button>
              ) : (
                <BuyButton
                  eventId={event.id}
                  ticketPrice={event.ticketPrice}
                  userEmail={session?.user.email}
                />
              )}
            </div>
            <div className="my-4">
              <h1 className="text-xl font-semibold">Event Description</h1>
              <p>{event.description}</p>
              {/* <p onClick={() => addUserToAttendace()}>ADD USER TO ATTENDANCE</p> */}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default page;
