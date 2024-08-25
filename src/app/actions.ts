"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function BuyTicket(formData: FormData) {
  const userSession = await auth();
  const id = formData.get("id") as string;
  const data = await prisma.event.findUnique({
    where: {
      id: id,
    },
    select: {
      eventName: true,
      description: true,
      imageUrl: true,
      ticketPrice: true,
      user: {
        select: {
          connectedAccountId: true,
        },
      },
    },
  });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round((data?.ticketPrice as number) * 100),
          product_data: {
            name: data?.eventName as string,
            description: data?.description,
            images: [data?.imageUrl as string],
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      // sends the money received to sombot stripe account to the actual ticket seller
      //   application_fee_amount: 0,
      transfer_data: {
        destination: data?.user?.connectedAccountId as string,
      },
    },
    success_url: "http://localhost:3000/payment/success",
    cancel_url: "http://localhost:3000/payment/cancel",
    metadata: {
      eventId: id,
      userEmail: userSession?.user?.email as string,
      userName: userSession?.user?.name as string,
    },
  });
  return redirect(session.url as string);
}

export async function CreateStripeAccountLink() {
  const session = await auth();
  const data = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string,
    },
    select: {
      connectedAccountId: true,
    },
  });
  const accountLink = await stripe.accountLinks.create({
    account: data?.connectedAccountId as string,
    refresh_url: "http://localhost:3000",
    return_url: "http://localhost:3000/admin/dashboard",
    type: "account_onboarding",
  });
  return redirect(accountLink.url as string);
}
export async function getStripeDashboardLink() {
  const session = await auth();
  const data = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string,
    },
    select: {
      connectedAccountId: true,
    },
  });
  const loginLink = await stripe.accounts.createLoginLink(data?.connectedAccountId as string);
  return redirect(loginLink.url as string);
}
