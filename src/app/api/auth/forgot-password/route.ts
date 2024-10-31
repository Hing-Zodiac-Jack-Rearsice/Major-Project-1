import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { transporter } from "@/lib/nodemailer";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        console.log("Processing password reset for email:", email);


        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log("No user found with email:", email);
            return NextResponse.json({
                message: "If an account exists with this email, you will receive a password reset link."
            });
        }

        // Generate reset token and expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token and expiry to database
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // Construct reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;
        console.log("Reset URL generated:", resetUrl);

        try {
            // Send reset email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Password Reset Request",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset for your account.</p>
                        <p>Click the button below to reset your password:</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
                        <p>If you didn't request this, please ignore this email.</p>
                        <p>This link will expire in 1 hour.</p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all;">${resetUrl}</p>
                    </div>
                `,
            });
            console.log("Reset email sent successfully to:", email);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            throw new Error("Failed to send reset email");
        }

        return NextResponse.json({
            message: "Password reset link has been sent to your email."
        });

    } catch (error) {
        console.error("Password reset request error:", error);
        return NextResponse.json(
            { error: "Failed to process password reset request. Please try again." },
            { status: 500 }
        );
    }
} 