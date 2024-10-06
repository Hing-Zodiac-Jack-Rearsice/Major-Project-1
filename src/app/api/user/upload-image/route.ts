import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImageToFirebase } from "@/lib/uploadImageToFirebase";

export async function POST(request: Request, res: any) {
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

    // Upload the image to Firebase and get the download URL
    const imageUrl = await uploadImageToFirebase(file);

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Profile image upload error:", error);
      return NextResponse.json({ error: "Failed to upload profile image", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to upload profile image" }, { status: 500 });
  }
}