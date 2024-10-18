"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { BuyTicket, checkForPurchase, checkForSoldOut } from "@/app/actions";
import prisma from "@/lib/db";
import { Link, ShoppingCart } from "lucide-react";
import { auth } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const BuyButton = ({ eventId, ticketPrice, userEmail }: any) => {
  //   console.log(ticketPrice);
  //   console.log(eventId);
  const router = useRouter();
  const { data: session } = useSession();
  const [hasBought, setHasBought] = useState<boolean | null>(null);
  const [soldOut, setSoldOut] = useState<boolean | null>(null);
  useEffect(() => {
    const check = async () => {
      const bought = await checkForPurchase(eventId, userEmail);
      const sold = await checkForSoldOut(eventId);
      setHasBought(bought);
      setSoldOut(sold);
    };
    check();
  }, []);
  //   if has bought is true DISABLE buyButton ELSE allow user to buy
  // console.log(hasBought);
  if (session) {
    if (soldOut) {
      return (
        <Button type="submit" className="w-full">
          Sold out.
        </Button>
      );
    }
    return hasBought ? (
      <Button type="submit" variant="destructive" className="w-full">
        You already own this ticket.
      </Button>
    ) : (
      <form action={BuyTicket}>
        <input type="hidden" name="id" value={eventId} />
        <Button
          type="submit"
          className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Buy {ticketPrice} $
        </Button>
      </form>
    );
  } else {
    return (
      <Button className="w-full" onClick={() => router.push("/login")}>
        Please login to purchase tickets.
      </Button>
    );
  }
};

export default BuyButton;
