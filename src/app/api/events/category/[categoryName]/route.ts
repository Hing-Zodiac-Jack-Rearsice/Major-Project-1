import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { categoryName: string } }) {
  const { categoryName } = params;
  const session = await auth();

  const isAdmin = session?.user?.role === 'admin';

  const baseQuery = {
    where: {
      categoryName: categoryName === "all" ? undefined : categoryName,
      status: isAdmin ? undefined : 'approved',
    },
  };

  try {
    const events = await prisma.event.findMany(baseQuery);
    return new NextResponse(JSON.stringify({ data: events }), { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
