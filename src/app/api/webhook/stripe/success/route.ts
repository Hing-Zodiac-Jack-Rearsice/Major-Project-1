import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
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
      const res = await fetch(`http://localhost:3000/api/events/mail/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, userName }),
      });
      //   if (generateQrAndMail.ok) {
      const msg = await res.json();
      console.log(msg);
      //   }
      break;
    }
    default:
      console.log("Unhandled event");
  }
  return NextResponse.json({ received: true });
}
