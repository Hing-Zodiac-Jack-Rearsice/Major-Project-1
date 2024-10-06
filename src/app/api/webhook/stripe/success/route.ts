import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_URL;
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_2 as string
    );
  } catch (error: unknown) {
    return new Response("webhook error", { status: 400 });
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const eventId = session?.metadata?.eventId;
      const userEmail = session?.metadata?.userEmail;
      const userName = session?.metadata?.userName;
      const price = session?.metadata?.price;
      //  post req to generate qr code and mail to the buyer after payment is confirmed
      // also generating attendace data for that specific user
      const res = await fetch(`${url}/api/events/mail/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, userName }),
      });
      // post req to generate sales data
      const generateSale = await fetch(`${url}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, userEmail, userName, price }),
      });
      //   if (generateQrAndMail.ok) {
      const msg = await res.json();
      const salesMsg = await generateSale.json();

      // console.log(salesMsg);
      // console.log(msg);
      //   }
      break;
    }
    default:
      console.log("Unhandled event");
  }
  return NextResponse.json({ received: true });
}
