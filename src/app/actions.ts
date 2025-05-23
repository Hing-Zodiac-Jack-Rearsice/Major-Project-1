"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

// url change depend on production and localhost
const url = process.env.NEXT_PUBLIC_URL;
export async function checkForDelete(eventId: any) {
  const canDelete = await prisma.event.findUnique({
    where: {
      id: eventId,
      attendances: {
        none: {},
      },
      tickets: {
        none: {},
      },
      sales: {
        none: {},
      },
    },
  });
  // if the event can be deleted which is not equal to null
  return canDelete !== null;
}
export async function checkForSoldOut(eventId: any) {
  const eventTicketAmount = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      ticketAmount: true,
    },
  });
  const ticketsSold = await prisma.ticket.count({
    where: {
      eventId: eventId,
    },
  });
  if (eventTicketAmount === null) {
    throw new Error("Event not found");
  }
  // true means sold out, if more than 0 means still ongoing sale
  return eventTicketAmount?.ticketAmount - ticketsSold === 0;
}
export async function ticketsSold(eventId: any) {
  const ticketsSold = await prisma.ticket.count({
    where: {
      eventId: eventId,
    },
  });
  // true means sold out, if more than 0 means still ongoing sale
  return ticketsSold;
}
export async function remainingTickets(eventId: any) {
  const eventTicketAmount = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      ticketAmount: true,
    },
  });
  const ticketsSold = await prisma.ticket.count({
    where: {
      eventId: eventId,
    },
  });
  if (eventTicketAmount === null) {
    throw new Error("Event not found");
  }
  // true means sold out, if more than 0 means still ongoing sale
  return (eventTicketAmount.ticketAmount - ticketsSold) as number;
}
export async function checkForPurchase(eventId: any, userEmail: any) {
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      eventId: eventId,
      userEmail: userEmail,
    },
  });

  // If existingTicket is not null, it means the user has bought the ticket
  return existingTicket !== null;
}
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
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      eventId: id,
      userEmail: userSession?.user.email as string,
    },
  });
  if (existingTicket) {
    return NextResponse.json(
      { error: "You have already purchased a ticket for this event." },
      { status: 400 }
    );
  }
  const session = await stripe.checkout.sessions.create({
    customer_email: userSession?.user?.email as string,
    mode: "payment",
    // invoice_creation: {
    //   enabled: true,
    //   invoice_data: {
    //     description: `Ticket for ${data?.eventName}`,
    //     metadata: {
    //       price: data?.ticketPrice as number,
    //       eventId: id,
    //       userEmail: userSession?.user?.email as string,
    //       userName: userSession?.user?.name as string,
    //     },
    //   },
    // },``
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
    success_url: `${url}/payment/success`,
    cancel_url: `${url}/payment/cancel`,
    metadata: {
      price: data?.ticketPrice as number,
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
    refresh_url: `${url}`,
    return_url: `${url}/admin/dashboard`,
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
