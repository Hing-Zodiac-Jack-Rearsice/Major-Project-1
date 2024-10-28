"use client";

import React from "react";
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
import { Wallet } from "lucide-react";
import { CreateStripeAccountLink, getStripeDashboardLink } from "@/app/actions";
import { useSession } from "next-auth/react";

export default function Billing() {
  const { data: session } = useSession();
  const stripeConnectedLinked = session?.user?.stripeConnectedLinked;
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`pl-3 sm:px-2 sm:py-4 ${open ? "bg-accent text-accent-foreground" : ""}`}
        >
          <Wallet className={`w-5 h-5 ${open ? "fill-current" : ""}`} />
          <span className="sr-only">Billing</span>
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
}
