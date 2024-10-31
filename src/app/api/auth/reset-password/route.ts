import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { saltAndHashPassword } from "@/utils/password";

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        // Hash new password and update user
        const hashedPassword = await saltAndHashPassword(password);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({
            message: "Password has been reset successfully"
        });

    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        );
    }
} 