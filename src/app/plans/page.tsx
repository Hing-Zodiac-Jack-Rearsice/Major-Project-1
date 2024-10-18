"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingPage() {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false); // State for login prompt dialog
  const paymentLink = "https://buy.stripe.com/test_8wM6r52FXemJg4EaEE";

  const features = [
    "Unlimited events",
    "Facilitate online ticket sales easily",
    "Deliver and generate QRCode tickets",
    "Analytics for event performance",
  ];

  const termsAndConditionsSections = [
    {
      title: "Introduction",
      content:
        "Sombot operates as an intermediary platform facilitating the sale and purchase of event tickets. Our role is limited to providing a platform for users to interact and transact. We do not hold any responsibility for the actual events or the transactions between users and event organizers.",
    },
    // Other sections...
  ];

  const handleStartFreeTrial = () => {
    if (!session) {
      setIsLoginPromptOpen(true); // Open the login prompt dialog
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleAcceptTerms = () => {
    setIsDialogOpen(false);
    window.open(
      `${paymentLink}?prefilled_email=${session?.user?.email}`,
      "_blank"
    );
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 mt-16">
      <h1 className="text-4xl font-bold text-center">
        Simple pricing for powerful ticket management
      </h1>
      <p className="my-4 text-center text-muted-foreground">
        Get started with our comprehensive plan and streamline your ticket sales
        without limits. Use Sombot on your computer, tablet, and other devices.
      </p>

      <div className="mt-12 max-w-md mx-auto">
        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle>Sombot Pro</CardTitle>
            <CardDescription>
              Everything you need for successful events
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-4xl font-bold">Free for 30 days</div>
            <p className="text-muted-foreground">
              Then $9.99 per month after the trial period.
            </p>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {session?.user.role === "admin" ? (
              <Button className="w-full">Subscribed</Button>
            ) : (
              <Button className="w-full" onClick={handleStartFreeTrial}>
                Start Free Trial
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">
          Why choose Sombot?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle2 className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please read and accept our terms and conditions before starting
              your free trial.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow h-screen">
            <div className="pr-4 overflow-y-auto">
              <Accordion type="single" collapsible className="w-full">
                {termsAndConditionsSections.map((section, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg text-left font-semibold">
                      {`${index + 1}. ${section.title}`}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{section.content}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleAcceptTerms}>
              Accept and Start Free Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Prompt Dialog */}
      <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to start your free trial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setIsLoginPromptOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={signIn}>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
