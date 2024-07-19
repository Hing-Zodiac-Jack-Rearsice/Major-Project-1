import React from "react";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/QHqMqwhICOk
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Component() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 mt-16">
      <h1 className="text-4xl font-bold text-center">Affordable plans for any situation</h1>
      <p className="my-4 text-center">
        Choose a plan and effortlessly streamline your ticket sales without limits. Use Sombot on
        your computer, tablet, and other devices. Enjoy flexible payment options and the freedom to
        cancel anytime.
      </p>
      <div className="flex-row items-center my-12 gap-10 justify-center sm:flex">
        <h1 className="text-3xl font-bold my-4">All plans include</h1>
        <div className="flex flex-col items-start max-w-md">
          <p className="flex items-center mb-2">
            <CheckIcon className="mr-2 block h-4 w-4" />
            Unlimited events
          </p>
          <p className="flex items-center mb-2">
            <CheckIcon className="mr-2 block h-4 w-4" />
            Facilitate online ticket sales easily
          </p>
          <p className="flex items-center mb-2">
            <CheckIcon className="mr-2 block h-4 w-4" />
            Deliver and generate QRCode tickets
          </p>
          <p className="flex items-center">
            <CheckIcon className="mr-2 block h-4 w-4" />
            Analytics for event performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Get started for free</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-4xl font-bold">Free for 7 days</div>
            <p className="text-muted-foreground">Free for 7 days, then $9.99 per month after.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Try now</Button>
          </CardFooter>
        </Card>
        <Card className="bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle>Paid Plan</CardTitle>
            <CardDescription>After trying us out</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-4xl font-bold">9.99$ / month</div>
            <p className="text-muted-foreground">Once you've used Sombot, you can't go back!</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Subscribe</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
function CheckIcon(props) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
