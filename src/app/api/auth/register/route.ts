import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { saltAndHashPassword } from "@/utils/password";
import { signUpSchema } from "@/lib/zod";
import { ZodError } from "zod";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(operation: () => Promise<T>, retries: number = MAX_RETRIES): Promise<T> {
    try {
        return await operation();
    } catch (error: unknown) {
        if (retries > 0 && typeof error === 'object' && error !== null && 'code' in error && error.code === 'P5000') {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return retryOperation(operation, retries - 1);
        }
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = await signUpSchema.parseAsync(body);

        const existingUser = await retryOperation(() => prisma.user.findUnique({ where: { email } }));
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await saltAndHashPassword(password);

        const user = await retryOperation(() => prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "user",
            },
        }));

        return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            return NextResponse.json({ error: errorMessages }, { status: 400 });
        }
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Registration failed. Please try again later." }, { status: 500 });
    }
}
