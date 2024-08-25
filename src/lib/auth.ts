import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// This can be used for next time or other projects
const prisma = new PrismaClient().$extends(withAccelerate());
// import prisma from "./db";
// const prisma = new PrismaClient();
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
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
      if (user) token.role = user.role;
      if (user) token.stripeConnectedLinked = user.stripeConnectedLinked;
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.stripeConnectedLinked = token.stripeConnectedLinked;
      }
      return session;
    },
  },
});
