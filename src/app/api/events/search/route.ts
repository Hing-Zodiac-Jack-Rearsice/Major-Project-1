// app/api/search/events/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        eventName: {
          contains: query,
          mode: "insensitive", // This makes the search case-insensitive
        },
      },
    });

    return new NextResponse(JSON.stringify({ events: events }), { status: 200 });
  } catch (error) {
    console.error("Error searching events:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for events" },
      { status: 500 }
    );
  }
}
