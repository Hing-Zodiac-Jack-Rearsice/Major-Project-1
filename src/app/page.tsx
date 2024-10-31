"use client";

import React, { useEffect, useRef } from "react";
import Services from "@/components/Services";
import { Vortex } from "@/components/ui/vortex";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CreditCard, Lock, Zap, BarChart2, QrCode, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const messageShown = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (message && !messageShown.current) {
      // Show the toast only if it hasn't been shown yet
      toast({
        title: "Notification",
        description: message,
        duration: 5000,
      });
      messageShown.current = true;

      // Remove the message from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("message");
      window.history.replaceState({}, "", newUrl);
    }
  }, [message, toast]);

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white">
      {session?.user.role === "admin" ? (
        <div className="w-full mx-auto h-screen overflow-hidden mt-14">
          <Vortex
            backgroundColor="transparent"
            rangeY={500}
            particleCount={350}
            baseHue={150}
            className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full z-0 [&>canvas]:opacity-30 dark:[&>canvas]:opacity-100"
          >
            <h2 className="text-2xl md:text-6xl font-bold text-center">
              The Only Ticketing System You&apos;ll Ever Need
            </h2>
            <p className="text-sm md:text-2xl max-w-xl mt-6 text-center">
              Sombot enables you to streamline your ticket sales and enhance your customer
              experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <Link href="/plans">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition duration-200 rounded-lg shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
                  View events
                </button>
              </Link>
              <Link href="/plans">
                <button className="px-4 py-2 border border-current rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200">
                  Learn more
                </button>
              </Link>
            </div>
          </Vortex>
        </div>
      ) : (
        <div className="w-full mx-auto h-screen overflow-hidden mt-14">
          <Vortex
            backgroundColor="transparent"
            rangeY={500}
            particleCount={350}
            baseHue={150}
            className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full z-0 [&>canvas]:opacity-30 dark:[&>canvas]:opacity-100"
          >
            <h2 className="text-2xl md:text-6xl font-bold text-center">
              Looking to purchase tickets?
            </h2>
            <p className="text-sm md:text-2xl max-w-xl mt-6 text-center">
              Find events and experiences that fit your desires
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <Link href="/events">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition duration-200 rounded-lg shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
                  Browse events
                </button>
              </Link>
              <Link href="/plans">
                <button className="px-4 py-2 border border-current rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200">
                  Looking to sell tickets instead?
                </button>
              </Link>
            </div>
          </Vortex>
        </div>
      )}
      <Services />
      <section className="py-16 bg-gray-100 dark:bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Sombot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
                <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your ticket sales in real-time with comprehensive analytics, helping you
                make data-driven decisions for your events.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full mb-4">
                <QrCode className="w-6 h-6 text-teal-600 dark:text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">QR Code Tickets</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate secure QR code tickets instantly, making entry management smooth and
                efficient for both organizers and attendees.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
                <Mail className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tickets are automatically emailed to purchasers immediately after checkout, ensuring
                a hassle-free experience for your customers.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Seamless Payments with Stripe Integration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-100 dark:bg-gray-950 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our Stripe integration ensures that all payments are processed securely, protecting
                both you and your customers.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-950 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Experience quick and efficient payment processing, allowing your customers to
                complete their purchases in seconds.
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-950 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <Lock className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Payment Methods</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Accept a wide range of payment methods including credit cards, debit cards, and
                popular digital wallets.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Toaster />
    </div>
  );
}
