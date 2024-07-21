import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // get ID from params from api/users/[id]
  const { id } = params;
  try {
    const updateRole = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        role: "admin",
      },
    });
    return new NextResponse(JSON.stringify({ id: id, role: "admin" }), { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
  }
}
