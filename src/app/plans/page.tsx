"use client";

import React from "react";
import { useSession } from "next-auth/react";
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

export default function PricingPage() {
  const { data: session } = useSession();
  const paymentLink = "https://buy.stripe.com/test_8wM6r52FXemJg4EaEE";

  const features = [
    "Unlimited events",
    "Facilitate online ticket sales easily",
    "Deliver and generate QRCode tickets",
    "Analytics for event performance",
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 mt-16">
      <h1 className="text-4xl font-bold text-center">
        Simple pricing for powerful event management
      </h1>
      <p className="my-4 text-center text-muted-foreground">
        Get started with our comprehensive plan and streamline your ticket sales without limits. Use
        Sombot on your computer, tablet, and other devices.
      </p>

      <div className="mt-12 max-w-md mx-auto">
        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle>Sombot Pro</CardTitle>
            <CardDescription>Everything you need for successful events</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-4xl font-bold">Free for 7 days</div>
            <p className="text-muted-foreground">Then $9.99 per month after the trial period.</p>
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
              <a
                className="w-full"
                target="_blank"
                href={`${paymentLink}?prefilled_email=${session?.user?.email}`}
                rel="noopener noreferrer"
              >
                <Button className="w-full">Start Free Trial</Button>
              </a>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">Why choose Sombot?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle2 className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
