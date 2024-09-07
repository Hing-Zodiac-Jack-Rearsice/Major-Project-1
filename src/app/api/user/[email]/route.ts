import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { email: string } }) {
  const { email } = params;
  const user = await prisma.user.findUnique({
    where: {
      email: email as string,
    },
    select: {
      name: true,
    },
  });
  return new NextResponse(JSON.stringify({ userName: user?.name }), { status: 200 });
}
