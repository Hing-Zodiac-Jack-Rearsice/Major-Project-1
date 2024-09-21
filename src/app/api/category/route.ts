import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  const categories = await prisma.category.findMany();
  return new NextResponse(JSON.stringify({ categories }), { status: 200 });
}
