import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// new added import for Credentials nextAuth i used for login

import { ZodError } from "zod"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/lib/zod"

import { saltAndHashPassword } from "@/utils/password"
import { getUserFromDb } from "@/utils/db";

// This can be used for next time or other projects
const prisma = new PrismaClient().$extends(withAccelerate());

// import prisma from "./db";
// const prisma = new PrismaClient();
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "email",
          type: "email",

        },
        password: {
          label: "password",
          type: "password"
        },
      },
      authorize: async (credentials, request) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);
          console.log("Attempting to authenticate user:", email);
          const user = await getUserFromDb(email, password);
          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role || undefined,
              stripeConnectedLinked: user.stripeConnectedLinked
            };
          }
          if (!user) {
            console.log("User not found or invalid credentials for:", email);
            return null;
          }
          console.log("User authenticated successfully:", user);
          return user;
        } catch (error) {
          console.error("Error in authorize function:", error);
          if (error instanceof ZodError) {
            console.error("Validation error:", error.errors);
          }
          return null;
        }
      },
    })
    ,
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? "user",
          stripeConnectedLinked: profile.stripeConnectedLinked,
        };
      },
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - user:", user);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.stripeConnectedLinked = user.stripeConnectedLinked;
      }
      console.log("JWT callback - token:", token);
      return token;
    },
    session({ session, token }) {
      console.log("Session callback - token:", token);
      if (token) {
        session.user = session.user || {};
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.stripeConnectedLinked = token.stripeConnectedLinked as boolean;
      }
      console.log("Session callback - session:", session);
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    // strategy: "database",
    // maxAge: 30 * 24 * 60 * 60, // 30 days
    // updateAge: 24 * 60 * 60, // 24 hours
  },
});
