"use client";
import Services from "@/components/Services";
import { Vortex } from "@/components/ui/vortex";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="w-full mx-auto h-screen overflow-hidden mt-14">
        <Vortex
          backgroundColor="black"
          rangeY={500}
          particleCount={350}
          baseHue={150}
          className="flex items-center flex-col justify-center px-2 md:px-10  py-4 w-full h-full text-white z-0"
        >
          <h2 className="text-2xl md:text-6xl font-bold text-center">
            The Only Ticketing System You&apos; ll Ever Need
          </h2>
          <p className="text-sm md:text-2xl max-w-xl mt-6 text-center">
            Sombot enables you to streamline your ticket sales and enhance your customer experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <Link href="/login">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg shadow-[0px_2px_0px_0px_#FFFFFF40_inset]">
                Try 7 days free
              </button>
            </Link>
            <Link href="/plans">
              <button className="px-4 py-2">Learn more</button>
            </Link>
          </div>
        </Vortex>
      </div>
      <Services />
    </div>
  );
}
