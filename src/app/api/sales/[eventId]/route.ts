import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;

  try {
    // Get all sales for the event
    const sales = await prisma.sale.findMany({
      where: {
        eventId: eventId as string,
      },
    });

    console.log('Sales found:', sales); // Debug log

    // Calculate total revenue
    const totalRevenue = sales.reduce((sum, sale) => {
      console.log('Processing sale:', sale); // Debug log
      return sum + (sale.price || 0);
    }, 0);

    console.log('Total revenue calculated:', totalRevenue); // Debug log

    return new NextResponse(
      JSON.stringify({
        sales,
        totalRevenue,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch sales data" }),
      { status: 500 }
    );
  }
}
