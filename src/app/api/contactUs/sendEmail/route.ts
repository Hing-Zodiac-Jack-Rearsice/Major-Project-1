import { transporter } from "@/lib/nodemailer";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, message, email } = body;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender's email from session
            replyTo: session.user?.email as string,
            to: "chatforgon@gmail.com",   // Recipient's email
            subject: `Request Support from ${session.user?.name}`,
            text: `Name: ${name}\nMessage: ${message}`, // Corrected string template syntax
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
