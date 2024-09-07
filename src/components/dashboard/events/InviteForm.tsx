"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { faPlusSquare, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";

import { CreateStripeAccountLink, getStripeDashboardLink } from "@/app/actions";
import { auth } from "@/lib/auth";
import { useSession } from "next-auth/react";
const InviteForm = ({ eventId }: any) => {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  //   const fetchUserName = async () => {
  //     const res = await fetch(`/api/user/${userEmail}`);
  //     const data = await res.json();
  //     // console.log(data.userName);
  //     return data.userName;
  //   };
  const invAttendees = async () => {
    // const userName = await fetchUserName();
    const res = await fetch(`/api/events/mail/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail, userName: userName }),
    });
    if (res.status === 200) {
      alert(`Ticket sent to ${userEmail}`);
    } else {
      alert(`Failed to send ticket to ${userEmail}`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <span>Invite</span>
          <FontAwesomeIcon icon={faPlusSquare} className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-sm max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Attendees</DialogTitle>
          <DialogDescription>Enter user email to invite them.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-left">
            Email
          </Label>
          <Input
            id="name"
            value={userEmail}
            onChange={(e) => {
              setUserEmail(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-left">
            Attendee's name
          </Label>
          <Input
            id="name"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
        </div>
        <DialogFooter>
          <form action={invAttendees}>
            <Button type="submit">Generate ticket & mail</Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteForm;
