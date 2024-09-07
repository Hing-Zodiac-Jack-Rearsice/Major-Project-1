import prisma from "@/lib/db"; // query sales data for that specific event
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  const { eventId } = params;

  const sales = await prisma.sale.findMany({
    where: {
      eventId: eventId as string,
    },
  });
  return new Response(JSON.stringify({ sales }), { status: 200 });
}
