import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { BuyTicket, checkForPurchase, checkForSoldOut } from "@/app/actions";
import prisma from "@/lib/db";

const BuyButton = ({ eventId, ticketPrice, userEmail }: any) => {
  //   console.log(ticketPrice);
  //   console.log(eventId);
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
  console.log(hasBought);
  if (soldOut) {
    return <Button type="submit">Sold out.</Button>;
  }
  return hasBought ? (
    <Button type="submit" variant="destructive">
      You already own this ticket.
    </Button>
  ) : (
    <form action={BuyTicket}>
      <input type="hidden" name="id" value={eventId} />
      <Button type="submit">{ticketPrice} $</Button>
    </form>
  );
};

export default BuyButton;
