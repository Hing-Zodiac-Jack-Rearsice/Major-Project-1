import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "-" + file.name.replaceAll(" ", "_");
        const relativePath = `/uploads/${filename}`;
        const absolutePath = path.join(process.cwd(), "public", relativePath);

        // Ensure the uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.promises.mkdir(uploadsDir, { recursive: true });

        await writeFile(absolutePath, buffer as any);

        const imageUrl = `/uploads/${filename}`;

        return NextResponse.json({ imageUrl }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Profile image upload error:", error);
            return NextResponse.json({ error: "Failed to upload profile image", details: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Failed to upload profile image" }, { status: 500 });
    }
}