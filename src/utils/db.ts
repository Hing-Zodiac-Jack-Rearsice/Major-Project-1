import { verifyPassword } from "./password";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
}).$extends(withAccelerate());

export const getUserFromDb = async (email: string, password: string) => {
    try {
        console.log("Starting getUserFromDb for email:", email);
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                password: true,
                role: true,
                stripeConnectedLinked: true,
            },
        });

        console.log("User found:", user ? "Yes" : "No");

        if (!user) return null;

        const isPasswordValid = user.password && await verifyPassword(password, user.password);

        console.log("Password valid:", isPasswordValid ? "Yes" : "No");

        if (!isPasswordValid) return null;

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error("Error in getUserFromDb:", error);
        return null;
    }
};

