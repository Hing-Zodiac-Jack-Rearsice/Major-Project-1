import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { saltAndHashPassword } from "@/utils/password";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(operation: () => Promise<T>, retries: number = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && error.code === 'P5000') {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, image } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (image) updateData.image = image;
    if (password) {
      const hashedPassword = await saltAndHashPassword(password);
      updateData.password = hashedPassword;
    }

    const updatedUser = await retryOperation(() =>
      prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      })
    );

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}