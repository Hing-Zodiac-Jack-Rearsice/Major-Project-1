import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import NodeCache from "node-cache";

// Create a cache with a default TTL of 10 minutes
const userCache = new NodeCache({ stdTTL: 600 });

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Check if user data is in cache
        const cachedUser = userCache.get(session.user.id);
        if (cachedUser) {
            return NextResponse.json(cachedUser);
        }

        // If not in cache, fetch from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Store user data in cache
        userCache.set(session.user.id, user);

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch user data",
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
