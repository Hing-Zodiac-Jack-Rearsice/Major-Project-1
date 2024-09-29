// app/api/search/events/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth"; // Assuming auth is defined in lib/auth

export async function GET(request: Request, { params }: { params: { categoryName: string } }) {
  const { searchParams } = new URL(request.url);
  const { categoryName } = params;
  const query = searchParams.get("query");
  const session = await auth();

  const isAdmin = session?.user?.role === 'admin';

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        categoryName: categoryName === "all" ? undefined : categoryName,
        eventName: {
          contains: query,
          mode: "insensitive",
        },
        status: isAdmin ? undefined : 'approved',
      },
    });

    return new NextResponse(JSON.stringify({ data: events }), { status: 200 });
  } catch (error) {
    console.error("Error searching events:", error);
    return NextResponse.json(
      { error: "An error occurred while searching for events" },
      { status: 500 }
    );
  }
}
