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

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";

import { CreateStripeAccountLink, getStripeDashboardLink } from "@/app/actions";
import { auth } from "@/lib/auth";
import { useSession } from "next-auth/react";

const Billing = () => {
  const { data: session } = useSession();
  const stripeConnectedLinked = session?.user?.stripeConnectedLinked;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="pl-3 sm:px-2 sm:py-4">
          <FontAwesomeIcon icon={faWallet} className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-sm max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Billing details</DialogTitle>
          <DialogDescription>Find all your billing details below.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {stripeConnectedLinked === false ? (
            <form action={CreateStripeAccountLink}>
              <Button type="submit" className="w-full">
                Link your account to stripe
              </Button>
            </form>
          ) : (
            <form action={getStripeDashboardLink}>
              <Button type="submit" className="w-full">
                View Stripe Connect Dashboard
              </Button>
            </form>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Billing;
